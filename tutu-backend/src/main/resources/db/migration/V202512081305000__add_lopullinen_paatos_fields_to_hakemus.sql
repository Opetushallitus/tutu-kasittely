ALTER TABLE IF EXISTS hakemus ADD COLUMN IF NOT EXISTS lopullinen_paatos_ehdollisen_asiatunnus VARCHAR(15);
ALTER TABLE IF EXISTS hakemus ADD COLUMN IF NOT EXISTS lopullinen_paatos_tutkinnon_suoritus_maakoodiuri VARCHAR(255);

COMMENT ON COLUMN hakemus.form_id IS 'Hakemusta vastaavan ataru-lomakkeen ID';
COMMENT ON COLUMN hakemus.lopullinen_paatos_ehdollisen_asiatunnus IS 'Lopullisen päätöksen hakemuksessa vastaavan ehdollisen päätöksen hakemuksen asiatunnus';
COMMENT ON COLUMN hakemus.lopullinen_paatos_tutkinnon_suoritus_maakoodiuri IS 'Lopullisen päätöksen hakemuksessa vastaavan ehdollisen päätöksen tutkinnon suoritusmaa-URI muodossa maatjavaltiot2_XXX';
