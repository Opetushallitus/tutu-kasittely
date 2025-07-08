CREATE TYPE hakemuksen_osa AS ENUM (
  'hakemus',
  'hakija',
  'tutkinnot',
  'asiakirjat',
  'paatos',
  'valitus',
  'yhteinen_kasittely',
  'perustelut-yleiset',
  'perustelut-ro-uo',
  'perustelut-ap'
);

ALTER TABLE muistio ADD COLUMN IF NOT EXISTS sisainen_huomio boolean NOT NULL DEFAULT FALSE;
ALTER TABLE muistio ADD COLUMN IF NOT EXISTS hakemuksen_osa hakemuksen_osa NOT NULL DEFAULT 'hakemus';

COMMENT ON COLUMN muistio.sisainen_huomio IS 'Sisäinen huomio – ei näy muistiossa';
COMMENT ON COLUMN muistio.hakemuksen_osa IS 'Hakemuksen osa, johon muistion rivi liittyy';
