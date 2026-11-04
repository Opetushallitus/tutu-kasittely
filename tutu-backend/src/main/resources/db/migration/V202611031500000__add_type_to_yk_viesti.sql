CREATE TYPE viesti_tyyppi AS ENUM ('kysymys', 'jatkokysymys', 'vastaus');

ALTER TABLE yk_viesti
    ADD COLUMN IF NOT EXISTS tyyppi viesti_tyyppi NOT NULL DEFAULT 'kysymys';

COMMENT ON COLUMN yk_viesti.tyyppi IS 'Viestin tyyppi: kysymys, jatkokysymys tai vastaus';