CREATE TABLE IF NOT EXISTS viestipohja_kategoria (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nimi TEXT NOT NULL UNIQUE,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255)
);

CREATE OR REPLACE TRIGGER trg_viestipohja_kategoria_update_muokattu_timestamp
BEFORE UPDATE ON viestipohja_kategoria
                  FOR EACH ROW
                  EXECUTE FUNCTION update_muokattu_timestamp();

COMMENT ON TABLE viestipohja_kategoria IS 'Viestipohjien kategoriat';
COMMENT ON COLUMN viestipohja_kategoria.id IS 'Taulun rivin id';
COMMENT ON COLUMN viestipohja_kategoria.nimi IS 'Kategorian nimi';
COMMENT ON COLUMN viestipohja_kategoria.luotu IS 'Rivin luontiaika';
COMMENT ON COLUMN viestipohja_kategoria.luoja IS 'Rivin luojan oid';
COMMENT ON COLUMN viestipohja_kategoria.muokattu IS 'Rivin viimeisin muokkausaika';
COMMENT ON COLUMN viestipohja_kategoria.muokkaaja IS 'Rivin viimeisimmän muokkaajan oid';

CREATE TABLE IF NOT EXISTS viestipohja (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    kategoria_id uuid NOT NULL,
    nimi TEXT NOT NULL,
    otsikko TEXT NOT NULL,
    sisalto JSONB DEFAULT '{}'::jsonb NOT NULL,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),
    CONSTRAINT fk_viestipohja_kategoria FOREIGN KEY (kategoria_id) REFERENCES viestipohja_kategoria (id)
);

CREATE OR REPLACE TRIGGER trg_viestipohja_update_muokattu_timestamp
BEFORE UPDATE ON viestipohja
                  FOR EACH ROW
                  EXECUTE FUNCTION update_muokattu_timestamp();

COMMENT ON TABLE viestipohja IS 'Viestipohjat';
COMMENT ON COLUMN viestipohja.id IS 'Taulun rivin id';
COMMENT ON COLUMN viestipohja.kategoria_id IS 'Viestipohjan kategoria';
COMMENT ON COLUMN viestipohja.nimi IS 'Viestipohjan nimi';
COMMENT ON COLUMN viestipohja.otsikko IS 'Viestipohjan otsikko';
COMMENT ON COLUMN viestipohja.sisalto IS 'Viestipohjan sisältö fi/sv/en käännöksineen JSON-muodossa';
COMMENT ON COLUMN viestipohja.luotu IS 'Rivin luontiaika';
COMMENT ON COLUMN viestipohja.luoja IS 'Rivin luojan oid';
COMMENT ON COLUMN viestipohja.muokattu IS 'Rivin viimeisin muokkausaika';
COMMENT ON COLUMN viestipohja.muokkaaja IS 'Rivin viimeisimmän muokkaajan oid';
