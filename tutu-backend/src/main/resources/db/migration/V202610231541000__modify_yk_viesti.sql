ALTER TABLE yk_viesti
    DROP COLUMN vastaus,
    DROP COLUMN vastaus_luettu,
    DROP COLUMN vastattu,
    DROP COLUMN kysymys_luettu,
    DROP COLUMN kysymys;

ALTER TABLE yk_viesti
    ADD COLUMN IF NOT EXISTS luettu VARCHAR (255)[],
    ADD COLUMN IF NOT EXISTS viesti TEXT,
    ADD COLUMN IF NOT EXISTS aihe UUID REFERENCES yk_viesti_aihe (id) ON DELETE SET NULL;

COMMENT ON COLUMN yk_viesti.luettu IS 'Lista henkilöistä, jotka ovat lukeneet viestin';
COMMENT ON COLUMN yk_viesti.viesti IS 'Viesti-kenttä';