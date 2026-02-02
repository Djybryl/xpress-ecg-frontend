/**
 * Stub ECG analysis for frontend build.
 * Full implementation lives in backend / when Supabase is connected.
 */

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
  static async importECG(
    _file: File,
    _metadata: {
      patientName: string;
      patientId?: string;
      medicalCenter: string;
      hospitalId: string;
      referringDoctorId: string;
    }
  ): Promise<{ ecgRecord: null; analysis: null; error: string }> {
    return {
      ecgRecord: null,
      analysis: null,
      error: "Backend non connecté. L'import ECG sera disponible après configuration.",
    };
  }
}
