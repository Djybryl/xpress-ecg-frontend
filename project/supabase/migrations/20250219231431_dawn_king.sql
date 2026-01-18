-- Système de templates de rapport
CREATE TABLE IF NOT EXISTS report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  hospital_id uuid REFERENCES hospitals(id),
  is_default boolean DEFAULT false,
  template_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rapports générés
CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecg_record_id uuid REFERENCES ecg_records(id) ON DELETE CASCADE,
  template_id uuid REFERENCES report_templates(id),
  report_data jsonb NOT NULL,
  generated_by uuid REFERENCES users(id),
  file_path text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their hospital's report templates"
  ON report_templates
  FOR SELECT
  TO authenticated
  USING (
    hospital_id IS NULL OR
    EXISTS (
      SELECT 1 FROM hospital_users
      WHERE hospital_users.hospital_id = report_templates.hospital_id
      AND hospital_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their hospital's report templates"
  ON report_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hospital_users
      WHERE hospital_users.hospital_id = report_templates.hospital_id
      AND hospital_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view reports for their hospital's ECGs"
  ON generated_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ecg_records er
      JOIN hospital_users hu ON hu.hospital_id = er.hospital_id
      WHERE er.id = generated_reports.ecg_record_id
      AND hu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can generate reports for their hospital's ECGs"
  ON generated_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ecg_records er
      JOIN hospital_users hu ON hu.hospital_id = er.hospital_id
      WHERE er.id = generated_reports.ecg_record_id
      AND hu.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_hospital ON report_templates(hospital_id);
CREATE INDEX IF NOT EXISTS idx_reports_ecg ON generated_reports(ecg_record_id);
CREATE INDEX IF NOT EXISTS idx_reports_template ON generated_reports(template_id);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON report_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();