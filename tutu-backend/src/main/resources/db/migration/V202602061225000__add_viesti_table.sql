CREATE TYPE viestityyppi AS ENUM (
    'taydennyspyynto',
    'ennakkotieto',
    'muu'
    );

CREATE TYPE kieli AS ENUM (
    'fi',
    'sv',
    'en'
    );

CREATE TABLE IF NOT EXISTS viesti
(
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_id      UUID NOT NULL,
    kieli           kieli,
    tyyppi          viestityyppi,
    otsikko         TEXT,
    viesti          TEXT,
    vahvistettu     TIMESTAMPTZ,
    vahvistaja      VARCHAR(255),
    luotu           TIMESTAMPTZ     DEFAULT now(),
    luoja           VARCHAR(255)    NOT NULL,
    muokattu        TIMESTAMPTZ,
    muokkaaja       VARCHAR(255),
    CONSTRAINT fk_viesti_hakemus FOREIGN KEY (hakemus_id) REFERENCES hakemus (id)
);

CREATE INDEX IF NOT EXISTS idx_viesti_hakemus ON viesti (hakemus_id);

CREATE OR REPLACE TRIGGER trg_viesti_update_muokattu_timestamp
BEFORE UPDATE ON viesti
FOR EACH ROW
EXECUTE FUNCTION update_muokattu_timestamp();

COMMENT ON TABLE viesti IS 'Viestit, kuten täydennyspyynnöt ja ennakkotiedot';
COMMENT ON COLUMN viesti.id IS 'Taulun rivin id';        
COMMENT ON COLUMN viesti.hakemus_id IS 'Hakemustaulun hakemuksen id';        
COMMENT ON COLUMN viesti.kieli IS 'Viestin kieli';        
COMMENT ON COLUMN viesti.tyyppi IS 'Viestin tyyppi, täydennyspyyntö, ennakkotieto tai muu';        
COMMENT ON COLUMN viesti.otsikko IS 'Viestin otsikko';        
COMMENT ON COLUMN viesti.viesti IS 'Viestin varsinainen sisältö';        
COMMENT ON COLUMN viesti.vahvistettu IS 'Viestin vahvistamisaika';        
COMMENT ON COLUMN viesti.vahvistaja IS 'Viestin vahvistaja';        
COMMENT ON COLUMN viesti.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN viesti.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN viesti.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN viesti.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';


