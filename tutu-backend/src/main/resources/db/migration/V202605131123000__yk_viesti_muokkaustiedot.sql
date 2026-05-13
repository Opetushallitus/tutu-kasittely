ALTER TABLE yk_viesti ADD COLUMN IF NOT EXISTS luoja VARCHAR(255);
ALTER TABLE yk_viesti ADD COLUMN IF NOT EXISTS muokattu TIMESTAMPTZ;
ALTER TABLE yk_viesti ADD COLUMN IF NOT EXISTS muokkaaja VARCHAR(255);

CREATE OR REPLACE TRIGGER trg_yk_viesti_update_muokattu_timestamp
    BEFORE UPDATE ON yk_viesti
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();
