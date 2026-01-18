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
import { usePatientStore, type Patient } from '@/stores/usePatientStore';
import { useToast } from "@/hooks/use-toast";
import { useReportStore } from '@/stores/useReportStore';
import { cn } from '@/lib/utils';

export function PatientsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patients, searchPatients } = usePatientStore();
  const { getReportsByPatient } = useReportStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleExport = (format: 'pdf' | 'excel') => {
    toast({
      title: "Export en cours",
      description: `Génération du fichier ${format.toUpperCase()} avec ${filteredPatients.length} patient(s)...`
    });
    // TODO: Implémenter l'export réel
  };

  // Filtrage des patients
  const filteredPatients = searchTerm ? searchPatients(searchTerm) : patients;

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  // Calcul de l'âge
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Rapports du patient sélectionné
  const patientReports = selectedPatient ? getReportsByPatient(selectedPatient.id) : [];

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes patients</h1>
          <p className="text-gray-500">Gérez vos patients et consultez leur historique ECG</p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate('/medecin/new-ecg')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel ECG
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{patients.length}</p>
              <p className="text-sm text-gray-500">Patients</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {patients.reduce((acc, p) => acc + p.ecgCount, 0)}
              </p>
              <p className="text-sm text-gray-500">ECG au total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {patients.filter(p => {
                  if (!p.lastEcgDate) return false;
                  const lastEcg = new Date(p.lastEcgDate);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return lastEcg > weekAgo;
                }).length}
              </p>
              <p className="text-sm text-gray-500">ECG cette semaine</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des patients */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg">Liste des patients</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un patient..."
                className="pl-9 w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                        patient.gender === 'M' ? 'bg-blue-100' : 'bg-pink-100'
                      )}>
                        <User className={cn(
                          'h-5 w-5',
                          patient.gender === 'M' ? 'text-blue-600' : 'text-pink-600'
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
                      <span>{calculateAge(patient.dateOfBirth)} ans</span>
                      <Badge variant="outline" className={cn(
                        patient.gender === 'M' ? 'border-blue-200 text-blue-700' : 'border-pink-200 text-pink-700'
                      )}>
                        {patient.gender === 'M' ? 'H' : 'F'}
                      </Badge>
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
                      {patient.ecgCount} ECG
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {patient.lastEcgDate ? formatDate(patient.lastEcgDate) : '-'}
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
                selectedPatient?.gender === 'M' ? 'bg-blue-100' : 'bg-pink-100'
              )}>
                <User className={cn(
                  'h-6 w-6',
                  selectedPatient?.gender === 'M' ? 'text-blue-600' : 'text-pink-600'
                )} />
              </div>
              <div>
                <p>{selectedPatient?.name}</p>
                <p className="text-sm font-normal text-gray-500">
                  {selectedPatient?.id} • {selectedPatient && calculateAge(selectedPatient.dateOfBirth)} ans
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
                  <p className="font-medium">{formatDate(selectedPatient.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sexe</p>
                  <p className="font-medium">{selectedPatient.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
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
                  <h3 className="font-semibold">Historique ECG ({selectedPatient.ecgCount})</h3>
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

                {patientReports.length > 0 ? (
                  <div className="border rounded-lg divide-y max-h-[300px] overflow-auto">
                    {patientReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        onClick={() => {
                          setSelectedPatient(null);
                          navigate(`/medecin/reports/${report.id}`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-indigo-600" />
                          <div>
                            <p className="font-medium">{report.ecgId}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(report.dateEcg)} • {report.cardiologist}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.isUrgent && (
                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border rounded-lg">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Aucun rapport disponible</p>
                    <p className="text-sm">Les ECG en cours d'analyse apparaîtront ici</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
