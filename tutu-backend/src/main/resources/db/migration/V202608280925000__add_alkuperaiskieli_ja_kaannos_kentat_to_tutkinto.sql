ALTER TABLE IF EXISTS tutkinto ADD COLUMN IF NOT EXISTS nimi_alkuperaiskielella TEXT;
ALTER TABLE IF EXISTS tutkinto ADD COLUMN IF NOT EXISTS nimi_kaannoksessa TEXT;
ALTER TABLE IF EXISTS tutkinto ADD COLUMN IF NOT EXISTS oppilaitos_alkuperaiskielella TEXT;
ALTER TABLE IF EXISTS tutkinto ADD COLUMN IF NOT EXISTS oppilaitos_kaannoksessa TEXT;

COMMENT ON COLUMN tutkinto.nimi_alkuperaiskielella IS 'Tutkinnon nimi alkuperäiskielellä';
COMMENT ON COLUMN tutkinto.nimi_kaannoksessa IS 'Tutkinnon nimi käännöksessä';
COMMENT ON COLUMN tutkinto.oppilaitos_alkuperaiskielella IS 'Korkeakoulun tai oppilaitoksen nimi alkuperäiskielellä';
COMMENT ON COLUMN tutkinto.oppilaitos_kaannoksessa IS 'Korkeakoulun tai oppilaitoksen nimi käännöksessä';
