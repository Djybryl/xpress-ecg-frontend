import { useState } from 'react';
import { ECGAnalysisService } from '@/lib/ecg-analysis';
import { useAuthContext } from '@/providers/AuthProvider';

interface ImportECGParams {
  file: File;
  patientName: string;
  patientId?: string;
  medicalCenter: string;
  hospitalId: string;
}

/**
 * Hook pour importer un ECG.
 * Sera pleinement fonctionnel une fois le backend Supabase connecte.
 */
export function useECGImport() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuthContext();

  const importECG = async ({ file, patientName, patientId, medicalCenter, hospitalId }: ImportECGParams) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      setImporting(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await ECGAnalysisService.importECG(file, {
        patientName,
        patientId,
        medicalCenter,
        hospitalId,
        referringDoctorId: user.email,
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
