ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS ap_hakemus BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN hakemus.ap_hakemus IS 'true jos hakemus on AP hakemus';
