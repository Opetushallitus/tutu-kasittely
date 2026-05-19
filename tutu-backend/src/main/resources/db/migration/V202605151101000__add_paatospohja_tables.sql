CREATE TABLE IF NOT EXISTS paatospohja_kategoria (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nimi TEXT NOT NULL UNIQUE,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255)
);

CREATE OR REPLACE TRIGGER trg_paatospohja_kategoria_update_muokattu_timestamp
BEFORE UPDATE ON paatospohja_kategoria
                  FOR EACH ROW
                  EXECUTE FUNCTION update_muokattu_timestamp();

COMMENT ON TABLE paatospohja_kategoria IS 'Päätöspohjien kategoriat';
COMMENT ON COLUMN paatospohja_kategoria.id IS 'Taulun rivin id';
COMMENT ON COLUMN paatospohja_kategoria.nimi IS 'Kategorian nimi';
COMMENT ON COLUMN paatospohja_kategoria.luotu IS 'Rivin luontiaika';
COMMENT ON COLUMN paatospohja_kategoria.luoja IS 'Rivin luojan oid';
COMMENT ON COLUMN paatospohja_kategoria.muokattu IS 'Rivin viimeisin muokkausaika';
COMMENT ON COLUMN paatospohja_kategoria.muokkaaja IS 'Rivin viimeisimmän muokkaajan oid';

CREATE TABLE IF NOT EXISTS paatospohja (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    kategoria_id uuid,
    nimi TEXT NOT NULL,
    sisalto JSONB DEFAULT '{}'::jsonb NOT NULL,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),
    CONSTRAINT fk_paatospohja_kategoria FOREIGN KEY (kategoria_id) REFERENCES paatospohja_kategoria (id)
);

CREATE OR REPLACE TRIGGER trg_paatospohja_update_muokattu_timestamp
BEFORE UPDATE ON paatospohja
                  FOR EACH ROW
                  EXECUTE FUNCTION update_muokattu_timestamp();

COMMENT ON TABLE paatospohja IS 'Päätöspohjat';
COMMENT ON COLUMN paatospohja.id IS 'Taulun rivin id';
COMMENT ON COLUMN paatospohja.kategoria_id IS 'Päätöspohjan kategoria';
COMMENT ON COLUMN paatospohja.nimi IS 'Päätöspohjan nimi';
COMMENT ON COLUMN paatospohja.sisalto IS 'Päätöspohjan sisältö fi/sv/en käännöksineen JSON-muodossa';
COMMENT ON COLUMN paatospohja.luotu IS 'Rivin luontiaika';
COMMENT ON COLUMN paatospohja.luoja IS 'Rivin luojan oid';
COMMENT ON COLUMN paatospohja.muokattu IS 'Rivin viimeisin muokkausaika';
COMMENT ON COLUMN paatospohja.muokkaaja IS 'Rivin viimeisimmän muokkaajan oid';
