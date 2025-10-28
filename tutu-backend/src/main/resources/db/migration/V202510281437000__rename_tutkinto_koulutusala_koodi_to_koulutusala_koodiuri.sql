ALTER TABLE IF EXISTS tutkinto ADD COLUMN IF NOT EXISTS koulutusala_koodiuri VARCHAR(255);

ALTER TABLE tutkinto
    ADD CONSTRAINT tutkinto_koulutusala_koodiuri_underscore_check
        CHECK (koulutusala_koodiuri LIKE '%\_%' ESCAPE '\' OR koulutusala_koodiuri IS NULL);

UPDATE tutkinto
SET koulutusala_koodiuri = CASE
    WHEN koulutusala_koodi IS NOT NULL THEN 'kansallinenkoulutusluokitus2016koulutusalataso1_' || koulutusala_koodi
    ELSE NULL
END;

ALTER TABLE IF EXISTS tutkinto DROP COLUMN IF EXISTS koulutusala_koodi;

COMMENT ON COLUMN tutkinto.koulutusala_koodiuri IS 'Kansallinen koulutusluokitus koulutusala URI muodossa kansallinenkoulutusluokitus2016koulutusalataso1_XX';
