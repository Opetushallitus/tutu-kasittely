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
    hakemus_id       uuid             NOT NULL,
    asiakirja_tyyppi asiakirjan_tyyppi NOT NULL,
    luotu            TIMESTAMPTZ      DEFAULT now(),
    luoja            VARCHAR(255)     NOT NULL,
    CONSTRAINT fk_pyydettava_asiakirja_hakemus FOREIGN KEY (hakemus_id) REFERENCES hakemus (id)
);

COMMENT ON TABLE pyydettava_asiakirja IS 'Tutu-hakemusten hakijalta pyydettävät asiakirjat';
COMMENT ON COLUMN pyydettava_asiakirja.id IS 'Taulun rivin id';
COMMENT ON COLUMN pyydettava_asiakirja.asiakirja_tyyppi IS 'Asiakirjan tyyppi';
COMMENT ON COLUMN pyydettava_asiakirja.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN pyydettava_asiakirja.luoja IS 'Taulun rivin luoja';