CREATE TABLE IF NOT EXISTS maakoodi (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    esittelija_id uuid,
    koodi VARCHAR(255) NOT NULL,
    lyhytnimi VARCHAR(255),
    nimi VARCHAR(255) NOT NULL,
    kuvaus TEXT,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255)
);