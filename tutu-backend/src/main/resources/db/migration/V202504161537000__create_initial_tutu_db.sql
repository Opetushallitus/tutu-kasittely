CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- UPDATE FUNCTION
CREATE OR REPLACE FUNCTION update_muokattu_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.muokattu := now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ESITTELIJA
CREATE TABLE IF NOT EXISTS esittelija (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    maatjavaltiot_koodi_uri VARCHAR(255) NOT NULL,
    esittelija_oid VARCHAR(255) NOT NULL,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255)
);

COMMENT ON TABLE esittelija IS 'Tutu-hakemusten esittelijät ja esittelijöiden vastuualueet';
COMMENT ON COLUMN esittelija.id IS 'Taulun rivin id';
COMMENT ON COLUMN esittelija.maatjavaltiot_koodi_uri IS 'Maatjavaltiot-koodiston koodiuri, joka on esittelijän vastuualuetta';
COMMENT ON COLUMN esittelija.esittelija_oid IS 'Esittelijän henkilöOID';
COMMENT ON COLUMN esittelija.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN esittelija.luotu IS 'Taulun rivin luoja';
COMMENT ON COLUMN esittelija.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN esittelija.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE INDEX idx_esittelija_oid ON esittelija(esittelija_oid);
CREATE INDEX idx_esittelija_maatjavaltiot_koodi_uri ON esittelija(maatjavaltiot_koodi_uri);

CREATE OR REPLACE TRIGGER trg_esittelija_update_muokattu_timestamp
    BEFORE UPDATE ON esittelija
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

-- HAKEMUS
CREATE TABLE IF NOT EXISTS hakemus (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_oid VARCHAR(255) NOT NULL,
    esittelija_id uuid,
    esitelty TIMESTAMPTZ,
    paatos TIMESTAMPTZ,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255)
);

COMMENT ON TABLE hakemus IS 'Tutu-hakemuksen tiedot';
COMMENT ON COLUMN hakemus.id IS 'Taulun rivin id';
COMMENT ON COLUMN hakemus.hakemus_oid IS 'Hakemuspalvelun hakemustunniste';
COMMENT ON COLUMN hakemus.esittelija_id IS 'Esittelija-taulun esittelijä-id';
COMMENT ON COLUMN hakemus.esitelty IS 'Hakemuksen esittelyaika';
COMMENT ON COLUMN hakemus.paatos IS 'Hakemuksen päätöksen ajankohta';
COMMENT ON COLUMN hakemus.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN hakemus.luotu IS 'Taulun rivin luoja';
COMMENT ON COLUMN hakemus.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN hakemus.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE INDEX idx_hakemus_oid ON hakemus(hakemus_oid);
CREATE INDEX idx_hakemus_esittelija ON hakemus(esittelija_id);

ALTER TABLE hakemus
    ADD CONSTRAINT fk_hakemus_esittelija
    FOREIGN KEY (esittelija_id) REFERENCES esittelija(id);

CREATE OR REPLACE TRIGGER trg_hakemus_update_muokattu_timestamp
    BEFORE UPDATE ON hakemus
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

-- MUISTIO
CREATE TABLE IF NOT EXISTS muistio (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_id uuid NOT NULL,
    sisalto TEXT NOT NULL,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255)
);

COMMENT ON TABLE muistio IS 'Tutu-hakemuksen muistiot';
COMMENT ON COLUMN muistio.id IS 'Taulun rivin id';
COMMENT ON COLUMN muistio.hakemus_id IS 'Hakemustaulun hakemuksen id';
COMMENT ON COLUMN muistio.sisalto IS 'Muistion sisälto';
COMMENT ON COLUMN muistio.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN muistio.luotu IS 'Taulun rivin luoja';
COMMENT ON COLUMN muistio.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN muistio.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE INDEX idx_muistio_hakemus_id ON muistio(hakemus_id);

ALTER TABLE muistio
    ADD CONSTRAINT fk_muistio_hakemus
    FOREIGN KEY (hakemus_id) REFERENCES hakemus(id);

CREATE OR REPLACE TRIGGER trg_muistio_update_muokattu_timestamp
    BEFORE UPDATE ON muistio
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

-- PAATOS
CREATE TABLE IF NOT EXISTS paatos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

    hakemus_id uuid NOT NULL,
    sisalto TEXT NOT NULL,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255)
);

COMMENT ON TABLE paatos IS 'Tutu-hakemuksen päätökset';
COMMENT ON COLUMN paatos.id IS 'Taulun rivin id';
COMMENT ON COLUMN paatos.hakemus_id IS 'Hakemustaulun hakemuksen id';
COMMENT ON COLUMN paatos.sisalto IS 'Päätöksen sisälto';
COMMENT ON COLUMN paatos.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN paatos.luotu IS 'Taulun rivin luoja';
COMMENT ON COLUMN paatos.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN paatos.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE INDEX idx_paatos_hakemus ON paatos(hakemus_id);
ALTER TABLE paatos
    ADD CONSTRAINT fk_paatos_hakemus
    FOREIGN KEY (hakemus_id) REFERENCES hakemus(id);

CREATE OR REPLACE TRIGGER trg_paatos_update_muokattu_timestamp
    BEFORE UPDATE ON paatos
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();
