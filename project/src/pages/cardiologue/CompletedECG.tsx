import { useState } from 'react';
import { 
  CheckCircle2, 
  Search, 
  Filter,
  User,
  Building2,
  Clock,
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
import { format, parseISO, formatDistanceToNow, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function CompletedECG() {
  const { getCompleted, getCounts } = useCardiologueStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [viewReport, setViewReport] = useState<CardiologueECG | null>(null);

  const completedECGs = getCompleted();
  const counts = getCounts();

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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            ECG Terminés
          </h1>
          <p className="text-gray-500 mt-1">Historique des ECG analysés</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total analysés</p>
                <p className="text-2xl font-bold text-green-700">{counts.completed}</p>
              </div>
              <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Cette semaine</p>
                <p className="text-2xl font-bold text-blue-700">{thisWeekCount}</p>
              </div>
              <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">Normaux</p>
                <p className="text-2xl font-bold text-emerald-700">{normalCount}</p>
                <p className="text-xs text-emerald-500">
                  {counts.completed > 0 ? Math.round((normalCount / counts.completed) * 100) : 0}%
                </p>
              </div>
              <div className="h-10 w-10 bg-emerald-200 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Anormaux</p>
                <p className="text-2xl font-bold text-amber-700">{abnormalCount}</p>
                <p className="text-xs text-amber-500">
                  {counts.completed > 0 ? Math.round((abnormalCount / counts.completed) * 100) : 0}%
                </p>
              </div>
              <div className="h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher patient, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Résultat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="normal">Normaux</SelectItem>
                <SelectItem value="abnormal">Anormaux</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute période</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des ECG */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            Historique des analyses
            <Badge variant="secondary" className="ml-2">{filteredECGs.length}</Badge>
          </CardTitle>
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
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>ID ECG</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médecin référent</TableHead>
                  <TableHead>Terminé le</TableHead>
                  <TableHead>Résultat</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredECGs.map((ecg) => (
                  <>
                    <TableRow 
                      key={ecg.id}
                      className={cn(
                        "cursor-pointer hover:bg-gray-50",
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
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{ecg.patientName}</p>
                            <p className="text-xs text-gray-500">
                              {ecg.patientGender === 'M' ? 'H' : 'F'}, {ecg.patientAge} ans
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
                            {ecg.dateCompleted && format(parseISO(ecg.dateCompleted), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ecg.dateCompleted && formatDistanceToNow(parseISO(ecg.dateCompleted), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ecg.interpretation?.isNormal ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Normal
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700">
                            <Activity className="h-3 w-3 mr-1" />
                            Anormal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewReport(ecg)}
                            title="Voir le rapport"
                          >
                            <Eye className="h-4 w-4 text-indigo-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4 text-gray-600" />
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
                                {ecg.interpretation?.findings.map((finding, idx) => (
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
                  </>
                ))}
              </TableBody>
            </Table>
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
                  {viewReport.interpretation?.findings.map((finding, idx) => (
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
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
