import { useState, useEffect } from 'react';
import {
  Archive,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useECGQueueStore } from '@/stores/useECGQueueStore';
import { useReportStore } from '@/stores/useReportStore';
import { format, parseISO, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

const PAGE_SIZE = 10;
const PERIOD_OPTIONS = [
  { value: 'all', label: 'Toutes les périodes' },
  { value: '7', label: '7 derniers jours' },
  { value: '30', label: '30 derniers jours' },
  { value: '90', label: '3 derniers mois' },
];

export function ArchivesSecretaire() {
  const { getByStatus } = useECGQueueStore();
  const { reports } = useReportStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const sentECGs = getByStatus(['sent', 'ready_to_send']);
  const sentReports = reports?.filter(r => r.status === 'sent') ?? [];

  type ArchiveItem = {
    id: string;
    type: 'ecg' | 'report';
    patientName: string;
    date: string;
    hospital: string;
    cardiologist?: string;
    ecgId?: string;
    reportId?: string;
  };

  const archiveItems: ArchiveItem[] = [
    ...sentECGs.map(ecg => ({
      id: ecg.id,
      type: 'ecg' as const,
      patientName: ecg.patientName,
      date: ecg.dateSent || ecg.dateCompleted || ecg.dateReceived,
      hospital: ecg.hospital,
      cardiologist: ecg.assignedTo,
      ecgId: ecg.id,
    })),
    ...sentReports.map(r => ({
      id: r.id,
      type: 'report' as const,
      patientName: r.patientName,
      date: r.dateSent || r.dateCompleted,
      hospital: r.hospital,
      cardiologist: r.cardiologist,
      reportId: r.id,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredItems = archiveItems.filter(item => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.cardiologist?.toLowerCase().includes(searchTerm.toLowerCase()));
    const itemDate = new Date(item.date);
    let matchesPeriod = true;
    if (periodFilter !== 'all') {
      const days = parseInt(periodFilter, 10);
      const cutoff = subMonths(new Date(), 0);
      cutoff.setDate(cutoff.getDate() - days);
      matchesPeriod = itemDate >= cutoff;
    }
    return matchesSearch && matchesPeriod;
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, periodFilter]);

  const totalECG = archiveItems.filter(i => i.type === 'ecg').length;
  const totalReports = archiveItems.filter(i => i.type === 'report').length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Archive className="h-5 w-5 text-indigo-600" />
            Archives
          </h1>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700">
            <span className="font-bold">{archiveItems.length}</span>
            <span className="opacity-75">total</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
            <FileText className="h-3 w-3" />
            <span className="font-bold">{totalECG}</span>
            <span className="opacity-75">ECG</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            <span className="font-bold">{totalReports}</span>
            <span className="opacity-75">rapports</span>
          </span>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Patient, établissement, cardiologue…"
              className="pl-8 h-8 text-xs w-56"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-gray-400">
            {filteredItems.length} élément{filteredItems.length > 1 ? 's' : ''}
          </span>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Patient</TableHead>
                <TableHead className="font-semibold">Établissement</TableHead>
                <TableHead className="font-semibold">Cardiologue</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      'text-xs',
                      item.type === 'ecg' ? 'border-slate-300 text-slate-700' : 'border-green-300 text-green-700'
                    )}>
                      {item.type === 'ecg' ? (
                        <>
                          <FileText className="h-3 w-3 mr-0.5" />
                          ECG
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-0.5" />
                          Rapport
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{item.patientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{item.hospital}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {item.cardiologist ?? '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {item.date ? format(parseISO(item.date), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Aucun élément archivé trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 py-2 border-t">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(1)} title="Première page">
                «
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-slate-500 px-2">
                {page} / {totalPages}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(totalPages)} title="Dernière page">
                »
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
