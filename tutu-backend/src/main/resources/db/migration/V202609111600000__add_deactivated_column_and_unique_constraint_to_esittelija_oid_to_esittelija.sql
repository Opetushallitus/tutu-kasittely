ALTER TABLE esittelija ADD COLUMN IF NOT EXISTS deactivated TIMESTAMPTZ;

COMMENT ON COLUMN esittelija.deactivated IS 'Käyttäjän deaktivointi aika';

ALTER TABLE esittelija DROP CONSTRAINT IF EXISTS esittelija_oid_unique;
ALTER TABLE esittelija ADD CONSTRAINT esittelija_oid_unique UNIQUE (esittelija_oid);
