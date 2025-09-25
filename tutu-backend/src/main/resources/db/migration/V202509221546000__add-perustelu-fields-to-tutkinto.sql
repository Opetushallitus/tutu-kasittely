ALTER TABLE IF EXISTS tutkinto ADD COLUMN IF NOT EXISTS ohjeellinen_laajuus TEXT;
ALTER TABLE IF EXISTS tutkinto ADD COLUMN IF NOT EXISTS opinnaytetyo BOOLEAN;
ALTER TABLE IF EXISTS tutkinto ADD COLUMN IF NOT EXISTS harjoittelu BOOLEAN;
ALTER TABLE IF EXISTS tutkinto ADD COLUMN IF NOT EXISTS perustelun_lisatietoja TEXT;

COMMENT ON COLUMN tutkinto.ohjeellinen_laajuus IS 'Tutkinnon perustelut: ohjeellinen laajuus';
COMMENT ON COLUMN tutkinto.opinnaytetyo IS 'Tutkinnon perustelut: sisältyikö opinnäytetyö tutkintoon';
COMMENT ON COLUMN tutkinto.harjoittelu IS 'Tutkinnon perustelut: sisältyikö harjoittelu tutkintoon';
COMMENT ON COLUMN tutkinto.perustelun_lisatietoja IS 'Tutkinnon perustelut: lisätietoja';