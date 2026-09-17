ALTER TABLE esittelija ADD COLUMN IF NOT EXISTS deactivated TIMESTAMPTZ;

COMMENT ON COLUMN esittelija.deactivated IS 'Käyttäjän deaktivointi aika';
