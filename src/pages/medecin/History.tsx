import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Building2,
  FileText,
  Activity,
  TrendingUp,
  BarChart2,
  ChevronDown,
  ChevronUp,
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
import { format, parseISO, subMonths, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";

type ECGStatus = 'pending' | 'received' | 'analyzing' | 'completed';
type Urgency = 'normal' | 'urgent';

interface HistoryEntry {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  dateSent: string;
  dateCompleted?: string;
  status: ECGStatus;
  urgency: Urgency;
  cardiologist?: string;
  hospital: string;
  clinicalContext: string;
  ecgDate: string;
  conclusion?: string;
  isNormal?: boolean;
  reportId?: string;
}

const mockHistory: HistoryEntry[] = [
  {
    id: 'ECG-2024-0409', patientName: 'Pierre Dupont', patientAge: 58, patientGender: 'M',
    dateSent: '2024-12-25T08:30:00', dateCompleted: '2024-12-25T10:15:00',
    status: 'completed', urgency: 'normal', cardiologist: 'Dr. Sophie Bernard',
    hospital: 'CHU de Yaoundé', clinicalContext: 'Palpitations, bilan cardiovasculaire',
    ecgDate: '2024-12-25', conclusion: 'ECG normal, rythme sinusal régulier.', isNormal: true, reportId: 'RPT-001',
  },
  {
    id: 'ECG-2024-0405', patientName: 'Robert Petit', patientAge: 72, patientGender: 'M',
    dateSent: '2024-12-20T09:00:00', dateCompleted: '2024-12-20T10:30:00',
    status: 'completed', urgency: 'urgent', cardiologist: 'Dr. François Dubois',
    hospital: 'Hôpital Central', clinicalContext: 'Syncope, fibrillation auriculaire connue',
    ecgDate: '2024-12-20', conclusion: 'Fibrillation auriculaire à réponse ventriculaire rapide. Cardioversion à discuter.', isNormal: false, reportId: 'RPT-002',
  },
  {
    id: 'ECG-2024-0401', patientName: 'Anne Lecomte', patientAge: 45, patientGender: 'F',
    dateSent: '2024-12-15T14:00:00', dateCompleted: '2024-12-15T16:45:00',
    status: 'completed', urgency: 'normal', cardiologist: 'Dr. Sophie Bernard',
    hospital: 'Clinique des Princes', clinicalContext: 'Bilan pré-opératoire',
    ecgDate: '2024-12-15', conclusion: 'ECG normal.', isNormal: true, reportId: 'RPT-003',
  },
  {
    id: 'ECG-2024-0395', patientName: 'Michel Garcia', patientAge: 64, patientGender: 'M',
    dateSent: '2024-12-10T10:30:00', dateCompleted: '2024-12-10T13:00:00',
    status: 'completed', urgency: 'normal', cardiologist: 'Dr. Sophie Bernard',
    hospital: 'CHU de Yaoundé', clinicalContext: 'HTA, suivi cardiologique',
    ecgDate: '2024-12-10', conclusion: 'Hypertrophie ventriculaire gauche. Critères de Sokolow positifs.', isNormal: false, reportId: 'RPT-004',
  },
  {
    id: 'ECG-2024-0388', patientName: 'Claire Moreau', patientAge: 38, patientGender: 'F',
    dateSent: '2024-11-28T08:00:00', dateCompleted: '2024-11-28T09:30:00',
    status: 'completed', urgency: 'urgent', cardiologist: 'Dr. François Dubois',
    hospital: 'Hôpital Central', clinicalContext: 'Douleur thoracique aiguë',
    ecgDate: '2024-11-28', conclusion: 'Sus-décalage ST en V1-V4. IDM antérieur aigu. Prise en charge urgente.', isNormal: false, reportId: 'RPT-005',
  },
  {
    id: 'ECG-2024-0412', patientName: 'Sophie Martin', patientAge: 45, patientGender: 'F',
    dateSent: '2024-12-25T14:30:00', status: 'pending', urgency: 'urgent',
    hospital: 'CHU de Yaoundé', clinicalContext: 'Douleur thoracique atypique',
    ecgDate: '2024-12-25',
  },
  {
    id: 'ECG-2024-0411', patientName: 'Lucas Bernard', patientAge: 62, patientGender: 'M',
    dateSent: '2024-12-25T11:00:00', status: 'received', urgency: 'normal',
    hospital: 'CHU de Yaoundé', clinicalContext: 'Bilan pré-opératoire',
    ecgDate: '2024-12-25',
  },
  {
    id: 'ECG-2024-0407', patientName: 'Jean-Paul Mercier', patientAge: 55, patientGender: 'M',
    dateSent: '2024-12-25T06:00:00', dateCompleted: '2024-12-25T07:45:00',
    status: 'completed', urgency: 'normal', cardiologist: 'Dr. Sophie Bernard',
    hospital: 'Clinique des Princes', clinicalContext: 'Suivi post-IDM',
    ecgDate: '2024-12-25', conclusion: 'Rythme sinusal régulier. Ondes Q séquellaires en V1-V4.', isNormal: false, reportId: 'RPT-006',
  },
];

const statusConfig: Record<ECGStatus, { label: string; icon: React.ElementType; className: string; step: number }> = {
  pending:   { label: 'En attente',    icon: Clock,        className: 'bg-amber-100 text-amber-700 border-amber-300',  step: 1 },
  received:  { label: 'Reçu',          icon: Activity,     className: 'bg-blue-100 text-blue-700 border-blue-300',     step: 2 },
  analyzing: { label: 'En analyse',    icon: Activity,     className: 'bg-indigo-100 text-indigo-700 border-indigo-300', step: 3 },
  completed: { label: 'Interprété',    icon: CheckCircle2, className: 'bg-green-100 text-green-700 border-green-300',  step: 4 },
};

const STEPS: { key: ECGStatus; label: string }[] = [
  { key: 'pending',   label: 'Envoyé' },
  { key: 'received',  label: 'Reçu' },
  { key: 'analyzing', label: 'Analyse' },
  { key: 'completed', label: 'Rapport' },
];

function StatusTimeline({ status }: { status: ECGStatus }) {
  const current = statusConfig[status].step;
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const done = statusConfig[step.key].step <= current;
        const active = statusConfig[step.key].step === current;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-0.5">
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold",
                done
                  ? active
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              )}>
                {done && !active ? '✓' : i + 1}
              </div>
              <span className={cn("text-[9px]", done ? 'text-gray-600' : 'text-gray-300')}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 flex-1 mb-3", statusConfig[STEPS[i + 1].key].step <= current ? 'bg-green-400' : 'bg-gray-200')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function HistoryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ECGStatus | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'all'>('all');
  const [periodFilter, setPeriodFilter] = useState<'1month' | '3months' | '6months' | 'all'>('3months');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const filtered = useMemo(() => {
    const cutoff =
      periodFilter === '1month' ? subMonths(new Date(), 1)
      : periodFilter === '3months' ? subMonths(new Date(), 3)
      : periodFilter === '6months' ? subMonths(new Date(), 6)
      : null;

    return mockHistory.filter(e => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (urgencyFilter !== 'all' && e.urgency !== urgencyFilter) return false;
      if (cutoff && !isAfter(parseISO(e.dateSent), cutoff)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return e.patientName.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.hospital.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, statusFilter, urgencyFilter, periodFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Stats résumées
  const stats = useMemo(() => ({
    total:     mockHistory.length,
    completed: mockHistory.filter(e => e.status === 'completed').length,
    pending:   mockHistory.filter(e => e.status !== 'completed').length,
    urgent:    mockHistory.filter(e => e.urgency === 'urgent').length,
    normal:    mockHistory.filter(e => e.isNormal === true).length,
    abnormal:  mockHistory.filter(e => e.isNormal === false).length,
  }), []);

  return (
    <div className="space-y-3">
      {/* En-tête compact + KPIs en pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mr-2">
          <Clock className="h-5 w-5 text-emerald-600" />
          Historique ECG
        </h1>
        {[
          { label: 'Total',      value: stats.total,     color: 'border-indigo-300 text-indigo-700 bg-indigo-50', icon: BarChart2 },
          { label: 'Interprétés', value: stats.completed, color: 'border-green-300 text-green-700 bg-green-50',  icon: CheckCircle2 },
          { label: 'En attente', value: stats.pending,   color: 'border-amber-300 text-amber-700 bg-amber-50',  icon: Clock },
          { label: 'Urgents',    value: stats.urgent,    color: 'border-red-300 text-red-700 bg-red-50',        icon: AlertCircle },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium', k.color)}>
              <Icon className="h-3 w-3" />
              <span className="font-bold">{k.value}</span>
              <span className="font-normal opacity-75">{k.label}</span>
            </div>
          );
        })}
      </div>

      {/* Card liste avec filtres dans le header */}
      <Card>
        <CardHeader className="border-b p-0">
          <div className="flex items-center gap-2 flex-wrap px-3 py-2 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Patient, ID ECG, établissement…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 h-8 text-xs w-48"
              />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as ECGStatus | 'all'); setPage(1); }}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="received">Reçu</SelectItem>
                <SelectItem value="analyzing">En analyse</SelectItem>
                <SelectItem value="completed">Interprété</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={v => { setUrgencyFilter(v as Urgency | 'all'); setPage(1); }}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="urgent">Urgents</SelectItem>
                <SelectItem value="normal">Normaux</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={v => { setPeriodFilter(v as typeof periodFilter); setPage(1); }}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <Calendar className="h-3 w-3 mr-1 text-gray-400" /><SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 mois</SelectItem>
                <SelectItem value="3months">3 mois</SelectItem>
                <SelectItem value="6months">6 mois</SelectItem>
                <SelectItem value="all">Tout</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-auto text-xs text-gray-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
        <CardContent className="p-3">

      {/* Liste */}
      <div className="space-y-3">
        {paginated.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune demande trouvée</p>
              <p className="text-sm mt-1">Modifiez les filtres pour élargir la recherche</p>
            </CardContent>
          </Card>
        ) : (
          paginated.map(entry => {
            const cfg = statusConfig[entry.status];
            const Icon = cfg.icon;
            const isExpanded = expandedId === entry.id;
            return (
              <Card key={entry.id} className={cn("transition-all hover:shadow-md", entry.urgency === 'urgent' && 'border-red-200')}>
                <CardContent className="p-0">
                  <button
                    className="w-full text-left p-4"
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icône statut */}
                      <div className={cn("p-2 rounded-lg border shrink-0 mt-0.5", cfg.className)}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Infos principales */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-800">{entry.patientName}</span>
                          <span className="font-mono text-xs text-gray-400">{entry.id}</span>
                          {entry.urgency === 'urgent' && (
                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                          )}
                          <Badge variant="outline" className={cn("text-xs border", cfg.className)}>
                            {cfg.label}
                          </Badge>
                          {entry.status === 'completed' && (
                            <Badge variant="outline" className={cn(
                              "text-xs border",
                              entry.isNormal ? 'border-green-400 text-green-700 bg-green-50' : 'border-amber-400 text-amber-700 bg-amber-50'
                            )}>
                              {entry.isNormal ? '✓ Normal' : '⚠ Anormal'}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(parseISO(entry.dateSent), 'dd MMM yyyy HH:mm', { locale: fr })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />{entry.hospital}
                          </span>
                          {entry.cardiologist && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />{entry.cardiologist}
                            </span>
                          )}
                        </div>

                        {/* Timeline */}
                        <div className="mt-3 max-w-xs">
                          <StatusTimeline status={entry.status} />
                        </div>
                      </div>

                      {/* Toggle + actions */}
                      <div className="flex flex-col items-end gap-2">
                        {entry.reportId && (
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            <FileText className="h-3 w-3 mr-1" /> Rapport
                          </Button>
                        )}
                        <div className="text-gray-400">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Détail expandé */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t pt-3 bg-gray-50 rounded-b-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Contexte clinique</p>
                          <p className="text-gray-700">{entry.clinicalContext}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Patient</p>
                          <p className="text-gray-700">
                            {entry.patientGender === 'M' ? 'Homme' : 'Femme'}, {entry.patientAge} ans — ECG du {format(parseISO(entry.ecgDate), 'dd/MM/yyyy', { locale: fr })}
                          </p>
                        </div>
                        {entry.conclusion && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Conclusion</p>
                            <div className={cn(
                              "p-3 rounded-lg border text-gray-800",
                              entry.isNormal ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                            )}>
                              {entry.conclusion}
                            </div>
                          </div>
                        )}
                        {entry.dateCompleted && (
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Date d'interprétation</p>
                            <p className="text-gray-700">{format(parseISO(entry.dateCompleted), 'dd MMM yyyy à HH:mm', { locale: fr })}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
          <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''} • page {page}/{totalPages}</span>
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
