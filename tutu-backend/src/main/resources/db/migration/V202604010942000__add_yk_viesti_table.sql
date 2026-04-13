CREATE TABLE IF NOT EXISTS yk_viesti (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id uuid,
    hakemus_oid VARCHAR(255),
    lahettaja_oid VARCHAR(255),
    vastaanottaja_oid VARCHAR(255),
    luotu TIMESTAMPTZ DEFAULT now(),
    luettu TIMESTAMPTZ,
    viesti TEXT,
    CONSTRAINT fk_viesti_hakemus FOREIGN KEY (hakemus_oid) REFERENCES hakemus(hakemus_oid),
    CONSTRAINT fk_parent FOREIGN KEY (parent_id) REFERENCES yk_viesti(id) ON DELETE CASCADE
);

COMMENT ON TABLE yk_viesti IS 'Yhteiseen käsittelyyn liittyvät viestit';
COMMENT ON COLUMN yk_viesti.id IS 'Taulun rivin id';
COMMENT ON COLUMN yk_viesti.parent_id IS 'Isäntäviestin id';
COMMENT ON COLUMN yk_viesti.hakemus_oid IS 'Hakemustaulun hakemuksen oid';
COMMENT ON COLUMN yk_viesti.lahettaja_oid IS 'Kysymyksen lähettäjän oid';
COMMENT ON COLUMN yk_viesti.vastaanottaja_oid IS 'Vastaanottajan oid';
COMMENT ON COLUMN yk_viesti.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN yk_viesti.luettu IS 'Viestin lukuaika';
COMMENT ON COLUMN yk_viesti.viesti IS 'Viestin sisältö';