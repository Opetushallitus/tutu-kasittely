ALTER TABLE esittelija
    ADD COLUMN IF NOT EXISTS sahkoposti VARCHAR(255),
    ADD COLUMN IF NOT EXISTS puhelinnumero VARCHAR(255);

COMMENT ON COLUMN esittelija.sahkoposti IS 'Esittelijän sähköpostiosoite ONR:stä, synkataan ajastettuna';
COMMENT ON COLUMN esittelija.puhelinnumero IS 'Esittelijän puhelinnumero ONR:stä, synkataan ajastettuna';
