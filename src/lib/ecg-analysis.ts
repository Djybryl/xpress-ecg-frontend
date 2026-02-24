import { supabase } from './supabase';
import { Tables } from './database.types';

export type ECGAnalysisResult = {
  heartRate?: number;
  prInterval?: number;
  qrsInterval?: number;
  qtInterval?: number;
  diagnosis?: string;
  annotations?: Array<{
    time: number;
    label: string;
    type: 'normal' | 'warning' | 'critical';
  }>;
};

export class ECGAnalysisService {
  private static readonly ALLOWED_FORMATS = ['wfdb', 'dicom', 'jpg', 'jpeg', 'png'];
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  static async importECG(file: File, metadata: {
    patientName: string;
    patientId?: string;
    medicalCenter: string;
    hospitalId: string;
    referringDoctorId: string;
  }) {
    try {
      // 1. Validate file
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !this.ALLOWED_FORMATS.includes(fileExt)) {
        throw new Error(`Format de fichier non supporté. Formats acceptés: ${this.ALLOWED_FORMATS.join(', ')}`);
      }

      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error('Fichier trop volumineux. Taille maximum: 50MB');
      }

      // 2. Create ECG record
      const { data: ecgRecord, error: ecgError } = await supabase
        .from('ecg_records')
        .insert({
          patient_name: metadata.patientName,
          patient_id: metadata.patientId,
          medical_center: metadata.medicalCenter,
          hospital_id: metadata.hospitalId,
          referring_doctor_id: metadata.referringDoctorId,
          status: 'analyzing'
        })
        .select()
        .single();

      if (ecgError) throw ecgError;

      // 3. Upload file
      const filePath = `ecg-files/${ecgRecord.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('ecg_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // 4. Create file record
      const { error: fileError } = await supabase
        .from('ecg_files')
        .insert({
          ecg_record_id: ecgRecord.id,
          file_path: filePath,
          file_type: this.getFileType(fileExt)
        });

      if (fileError) throw fileError;

      // 5. Analyze ECG
      const analysis = await this.analyzeECG(file, fileExt);

      // 6. Update record with analysis results
      const { error: updateError } = await supabase
        .from('ecg_records')
        .update({
          status: 'completed',
          heart_rate: analysis.heartRate,
          analyzed: true,
          notes: JSON.stringify({
            measurements: {
              prInterval: analysis.prInterval,
              qrsInterval: analysis.qrsInterval,
              qtInterval: analysis.qtInterval
            },
            diagnosis: analysis.diagnosis,
            annotations: analysis.annotations
          })
        })
        .eq('id', ecgRecord.id);

      if (updateError) throw updateError;

      return { ecgRecord, analysis, error: null };
    } catch (error) {
      console.error("Erreur lors de l'importation de l'ECG:", error);
      return { 
        ecgRecord: null, 
        analysis: null, 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  private static async analyzeECG(file: File, format: string): Promise<ECGAnalysisResult> {
    try {
      // Simulation d'analyse - À remplacer par votre logique d'analyse réelle
      // Ici vous intégreriez votre bibliothèque d'analyse ECG (wfdb, biosppy, etc.)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simuler le temps d'analyse

      return {
        heartRate: Math.floor(Math.random() * (100 - 60) + 60),
        prInterval: Math.floor(Math.random() * (200 - 120) + 120),
        qrsInterval: Math.floor(Math.random() * (120 - 80) + 80),
        qtInterval: Math.floor(Math.random() * (440 - 360) + 360),
        diagnosis: "Rythme sinusal normal",
        annotations: [
          {
            time: 0.5,
            label: "Complexe QRS",
            type: "normal"
          },
          {
            time: 1.2,
            label: "Onde T",
            type: "normal"
          }
        ]
      };
    } catch (error) {
      console.error("Erreur lors de l'analyse de l'ECG:", error);
      throw new Error("Échec de l'analyse de l'ECG");
    }
  }

  private static getFileType(extension: string): Tables['ecg_files']['Row']['file_type'] {
    switch (extension.toLowerCase()) {
      case 'wfdb':
        return 'WFDB';
      case 'dcm':
        return 'DICOM';
      case 'jpg':
      case 'jpeg':
        return 'JPEG';
      case 'png':
        return 'PNG';
      default:
        throw new Error(`Format de fichier non supporté: ${extension}`);
    }
  }
}