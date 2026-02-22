import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Search, 
  Filter,
  User,
  Building2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Eye,
  Calendar,
  Stethoscope,
  ArrowRight
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
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function PendingECG() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getPending, getInProgress, getCounts, startAnalysis } = useCardiologueStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [previewECG, setPreviewECG] = useState<CardiologueECG | null>(null);

  const pendingECGs = getPending();
  const inProgressECGs = getInProgress();
  const counts = getCounts();

  // Filtrage
  const filteredECGs = pendingECGs.filter(ecg => {
    const matchesSearch = 
      ecg.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecg.referringDoctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || ecg.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  const handleStartAnalysis = (ecg: CardiologueECG) => {
    startAnalysis(ecg.id);
    toast({
      title: "Analyse démarrée",
      description: `Vous analysez maintenant l'ECG de ${ecg.patientName}.`
    });
    navigate(`/cardiologue/analyze/${ecg.id}`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Inbox className="h-6 w-6 text-indigo-600" />
            ECG en attente
          </h1>
          <p className="text-gray-500 mt-1">ECG assignés en attente d'interprétation</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">En attente</p>
                <p className="text-2xl font-bold text-amber-700">{counts.pending}</p>
              </div>
              <div className="h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center">
                <Inbox className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Urgents</p>
                <p className="text-2xl font-bold text-red-700">{counts.urgent}</p>
              </div>
              <div className="h-10 w-10 bg-red-200 rounded-full flex items-center justify-center animate-pulse">
                <AlertCircle className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">En cours</p>
                <p className="text-2xl font-bold text-blue-700">{counts.inProgress}</p>
              </div>
              <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Terminés (jour)</p>
                <p className="text-2xl font-bold text-green-700">{counts.today}</p>
              </div>
              <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ECG en cours d'analyse */}
      {inProgressECGs.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
              <Clock className="h-5 w-5" />
              ECG en cours d'analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inProgressECGs.map(ecg => (
                <div 
                  key={ecg.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{ecg.id}</span>
                        <span className="font-medium">{ecg.patientName}</span>
                        {ecg.urgency === 'urgent' && (
                          <Badge className="bg-red-100 text-red-700">URGENT</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Démarré {ecg.dateStarted && formatDistanceToNow(parseISO(ecg.dateStarted), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(`/cardiologue/analyze/${ecg.id}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continuer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher patient, ID, médecin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Urgence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="urgent">Urgents</SelectItem>
                <SelectItem value="normal">Normaux</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des ECG */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            ECG à analyser
            {counts.pending > 0 && (
              <Badge variant="secondary" className="ml-2">{counts.pending}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredECGs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Aucun ECG en attente</p>
              <p className="text-sm">Les nouveaux ECG assignés apparaîtront ici</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>ID ECG</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médecin référent</TableHead>
                  <TableHead>Assigné</TableHead>
                  <TableHead>Urgence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredECGs.map((ecg) => (
                  <>
                    <TableRow 
                      key={ecg.id}
                      className={cn(
                        "cursor-pointer",
                        ecg.urgency === 'urgent' && "bg-red-50 hover:bg-red-100",
                        ecg.urgency !== 'urgent' && "hover:bg-gray-50",
                        expandedRow === ecg.id && "bg-indigo-50"
                      )}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setExpandedRow(expandedRow === ecg.id ? null : ecg.id)}
                        >
                          {expandedRow === ecg.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium">
                        {ecg.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center",
                            ecg.urgency === 'urgent' ? "bg-red-100" : "bg-gray-100"
                          )}>
                            <User className={cn(
                              "h-4 w-4",
                              ecg.urgency === 'urgent' ? "text-red-500" : "text-gray-500"
                            )} />
                          </div>
                          <div>
                            <p className="font-medium">{ecg.patientName}</p>
                            <p className="text-xs text-gray-500">
                              {ecg.patientGender === 'M' ? 'Homme' : 'Femme'}, {ecg.patientAge} ans
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm">{ecg.referringDoctor}</p>
                            <p className="text-xs text-gray-500">{ecg.hospital}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {format(parseISO(ecg.dateAssigned), 'dd/MM HH:mm', { locale: fr })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(parseISO(ecg.dateAssigned), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ecg.urgency === 'urgent' ? (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 animate-pulse">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            URGENT
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPreviewECG(ecg)}
                            title="Aperçu"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStartAnalysis(ecg)}
                            className={cn(
                              ecg.urgency === 'urgent' 
                                ? "bg-red-600 hover:bg-red-700" 
                                : "bg-indigo-600 hover:bg-indigo-700"
                            )}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Analyser
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
                                ecg.urgency === 'urgent' 
                                  ? "bg-red-50 border-red-200 text-red-800" 
                                  : "bg-white border-gray-200"
                              )}>
                                {ecg.clinicalContext}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Actions</h4>
                              <Button 
                                className={cn(
                                  "w-full",
                                  ecg.urgency === 'urgent' 
                                    ? "bg-red-600 hover:bg-red-700" 
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                )}
                                onClick={() => handleStartAnalysis(ecg)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Démarrer l'analyse
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
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
              {previewECG?.urgency === 'urgent' && (
                <Badge className="bg-red-100 text-red-700 ml-2">URGENT</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {previewECG && (
            <div className="space-y-4">
              {/* Infos patient */}
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

              {/* Contexte clinique */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Contexte clinique</h4>
                <div className={cn(
                  "p-3 rounded-lg text-sm",
                  previewECG.urgency === 'urgent' 
                    ? "bg-red-50 border border-red-200 text-red-800" 
                    : "bg-gray-50"
                )}>
                  {previewECG.clinicalContext}
                </div>
              </div>

              {/* Aperçu ECG */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Tracé ECG</h4>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-400">Aperçu du tracé ECG</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  ECG du {format(parseISO(previewECG.ecgDate), 'dd/MM/yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Reçu {formatDistanceToNow(parseISO(previewECG.dateReceived), { addSuffix: true, locale: fr })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewECG(null)}>
              Fermer
            </Button>
            <Button 
              onClick={() => {
                if (previewECG) handleStartAnalysis(previewECG);
                setPreviewECG(null);
              }}
              className={cn(
                previewECG?.urgency === 'urgent' 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              <Play className="h-4 w-4 mr-2" />
              Démarrer l'analyse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
