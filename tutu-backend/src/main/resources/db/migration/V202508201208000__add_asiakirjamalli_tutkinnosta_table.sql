CREATE TYPE asiakirja_malli_lahde AS ENUM (
    'ece',
    'UK_enic',
    'naric_portal',
    'nuffic',
    'aacrao',
    'muu'
    );

CREATE TABLE IF NOT EXISTS asiakirjamalli_tutkinnosta (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    asiakirja_id uuid NOT NULL,
    lahde asiakirja_malli_lahde NOT NULL,
    vastaavuus BOOLEAN NOT NULL,
    kuvaus TEXT,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),
    CONSTRAINT fk_asiakirjamalli_tutkinnosta_asiakirja FOREIGN KEY (asiakirja_id) REFERENCES asiakirja(id)
    );

COMMENT ON TABLE asiakirjamalli_tutkinnosta IS 'Asiakirjamallit vastaavista tutkinnoista';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.id IS 'Taulun rivin id';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.asiakirja_id IS 'Vastaavan asiakirjakokonaisuuden id';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.lahde IS 'Asiakirjamallin lähde';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.vastaavuus IS 'vastaako tietty asiakirjamalli hakemuksen asiakirjaa';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.kuvaus IS 'Kuvaus siitä vastaako tietty asiakirjamalli hakemuksen asiakirjaa';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE UNIQUE INDEX idx_asiakirjamalli_tutkinnosta_asiakirja_lahde ON asiakirjamalli_tutkinnosta(asiakirja_id, lahde);

CREATE OR REPLACE TRIGGER trg_asiakirjamalli_tutkinnosta_update_muokattu_timestamp
    BEFORE UPDATE ON asiakirjamalli_tutkinnosta
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

