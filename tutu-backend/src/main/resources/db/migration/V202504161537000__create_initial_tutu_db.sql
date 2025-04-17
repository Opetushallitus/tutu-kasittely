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

CREATE INDEX idx_paatos_hakemus ON paatos(hakemus_id);
ALTER TABLE paatos
    ADD CONSTRAINT fk_paatos_hakemus
    FOREIGN KEY (hakemus_id) REFERENCES hakemus(id);

CREATE OR REPLACE TRIGGER trg_paatos_update_muokattu_timestamp
    BEFORE UPDATE ON paatos
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();
