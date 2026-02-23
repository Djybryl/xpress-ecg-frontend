import { useState, useEffect } from 'react';
import {
  User,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Activity,
  Clock,
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
import { usePatientStore } from '@/stores/usePatientStore';

const PAGE_SIZE = 10;

export function PatientsSecretaire() {
  const { patients, searchPatients } = usePatientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [ecgFilter, setEcgFilter] = useState<'all' | 'with_ecg' | 'recent'>('all');
  const [page, setPage] = useState(1);

  const withECG = patients.filter(p => p.ecgCount > 0).length;
  const recentECG = patients.filter(p => p.lastEcgDate && new Date(p.lastEcgDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

  const basePatients = searchTerm ? searchPatients(searchTerm) : patients;
  const filteredPatients = basePatients.filter(p => {
    if (ecgFilter === 'with_ecg') return p.ecgCount > 0;
    if (ecgFilter === 'recent') return p.lastEcgDate && new Date(p.lastEcgDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE));
  const paginatedPatients = filteredPatients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, ecgFilter]);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Patients
          </h1>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700">
            <span className="font-bold">{patients.length}</span>
            <span className="opacity-75">total</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-xs font-medium text-green-700">
            <Activity className="h-3 w-3" />
            <span className="font-bold">{withECG}</span>
            <span className="opacity-75">avec ECG</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-xs font-medium text-amber-700">
            <Clock className="h-3 w-3" />
            <span className="font-bold">{recentECG}</span>
            <span className="opacity-75">30 jours</span>
          </span>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Rechercher un patient…"
              className="pl-8 h-8 text-xs w-52"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {[
            { value: 'all', label: 'Tous', count: patients.length },
            { value: 'with_ecg', label: 'Avec ECG', count: withECG },
            { value: 'recent', label: 'ECG < 30j', count: recentECG },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setEcgFilter(f.value as typeof ecgFilter)}
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium transition-colors',
                ecgFilter === f.value ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              )}
            >
              {f.label}
              <span className={cn('text-[10px] rounded-full px-1', ecgFilter === f.value ? 'bg-white/20' : 'bg-gray-200 text-gray-500')}>
                {f.count}
              </span>
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">
            {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''}
          </span>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold">Patient</TableHead>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Âge / Sexe</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">ECG</TableHead>
                <TableHead className="font-semibold">Dernier ECG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center',
                          patient.gender === 'M' ? 'bg-blue-100' : 'bg-pink-100'
                        )}
                      >
                        <User className={cn('h-4 w-4', patient.gender === 'M' ? 'text-blue-600' : 'text-pink-600')} />
                      </div>
                      <span className="font-medium">{patient.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-indigo-600 font-mono text-sm">{patient.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{calculateAge(patient.dateOfBirth)} ans</span>
                      <Badge variant="outline" className={cn('text-xs', patient.gender === 'M' ? 'border-blue-200 text-blue-700' : 'border-pink-200 text-pink-700')}>
                        {patient.gender === 'M' ? 'H' : 'F'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      {patient.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                      )}
                      {!patient.phone && !patient.email && <span className="text-gray-400">-</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {patient.ecgCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {patient.lastEcgDate ? formatDate(patient.lastEcgDate) : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Aucun patient trouvé
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
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-slate-500 px-2">
                {page} / {totalPages}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
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
