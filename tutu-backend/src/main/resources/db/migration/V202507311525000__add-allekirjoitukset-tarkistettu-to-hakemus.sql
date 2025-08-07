ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS allekirjoitukset_tarkistettu BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS allekirjoitukset_tarkistettu_lisatiedot TEXT DEFAULT NULL;

COMMENT ON COLUMN hakemus.allekirjoitukset_tarkistettu IS 'Allekirjoitukset tarkistettu -- true jos tarkistus suoritettu';
COMMENT ON COLUMN hakemus.allekirjoitukset_tarkistettu_lisatiedot IS 'Allekirjoitusten tarkastusten lisätiedot';
