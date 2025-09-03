-- PERUSTELU_UO_RO

CREATE TABLE IF NOT EXISTS perustelu_uo_ro
(
    id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    perustelu_id       uuid                                 NOT NULL,
    perustelun_sisalto JSONB            DEFAULT '{}'::jsonb NOT NULL,
    luotu              TIMESTAMPTZ      DEFAULT now(),
    luoja              VARCHAR(255)                         NOT NULL,
    muokattu           TIMESTAMPTZ,
    muokkaaja          VARCHAR(255),

    CONSTRAINT fk_perustelu_uo_ro_perustelu_yleiset FOREIGN KEY (perustelu_id) REFERENCES perustelu_yleiset (id)
);

CREATE INDEX idx_perustelu_uo_ro_perustelu_id ON perustelu_uo_ro (perustelu_id);

COMMENT ON TABLE perustelu_uo_ro IS 'Tutu-hakemuksen UO/RO-päätöksen perustelut';
COMMENT ON COLUMN perustelu_uo_ro.id IS 'Taulun rivin id';
COMMENT ON COLUMN perustelu_uo_ro.perustelun_sisalto IS 'Perustelun sisältö (JSONB)';
COMMENT ON COLUMN perustelu_uo_ro.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN perustelu_uo_ro.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN perustelu_uo_ro.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN perustelu_uo_ro.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE OR REPLACE TRIGGER trg_perustelu_uo_ro_update_muokattu_timestamp
    BEFORE UPDATE
    ON perustelu_uo_ro
    FOR EACH ROW
EXECUTE FUNCTION update_muokattu_timestamp();
