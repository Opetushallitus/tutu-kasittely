CREATE OR REPLACE TRIGGER trg_lausuntopyynto_update_muokattu_timestamp
    BEFORE UPDATE ON lausuntopyynto
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

CREATE OR REPLACE TRIGGER trg_maakoodi_update_muokattu_timestamp
    BEFORE UPDATE ON maakoodi
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

CREATE OR REPLACE TRIGGER trg_paatostieto_update_muokattu_timestamp
    BEFORE UPDATE ON paatostieto
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

CREATE OR REPLACE TRIGGER trg_tutkinto_tai_opinto_update_muokattu_timestamp
    BEFORE UPDATE ON tutkinto_tai_opinto
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

CREATE OR REPLACE TRIGGER trg_kelpoisuus_update_muokattu_timestamp
    BEFORE UPDATE ON kelpoisuus
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

CREATE OR REPLACE TRIGGER trg_hallinto_oikeus_update_muokattu_timestamp
    BEFORE UPDATE ON hallinto_oikeus
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();
