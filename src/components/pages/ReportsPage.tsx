import { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReportsPageProps {
  onBack: () => void;
}

// Mock reports data
const mockReports = [
  {
    id: 'r1',
    ecgId: 'ECG-2024-0405',
    patientName: 'Robert Petit',
    medicalCenter: 'Institut Cœur Paris',
    createdAt: '2024-12-23T12:00:00',
    validatedBy: 'Dr. Sophie Bernard',
    status: 'sent',
    downloadCount: 3,
  },
  {
    id: 'r2',
    ecgId: 'ECG-2024-0407',
    patientName: 'Jean-Paul Mercier',
    medicalCenter: 'Centre Cardio Paris',
    createdAt: '2024-12-24T17:15:00',
    validatedBy: 'Dr. Sophie Bernard',
    status: 'validated',
    downloadCount: 1,
  },
  {
    id: 'r3',
    ecgId: 'ECG-2024-0403',
    patientName: 'Alice Durand',
    medicalCenter: 'Hôpital Saint-Louis',
    createdAt: '2024-12-22T14:30:00',
    validatedBy: 'Dr. Sophie Bernard',
    status: 'sent',
    downloadCount: 5,
  },
  {
    id: 'r4',
    ecgId: 'ECG-2024-0401',
    patientName: 'Michel Lefebvre',
    medicalCenter: 'Clinique du Sport',
    createdAt: '2024-12-21T09:45:00',
    validatedBy: 'Dr. Sophie Bernard',
    status: 'sent',
    downloadCount: 2,
  },
];

export function ReportsPage({ onBack }: ReportsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'validated' | 'sent'>('all');

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = 
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.ecgId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMM yyyy 'à' HH:mm", { locale: fr });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Rapports
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockReports.length}</p>
                  <p className="text-xs text-gray-500">Total rapports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockReports.filter(r => r.status === 'sent').length}
                  </p>
                  <p className="text-xs text-gray-500">Envoyés</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockReports.filter(r => r.status === 'validated').length}
                  </p>
                  <p className="text-xs text-gray-500">En attente d'envoi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <Download className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockReports.reduce((sum, r) => sum + r.downloadCount, 0)}
                  </p>
                  <p className="text-xs text-gray-500">Téléchargements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par patient ou numéro ECG..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="px-3 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="validated">Validés</option>
                  <option value="sent">Envoyés</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="text-base">
              {filteredReports.length} rapport{filteredReports.length > 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">ECG</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Établissement</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Statut</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <span className="font-medium text-indigo-600">{report.ecgId}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {report.patientName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {report.medicalCenter}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(report.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        report.status === 'sent' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                      }`}>
                        {report.status === 'sent' ? 'Envoyé' : 'Validé'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Aperçu">
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Télécharger">
                          <Download className="h-4 w-4 text-indigo-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <span className="text-sm text-gray-500">
                Affichage de 1 à {filteredReports.length} sur {filteredReports.length}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="default" size="sm" className="h-8 w-8 px-0 bg-indigo-600">
                  1
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
