import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
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
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports reçus</h1>
          <p className="text-gray-500">Consultez les interprétations de vos ECG</p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exporter en Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Alerte urgences */}
      {urgentUnreadCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-800">
                {urgentUnreadCount} rapport{urgentUnreadCount > 1 ? 's' : ''} urgent{urgentUnreadCount > 1 ? 's' : ''} non lu{urgentUnreadCount > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-600">
                Veuillez consulter ces rapports en priorité
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setFilterStatus('unread')}
            >
              Voir les urgences
            </Button>
          </div>
        </div>
      )}


      {/* Tableau des rapports */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg">Liste des rapports</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un patient, ECG..."
                  className="pl-9 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-10"></TableHead>
                <TableHead className="font-semibold">Patient</TableHead>
                <TableHead className="font-semibold">ECG</TableHead>
                <TableHead className="font-semibold">Date réception</TableHead>
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
