ALTER TABLE hakemus ADD COLUMN asiatunnus VARCHAR(15);
COMMENT ON COLUMN hakemus.asiatunnus IS 'Hakemuksen asiatunnus';