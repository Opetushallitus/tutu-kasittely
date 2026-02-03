ALTER TABLE IF EXISTS hakemus ADD COLUMN IF NOT EXISTS onko_peruutettu BOOLEAN;
ALTER TABLE IF EXISTS hakemus ADD COLUMN IF NOT EXISTS peruutus_paiva TIMESTAMPTZ;
ALTER TABLE IF EXISTS hakemus ADD COLUMN IF NOT EXISTS peruutus_lisatieto TEXT;
ALTER TABLE IF EXISTS hakemus ADD COLUMN IF NOT EXISTS viimeisin_taydennyspyynto_paiva TIMESTAMPTZ;

COMMENT ON COLUMN hakemus.onko_peruutettu IS 'Onko hakemus peruutettu?';
COMMENT ON COLUMN hakemus.peruutus_paiva IS 'Hakemuksen peruutuspäivämäärä';
COMMENT ON COLUMN hakemus.peruutus_lisatieto IS 'Lisätietoa hakemuksen peruutuksesta';
COMMENT ON COLUMN hakemus.viimeisin_taydennyspyynto_paiva IS 'Viimeisimmän hakemuksesta lähetetyn täydennyspyynnön päivämäärä';

