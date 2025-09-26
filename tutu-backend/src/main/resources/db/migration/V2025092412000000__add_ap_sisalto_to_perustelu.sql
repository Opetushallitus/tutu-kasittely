ALTER TABLE perustelu ADD COLUMN IF NOT EXISTS ap_sisalto JSONB DEFAULT '{}'::jsonb NOT NULL;

COMMENT ON COLUMN perustelu.ap_sisalto IS 'Perustelun AP-päätös sisältö';
