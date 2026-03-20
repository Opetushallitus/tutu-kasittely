ALTER TABLE hakemus DROP CONSTRAINT fk_hakemus_esittelija;
ALTER TABLE hakemus ADD CONSTRAINT fk_hakemus_esittelija FOREIGN KEY (esittelija_id) REFERENCES esittelija(id) ON DELETE SET NULL;

ALTER TABLE maakoodi DROP CONSTRAINT maakoodi_esittelija_id_fkey;
ALTER TABLE maakoodi ADD CONSTRAINT maakoodi_esittelija_id_fkey FOREIGN KEY (esittelija_id) REFERENCES esittelija(id) ON DELETE SET NULL;
