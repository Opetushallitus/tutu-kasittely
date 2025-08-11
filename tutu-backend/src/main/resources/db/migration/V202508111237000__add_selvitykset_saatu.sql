ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS selvitykset_saatu BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN hakemus.selvitykset_saatu IS 'Kaikki tarvittavat selvitykset saatu -- true jos on saatu';
