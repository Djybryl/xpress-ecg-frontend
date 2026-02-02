import { supabase } from './supabase';
import { Tables } from './supabase';

export type ECGRecord = Tables['ecg_records']['Row'];
export type ECGFile = Tables['ecg_files']['Row'];
export type SecondOpinion = Tables['second_opinions']['Row'];

interface CreateECGParams {
  patientName: string;
  patientId?: string;
  medicalCenter: string;
  gender?: 'M' | 'F';
  hospitalId: string;
  referringDoctorId: string;
  file: File;
}

export async function createECG({
  patientName,
  patientId,
  medicalCenter,
  gender,
  hospitalId,
  referringDoctorId,
  file
}: CreateECGParams) {
  try {
    // 1. Create ECG record
    const { data: ecgRecord, error: ecgError } = await supabase
      .from('ecg_records')
      .insert({
        patient_name: patientName,
        patient_id: patientId,
        medical_center: medicalCenter,
        gender,
        hospital_id: hospitalId,
        referring_doctor_id: referringDoctorId
      })
      .select()
      .single();

    if (ecgError) throw ecgError;

    // 2. Upload file to storage
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const filePath = `ecg-files/${ecgRecord.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('ecg-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 3. Create ECG file record
    const { error: fileRecordError } = await supabase
      .from('ecg_files')
      .insert({
        ecg_record_id: ecgRecord.id,
        file_path: filePath,
        file_type: fileExt?.toUpperCase() as 'WFDB' | 'DICOM' | 'JPEG' | 'PNG'
      });

    if (fileRecordError) throw fileRecordError;

    return { ecgRecord, error: null };
  } catch (error) {
    return { ecgRecord: null, error };
  }
}

export async function getECGRecords(hospitalId: string) {
  try {
    const { data, error } = await supabase
      .from('ecg_records')
      .select(`
        *,
        files:ecg_files(*),
        referring_doctor:users!referring_doctor_id(
          full_name
        ),
        second_opinions(*)
      `)
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { records: data, error: null };
  } catch (error) {
    return { records: null, error };
  }
}

export async function requestSecondOpinion(
  ecgRecordId: string,
  consultantIds: string[],
  notes?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const opinions = consultantIds.map(consultantId => ({
      ecg_record_id: ecgRecordId,
      requesting_doctor_id: user.id,
      consultant_id: consultantId,
      notes
    }));

    const { data, error } = await supabase
      .from('second_opinions')
      .insert(opinions)
      .select();

    if (error) throw error;
    return { opinions: data, error: null };
  } catch (error) {
    return { opinions: null, error };
  }
}

export async function getSecondOpinions() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('second_opinions')
      .select(`
        *,
        ecg_record:ecg_records (
          *,
          files:ecg_files(*)
        ),
        requesting_doctor:users!requesting_doctor_id (
          full_name
        ),
        consultant:users!consultant_id (
          full_name
        )
      `)
      .or(`requesting_doctor_id.eq.${user.id},consultant_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { opinions: data, error: null };
  } catch (error) {
    return { opinions: null, error };
  }
}