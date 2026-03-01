import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Search,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
  Eye,
  Calendar,
  Activity,
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
import { useAuthContext } from '@/providers/AuthProvider';
import { useEcgList, ecgRef } from '@/hooks/useEcgList';
import { format, parseISO, formatDistanceToNow, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function CompletedECG() {
  const { user } = useAuthContext();
  const { records: completedECGs, loading, error } = useEcgList({
    status: 'completed',
    assigned_to: user?.id,
    limit: 300,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekCount = completedECGs.filter(e =>
    e.analyzed_at && isWithinInterval(parseISO(e.analyzed_at), { start: thisWeekStart, end: thisWeekEnd })
  ).length;

  const filteredECGs = completedECGs.filter(ecg => {
    const matchesSearch =
      ecg.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ecgRef(ecg).toLowerCase().includes(searchTerm.toLowerCase());

    let matchesPeriod = true;
    if (periodFilter === 'today') {
      matchesPeriod = ecg.analyzed_at
        ? new Date(ecg.analyzed_at).toDateString() === new Date().toDateString()
        : false;
    } else if (periodFilter === 'week') {
      matchesPeriod = ecg.analyzed_at
        ? isWithinInterval(parseISO(ecg.analyzed_at), { start: thisWeekStart, end: thisWeekEnd })
        : false;
    }

    return matchesSearch && matchesPeriod;
  });

  const totalPages = Math.max(1, Math.ceil(filteredECGs.length / PAGE_SIZE));
  const paginatedECGs = filteredECGs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [searchTerm, resultFilter, periodFilter]);

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      {/* En-tête compact avec résumé inline */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          ECG Terminés
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />{loading ? '…' : completedECGs.length} total
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium">
            <Calendar className="h-3.5 w-3.5" />{thisWeekCount} cette semaine
          </span>
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
                  placeholder="Patient, ID…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm w-48"
                />
              </div>
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
                        {ecgRef(ecg)}
                      </TableCell>
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <div>
                            <p className="font-medium leading-tight">{ecg.patient_name}</p>
                            {ecg.gender && <p className="text-xs text-gray-400">{ecg.gender === 'M' ? 'H' : 'F'}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5">
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Building2 className="h-3 w-3" />{ecg.medical_center}</p>
                      </TableCell>
                      <TableCell className="py-1.5">
                        <p className="leading-tight">
                          {ecg.analyzed_at && format(parseISO(ecg.analyzed_at), 'dd/MM HH:mm', { locale: fr })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {ecg.analyzed_at && formatDistanceToNow(parseISO(ecg.analyzed_at), { addSuffix: true, locale: fr })}
                        </p>
                      </TableCell>
                      <TableCell className="py-1.5">
                        {ecg.urgency === 'urgent' ? (
                          <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5">Urgent</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 text-[10px] px-1.5">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-1.5 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Voir le rapport">
                            <Eye className="h-3.5 w-3.5 text-indigo-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedRow === ecg.id && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={7} className="p-4">
                          <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Contexte clinique</p>
                              <p className="text-gray-700">{ecg.clinical_context ?? '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Date ECG</p>
                              <p className="text-gray-700">
                                {ecg.date ? format(parseISO(ecg.date), 'dd MMM yyyy', { locale: fr }) : '—'}
                              </p>
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

    </div>
  );
}
