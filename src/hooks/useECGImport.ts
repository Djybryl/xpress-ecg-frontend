import { useState } from 'react';
import { ECGAnalysisService } from '@/lib/ecg-analysis';
import { useAuthContext } from '@/providers/AuthProvider';

interface ImportECGParams {
  file: File;
  patientName: string;
  patientId?: string;
  medicalCenter: string;
}

export function useECGImport() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuthContext();

  const importECG = async ({ file, patientName, patientId, medicalCenter }: ImportECGParams) => {
    if (!user?.hospital?.id) {
      throw new Error('Aucun hôpital associé à l\'utilisateur');
    }

    try {
      setImporting(true);
      setProgress(0);

      // Simuler la progression
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await ECGAnalysisService.importECG(file, {
        patientName,
        patientId,
        medicalCenter,
        hospitalId: user.hospital.id,
        referringDoctorId: user.id
      });

      clearInterval(progressInterval);
      setProgress(100);

      return result;
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      throw error;
    } finally {
      setImporting(false);
    }
  };

  return {
    importECG,
    importing,
    progress
  };
}