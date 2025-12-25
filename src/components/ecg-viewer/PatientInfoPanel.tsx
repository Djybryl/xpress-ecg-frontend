import { User, Calendar, Building2, Stethoscope, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ECGRecord } from './ECGViewerPage';

interface PatientInfoPanelProps {
  record: ECGRecord;
}

export function PatientInfoPanel({ record }: PatientInfoPanelProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-indigo-50 to-white border-b">
        <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-600" />
          Informations Patient
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-3">
          {/* Nom et âge */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-700 font-semibold text-sm">
                {record.patientName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{record.patientName}</p>
              <p className="text-sm text-gray-500">
                {record.patientAge} ans • {record.patientGender === 'M' ? 'Homme' : 'Femme'}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Informations de l'examen */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Date:</span>
              <span className="text-gray-900">{formatDate(record.acquisitionDate)}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Centre:</span>
              <span className="text-gray-900">{record.medicalCenter}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Stethoscope className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Prescripteur:</span>
              <span className="text-gray-900">{record.referringDoctor}</span>
            </div>
          </div>

          {/* Contexte clinique */}
          {(record.clinicalContext || record.symptoms) && (
            <>
              <div className="h-px bg-gray-100" />
              
              <div className="space-y-2">
                {record.symptoms && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Symptômes
                    </div>
                    <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-lg p-2">
                      {record.symptoms}
                    </p>
                  </div>
                )}

                {record.clinicalContext && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
                      <FileText className="h-3.5 w-3.5" />
                      Contexte clinique
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-2">
                      {record.clinicalContext}
                    </p>
                  </div>
                )}

                {record.medications && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
                      💊 Traitements
                    </div>
                    <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-2">
                      {record.medications}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

