ALTER TABLE paatos
    ALTER COLUMN peruutus_tai_raukeaminen_lisatiedot SET DEFAULT '{}'::jsonb,
    ALTER COLUMN peruutus_tai_raukeaminen_lisatiedot SET NOT NULL;

CREATE TYPE paatostyyppi AS ENUM ('Taso', 'Kelpoisuus', 'TiettyTutkintoTaiOpinnot', 'RiittavatOpinnot');
CREATE TYPE sovellettulaki AS ENUM ('uo', 'ap', 'ap_seut', 'ro');
CREATE TYPE tutkintotaso AS ENUM ('AlempiKorkeakoulu', 'YlempiKorkeakoulu');

CREATE TABLE paatostieto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paatos_id UUID NOT NULL,
    paatostyyppi paatostyyppi,
    sovellettulaki sovellettulaki,
    tutkinto_id UUID,
    lisaa_tutkinto_paatostekstiin BOOLEAN,
    myonteinen_paatos BOOLEAN,
    myonteisen_paatoksen_lisavaatimukset JSONB DEFAULT '{}'::jsonb NOT NULL,
    kielteisen_paatoksen_perustelut JSONB DEFAULT '{}'::jsonb NOT NULL,
    tutkintotaso tutkintotaso,
    rinnastettavat_tutkinnot_tai_opinnot TEXT[],
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),
    CONSTRAINT fk_paatostieto_paatos FOREIGN KEY (paatos_id) REFERENCES paatos (id),
    CONSTRAINT fk_paatostieto_tutkinto FOREIGN KEY (tutkinto_id) REFERENCES tutkinto (id)
);

CREATE INDEX idx_paatostieto_paatos ON paatostieto (paatos_id);

COMMENT ON TABLE paatostieto IS 'TUTU-hakemuksen päätökseen liittyvät tiedot';
COMMENT ON COLUMN paatostieto.id IS 'Taulun rivin id';
COMMENT ON COLUMN paatostieto.paatos_id IS 'Vastaavan päätöksen id päätös-taulussa';
COMMENT ON COLUMN paatostieto.paatostyyppi IS 'Päätöstyyppi';
COMMENT ON COLUMN paatostieto.sovellettulaki IS 'Sovellettava laki';
COMMENT ON COLUMN paatostieto.tutkinto_id IS 'Vastaavan tutkinnon id tutkinto-taulussa, annetaan mikäli päätöstyypiksi valittu "Taso" tai "Kelpoisuus"';
COMMENT ON COLUMN paatostieto.lisaa_tutkinto_paatostekstiin IS 'Lisätäänkö tutkinnon nimi päätöstekstiin';
COMMENT ON COLUMN paatostieto.myonteinen_paatos IS 'Onko päätös myönteinen (kyllä/ei)';
COMMENT ON COLUMN paatostieto.myonteisen_paatoksen_lisavaatimukset IS 'Myönteisen päätöksen mahdolliset lisävaatimukset';
COMMENT ON COLUMN paatostieto.kielteisen_paatoksen_perustelut IS 'Kielteisen päätöksen perustelut';
COMMENT ON COLUMN paatostieto.tutkintotaso IS 'Tutkintotaso, annetaan mikäli päätöstyypiksi valittu "Taso"';
COMMENT ON COLUMN paatostieto.rinnastettavat_tutkinnot_tai_opinnot IS 'Rinnastettavat tutkinnot tai opinnot, lista tunnisteita. Annetaan mikäli päätöstyypiksi valittu "TiettyTutkintoTaiOpinnot" tai "RiittävätOpinnot"';
COMMENT ON COLUMN paatostieto.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN paatostieto.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN paatostieto.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN paatostieto.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';
