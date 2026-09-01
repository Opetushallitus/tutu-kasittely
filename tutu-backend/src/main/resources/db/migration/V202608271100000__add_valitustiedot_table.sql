CREATE TABLE IF NOT EXISTS valitustiedot (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_id uuid NOT NULL UNIQUE,
    valitus_oph jsonb DEFAULT '{}'::jsonb,
    valitus_ho jsonb DEFAULT '{}'::jsonb,
    valitus_kho jsonb DEFAULT '{}'::jsonb,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),
    CONSTRAINT fk_valitustiedot_hakemus FOREIGN KEY (hakemus_id) REFERENCES hakemus (id)
    );

CREATE OR REPLACE TRIGGER trg_valitustiedot_update_muokattu_timestamp
BEFORE UPDATE ON valitustiedot
                  FOR EACH ROW
                  EXECUTE FUNCTION update_muokattu_timestamp();

COMMENT ON TABLE valitustiedot IS 'Hakemuksen valitustiedot';
COMMENT ON COLUMN valitustiedot.id IS 'Taulun rivin id';
COMMENT ON COLUMN valitustiedot.hakemus_id IS 'Hakemuksen ID johon valitustiedot liittyvät';
COMMENT ON COLUMN valitustiedot.valitus_oph IS 'Valitus Opetushallitukselle';
COMMENT ON COLUMN valitustiedot.valitus_ho IS 'Valitus hallinto-oikeuteen';
COMMENT ON COLUMN valitustiedot.valitus_kho IS 'Valitus korkeimpaan hallinto-oikeuteen';
COMMENT ON COLUMN valitustiedot.luotu IS 'Rivin luontiaika';
COMMENT ON COLUMN valitustiedot.luoja IS 'Rivin luojan oid';
COMMENT ON COLUMN valitustiedot.muokattu IS 'Rivin viimeisin muokkausaika';
COMMENT ON COLUMN valitustiedot.muokkaaja IS 'Rivin viimeisimmän muokkaajan oid';
