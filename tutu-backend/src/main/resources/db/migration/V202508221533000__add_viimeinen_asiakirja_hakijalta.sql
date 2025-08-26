ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS viimeinen_asiakirja_hakijalta TIMESTAMPTZ;

COMMENT ON COLUMN hakemus.viimeinen_asiakirja_hakijalta IS 'Aika, jolloin viimeinen asiakirja hakijalta saatu';