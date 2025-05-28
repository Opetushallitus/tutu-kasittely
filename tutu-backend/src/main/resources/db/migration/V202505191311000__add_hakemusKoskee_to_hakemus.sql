ALTER TABLE hakemus ADD COLUMN hakemus_koskee INTEGER NOT NULL default 9;
COMMENT ON COLUMN hakemus.hakemus_koskee IS 'Hakemuksen syy';