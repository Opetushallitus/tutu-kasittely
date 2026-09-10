ALTER TABLE valitustiedot ADD COLUMN IF NOT EXISTS valitus_hao jsonb DEFAULT '{}'::jsonb;
ALTER TABLE valitustiedot DROP COLUMN IF EXISTS valitus_ho;

COMMENT ON COLUMN valitustiedot.valitus_hao IS 'Valitus hallinto-oikeuteen';
