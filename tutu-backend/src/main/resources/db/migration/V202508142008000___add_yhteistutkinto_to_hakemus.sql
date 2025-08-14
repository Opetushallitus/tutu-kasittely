ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS yhteistutkinto BOOLEAN;

COMMENT ON COLUMN hakemus.yhteistutkinto IS 'true jos hakemus on yhteistutkinto';
