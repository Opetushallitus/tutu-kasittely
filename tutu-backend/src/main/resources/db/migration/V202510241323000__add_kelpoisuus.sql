CREATE TYPE direktiivitaso AS ENUM (
    'a_1384_2015_patevyystaso_1',
    'b_1384_2015_patevyystaso_2',
    'c_1384_2015_patevyystaso_3',
    'd_1384_2015_patevyystaso_4',
    'e_1384_2015_patevyystaso_5'
    );

CREATE TABLE IF NOT EXISTS kelpoisuus
(
    id                                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paatostieto_id                              UUID NOT NULL,
    kelpoisuus                                  TEXT,
    opetettava_aine                             TEXT,
    muu_ammatti_kuvaus                          TEXT,
    direktiivitaso                              TEXT,
    kansallisesti_vaadittava_direktiivitaso     TEXT,
    direktiivitaso_lisatiedot                   TEXT,
    myonteinen_paatos                           BOOLEAN,
    myonteisen_paatoksen_lisavaatimukset        JSONB           DEFAULT '{}'::jsonb NOT NULL,
    kielteisen_paatoksen_perustelut             JSONB           DEFAULT '{}'::jsonb NOT NULL,
    luotu                                       TIMESTAMPTZ     DEFAULT now(),
    luoja                                       VARCHAR(255)    NOT NULL,
    muokattu                                    TIMESTAMPTZ,
    muokkaaja                                   VARCHAR(255),
    CONSTRAINT fk_kelpoisuus_paatostieto FOREIGN KEY (paatostieto_id) REFERENCES paatostieto (id)
);

CREATE INDEX IF NOT EXISTS idx_kelpoisuus_paatostieto ON kelpoisuus (paatostieto_id);

COMMENT ON TABLE kelpoisuus IS 'TUTU-hakemuksen päätöstiedon kelpoisuuteen liittyvät tiedot';
COMMENT ON COLUMN kelpoisuus.id IS 'Taulun rivin id';
COMMENT ON COLUMN kelpoisuus.paatostieto_id IS 'Vastaavan päätöstiedon id päätöstieto-taulussa';
COMMENT ON COLUMN kelpoisuus.kelpoisuus IS 'Kelpoisuuteen liittyvä ammatti tai tehtävä';
COMMENT ON COLUMN kelpoisuus.opetettava_aine IS 'Opetettava aine, annetaan jos kelpoisuus liittyy aineenopettajan kelpoisuuteen';
COMMENT ON COLUMN kelpoisuus.muu_ammatti_kuvaus IS 'Ammatin tarkempi kuvaus, mikäli kelpoisuudeksi valittu "Muu ammatti"';
COMMENT ON COLUMN kelpoisuus.direktiivitaso IS 'Kelpoisuuteen liittyvä direktiivitaso';
COMMENT ON COLUMN kelpoisuus.kansallisesti_vaadittava_direktiivitaso IS 'Kansallisesti vaadittava, kelpoisuuteen liittyvä direktiivitaso';
COMMENT ON COLUMN kelpoisuus.direktiivitaso_lisatiedot IS 'Lisätietoa direktiivitasosta';
COMMENT ON COLUMN kelpoisuus.myonteinen_paatos IS 'Onko kelpoisuuspäätös myönteinen (kyllä/ei)';
COMMENT ON COLUMN kelpoisuus.myonteisen_paatoksen_lisavaatimukset IS 'Myönteisen kelpoisuuspäätöksen mahdolliset lisävaatimukset';
COMMENT ON COLUMN kelpoisuus.kielteisen_paatoksen_perustelut IS 'Kielteisen kelpoisuuspäätöksen perustelut';
COMMENT ON COLUMN kelpoisuus.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN kelpoisuus.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN kelpoisuus.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN kelpoisuus.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';
