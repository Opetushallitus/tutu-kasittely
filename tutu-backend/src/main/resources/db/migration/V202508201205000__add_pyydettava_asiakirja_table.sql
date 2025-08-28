-- Korjataan muistio-taulun virheellinen kommentti:
COMMENT ON COLUMN muistio.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN muistio.luoja IS 'Taulun rivin luoja';

CREATE TYPE asiakirjan_tyyppi AS ENUM (
    'tutkintotodistustenjaljennokset',
    'liitteidenjaljennokset',
    'tutkintotodistustenkaannokset',
    'liitteidenkaannokset',
    'alkuperaisettutkintotodistukset',
    'alkuperaisetliitteet',
    'vaitoskirja',
    'tyotodistukset',
    'ammattipatevyys',
    'kansalaisuus',
    'nimenmuutos'
    );

CREATE TABLE IF NOT EXISTS pyydettava_asiakirja
(
    id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    asiakirja_id       uuid              NOT NULL,
    asiakirja_tyyppi asiakirjan_tyyppi NOT NULL,
    luotu            TIMESTAMPTZ      DEFAULT now(),
    luoja            VARCHAR(255)      NOT NULL,
    muokattu         TIMESTAMPTZ,
    muokkaaja        VARCHAR(255),
        CONSTRAINT fk_pyydettava_asiakirja_asiakirja FOREIGN KEY (asiakirja_id) REFERENCES asiakirja (id)
);

CREATE INDEX idx_pyydettava_asiakirja_asiakirja_id ON pyydettava_asiakirja(asiakirja_id);

COMMENT ON TABLE pyydettava_asiakirja IS 'Tutu-hakemusten hakijalta pyydettävät asiakirjat';
COMMENT ON COLUMN pyydettava_asiakirja.id IS 'Taulun rivin id';
COMMENT ON COLUMN pyydettava_asiakirja.asiakirja_tyyppi IS 'Asiakirjan tyyppi';
COMMENT ON COLUMN pyydettava_asiakirja.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN pyydettava_asiakirja.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN pyydettava_asiakirja.muokkaaja IS 'Taulun rivin muokkausaika';
COMMENT ON COLUMN pyydettava_asiakirja.muokattu IS 'Taulun rivin muokkaaja';

CREATE OR REPLACE TRIGGER trg_pyydettava_asiakirja_update_muokattu_timestamp
    BEFORE UPDATE ON pyydettava_asiakirja
    FOR EACH ROW
EXECUTE FUNCTION update_muokattu_timestamp();