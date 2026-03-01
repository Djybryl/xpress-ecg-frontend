import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Inbox, Search, Filter, User, Building2, Clock, AlertCircle,
  ChevronDown, ChevronUp, Play, Eye, Calendar, Stethoscope, ArrowRight, Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useCardiologueStore } from '@/stores/useCardiologueStore';
import type { CardiologueECG } from '@/stores/useCardiologueStore';
import { useEcgList, ecgRef } from '@/hooks/useEcgList';
import type { EcgRecordItem } from '@/hooks/useEcgList';
import { api, ApiError } from '@/lib/apiClient';
import { useAuthContext } from '@/providers/AuthProvider';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

function CountdownBadge({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState('');
  const [isLow, setIsLow] = useState(false);

  useEffect(() => {
    const tick = () => {
      const ms = new Date(deadline).getTime() - Date.now();
      if (ms <= 0) { setRemaining('Expiré'); setIsLow(true); return; }
      const min = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      setRemaining(`${min}:${String(sec).padStart(2, '0')}`);
      setIsLow(min < 3);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <Badge variant="outline" className={cn(
      'text-[11px] font-mono tabular-nums',
      isLow ? 'border-red-400 text-red-600 animate-pulse' : 'border-blue-300 text-blue-600'
    )}>
      <Timer className="w-3 h-3 mr-1" />
      {remaining}
    </Badge>
  );
}

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  pending:   { label: 'En attente',  classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  validated: { label: 'Validé',      classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  assigned:  { label: 'Assigné',     classes: 'bg-purple-50 text-purple-700 border-purple-200' },
  analyzing: { label: 'En analyse',  classes: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

/** Convertit un EcgRecordItem backend en CardiologueECG pour l'UI */
function toCardiologueECG(r: EcgRecordItem): CardiologueECG & { backendStatus: string; reference: string } {
  return {
    id:                   r.id,
    reference:            r.reference,
    patientName:          r.patient_name,
    patientId:            r.patient_id ?? '',
    patientAge:           0,
    patientGender:        r.gender ?? 'M',
    referringDoctor:      r.medical_center || 'Médecin référent',
    referringDoctorEmail: '',
    hospital:             r.medical_center || '',
    dateReceived:         r.created_at,
    dateAssigned:         r.updated_at,
    status:               'pending' as const,
    urgency:              r.urgency,
    clinicalContext:      r.clinical_context ?? '',
    ecgDate:              r.date,
    deadline:             r.deadline ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    routedTo:             undefined,
    analyzedBy:           undefined,
    backendStatus:        r.status,
  };
}

export function PendingECG() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { getMyInProgress, getCounts, startAnalysis, releaseExpiredECGs, requestTimeExtension } = useCardiologueStore();

  // Si on est sur /urgent, pré-filtrer sur les urgents
  const isUrgentRoute = location.pathname === '/cardiologue/urgent';

  // Toutes les demandes non complétées (pending, validated, assigned, analyzing)
  // Le cardiologue voit tout par défaut ; la secrétaire peut assigner à un cardiologue précis
  const { records, loading, error, refetch } = useEcgList({});
  const availableECGs = records
    .filter(r => r.status !== 'completed')
    .map(toCardiologueECG) as (CardiologueECG & { backendStatus: string; reference: string })[];

  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>(isUrgentRoute ? 'urgent' : 'all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [previewECG, setPreviewECG] = useState<CardiologueECG | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Libérer les ECG expirés toutes les 5 secondes (store local pour le timer)
  useEffect(() => {
    const id = setInterval(() => releaseExpiredECGs(), 5000);
    return () => clearInterval(id);
  }, [releaseExpiredECGs]);

  // ECG en cours d'analyse pour CE cardiologue (timer local dans le store)
  const myInProgress = user?.email ? getMyInProgress(user.email) : [];
  const counts = getCounts(user?.email);

  const filteredECGs = availableECGs.filter(ecg => {
    const matchesSearch =
      ecg.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecgRef(ecg).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || ecg.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  const totalPages = Math.max(1, Math.ceil(filteredECGs.length / PAGE_SIZE));
  const paginatedECGs = filteredECGs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [searchTerm, urgencyFilter]);

  const handleStartAnalysis = async (ecg: CardiologueECG) => {
    if (!user?.id || !user?.email || !user?.name) return;
    try {
      // Assigner au cardiologue puis démarrer l'analyse sur le backend
      await api.post(`/ecg-records/${ecg.id}/assign`, { cardiologistId: user.id });
      await api.post(`/ecg-records/${ecg.id}/start-analysis`);
      // Mettre à jour le store local pour le timer countdown
      startAnalysis(ecg.id, user.email, user.name);
      refetch();
      toast({ title: "ECG pris en charge", description: `Vous avez 15 minutes pour interpréter l'ECG de ${ecg.patientName}.` });
      navigate(`/cardiologue/analyze/${ecg.id}`);
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof ApiError ? err.message : "Impossible de démarrer l'analyse.", variant: "destructive" });
    }
  };

  const handleExtend = (ecgId: string) => {
    requestTimeExtension(ecgId);
    toast({ title: 'Temps prolongé', description: '+10 minutes accordées.' });
  };

  return (
    <div className="space-y-3">
      {/* En-tête compact avec résumé inline */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {isUrgentRoute
              ? <><AlertCircle className="h-5 w-5 text-red-500" />ECG Urgents</>
              : <><Inbox className="h-5 w-5 text-indigo-600" />ECG disponibles</>
            }
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">
            <Inbox className="h-3.5 w-3.5" />{loading ? '…' : availableECGs.length} dispo
          </span>
          {availableECGs.filter(e => e.urgency === 'urgent').length > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 font-medium animate-pulse">
              <AlertCircle className="h-3.5 w-3.5" />{availableECGs.filter(e => e.urgency === 'urgent').length} urgent{availableECGs.filter(e => e.urgency === 'urgent').length > 1 ? 's' : ''}
            </span>
          )}
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium">
            <Clock className="h-3.5 w-3.5" />{counts.myInProgress} en cours
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium">
            <Stethoscope className="h-3.5 w-3.5" />{counts.today} ce jour
          </span>
        </div>
      </div>

      {/* Erreur de chargement */}
      {!loading && error && (
        <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refetch} className="ml-4 h-7 text-xs">Réessayer</Button>
        </div>
      )}

      {/* Mes ECG en cours avec compte à rebours */}
      {myInProgress.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />Mes ECG en cours d'analyse
            </p>
            <div className="space-y-1.5">
              {myInProgress.map(ecg => (
                <div 
                  key={ecg.id}
                  className="flex items-center justify-between py-2 px-3 bg-white rounded border border-blue-200"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="font-mono text-xs text-gray-400">{ecgRef(ecg)}</span>
                    <span className="font-medium text-sm truncate">{ecg.patientName}</span>
                    {ecg.urgency === 'urgent' && (
                      <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0">URGENT</Badge>
                    )}
                    <span className="text-xs text-gray-400 shrink-0">
                      {ecg.dateStarted && formatDistanceToNow(parseISO(ecg.dateStarted), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {ecg.analysisDeadline && (
                      <CountdownBadge deadline={ecg.analysisDeadline} />
                    )}
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2"
                      onClick={() => handleExtend(ecg.id)} title="+10 min">
                      <Timer className="h-3 w-3 mr-1" />+Temps
                    </Button>
                    <Button 
                      onClick={() => navigate(`/cardiologue/analyze/${ecg.id}`)}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      Continuer
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pool d'ECG disponibles */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              ECG à analyser
              {counts.available > 0 && (
                <Badge variant="secondary" className="text-xs">{counts.available}</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Patient, ID, médecin…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm w-52"
                />
              </div>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="h-8 w-28 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="urgent">Urgents</SelectItem>
                  <SelectItem value="normal">Normaux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mr-3" />
              Chargement des ECG disponibles…
            </div>
          ) : error ? (
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 m-4">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={refetch} className="ml-4 h-7 text-xs">Réessayer</Button>
            </div>
          ) : filteredECGs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Aucune demande ECG en cours</p>
              <p className="text-sm text-gray-400 mt-1">Les nouvelles demandes des médecins apparaîtront ici</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 text-xs">
                  <TableHead className="w-8 py-2"></TableHead>
                  <TableHead className="py-2">ID ECG</TableHead>
                  <TableHead className="py-2">Patient</TableHead>
                  <TableHead className="py-2">Médecin / Établissement</TableHead>
                  <TableHead className="py-2">Reçu</TableHead>
                  <TableHead className="py-2">Statut</TableHead>
                  <TableHead className="py-2">Urgence</TableHead>
                  <TableHead className="py-2 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedECGs.map((ecg) => (
                  <React.Fragment key={ecg.id}>
                    <TableRow 
                      className={cn(
                        "cursor-pointer text-sm",
                        ecg.urgency === 'urgent' && "bg-red-50/60 hover:bg-red-100/60",
                        ecg.urgency !== 'urgent' && "hover:bg-gray-50",
                        expandedRow === ecg.id && "bg-indigo-50/60"
                      )}
                    >
                      <TableCell className="py-1.5 pr-0">
                        <Button
                          variant="ghost" size="icon" className="h-6 w-6"
                          onClick={() => setExpandedRow(expandedRow === ecg.id ? null : ecg.id)}
                        >
                          {expandedRow === ecg.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                      </TableCell>
                      <TableCell className="py-1.5 font-mono text-xs font-medium text-indigo-700">{ecgRef(ecg)}</TableCell>
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-1.5">
                          <User className={cn("h-3.5 w-3.5 shrink-0", ecg.urgency === 'urgent' ? "text-red-400" : "text-gray-400")} />
                          <div>
                            <p className="font-medium leading-tight">{ecg.patientName}</p>
                            <p className="text-xs text-gray-400">{ecg.patientGender === 'M' ? 'H' : 'F'}, {ecg.patientAge} ans</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5">
                        <p className="leading-tight">{ecg.referringDoctor}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Building2 className="h-3 w-3" />{ecg.hospital}</p>
                      </TableCell>
                      <TableCell className="py-1.5">
                        <p className="leading-tight">{format(parseISO(ecg.dateReceived), 'dd/MM HH:mm', { locale: fr })}</p>
                        <p className="text-xs text-gray-400">{formatDistanceToNow(parseISO(ecg.dateReceived), { addSuffix: true, locale: fr })}</p>
                      </TableCell>
                      <TableCell className="py-1.5">
                        {(() => {
                          const s = STATUS_LABELS[(ecg as CardiologueECG & { backendStatus: string }).backendStatus] ?? STATUS_LABELS['pending'];
                          return (
                            <Badge variant="outline" className={`text-[10px] px-1.5 ${s.classes}`}>
                              {s.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="py-1.5">
                        {ecg.urgency === 'urgent' ? (
                          <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 animate-pulse">
                            <AlertCircle className="h-2.5 w-2.5 mr-0.5" />URGENT
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 text-[10px] px-1.5">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-1.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewECG(ecg)} title="Aperçu">
                            <Eye className="h-3.5 w-3.5 text-gray-500" />
                          </Button>
                          <Button
                            size="sm" className="h-7 text-xs px-2"
                            onClick={() => handleStartAnalysis(ecg)}
                            style={{ backgroundColor: ecg.urgency === 'urgent' ? '#dc2626' : '#4f46e5' }}
                          >
                            <Play className="h-3 w-3 mr-1" />Prendre
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedRow === ecg.id && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={8} className="p-4">
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Informations Patient</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">ID:</span> {ecg.patientId}</p>
                                <p><span className="text-gray-500">Nom:</span> {ecg.patientName}</p>
                                <p><span className="text-gray-500">Âge:</span> {ecg.patientAge} ans</p>
                                <p><span className="text-gray-500">Sexe:</span> {ecg.patientGender === 'M' ? 'Masculin' : 'Féminin'}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Contexte clinique</h4>
                              <p className={cn(
                                "text-sm p-3 rounded border",
                                ecg.urgency === 'urgent' ? "bg-red-50 border-red-200 text-red-800" : "bg-white border-gray-200"
                              )}>{ecg.clinicalContext}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Actions</h4>
                              <Button 
                                className={cn("w-full", ecg.urgency === 'urgent' ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700")}
                                onClick={() => handleStartAnalysis(ecg)}
                              >
                                <Play className="h-4 w-4 mr-2" />Prendre en charge
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-gray-500">
              <span>{filteredECGs.length} résultat{filteredECGs.length > 1 ? 's' : ''} • page {page}/{totalPages}</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === 1} onClick={() => setPage(1)}>«</Button>
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  return start + i;
                }).map(p => (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm"
                    className={cn('h-6 w-6 p-0 text-xs', p === page && 'bg-indigo-600 text-white')}
                    onClick={() => setPage(p)}>{p}
                  </Button>
                ))}
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de prévisualisation */}
      <Dialog open={!!previewECG} onOpenChange={() => setPreviewECG(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-indigo-600" />
              Aperçu ECG - {previewECG?.id}
              {previewECG?.urgency === 'urgent' && <Badge className="bg-red-100 text-red-700 ml-2">URGENT</Badge>}
            </DialogTitle>
          </DialogHeader>
          {previewECG && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Patient</h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                    <p><span className="text-gray-500">Nom:</span> {previewECG.patientName}</p>
                    <p><span className="text-gray-500">ID:</span> {previewECG.patientId}</p>
                    <p><span className="text-gray-500">Âge:</span> {previewECG.patientAge} ans</p>
                    <p><span className="text-gray-500">Sexe:</span> {previewECG.patientGender === 'M' ? 'Masculin' : 'Féminin'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Médecin référent</h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                    <p><span className="text-gray-500">Nom:</span> {previewECG.referringDoctor}</p>
                    <p><span className="text-gray-500">Email:</span> {previewECG.referringDoctorEmail}</p>
                    <p><span className="text-gray-500">Établissement:</span> {previewECG.hospital}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Contexte clinique</h4>
                <div className={cn("p-3 rounded-lg text-sm", previewECG.urgency === 'urgent' ? "bg-red-50 border border-red-200 text-red-800" : "bg-gray-50")}>
                  {previewECG.clinicalContext}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Tracé ECG</h4>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-400">Aperçu du tracé ECG</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />ECG du {format(parseISO(previewECG.ecgDate), 'dd/MM/yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />Reçu {formatDistanceToNow(parseISO(previewECG.dateReceived), { addSuffix: true, locale: fr })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewECG(null)}>Fermer</Button>
            <Button 
              onClick={() => { if (previewECG) handleStartAnalysis(previewECG); setPreviewECG(null); }}
              className={cn(previewECG?.urgency === 'urgent' ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700")}
            >
              <Play className="h-4 w-4 mr-2" />Prendre en charge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
