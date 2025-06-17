ALTER TABLE hakemus ADD COLUMN kasittely_vaihe VARCHAR(50) NOT NULL DEFAULT 'AlkukasittelyKesken';
COMMENT ON COLUMN hakemus.kasittely_vaihe IS 'Hakemuksen käsittelyvaihe';