CREATE TABLE IF NOT EXISTS paatosteksti (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_id UUID UNIQUE NOT NULL,
    vahvistettu TIMESTAMPTZ,
    sisalto TEXT NOT NULL,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),
    CONSTRAINT fk_paatosteksti_hakemus FOREIGN KEY (hakemus_id) REFERENCES hakemus (id)
);

CREATE OR REPLACE TRIGGER trg_paatosteksti_update_muokattu_timestamp
    BEFORE UPDATE ON paatosteksti
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

COMMENT ON TABLE paatosteksti IS 'Päätöstekstit';
COMMENT ON COLUMN paatosteksti.id IS 'Taulun rivin id';
COMMENT ON COLUMN paatosteksti.hakemus_id IS 'Hakemustaulun hakemuksen id';
COMMENT ON COLUMN paatosteksti.sisalto IS 'Päätöstekstin sisältö';
COMMENT ON COLUMN paatosteksti.vahvistettu IS 'Päätöstekstin vahvistamisaika';
COMMENT ON COLUMN paatosteksti.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN paatosteksti.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN paatosteksti.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN paatosteksti.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';
