ALTER TABLE IF EXISTS tutkinto ADD COLUMN IF NOT EXISTS maakoodiuri VARCHAR(255);

ALTER TABLE tutkinto
    ADD CONSTRAINT tutkinto_maakoodiuri_underscore_check
        CHECK (maakoodiuri LIKE '%\_%' ESCAPE '\' OR maakoodiuri IS NULL);

UPDATE tutkinto
SET maakoodiuri = CASE
WHEN maakoodi IS NOT NULL THEN 'maatjavaltiot2_' || maakoodi
ELSE NULL
END;

ALTER TABLE IF EXISTS tutkinto DROP COLUMN IF EXISTS maakoodi;

COMMENT ON COLUMN tutkinto.maakoodiuri IS 'Tutkinnon suoritus maa URI muodossa maatjavaltiot2_XXX';