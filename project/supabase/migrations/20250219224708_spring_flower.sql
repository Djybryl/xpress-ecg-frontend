/*
  # Améliorations du backend pour la gestion des ECG

  1. Nouvelles Tables
    - `notifications` : Notifications système pour les utilisateurs
    - `ecg_analysis_history` : Historique des analyses d'ECG
    - `analytics` : Métriques et statistiques

  2. Fonctions
    - Calcul des statistiques quotidiennes
    - Recherche avancée d'ECG
    - Notifications automatiques

  3. Triggers
    - Mise à jour automatique des notifications
    - Historisation des analyses
*/

-- Système de notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  content jsonb NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Historique des analyses
CREATE TABLE IF NOT EXISTS ecg_analysis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecg_record_id uuid REFERENCES ecg_records(id) ON DELETE CASCADE,
  analysis_data jsonb NOT NULL,
  analyzed_by uuid REFERENCES users(id),
  version integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Métriques et statistiques
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES hospitals(id) ON DELETE CASCADE,
  metrics_type text NOT NULL,
  metrics_data jsonb NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Fonction pour calculer les statistiques quotidiennes
CREATE OR REPLACE FUNCTION calculate_daily_stats(hospital_id uuid, day date)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'received', COUNT(*) FILTER (WHERE created_at::date = day),
    'analyzed', COUNT(*) FILTER (WHERE analyzed = true AND updated_at::date = day),
    'pending', COUNT(*) FILTER (WHERE status = 'pending')
  )
  INTO result
  FROM ecg_records
  WHERE hospital_id = $1
  AND created_at::date = day;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour la recherche avancée d'ECG
CREATE OR REPLACE FUNCTION search_ecgs(
  search_term text,
  hospital_id uuid,
  status text[],
  date_from timestamptz,
  date_to timestamptz
) RETURNS SETOF ecg_records AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM ecg_records
  WHERE hospital_id = $2
  AND (
    patient_name ILIKE '%' || search_term || '%'
    OR medical_center ILIKE '%' || search_term || '%'
    OR id::text ILIKE '%' || search_term || '%'
  )
  AND (status = ANY($3))
  AND created_at BETWEEN $4 AND $5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour notifier les médecins des nouveaux ECG
CREATE OR REPLACE FUNCTION notify_new_ecg()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    content
  )
  SELECT
    u.id,
    'new_ecg',
    jsonb_build_object(
      'ecg_id', NEW.id,
      'patient_name', NEW.patient_name,
      'medical_center', NEW.medical_center
    )
  FROM users u
  JOIN hospital_users hu ON hu.user_id = u.id
  WHERE hu.hospital_id = NEW.hospital_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ecg_notification_trigger
AFTER INSERT ON ecg_records
FOR EACH ROW
EXECUTE FUNCTION notify_new_ecg();

-- Trigger pour historiser les analyses
CREATE OR REPLACE FUNCTION log_ecg_analysis()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.analyzed = true AND (OLD.analyzed = false OR OLD.analyzed IS NULL) THEN
    INSERT INTO ecg_analysis_history (
      ecg_record_id,
      analysis_data,
      analyzed_by,
      version
    ) VALUES (
      NEW.id,
      jsonb_build_object(
        'heart_rate', NEW.heart_rate,
        'notes', NEW.notes
      ),
      NEW.referring_doctor_id,
      (
        SELECT COALESCE(MAX(version), 0) + 1
        FROM ecg_analysis_history
        WHERE ecg_record_id = NEW.id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ecg_analysis_history_trigger
BEFORE UPDATE ON ecg_records
FOR EACH ROW
EXECUTE FUNCTION log_ecg_analysis();

-- Enable RLS on new tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecg_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for new tables
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view analysis history for their hospital's ECGs"
  ON ecg_analysis_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ecg_records er
      JOIN hospital_users hu ON hu.hospital_id = er.hospital_id
      WHERE er.id = ecg_analysis_history.ecg_record_id
      AND hu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their hospital's analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hospital_users
      WHERE hospital_users.hospital_id = analytics.hospital_id
      AND hospital_users.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_analysis_history_ecg ON ecg_analysis_history(ecg_record_id);
CREATE INDEX IF NOT EXISTS idx_analytics_hospital ON analytics(hospital_id);
CREATE INDEX IF NOT EXISTS idx_analytics_period ON analytics(period_start, period_end);