CREATE TABLE IF NOT EXISTS perustelumuistio (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_id UUID UNIQUE NOT NULL,
    sisalto TEXT NOT NULL,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),
    CONSTRAINT fk_perustelumuistio_hakemus FOREIGN KEY (hakemus_id) REFERENCES hakemus (id)
);

CREATE OR REPLACE TRIGGER trg_perustelumuistio_update_muokattu_timestamp
    BEFORE UPDATE ON perustelumuistio
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

COMMENT ON TABLE perustelumuistio IS 'Perustelumuistio';
COMMENT ON COLUMN perustelumuistio.id IS 'Taulun rivin id';
COMMENT ON COLUMN perustelumuistio.hakemus_id IS 'Hakemustaulun hakemuksen id';
COMMENT ON COLUMN perustelumuistio.sisalto IS 'Perustelumuistion tekstisisältö';
COMMENT ON COLUMN perustelumuistio.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN perustelumuistio.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN perustelumuistio.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN perustelumuistio.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';
