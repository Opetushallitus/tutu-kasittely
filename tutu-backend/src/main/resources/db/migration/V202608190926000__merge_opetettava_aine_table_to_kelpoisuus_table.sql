ALTER TABLE kelpoisuus ADD COLUMN opetettava_aine TEXT;
COMMENT ON COLUMN kelpoisuus.opetettava_aine IS 'Opetettava aine, annetaan jos kelpoisuus liittyy aineenopettajan kelpoisuuteen';

UPDATE kelpoisuus k
SET opetettava_aine = (
  SELECT opetettava_aine
  FROM opetettava_aine oa
  WHERE oa.kelpoisuus_id = k.id
  LIMIT 1
);

DROP TRIGGER IF EXISTS trg_opetettava_aine_update_muokattu_timestamp ON opetettava_aine;

DROP TABLE IF EXISTS opetettava_aine;
