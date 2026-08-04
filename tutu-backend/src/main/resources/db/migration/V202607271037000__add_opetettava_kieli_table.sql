CREATE TABLE IF NOT EXISTS opetettava_aine (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    kelpoisuus_id uuid NOT NULL,
    opetettava_aine TEXT,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),
    CONSTRAINT fk_opetettava_aine_kelpoisuus FOREIGN KEY (kelpoisuus_id) REFERENCES kelpoisuus (id)
);

CREATE OR REPLACE TRIGGER trg_opetettava_aine_update_muokattu_timestamp
BEFORE UPDATE ON opetettava_aine
                  FOR EACH ROW
                  EXECUTE FUNCTION update_muokattu_timestamp();

COMMENT ON TABLE opetettava_aine IS 'Kelpoisuustiedon opetettavat aineet';
COMMENT ON COLUMN opetettava_aine.id IS 'Taulun rivin id';
COMMENT ON COLUMN opetettava_aine.kelpoisuus_id IS 'Vastaavan kelpoisuuden id kelpoisuus-taulussa';
COMMENT ON COLUMN opetettava_aine.opetettava_aine IS 'Opetettava aine';
COMMENT ON COLUMN opetettava_aine.luotu IS 'Rivin luontiaika';
COMMENT ON COLUMN opetettava_aine.luoja IS 'Rivin luojan oid';
COMMENT ON COLUMN opetettava_aine.muokattu IS 'Rivin viimeisin muokkausaika';
COMMENT ON COLUMN opetettava_aine.muokkaaja IS 'Rivin viimeisimmän muokkaajan oid';

INSERT INTO opetettava_aine (
  kelpoisuus_id,
  opetettava_aine,
  luoja
)
SELECT
  id,
  opetettava_aine,
  'migration'
FROM kelpoisuus;

ALTER TABLE kelpoisuus DROP COLUMN IF EXISTS opetettava_aine;
