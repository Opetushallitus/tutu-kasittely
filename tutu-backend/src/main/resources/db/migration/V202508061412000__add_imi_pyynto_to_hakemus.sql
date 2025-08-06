ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS imi_pyynto BOOLEAN;
ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS imi_pyynto_numero VARCHAR(255);
ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS imi_pyynto_lahetetty TIMESTAMPTZ;
ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS imi_pyynto_vastattu TIMESTAMPTZ;

COMMENT ON COLUMN hakemus.imi_pyynto IS 'IMI-pyyntö';
COMMENT ON COLUMN hakemus.imi_pyynto_numero IS 'IMI-pyynnön numero';
COMMENT ON COLUMN hakemus.imi_pyynto_lahetetty IS 'IMI-pyyntö lähetetty';
COMMENT ON COLUMN hakemus.imi_pyynto_vastattu IS 'IMI-pyynnön vastaus saatu';