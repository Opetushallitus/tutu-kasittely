DROP INDEX IF EXISTS idx_paatos_hakemus;
CREATE UNIQUE INDEX idx_unique_paatos_hakemus_id
    ON paatos (hakemus_id);

CREATE TYPE ratkaisutyyppi AS ENUM ('Paatos', 'PeruutusTaiRaukeaminen', 'Oikaisu', 'JatetaanTutkimatta', 'Siirto');

ALTER TABLE paatos DROP COLUMN IF EXISTS sisalto,
    DROP COLUMN IF EXISTS tyyppi,
    ADD COLUMN IF NOT EXISTS ratkaisutyyppi ratkaisutyyppi,
    ADD COLUMN IF NOT EXISTS onko_aikaisempi_paatos BOOLEAN,
    ADD COLUMN IF NOT EXISTS seut_arviointi_tehty BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS hyvaksymispaiva TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS peruutus_tai_raukeaminen_lisatiedot JSONB;

COMMENT ON COLUMN paatos.ratkaisutyyppi IS 'Päätöksen ratkaisutyypi';
COMMENT ON COLUMN paatos.onko_aikaisempi_paatos IS 'Onko hakijalla aikaisempi päätös samasta kokonaisuudesta';
COMMENT ON COLUMN paatos.seut_arviointi_tehty IS  'Onko SEUT-arviointi tehty';
COMMENT ON COLUMN paatos.hyvaksymispaiva IS 'Päätöksen hyväksymispäivä';
COMMENT ON COLUMN paatos.peruutus_tai_raukeaminen_lisatiedot IS 'Boolean-tyyppiset täsmennykset mikäli ratkaisutyypppi on Peruutus tai raukeaminen';
