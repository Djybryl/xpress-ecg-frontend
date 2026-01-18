-- ============================================
-- XPRESS-ECG - Schema Supabase
-- ============================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- Dashboard > SQL Editor > New Query

-- ============================================
-- 1. TABLE: hospitals
-- ============================================
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. TABLE: users (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'expert', 'secretary')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TABLE: hospital_users (junction table)
-- ============================================
CREATE TABLE IF NOT EXISTS public.hospital_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hospital_id, user_id)
);

-- ============================================
-- 4. TABLE: ecg_records
-- ============================================
CREATE TABLE IF NOT EXISTS public.ecg_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  gender TEXT,
  date DATE DEFAULT CURRENT_DATE,
  medical_center TEXT NOT NULL,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id),
  referring_doctor_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed')),
  heart_rate INTEGER,
  notes TEXT,
  analyzed BOOLEAN DEFAULT FALSE,
  viewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TABLE: ecg_files
-- ============================================
CREATE TABLE IF NOT EXISTS public.ecg_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecg_record_id UUID NOT NULL REFERENCES public.ecg_records(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('WFDB', 'DICOM', 'JPEG', 'PNG')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. TABLE: second_opinions
-- ============================================
CREATE TABLE IF NOT EXISTS public.second_opinions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecg_record_id UUID NOT NULL REFERENCES public.ecg_records(id) ON DELETE CASCADE,
  requesting_doctor_id UUID NOT NULL REFERENCES public.users(id),
  consultant_id UUID NOT NULL REFERENCES public.users(id),
  notes TEXT,
  response TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. TABLE: messages
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id),
  recipient_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  ecg_record_id UUID REFERENCES public.ecg_records(id),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. TABLE: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. TABLE: ecg_favorites
-- ============================================
CREATE TABLE IF NOT EXISTS public.ecg_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ecg_record_id UUID NOT NULL REFERENCES public.ecg_records(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ecg_record_id)
);

-- ============================================
-- 10. TABLE: ecg_tags
-- ============================================
CREATE TABLE IF NOT EXISTS public.ecg_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. TABLE: ecg_tag_relations
-- ============================================
CREATE TABLE IF NOT EXISTS public.ecg_tag_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecg_record_id UUID NOT NULL REFERENCES public.ecg_records(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.ecg_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ecg_record_id, tag_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecg_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecg_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecg_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecg_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecg_tag_relations ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust according to your needs)
-- Users can read their own data
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can read notifications
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage own favorites
CREATE POLICY "Users can manage own favorites" ON public.ecg_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Users can read messages they sent or received
CREATE POLICY "Users can read own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ECG records - users in same hospital can access
CREATE POLICY "Hospital members can access ECG records" ON public.ecg_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.hospital_users
      WHERE hospital_users.user_id = auth.uid()
      AND hospital_users.hospital_id = ecg_records.hospital_id
    )
  );

-- Tags are public for authenticated users
CREATE POLICY "Authenticated users can read tags" ON public.ecg_tags
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Create a bucket for ECG files (run in SQL or via Dashboard > Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ecg-files', 'ecg-files', false)
ON CONFLICT DO NOTHING;

-- Storage policy for ECG files
CREATE POLICY "Authenticated users can upload ECG files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ecg-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read ECG files"
ON storage.objects FOR SELECT
USING (bucket_id = 'ecg-files' AND auth.role() = 'authenticated');

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ecg_records_hospital ON public.ecg_records(hospital_id);
CREATE INDEX IF NOT EXISTS idx_ecg_records_doctor ON public.ecg_records(referring_doctor_id);
CREATE INDEX IF NOT EXISTS idx_ecg_records_status ON public.ecg_records(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
