ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS allekirjoitukset_tarkistettu TEXT DEFAULT NULL;

COMMENT ON COLUMN hakemus.allekirjoitukset_tarkistettu IS 'Allekirjoitusten tarkastusten lisätiedot -- NULL jos ei tarkistettu';
