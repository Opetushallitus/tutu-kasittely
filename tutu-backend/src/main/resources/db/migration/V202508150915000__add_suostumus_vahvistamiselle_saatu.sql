ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS suostumus_vahvistamiselle_saatu BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN hakemus.selvitykset_saatu IS 'Suostumuslomake saatu asiakirjojen vahvistamiselle -- true jos on saatu';
