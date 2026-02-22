import { Image } from '@/components/ui/image';
import { IMAGES } from '@/lib/constants';
import React from 'react';
import { Activity } from 'lucide-react';

interface ECGReportPreviewProps {
  record: {
    id: string;
    patientName: string;
    medicalCenter: string;
    date: string;
  };
  measurements: {
    heartRate?: number;
    prInterval?: number;
    qrsDuration?: number;
    qtInterval?: number;
    pAxis?: number;
    rAxis?: number;
    tAxis?: number;
  };
  analysis: string;
  doctor: {
    name: string;
    title: string;
    signature: string;
  };
}

export function ECGReportPreview({ record, measurements, analysis, doctor }: ECGReportPreviewProps) {
  return (
    <div className="bg-white w-full max-w-[800px] mx-auto p-8 text-black">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-6 text-sm">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Xpress-ECG</span>
          </div>
          <div className="space-y-1 text-gray-600">
            <p>{record.medicalCenter}</p>
            <p>Date: {new Date(record.date).toLocaleDateString('fr-FR')}</p>
            <p>Réf: {record.id}</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="font-medium">{record.patientName}</p>
          <p className="text-gray-600">ID: {record.id}</p>
        </div>
      </div>

      {/* Mesures */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Mesures</h3>
        <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Fréquence cardiaque:</span>
            <span>{measurements.heartRate || '-'} bpm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Intervalle PR:</span>
            <span>{measurements.prInterval || '-'} ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Durée QRS:</span>
            <span>{measurements.qrsDuration || '-'} ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">QT/QTc:</span>
            <span>{measurements.qtInterval || '-'} ms</span>
          </div>
        </div>
      </div>

      {/* Tracé ECG */}
      <div className="mb-6">
        <Image
          src={IMAGES.ECG.DEFAULT}
          fallbackSrc={IMAGES.ECG.FALLBACK}
          alt="ECG"
          className="w-full h-[400px] object-contain border rounded-lg"
        />
      </div>

      {/* Interprétation */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Interprétation</h3>
        <p className="text-sm whitespace-pre-line">{analysis || 'Aucune interprétation fournie.'}</p>
      </div>

      {/* Signature */}
      <div className="flex justify-between items-end mt-12 pt-4 border-t">
        <div className="text-sm text-gray-600">
          <p>Centre d'analyse ECG</p>
          <p>Xpress-ECG</p>
        </div>
        <div className="text-right">
          <div className="mb-2">
            {doctor.signature && (
              <Image 
                src={doctor.signature} 
                fallbackSrc={IMAGES.SIGNATURE.FALLBACK}
                alt="Signature"
                className="h-12 object-contain"
              />
            )}
          </div>
          <p className="font-medium text-sm">{doctor.name}</p>
          <p className="text-sm text-gray-600">{doctor.title}</p>
        </div>
      </div>
    </div>
  );
}