ALTER TABLE maakoodi ADD COLUMN IF NOT EXISTS fi VARCHAR DEFAULT '';
ALTER TABLE maakoodi ADD COLUMN IF NOT EXISTS sv VARCHAR DEFAULT '';
ALTER TABLE maakoodi ADD COLUMN IF NOT EXISTS en VARCHAR DEFAULT '';

COMMENT ON COLUMN maakoodi.fi IS 'Maakoodin suomenkilinen selkoteksti';
COMMENT ON COLUMN maakoodi.sv IS 'Maakoodin ruotsinkilinen selkoteksti';
COMMENT ON COLUMN maakoodi.en IS 'Maakoodin englanninkielinen selkoteksti';

UPDATE maakoodi
SET fi = nimi;

ALTER TABLE maakoodi DROP COLUMN nimi;