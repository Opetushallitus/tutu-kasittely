ALTER TABLE yk_viesti ADD COLUMN IF NOT EXISTS vastattu TIMESTAMPTZ;

COMMENT ON COLUMN yk_viesti.vastattu IS 'Vastauksen jättämisen ajankohta';
