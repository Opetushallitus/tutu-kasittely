ALTER TABLE maakoodi
    ADD CONSTRAINT maakoodi_esittelija_id_fkey
    FOREIGN KEY (esittelija_id)
    REFERENCES esittelija(id);

