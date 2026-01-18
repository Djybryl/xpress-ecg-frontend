-- Système de tags
CREATE TABLE IF NOT EXISTS ecg_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ecg_tag_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecg_record_id uuid REFERENCES ecg_records(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES ecg_tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(ecg_record_id, tag_id)
);

-- Système de favoris
CREATE TABLE IF NOT EXISTS ecg_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  ecg_record_id uuid REFERENCES ecg_records(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, ecg_record_id)
);

-- Enable RLS
ALTER TABLE ecg_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecg_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecg_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view all tags"
  ON ecg_tags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tags"
  ON ecg_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view tag relations for their hospital's ECGs"
  ON ecg_tag_relations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ecg_records er
      JOIN hospital_users hu ON hu.hospital_id = er.hospital_id
      WHERE er.id = ecg_tag_relations.ecg_record_id
      AND hu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tag relations for their hospital's ECGs"
  ON ecg_tag_relations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ecg_records er
      JOIN hospital_users hu ON hu.hospital_id = er.hospital_id
      WHERE er.id = ecg_tag_relations.ecg_record_id
      AND hu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own favorites"
  ON ecg_favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own favorites"
  ON ecg_favorites
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tag_relations_ecg ON ecg_tag_relations(ecg_record_id);
CREATE INDEX IF NOT EXISTS idx_tag_relations_tag ON ecg_tag_relations(tag_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON ecg_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_ecg ON ecg_favorites(ecg_record_id);