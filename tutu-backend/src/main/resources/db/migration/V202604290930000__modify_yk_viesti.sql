ALTER TABLE yk_viesti ADD COLUMN IF NOT EXISTS kysymys_luettu TIMESTAMPTZ;
ALTER TABLE yk_viesti ADD COLUMN IF NOT EXISTS vastaus_luettu TIMESTAMPTZ;

COMMENT ON COLUMN yk_viesti.kysymys_luettu IS 'Yhteiskäsittelyn kysymyksen lukuajankohta';
COMMENT ON COLUMN yk_viesti.vastaus_luettu IS 'Yhteiskäsittelyn vastauksen lukuajankohta';

UPDATE yk_viesti
SET kysymys_luettu = luettu;

ALTER TABLE yk_viesti DROP COLUMN IF EXISTS luettu;
