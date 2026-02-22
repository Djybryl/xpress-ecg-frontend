import { useState, useMemo } from 'react';
import {
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAdminStore, type ActivityLog } from '@/stores/useAdminStore';
import { format, parseISO, isToday, isYesterday, subDays, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type LogType = ActivityLog['type'] | 'all';
type DateRange = 'today' | 'yesterday' | '7days' | '30days' | 'all';

const typeConfig: Record<ActivityLog['type'], { label: string; icon: React.ElementType; className: string; dotClass: string }> = {
  info:    { label: 'Info',     icon: Info,          className: 'bg-blue-50 text-blue-700 border-blue-200',    dotClass: 'bg-blue-500' },
  success: { label: 'Succès',   icon: CheckCircle2,  className: 'bg-green-50 text-green-700 border-green-200', dotClass: 'bg-green-500' },
  warning: { label: 'Alerte',   icon: AlertTriangle, className: 'bg-amber-50 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
  error:   { label: 'Erreur',   icon: AlertCircle,   className: 'bg-red-50 text-red-700 border-red-200',       dotClass: 'bg-red-500' },
};

function getDateRangeFilter(range: DateRange): Date | null {
  const now = new Date();
  switch (range) {
    case 'today':     return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'yesterday': return subDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), 1);
    case '7days':     return subDays(now, 7);
    case '30days':    return subDays(now, 30);
    default:          return null;
  }
}

function formatTimestamp(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d))     return `Aujourd'hui à ${format(d, 'HH:mm')}`;
  if (isYesterday(d)) return `Hier à ${format(d, 'HH:mm')}`;
  return format(d, 'dd MMM yyyy à HH:mm', { locale: fr });
}

export function ActivityLogs() {
  const { getLogs, addLog } = useAdminStore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<LogType>('all');
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const logs = getLogs();

  const filtered = useMemo(() => {
    const cutoff = getDateRangeFilter(dateRange);
    return logs.filter(log => {
      if (typeFilter !== 'all' && log.type !== typeFilter) return false;
      if (cutoff && !isAfter(parseISO(log.timestamp), cutoff)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          log.userName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, typeFilter, dateRange, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Compteurs par type
  const counts = useMemo(() => ({
    info:    logs.filter(l => l.type === 'info').length,
    success: logs.filter(l => l.type === 'success').length,
    warning: logs.filter(l => l.type === 'warning').length,
    error:   logs.filter(l => l.type === 'error').length,
  }), [logs]);

  function handleRefresh() {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: 'Journaux mis à jour', description: `${logs.length} entrées chargées.` });
    }, 800);
  }

  function handleExport() {
    const csv = [
      'Date,Utilisateur,Action,Détails,Type',
      ...filtered.map(l =>
        [formatTimestamp(l.timestamp), l.userName, l.action, l.details, l.type].join(',')
      )
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-xpress-ecg-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export réussi', description: `${filtered.length} entrées exportées en CSV.` });
  }

  // Simuler un nouvel événement
  function handleSimulate() {
    const samples = [
      { action: 'ECG analysé', details: 'ECG-2024-0500 — Patient Test', type: 'success' as const, userId: 'USR-001', userName: 'Dr. Sophie Bernard' },
      { action: 'Tentative de connexion échouée', details: 'IP: 192.168.1.100 — 3 tentatives', type: 'error' as const, userId: 'SYS', userName: 'Système' },
      { action: 'Rapport envoyé', details: 'ECG-2024-0498 — Rapport envoyé à Dr. Martin', type: 'info' as const, userId: 'USR-003', userName: 'Marie Dubois' },
    ];
    const sample = samples[Math.floor(Math.random() * samples.length)];
    addLog(sample);
    toast({ title: 'Événement simulé', description: sample.action });
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-600" />
            Journaux d'activité
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Audit complet de toutes les actions sur la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSimulate}>
            + Simuler
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Exporter CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(Object.entries(typeConfig) as [ActivityLog['type'], typeof typeConfig[ActivityLog['type']]][]).map(([type, cfg]) => {
          const Icon = cfg.icon;
          return (
            <Card
              key={type}
              className={cn("cursor-pointer border transition-all hover:shadow-md", typeFilter === type ? 'ring-2 ring-indigo-500' : '')}
              onClick={() => setTypeFilter(prev => prev === type ? 'all' : type)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg border", cfg.className)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{cfg.label}</p>
                  <p className="text-lg font-bold">{counts[type]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par utilisateur, action, détails…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={v => { setTypeFilter(v as LogType); setPage(1); }}>
              <SelectTrigger className="w-36">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="success">Succès</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Alerte</SelectItem>
                <SelectItem value="error">Erreur</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={v => { setDateRange(v as DateRange); setPage(1); }}>
              <SelectTrigger className="w-36">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="yesterday">Hier</SelectItem>
                <SelectItem value="7days">7 derniers jours</SelectItem>
                <SelectItem value="30days">30 derniers jours</SelectItem>
                <SelectItem value="all">Tout l'historique</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(typeFilter !== 'all' || dateRange !== '7days' || search) && (
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <span>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => { setSearch(''); setTypeFilter('all'); setDateRange('7days'); setPage(1); }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-700">
            Entrées ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {paginated.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun journal trouvé</p>
              <p className="text-sm mt-1">Modifiez les filtres pour élargir la recherche</p>
            </div>
          ) : (
            <div className="divide-y">
              {paginated.map((log) => {
                const cfg = typeConfig[log.type];
                const Icon = cfg.icon;
                const isExpanded = expandedId === log.id;
                return (
                  <div key={log.id} className="hover:bg-gray-50 transition-colors">
                    <button
                      className="w-full text-left px-5 py-3 flex items-start gap-4"
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      {/* Indicateur type */}
                      <div className={cn("p-1.5 rounded-md border shrink-0 mt-0.5", cfg.className)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-800">{log.action}</span>
                          <Badge variant="outline" className={cn("text-xs border", cfg.className)}>
                            {cfg.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">{log.details}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />{log.userName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{formatTimestamp(log.timestamp)}
                          </span>
                          <span className="font-mono opacity-60">{log.id}</span>
                        </div>
                      </div>

                      {/* Toggle */}
                      <div className="shrink-0 text-gray-400 mt-1">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {/* Détail expandé */}
                    {isExpanded && (
                      <div className="px-5 pb-4 pl-16 border-t bg-gray-50">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-3">
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">ID Événement</p>
                            <p className="font-mono text-gray-700">{log.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Utilisateur</p>
                            <p className="text-gray-700">{log.userName} <span className="text-gray-400">({log.userId})</span></p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Horodatage précis</p>
                            <p className="font-mono text-gray-700">{format(parseISO(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Détails complets</p>
                            <p className="text-gray-700">{log.details}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50">
              <p className="text-sm text-gray-500">
                Page {page} / {totalPages} — {filtered.length} entrée{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Précédent
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
