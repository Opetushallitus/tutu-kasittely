-- Poistetaan samalla tarpeettomaksi jäänyt kenttä paatostieto -taulusta
ALTER TABLE IF EXISTS paatostieto DROP COLUMN IF EXISTS myonteisen_paatoksen_lisavaatimukset;

ALTER TABLE IF EXISTS hakemus ADD COLUMN IF NOT EXISTS form_id BIGINT;