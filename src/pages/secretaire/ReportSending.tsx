import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Download,
  Eye,
  AlertCircle,
  RefreshCw,
  Activity,
  ExternalLink,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { useReportList } from '@/hooks/useReportList';
import type { ReportItem } from '@/hooks/useReportList';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

export function ReportSending() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reports, loading, error, refetch } = useReportList();

  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);

  const filteredReports = reports.filter(r => {
    const matchesSearch =
      (r.patient_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.ecg_reference ?? r.ecg_record_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.cardiologist_name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all'
      ? true
      : urgencyFilter === 'urgent' ? r.is_urgent : !r.is_urgent;
    return matchesSearch && matchesUrgency;
  }).sort((a, b) => {
    if (a.is_urgent && !b.is_urgent) return -1;
    if (!a.is_urgent && b.is_urgent) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const paginatedReports = filteredReports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDownload = (report: ReportItem) => {
    if (report.pdf_url) {
      window.open(report.pdf_url, '_blank');
    } else {
      toast({
        title: 'PDF non disponible',
        description: 'Le PDF de ce rapport n\'a pas encore été généré.',
        variant: 'destructive',
      });
    }
  };

  const getConclusion = (r: ReportItem): string => {
    if (r.conclusion) return r.conclusion;
    const interp = r as unknown as { interpretation?: { conclusion?: string } };
    return interp.interpretation?.conclusion ?? '—';
  };

  return (
    <div className="space-y-3">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          Rapports terminés
          {reports.length > 0 && (
            <Badge variant="secondary" className="text-xs">{reports.length}</Badge>
          )}
        </h1>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={refetch} title="Actualiser">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refetch} className="ml-4 h-7 text-xs">Réessayer</Button>
        </div>
      )}

      <Card>
        <CardHeader className="border-b p-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Patient, Référence, cardiologue…"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-8 h-8 text-xs w-52"
              />
            </div>
            <Select value={urgencyFilter} onValueChange={(v) => { setUrgencyFilter(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue placeholder="Urgence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="urgent">Urgents</SelectItem>
                <SelectItem value="normal">Normaux</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-auto text-xs text-gray-400">{filteredReports.length} rapport{filteredReports.length > 1 ? 's' : ''}</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mr-3" />
              Chargement des rapports…
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Aucun rapport disponible</p>
              <p className="text-sm">Les rapports finalisés par les cardiologues apparaîtront ici</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[40px]" />
                  <TableHead>Référence ECG</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Cardiologue</TableHead>
                  <TableHead>Finalisé</TableHead>
                  <TableHead>Urgence</TableHead>
                  <TableHead>Conclusion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReports.map((report) => (
                  <>
                    <TableRow
                      key={report.id}
                      className={cn(
                        "cursor-pointer text-sm hover:bg-gray-50",
                        report.is_urgent && "bg-red-50/60 hover:bg-red-100/60",
                        expandedRow === report.id && "bg-indigo-50/60"
                      )}
                    >
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-6 w-6"
                          onClick={() => setExpandedRow(expandedRow === report.id ? null : report.id)}>
                          {expandedRow === report.id
                            ? <span className="text-xs">▲</span>
                            : <span className="text-xs">▼</span>}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium text-indigo-700">
                        {report.ecg_reference ?? report.ecg_record_id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium">{report.patient_name ?? '—'}</TableCell>
                      <TableCell className="text-gray-600">{report.cardiologist_name ?? '—'}</TableCell>
                      <TableCell>
                        <p className="leading-tight">{format(parseISO(report.created_at), 'dd/MM/yy HH:mm', { locale: fr })}</p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(parseISO(report.created_at), { addSuffix: true, locale: fr })}
                        </p>
                      </TableCell>
                      <TableCell>
                        {report.is_urgent ? (
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />URGENT
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <p className={cn(
                          "text-xs truncate",
                          report.is_normal ? 'text-green-700' : 'text-red-700'
                        )}>
                          {getConclusion(report)}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7"
                            title="Voir le rapport" onClick={() => navigate(`/secretaire/reports/${report.id}`)}>
                            <Eye className="h-3.5 w-3.5 text-indigo-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7"
                            title={report.pdf_url ? 'Télécharger PDF' : 'PDF non disponible'}
                            onClick={() => handleDownload(report)}
                            disabled={!report.pdf_url}
                          >
                            <Download className={cn("h-3.5 w-3.5", report.pdf_url ? "text-indigo-600" : "text-gray-300")} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedRow === report.id && (
                      <TableRow key={`${report.id}-exp`} className="bg-gray-50">
                        <TableCell colSpan={8} className="p-4">
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Rapport</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">Patient :</span> {report.patient_name}</p>
                                <p><span className="text-gray-500">Cardiologue :</span> {report.cardiologist_name}</p>
                                <p><span className="text-gray-500">ECG normal :</span>
                                  <span className={cn('ml-1 font-medium', report.is_normal ? 'text-green-600' : 'text-red-600')}>
                                    {report.is_normal ? 'Oui' : 'Non'}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <h4 className="font-semibold text-sm mb-2">Conclusion</h4>
                              <p className="text-sm bg-white p-3 rounded border">{getConclusion(report)}</p>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-gray-500">
              <span>page {page}/{totalPages}</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</Button>
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog aperçu rapport */}
      <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Rapport — <span className="font-mono text-indigo-600">
                {previewReport?.ecg_reference ?? previewReport?.ecg_record_id?.slice(0, 12)}
              </span>
            </DialogTitle>
          </DialogHeader>
          {previewReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                  <p><span className="text-gray-500">Patient :</span> <span className="font-medium">{previewReport.patient_name ?? '—'}</span></p>
                  <p><span className="text-gray-500">Cardiologue :</span> {previewReport.cardiologist_name ?? '—'}</p>
                  <p><span className="text-gray-500">Finalisé :</span> {format(parseISO(previewReport.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                  <p><span className="text-gray-500">Urgence :</span>
                    {previewReport.is_urgent
                      ? <Badge className="ml-2 bg-red-100 text-red-700 text-xs">URGENT</Badge>
                      : <Badge variant="outline" className="ml-2 text-xs">Normal</Badge>}
                  </p>
                  <p><span className="text-gray-500">ECG normal :</span>
                    <span className={cn('ml-1 font-medium', previewReport.is_normal ? 'text-green-600' : 'text-red-600')}>
                      {previewReport.is_normal ? 'Oui' : 'Non'}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Conclusion</h4>
                <p className="text-sm bg-white p-3 rounded border">{getConclusion(previewReport)}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {previewReport?.pdf_url && (
              <Button
                variant="outline"
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                onClick={() => { if (previewReport.pdf_url) window.open(previewReport.pdf_url, '_blank'); }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir le PDF
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => handleDownload(previewReport!)}
              disabled={!previewReport?.pdf_url}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <Button variant="outline" onClick={() => setPreviewReport(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
