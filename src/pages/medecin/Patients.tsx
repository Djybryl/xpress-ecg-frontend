import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Search,
  Plus,
  FileText,
  Calendar,
  ChevronRight,
  ChevronLeftIcon,
  ChevronRightIcon,
  Phone,
  Mail,
  Activity,
  Clock,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { usePatientList, type PatientItem } from '@/hooks/usePatientList';
import { PatientECGHistory } from '@/components/patients/PatientECGHistory';

export function PatientsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [ecgFilter, setEcgFilter] = useState<'all' | 'with_ecg' | 'recent'>('all');
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { patients, loading, error } = usePatientList({ search: searchTerm || undefined, limit: 200 });

  const handleExport = (format: 'pdf' | 'excel') => {
    toast({
      title: "Export en cours",
      description: `Génération du fichier ${format.toUpperCase()} avec ${filteredPatients.length} patient(s)...`
    });
  };

  // Stats
  const withECG = patients.filter(p => (p.ecg_count ?? 0) > 0).length;
  const recentECG = patients.filter(p => p.last_ecg_date && new Date(p.last_ecg_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

  // Filtrage des patients
  const filteredPatients = patients.filter(p => {
    if (ecgFilter === 'with_ecg') return (p.ecg_count ?? 0) > 0;
    if (ecgFilter === 'recent') return p.last_ecg_date && new Date(p.last_ecg_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  // Calcul de l'âge
  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      {/* En-tête compact avec pills stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Mes patients
          </h1>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700">
            {loading ? <span className="animate-pulse">…</span> : <span className="font-bold">{patients.length}</span>}
            <span className="opacity-75">total</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-xs font-medium text-green-700">
            <Activity className="h-3 w-3" />
            <span className="font-bold">{withECG}</span>
            <span className="opacity-75">avec ECG</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-xs font-medium text-amber-700">
            <Clock className="h-3 w-3" />
            <span className="font-bold">{recentECG}</span>
            <span className="opacity-75">30 jours</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs"
            onClick={() => navigate('/medecin/new-ecg')}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />Nouvel ECG
          </Button>
        </div>
      </div>

      {/* Tableau des patients */}
      <Card>
        <CardHeader className="border-b p-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Rechercher un patient…"
                className="pl-8 h-8 text-xs w-52"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            {[
              { value: 'all',      label: 'Tous',             count: patients.length },
              { value: 'with_ecg', label: 'Avec ECG',         count: withECG },
              { value: 'recent',   label: 'ECG < 30 jours',   count: recentECG },
            ].map(f => (
              <button key={f.value}
                onClick={() => { setEcgFilter(f.value as typeof ecgFilter); setCurrentPage(1); }}
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium transition-colors',
                  ecgFilter === f.value ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                )}
              >
                {f.label}
                <span className={cn('text-[10px] rounded-full px-1', ecgFilter === f.value ? 'bg-white/20' : 'bg-gray-200 text-gray-500')}>{f.count}</span>
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">{filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
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
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPatients.map((patient) => (
                <TableRow 
                  key={patient.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        patient.gender === 'M' ? 'bg-blue-100' : patient.gender === 'F' ? 'bg-pink-100' : 'bg-gray-100'
                      )}>
                        <User className={cn(
                          'h-5 w-5',
                          patient.gender === 'M' ? 'text-blue-600' : patient.gender === 'F' ? 'text-pink-600' : 'text-gray-400'
                        )} />
                      </div>
                      <span className="font-medium">{patient.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-indigo-600 font-medium">{patient.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {patient.date_of_birth ? <span>{calculateAge(patient.date_of_birth)} ans</span> : <span className="text-gray-400">-</span>}
                      {patient.gender && (
                        <Badge variant="outline" className={cn(
                          patient.gender === 'M' ? 'border-blue-200 text-blue-700' : 'border-pink-200 text-pink-700'
                        )}>
                          {patient.gender === 'M' ? 'H' : 'F'}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
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
                      {!patient.phone && !patient.email && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {patient.ecg_count ?? 0} ECG
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {patient.last_ecg_date ? formatDate(patient.last_ecg_date) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/medecin/new-ecg')}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        ECG
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {currentPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun patient trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredPatients.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
              <span className="text-sm text-gray-500">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPatients.length)} sur {filteredPatients.length}
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

      {/* Dialog détail patient */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                selectedPatient?.gender === 'M' ? 'bg-blue-100' : selectedPatient?.gender === 'F' ? 'bg-pink-100' : 'bg-gray-100'
              )}>
                <User className={cn(
                  'h-6 w-6',
                  selectedPatient?.gender === 'M' ? 'text-blue-600' : selectedPatient?.gender === 'F' ? 'text-pink-600' : 'text-gray-400'
                )} />
              </div>
              <div>
                <p>{selectedPatient?.name}</p>
                <p className="text-sm font-normal text-gray-500">
                  {selectedPatient?.id} {selectedPatient?.date_of_birth ? `• ${calculateAge(selectedPatient.date_of_birth)} ans` : ''}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6">
              {/* Informations patient */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Date de naissance</p>
                  <p className="font-medium">{selectedPatient.date_of_birth ? formatDate(selectedPatient.date_of_birth) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sexe</p>
                  <p className="font-medium">{selectedPatient.gender === 'M' ? 'Masculin' : selectedPatient.gender === 'F' ? 'Féminin' : '-'}</p>
                </div>
                {selectedPatient.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{selectedPatient.phone}</p>
                  </div>
                )}
                {selectedPatient.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedPatient.email}</p>
                  </div>
                )}
                {selectedPatient.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium">{selectedPatient.notes}</p>
                  </div>
                )}
              </div>

              {/* Historique ECG */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Historique ECG ({selectedPatient.ecg_count ?? 0})</h3>
                  <Button 
                    size="sm" 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      setSelectedPatient(null);
                      navigate('/medecin/new-ecg');
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Nouvel ECG
                  </Button>
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  <PatientECGHistory
                    patientName={selectedPatient.name}
                    reports={[]}
                    onOpenReport={(reportId) => {
                      setSelectedPatient(null);
                      navigate(`/medecin/reports/${reportId}`);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
