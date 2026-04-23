ALTER TABLE yk_viesti ADD COLUMN IF NOT EXISTS kysymys TEXT;
ALTER TABLE yk_viesti ADD COLUMN IF NOT EXISTS vastaus TEXT;

COMMENT ON COLUMN yk_viesti.kysymys IS 'Yhteiskäsittelyn alkuperäinen kysymys';
COMMENT ON COLUMN yk_viesti.vastaus IS 'Yhteiskäsittelyn työparin vastaus';

UPDATE yk_viesti
SET kysymys = viesti;

ALTER TABLE yk_viesti DROP COLUMN IF EXISTS viesti;
