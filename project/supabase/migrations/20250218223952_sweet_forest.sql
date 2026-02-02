/*
  # Initial schema for ECG management system

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Supabase auth user ID
      - `email` (text) - User email
      - `full_name` (text) - Full name of the user
      - `role` (text) - User role (doctor, expert, secretary)
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `hospitals`
      - `id` (uuid, primary key)
      - `name` (text) - Hospital name
      - `address` (text) - Hospital address
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `hospital_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to users table
      - `hospital_id` (uuid) - Reference to hospitals table
      - `created_at` (timestamptz)

    - `ecg_records`
      - `id` (uuid, primary key)
      - `patient_name` (text) - Patient name
      - `patient_id` (text) - Patient identifier
      - `medical_center` (text) - Medical center name
      - `date` (timestamptz) - ECG recording date
      - `status` (text) - Status of the ECG (pending, analyzing, completed)
      - `gender` (text) - Patient gender
      - `viewed` (boolean) - Whether the ECG has been viewed
      - `analyzed` (boolean) - Whether the ECG has been analyzed
      - `heart_rate` (integer) - Heart rate measurement
      - `notes` (text) - Notes about the ECG
      - `referring_doctor_id` (uuid) - Reference to the referring doctor
      - `hospital_id` (uuid) - Reference to the hospital
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `ecg_files`
      - `id` (uuid, primary key)
      - `ecg_record_id` (uuid) - Reference to ecg_records table
      - `file_path` (text) - Path to the ECG file in storage
      - `file_type` (text) - Type of file (WFDB, DICOM, JPEG, PNG)
      - `created_at` (timestamptz)

    - `second_opinions`
      - `id` (uuid, primary key)
      - `ecg_record_id` (uuid) - Reference to ecg_records table
      - `requesting_doctor_id` (uuid) - Reference to requesting doctor
      - `consultant_id` (uuid) - Reference to consulting doctor
      - `status` (text) - Status of the request (pending, completed)
      - `notes` (text) - Notes for the consultant
      - `response` (text) - Consultant's response
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for each user role
    - Secure file access through storage policies

  3. Indexes
    - Add indexes for frequently queried columns
    - Add foreign key constraints
*/

-- Create users table to extend Supabase auth
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('doctor', 'expert', 'secretary')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create hospitals table
CREATE TABLE hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create hospital_users junction table
CREATE TABLE hospital_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  hospital_id uuid REFERENCES hospitals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, hospital_id)
);

-- Create ECG records table
CREATE TABLE ecg_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_id text,
  medical_center text NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('pending', 'analyzing', 'completed')) DEFAULT 'pending',
  gender text CHECK (gender IN ('M', 'F')),
  viewed boolean DEFAULT false,
  analyzed boolean DEFAULT false,
  heart_rate integer,
  notes text,
  referring_doctor_id uuid REFERENCES users(id),
  hospital_id uuid REFERENCES hospitals(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ECG files table
CREATE TABLE ecg_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecg_record_id uuid REFERENCES ecg_records(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('WFDB', 'DICOM', 'JPEG', 'PNG')),
  created_at timestamptz DEFAULT now()
);

-- Create second opinions table
CREATE TABLE second_opinions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecg_record_id uuid REFERENCES ecg_records(id) ON DELETE CASCADE,
  requesting_doctor_id uuid REFERENCES users(id),
  consultant_id uuid REFERENCES users(id),
  status text NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  notes text,
  response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecg_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecg_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE second_opinions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_ecg_records_status ON ecg_records(status);
CREATE INDEX idx_ecg_records_hospital ON ecg_records(hospital_id);
CREATE INDEX idx_ecg_records_doctor ON ecg_records(referring_doctor_id);
CREATE INDEX idx_second_opinions_status ON second_opinions(status);
CREATE INDEX idx_hospital_users_hospital ON hospital_users(hospital_id);
CREATE INDEX idx_hospital_users_user ON hospital_users(user_id);

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Hospital policies
CREATE POLICY "Users can view hospitals they belong to"
  ON hospitals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hospital_users
      WHERE hospital_users.hospital_id = hospitals.id
      AND hospital_users.user_id = auth.uid()
    )
  );

-- Hospital users policies
CREATE POLICY "Users can view hospital memberships"
  ON hospital_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ECG records policies
CREATE POLICY "Doctors can view their hospital's ECGs"
  ON ecg_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hospital_users
      WHERE hospital_users.hospital_id = ecg_records.hospital_id
      AND hospital_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can create ECGs for their hospital"
  ON ecg_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'doctor'
    )
  );

-- ECG files policies
CREATE POLICY "Users can view ECG files they have access to"
  ON ecg_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ecg_records
      JOIN hospital_users ON hospital_users.hospital_id = ecg_records.hospital_id
      WHERE ecg_files.ecg_record_id = ecg_records.id
      AND hospital_users.user_id = auth.uid()
    )
  );

-- Second opinions policies
CREATE POLICY "Users can view second opinions they're involved in"
  ON second_opinions
  FOR SELECT
  TO authenticated
  USING (
    requesting_doctor_id = auth.uid()
    OR consultant_id = auth.uid()
  );

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON hospitals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ecg_records_updated_at
  BEFORE UPDATE ON ecg_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_second_opinions_updated_at
  BEFORE UPDATE ON second_opinions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();