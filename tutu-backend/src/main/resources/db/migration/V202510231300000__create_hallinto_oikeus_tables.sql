CREATE TABLE hallinto_oikeus (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    koodi VARCHAR(20) NOT NULL UNIQUE,
    nimi JSONB NOT NULL,
    osoite JSONB,
    puhelin VARCHAR(50),
    sahkoposti VARCHAR(100),
    verkkosivu JSONB,
    luotu TIMESTAMPTZ DEFAULT now(),
    muokattu TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE maakunta_hallinto_oikeus (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    maakunta_koodi VARCHAR(10) NOT NULL UNIQUE,
    hallinto_oikeus_id uuid REFERENCES hallinto_oikeus(id)
);

CREATE INDEX idx_maakunta_hallinto_oikeus_hallinto ON maakunta_hallinto_oikeus (hallinto_oikeus_id);
