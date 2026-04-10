ALTER TABLE hakemus
    ADD COLUMN IF NOT EXISTS esittely_pvm TIMESTAMPTZ;

COMMENT ON COLUMN hakemus.esittely_pvm IS 'Aika jolloin hakemuksen päätös etenee esiteltäväksi';
