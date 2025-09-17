ALTER TABLE IF EXISTS maakoodi DROP CONSTRAINT maakoodi_koodi_unique;

ALTER TABLE maakoodi ADD COLUMN koodiuri VARCHAR(255);

ALTER TABLE maakoodi
    ADD CONSTRAINT maakoodi_koodiuri_unique UNIQUE (koodiuri);

UPDATE maakoodi
SET koodiuri = 'maatjavaltiot2_' || koodi
WHERE koodi IS NOT NULL;

ALTER TABLE maakoodi ALTER COLUMN koodiuri SET NOT NULL;

ALTER TABLE maakoodi
    ADD CONSTRAINT maakoodi_koodiuri_underscore_check
        CHECK (koodiuri LIKE '%\_%' ESCAPE '\');

ALTER TABLE IF EXISTS maakoodi DROP COLUMN koodi;

COMMENT ON COLUMN maakoodi.koodiuri IS 'Maatjavaltiot2-koodiston uniikki arvo muodossa maatjavaltiot2_XXX, joka on esittelijän vastuualuetta';