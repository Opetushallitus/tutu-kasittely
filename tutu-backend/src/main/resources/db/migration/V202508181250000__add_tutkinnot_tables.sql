-- TUTKINTO
CREATE TABLE IF NOT EXISTS tutkinto
(
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_id      uuid NOT NULL,
    jarjestys_numero INT NOT NULL,
    nimi            VARCHAR(255) NOT NULL,
    oppilaitos      VARCHAR(255) NOT NULL,
    aloitus_vuosi   INT          NOT NULL,
    paattymis_vuosi INT          NOT NULL,
    luotu           TIMESTAMPTZ      DEFAULT now(),
    luoja           VARCHAR(255) NOT NULL,
    muokattu        TIMESTAMPTZ,
    muokkaaja       VARCHAR(255),
    CONSTRAINT fk_tutkinto_hakemus FOREIGN KEY (hakemus_id) REFERENCES hakemus (id)
);

COMMENT ON TABLE tutkinto IS 'Tutu-hakemuksen tutkintotiedot';
COMMENT ON COLUMN tutkinto.id IS 'Taulun rivin id';
COMMENT ON COLUMN tutkinto.hakemus_id IS 'Hakemustaulun hakemuksen id';
COMMENT ON COLUMN tutkinto.jarjestys_numero IS 'Tutkinnon järjestysnumero';
COMMENT ON COLUMN tutkinto.nimi IS 'Tutkinnon nimi';
COMMENT ON COLUMN tutkinto.oppilaitos IS 'Tutkinnon suorituksen oppilaitos';
COMMENT ON COLUMN tutkinto.aloitus_vuosi IS 'Tutkinnon aloitusvuosi';
COMMENT ON COLUMN tutkinto.paattymis_vuosi IS 'Tutkinnon päättymisvuosi';
COMMENT ON COLUMN tutkinto.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN tutkinto.luotu IS 'Taulun rivin luoja';
COMMENT ON COLUMN tutkinto.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN tutkinto.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE INDEX idx_tutkinto_hakemus ON tutkinto (hakemus_id);

CREATE OR REPLACE TRIGGER trg_tutkinto_update_muokattu_timestamp
    BEFORE UPDATE
    ON tutkinto
    FOR EACH ROW
EXECUTE FUNCTION update_muokattu_timestamp();

-- MUU_TUTKINTO
CREATE TABLE IF NOT EXISTS muu_tutkinto
(
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_id      uuid NOT NULL,
    tieto           TEXT,
    huomio          TEXT,
    luotu           TIMESTAMPTZ      DEFAULT now(),
    luoja           VARCHAR(255) NOT NULL,
    muokattu        TIMESTAMPTZ,
    muokkaaja       VARCHAR(255),
    CONSTRAINT fk_muu_tutkinto_hakemus FOREIGN KEY (hakemus_id) REFERENCES hakemus (id)
);

COMMENT ON TABLE muu_tutkinto IS 'Tutu-hakemuksen muiden tutkintojent tiedot';
COMMENT ON COLUMN muu_tutkinto.id IS 'Taulun rivin id';
COMMENT ON COLUMN muu_tutkinto.hakemus_id IS 'Hakemustaulun hakemuksen id';
COMMENT ON COLUMN muu_tutkinto.tieto IS 'Tutkinnon tiedot';
COMMENT ON COLUMN muu_tutkinto.huomio IS 'Tutkinnon huomiot päätökseen';
COMMENT ON COLUMN muu_tutkinto.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN muu_tutkinto.luotu IS 'Taulun rivin luoja';
COMMENT ON COLUMN muu_tutkinto.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN muu_tutkinto.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE INDEX idx_muu_tutkinto_hakemus ON muu_tutkinto (hakemus_id);

CREATE OR REPLACE TRIGGER trg_muu_tutkinto_update_muokattu_timestamp
    BEFORE UPDATE
    ON muu_tutkinto
    FOR EACH ROW
EXECUTE FUNCTION update_muokattu_timestamp();
