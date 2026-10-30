ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS hakija_oid VARCHAR(255);

COMMENT ON COLUMN hakemus.hakija_oid IS 'Hakijan OID';

