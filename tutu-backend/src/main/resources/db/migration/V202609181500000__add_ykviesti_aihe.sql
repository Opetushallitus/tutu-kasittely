CREATE TABLE IF NOT EXISTS yk_viesti_aihe (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  avain VARCHAR(255)
);

COMMENT ON TABLE yk_viesti_aihe IS 'Yhteiseen käsittelyyn liittyvien viestien aiheet';
COMMENT ON COLUMN yk_viesti_aihe.id IS 'Taulun rivin id';
COMMENT ON COLUMN yk_viesti_aihe.avain IS 'Aiheen käännösavain tolgeehen';

INSERT INTO yk_viesti_aihe (avain) VALUES ('asiakirjat');
INSERT INTO yk_viesti_aihe (avain) VALUES ('kelpoisuus');
INSERT INTO yk_viesti_aihe (avain) VALUES ('muotoilu');
INSERT INTO yk_viesti_aihe (avain) VALUES ('taso');
INSERT INTO yk_viesti_aihe (avain) VALUES ('lisavaatimukset');
INSERT INTO yk_viesti_aihe (avain) VALUES ('ennakkoviesti');
INSERT INTO yk_viesti_aihe (avain) VALUES ('muu');