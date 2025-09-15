CREATE TYPE jatko_opinto_kelpoisuus AS ENUM (
  'toisen_vaiheen_korkeakouluopintoihin',
  'tieteellisiin_jatko-opintoihin',
  'muu'
);

ALTER TABLE perustelu_yleiset ADD COLUMN IF NOT EXISTS aikaisemmat_paatokset boolean;
ALTER TABLE perustelu_yleiset ADD COLUMN IF NOT EXISTS jatko_opinto_kelpoisuus jatko_opinto_kelpoisuus;
ALTER TABLE perustelu_yleiset ADD COLUMN IF NOT EXISTS jatko_opinto_kelpoisuus_lisatieto text NOT NULL DEFAULT '';

COMMENT ON COLUMN perustelu_yleiset.aikaisemmat_paatokset IS 'Onko opetushallitus on tehnyt vastaavia päätöksiä?';
COMMENT ON COLUMN perustelu_yleiset.jatko_opinto_kelpoisuus IS 'Opintoaste, johon jatko-opintokelpoisuus';
COMMENT ON COLUMN perustelu_yleiset.jatko_opinto_kelpoisuus_lisatieto IS 'Tarkenne jatko-opintokelpoisuuteen "muu"';