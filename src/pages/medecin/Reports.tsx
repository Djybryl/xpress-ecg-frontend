import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bell,
  Clock,
  Mail,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReportStore } from '@/stores/useReportStore';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

export function ReportsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reports, unreadCount, urgentUnreadCount, markAsRead, markAllAsRead } = useReportStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleExport = (format: 'pdf' | 'excel') => {
    toast({
      title: "Export en cours",
      description: `Génération du fichier ${format.toUpperCase()} avec ${filteredReports.length} rapport(s)...`
    });
    // TODO: Implémenter l'export réel
  };

  // Filtrage des rapports
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.ecgId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.conclusion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'unread' && !report.isRead) ||
      (filterStatus === 'read' && report.isRead);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewReport = (reportId: string) => {
    markAsRead(reportId);
    navigate(`/medecin/reports/${reportId}`);
  };

  const handleDownloadPdf = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulation de téléchargement
    const report = reports.find(r => r.id === reportId);
    if (report) {
      markAsRead(reportId);
      // TODO: Implémenter le vrai téléchargement PDF
      console.log('Téléchargement du rapport:', reportId);
    }
  };

  return (
    <div className="space-y-3">
      {/* En-tête compact */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Rapports reçus
          </h1>
          {urgentUnreadCount > 0 && (
            <button
              className="flex items-center gap-1 px-2 py-0.5 bg-red-100 border border-red-300 rounded-full text-xs font-semibold text-red-700 animate-pulse hover:bg-red-200 transition-colors"
              onClick={() => setFilterStatus('unread')}
            >
              <AlertCircle className="h-3 w-3" />
              {urgentUnreadCount} urgent{urgentUnreadCount > 1 ? 's' : ''} non lu{urgentUnreadCount > 1 ? 's' : ''}
            </button>
          )}
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 rounded-full text-xs font-medium text-amber-700">
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Tout marquer lu
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" />Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />Exporter en Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tableau des rapports */}
      <Card>
        <CardHeader className="border-b p-0">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Patient, ECG, conclusion…"
                className="pl-8 h-8 text-xs w-52"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            {[
              { value: 'all',    label: 'Tous',     count: reports.length },
              { value: 'unread', label: 'Non lus',  count: unreadCount },
              { value: 'read',   label: 'Lus',      count: reports.length - unreadCount },
            ].map(f => (
              <button key={f.value}
                onClick={() => { setFilterStatus(f.value as typeof filterStatus); setCurrentPage(1); }}
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium transition-colors',
                  filterStatus === f.value ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                )}
              >
                {f.label}
                <span className={cn('text-[10px] rounded-full px-1', filterStatus === f.value ? 'bg-white/20' : 'bg-gray-200 text-gray-500')}>{f.count}</span>
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">{filteredReports.length} rapport{filteredReports.length > 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-10"></TableHead>
                <TableHead className="font-semibold">Patient</TableHead>
                <TableHead className="font-semibold">ECG</TableHead>
                <TableHead className="font-semibold">Rapport reçu</TableHead>
                <TableHead className="font-semibold">Cardiologue</TableHead>
                <TableHead className="font-semibold">Conclusion</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentReports.map((report) => (
                <TableRow 
                  key={report.id} 
                  className={cn(
                    'cursor-pointer transition-colors',
                    !report.isRead && 'bg-amber-50/50 hover:bg-amber-100/50',
                    report.isRead && 'hover:bg-gray-50',
                    report.isUrgent && !report.isRead && 'bg-red-50/50 hover:bg-red-100/50'
                  )}
                  onClick={() => handleViewReport(report.id)}
                >
                  <TableCell>
                    {!report.isRead && (
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        report.isUrgent ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                      )} />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{report.patientName}</span>
                      {report.isUrgent && (
                        <Badge variant="destructive" className="text-xs">
                          URGENT
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-indigo-600 font-medium">{report.ecgId}</span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(report.dateReceived)}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {report.cardiologist}
                  </TableCell>
                  <TableCell>
                    <p className={cn(
                      'text-sm truncate max-w-[250px]',
                      report.isUrgent && 'text-red-700 font-medium'
                    )}>
                      {report.conclusion}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Voir le rapport"
                        onClick={() => handleViewReport(report.id)}
                      >
                        <Eye className="h-4 w-4 text-indigo-600" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4 text-green-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleDownloadPdf(report.id, e as any)}>
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Envoyer par email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {currentReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun rapport trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredReports.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
              <span className="text-sm text-gray-500">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredReports.length)} sur {filteredReports.length}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 px-0 ${currentPage === page ? 'bg-indigo-600' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
