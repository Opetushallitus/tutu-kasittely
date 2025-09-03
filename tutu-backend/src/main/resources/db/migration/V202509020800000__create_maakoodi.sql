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