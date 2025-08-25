-- Korjataan esittelijä-taulun maakoodi
ALTER TABLE esittelija
    RENAME COLUMN maatjavaltiot_koodi_uri TO maakoodi;

ALTER TABLE esittelija
    ALTER COLUMN maakoodi TYPE INT USING maakoodi::INT;

COMMENT ON COLUMN esittelija.maakoodi IS 'Maatjavaltiot-koodiston arvo, joka on esittelijän vastuualuetta';

CREATE TABLE IF NOT EXISTS tutkinto
(
    id                     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_id             uuid         NOT NULL,
    jarjestys              VARCHAR(255) NOT NULL,
    nimi                   VARCHAR(255),
    oppilaitos             VARCHAR(255),
    aloitus_vuosi          INT,
    paattymis_vuosi        INT,
    maakoodi               INT,
    muu_tutkinto_tieto     TEXT,
    todistuksen_paivamaara VARCHAR(255),
    luotu                  TIMESTAMPTZ      DEFAULT now(),
    luoja                  VARCHAR(255) NOT NULL,
    muokattu               TIMESTAMPTZ,
    muokkaaja              VARCHAR(255),
    CONSTRAINT fk_tutkinto_hakemus FOREIGN KEY (hakemus_id) REFERENCES hakemus (id),
    CONSTRAINT unique_hakemus_id_jarjestys UNIQUE (hakemus_id, jarjestys)
);

COMMENT ON TABLE tutkinto IS 'Tutu-hakemuksen tutkintotiedot';
COMMENT ON COLUMN tutkinto.id IS 'Taulun rivin id';
COMMENT ON COLUMN tutkinto.hakemus_id IS 'Hakemustaulun hakemuksen id';
COMMENT ON COLUMN tutkinto.jarjestys IS 'Tutkinnon järjestysnumero, 1, 2, 3 -> tai MUU';
COMMENT ON COLUMN tutkinto.nimi IS 'Tutkinnon nimi';
COMMENT ON COLUMN tutkinto.oppilaitos IS 'Tutkinnon suorituksen oppilaitos';
COMMENT ON COLUMN tutkinto.aloitus_vuosi IS 'Tutkinnon aloitusvuosi';
COMMENT ON COLUMN tutkinto.paattymis_vuosi IS 'Tutkinnon päättymisvuosi';
COMMENT ON COLUMN tutkinto.maakoodi IS 'Tutkinnon suoritus maa';
COMMENT ON COLUMN tutkinto.muu_tutkinto_tieto IS 'Tutkinnon huomiot päätökseen';
COMMENT ON COLUMN tutkinto.todistuksen_paivamaara IS 'Todistuksen päivämäärä (tekstikenttä)';
COMMENT ON COLUMN tutkinto.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN tutkinto.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN tutkinto.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN tutkinto.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE INDEX idx_tutkinto_hakemus ON tutkinto (hakemus_id);

CREATE OR REPLACE TRIGGER trg_tutkinto_update_muokattu_timestamp
    BEFORE UPDATE
    ON tutkinto
    FOR EACH ROW
EXECUTE FUNCTION update_muokattu_timestamp();