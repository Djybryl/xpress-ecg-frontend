import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Search, 
  Filter,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  FileText,
  Calendar,
  Activity,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCardiologueStore, type CardiologueECG } from '@/stores/useCardiologueStore';
import { useAuthContext } from '@/providers/AuthProvider';
import { ReportPDFPreview } from '@/components/reports/ReportPDFPreview';
import { format, parseISO, formatDistanceToNow, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function CompletedECG() {
  const { getMyCompleted, getCounts } = useCardiologueStore();
  const { user } = useAuthContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [viewReport, setViewReport] = useState<CardiologueECG | null>(null);
  const [pdfPreviewECG, setPdfPreviewECG] = useState<CardiologueECG | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const completedECGs = user?.email ? getMyCompleted(user.email) : [];
  const counts = getCounts(user?.email);

  // Statistiques
  const normalCount = completedECGs.filter(e => e.interpretation?.isNormal).length;
  const abnormalCount = completedECGs.filter(e => !e.interpretation?.isNormal).length;
  
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekCount = completedECGs.filter(e => 
    e.dateCompleted && isWithinInterval(parseISO(e.dateCompleted), { start: thisWeekStart, end: thisWeekEnd })
  ).length;

  // Filtrage
  const filteredECGs = completedECGs.filter(ecg => {
    const matchesSearch = 
      ecg.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.referringDoctor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResult = resultFilter === 'all' || 
      (resultFilter === 'normal' && ecg.interpretation?.isNormal) ||
      (resultFilter === 'abnormal' && !ecg.interpretation?.isNormal);

    let matchesPeriod = true;
    if (periodFilter === 'today') {
      matchesPeriod = ecg.dateCompleted ? 
        new Date(ecg.dateCompleted).toDateString() === new Date().toDateString() : false;
    } else if (periodFilter === 'week') {
      matchesPeriod = ecg.dateCompleted ? 
        isWithinInterval(parseISO(ecg.dateCompleted), { start: thisWeekStart, end: thisWeekEnd }) : false;
    }

    return matchesSearch && matchesResult && matchesPeriod;
  });

  const totalPages = Math.max(1, Math.ceil(filteredECGs.length / PAGE_SIZE));
  const paginatedECGs = filteredECGs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [searchTerm, resultFilter, periodFilter]);

  return (
    <div className="space-y-3">
      {/* En-tête compact avec résumé inline */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          ECG Terminés
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />{counts.myCompleted} total
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium">
            <Calendar className="h-3.5 w-3.5" />{thisWeekCount} cette semaine
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            {normalCount} normaux{completedECGs.length > 0 ? ` (${Math.round((normalCount / completedECGs.length) * 100)}%)` : ''}
          </span>
          {abnormalCount > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">
              <Activity className="h-3.5 w-3.5" />{abnormalCount} anormaux
            </span>
          )}
        </div>
      </div>

      {/* Liste des ECG */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Historique des analyses
              <Badge variant="secondary" className="text-xs">{filteredECGs.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Patient, ID, médecin…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm w-48"
                />
              </div>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger className="h-8 w-28 text-xs">
                  <Filter className="h-3 w-3 mr-1" /><SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="normal">Normaux</SelectItem>
                  <SelectItem value="abnormal">Anormaux</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <Calendar className="h-3 w-3 mr-1" /><SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toute période</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredECGs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Aucun ECG trouvé</p>
              <p className="text-sm">Modifiez vos filtres pour voir plus de résultats</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 text-xs">
                  <TableHead className="w-8 py-2"></TableHead>
                  <TableHead className="py-2">ID ECG</TableHead>
                  <TableHead className="py-2">Patient</TableHead>
                  <TableHead className="py-2">Médecin / Établissement</TableHead>
                  <TableHead className="py-2">Terminé le</TableHead>
                  <TableHead className="py-2">Résultat</TableHead>
                  <TableHead className="py-2 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedECGs.map((ecg) => (
                  <React.Fragment key={ecg.id}>
                    <TableRow 
                      className={cn(
                        "cursor-pointer text-sm hover:bg-gray-50",
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
                      <TableCell className="py-1.5 font-mono text-xs font-medium text-indigo-700">
                        {ecg.id}
                      </TableCell>
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
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
                        <p className="leading-tight">
                          {ecg.dateCompleted && format(parseISO(ecg.dateCompleted), 'dd/MM HH:mm', { locale: fr })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {ecg.dateCompleted && formatDistanceToNow(parseISO(ecg.dateCompleted), { addSuffix: true, locale: fr })}
                        </p>
                      </TableCell>
                      <TableCell className="py-1.5">
                        {ecg.interpretation?.isNormal ? (
                          <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Normal
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5">
                            <Activity className="h-2.5 w-2.5 mr-0.5" />Anormal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-1.5 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => setViewReport(ecg)} title="Voir le rapport">
                            <Eye className="h-3.5 w-3.5 text-indigo-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7"
                            title="Aperçu PDF" onClick={() => setPdfPreviewECG(ecg)}>
                            <Download className="h-3.5 w-3.5 text-gray-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Ligne expandable avec détails */}
                    {expandedRow === ecg.id && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={7} className="p-4">
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Mesures</h4>
                              <div className="space-y-1 text-sm bg-white p-3 rounded border">
                                <p><span className="text-gray-500">Rythme:</span> {ecg.measurements?.rhythm || '-'}</p>
                                <p><span className="text-gray-500">FC:</span> {ecg.measurements?.heartRate || '-'} bpm</p>
                                <p><span className="text-gray-500">PR:</span> {ecg.measurements?.prInterval || '-'} ms</p>
                                <p><span className="text-gray-500">QRS:</span> {ecg.measurements?.qrsDuration || '-'} ms</p>
                                <p><span className="text-gray-500">QTc:</span> {ecg.measurements?.qtcInterval || '-'} ms</p>
                                <p><span className="text-gray-500">Axe:</span> {ecg.measurements?.axis || '-'}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Constatations</h4>
                              <ul className="space-y-1 text-sm bg-white p-3 rounded border">
                                {(ecg.interpretation?.findings ?? []).map((finding, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">•</span>
                                    {finding}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Conclusion</h4>
                              <div className={cn(
                                "p-3 rounded border text-sm",
                                ecg.interpretation?.isNormal 
                                  ? "bg-green-50 border-green-200" 
                                  : "bg-amber-50 border-amber-200"
                              )}>
                                {ecg.interpretation?.conclusion}
                              </div>
                              {ecg.interpretation?.recommendations && (
                                <div className="mt-2">
                                  <h4 className="font-semibold text-sm mb-1">Recommandations</h4>
                                  <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                                    {ecg.interpretation.recommendations}
                                  </p>
                                </div>
                              )}
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

      {/* Dialog de visualisation du rapport */}
      <Dialog open={!!viewReport} onOpenChange={() => setViewReport(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Rapport ECG - {viewReport?.id}
            </DialogTitle>
          </DialogHeader>
          {viewReport && (
            <div className="space-y-6">
              {/* En-tête */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Rapport d'interprétation ECG</h3>
                    <p className="text-sm text-gray-600">
                      Complété le {viewReport.dateCompleted && format(parseISO(viewReport.dateCompleted), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <Badge className={cn(
                    viewReport.interpretation?.isNormal 
                      ? "bg-green-100 text-green-700" 
                      : "bg-amber-100 text-amber-700"
                  )}>
                    {viewReport.interpretation?.isNormal ? 'Normal' : 'Anormal'}
                  </Badge>
                </div>
              </div>

              {/* Informations */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold border-b pb-2 mb-2">Patient</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Nom:</span> {viewReport.patientName}</p>
                    <p><span className="text-gray-500">ID:</span> {viewReport.patientId}</p>
                    <p><span className="text-gray-500">Âge:</span> {viewReport.patientAge} ans</p>
                    <p><span className="text-gray-500">Sexe:</span> {viewReport.patientGender === 'M' ? 'Masculin' : 'Féminin'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold border-b pb-2 mb-2">Médecin référent</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Nom:</span> {viewReport.referringDoctor}</p>
                    <p><span className="text-gray-500">Établissement:</span> {viewReport.hospital}</p>
                  </div>
                </div>
              </div>

              {/* Contexte clinique */}
              <div>
                <h4 className="font-semibold border-b pb-2 mb-2">Contexte clinique</h4>
                <p className="text-sm bg-gray-50 p-3 rounded">{viewReport.clinicalContext}</p>
              </div>

              {/* Mesures */}
              <div>
                <h4 className="font-semibold border-b pb-2 mb-2">Mesures ECG</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Rythme</p>
                    <p className="font-medium">{viewReport.measurements?.rhythm || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Fréquence</p>
                    <p className="font-medium">{viewReport.measurements?.heartRate || '-'} bpm</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">Axe</p>
                    <p className="font-medium">{viewReport.measurements?.axis || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">PR</p>
                    <p className="font-medium">{viewReport.measurements?.prInterval || '-'} ms</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">QRS</p>
                    <p className="font-medium">{viewReport.measurements?.qrsDuration || '-'} ms</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500">QTc</p>
                    <p className="font-medium">{viewReport.measurements?.qtcInterval || '-'} ms</p>
                  </div>
                </div>
              </div>

              {/* Constatations */}
              <div>
                <h4 className="font-semibold border-b pb-2 mb-2">Constatations</h4>
                <ul className="space-y-1 text-sm">
                  {(viewReport.interpretation?.findings ?? []).map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Conclusion */}
              <div>
                <h4 className="font-semibold border-b pb-2 mb-2">Conclusion</h4>
                <div className={cn(
                  "p-4 rounded-lg border",
                  viewReport.interpretation?.isNormal 
                    ? "bg-green-50 border-green-200" 
                    : "bg-amber-50 border-amber-200"
                )}>
                  <p className="text-sm">{viewReport.interpretation?.conclusion}</p>
                </div>
              </div>

              {/* Recommandations */}
              {viewReport.interpretation?.recommendations && (
                <div>
                  <h4 className="font-semibold border-b pb-2 mb-2">Recommandations</h4>
                  <p className="text-sm bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    {viewReport.interpretation.recommendations}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewReport(null)}>
              Fermer
            </Button>
            <Button onClick={() => { setPdfPreviewECG(viewReport); setViewReport(null); }}>
              <Download className="h-4 w-4 mr-2" />
              Aperçu PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aperçu PDF */}
      {pdfPreviewECG && (
        <ReportPDFPreview
          ecg={pdfPreviewECG}
          cardiologistName={user?.name ?? 'Cardiologue'}
          open={!!pdfPreviewECG}
          onOpenChange={(open) => { if (!open) setPdfPreviewECG(null); }}
        />
      )}
    </div>
  );
}
