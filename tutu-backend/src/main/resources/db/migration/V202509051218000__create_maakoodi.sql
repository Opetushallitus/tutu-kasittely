DROP INDEX IF EXISTS idx_esittelija_maakoodi;
ALTER TABLE esittelija DROP CONSTRAINT IF EXISTS esittelija_maakoodi_key;
ALTER TABLE esittelija DROP COLUMN IF EXISTS maakoodi;

CREATE TABLE IF NOT EXISTS maakoodi (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    esittelija_id uuid,
    koodi VARCHAR(255) NOT NULL,
    nimi VARCHAR(255) NOT NULL,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255)
);

ALTER TABLE maakoodi ADD CONSTRAINT maakoodi_koodi_unique UNIQUE (koodi);

COMMENT ON TABLE maakoodi IS 'Tutu-hakemusten maakoodit, jotka määrittävät esittelijän vastuualuetta';
COMMENT ON COLUMN maakoodi.id IS 'Taulun rivin id';
COMMENT ON COLUMN maakoodi.koodi IS 'Maatjavaltiot2-koodiston uniikki arvo, joka on esittelijän vastuualuetta';
COMMENT ON COLUMN maakoodi.esittelija_id IS 'Maakoodille asetetun esittelijän id';
COMMENT ON COLUMN maakoodi.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN maakoodi.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN maakoodi.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN maakoodi.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';