ALTER TABLE IF EXISTS tutkinto_tai_opinto ADD COLUMN IF NOT EXISTS opetuskieli VARCHAR(255);
COMMENT ON COLUMN tutkinto_tai_opinto.opetuskieli IS 'Rinnastettavan opinnon opetuskieli';