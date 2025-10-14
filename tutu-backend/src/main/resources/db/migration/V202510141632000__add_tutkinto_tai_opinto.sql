ALTER TABLE paatostieto
    DROP COLUMN IF EXISTS rinnastettavat_tutkinnot_tai_opinnot;

CREATE TABLE tutkinto_tai_opinto
(
    id                                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paatostieto_id                       UUID                                 NOT NULL,
    tutkinto_tai_opinto                  TEXT,
    myonteinen_paatos                    BOOLEAN,
    myonteisen_paatoksen_lisavaatimukset JSONB            DEFAULT '{}'::jsonb NOT NULL,
    kielteisen_paatoksen_perustelut      JSONB            DEFAULT '{}'::jsonb NOT NULL,
    luotu                                TIMESTAMPTZ      DEFAULT now(),
    luoja                                VARCHAR(255)                         NOT NULL,
    muokattu                             TIMESTAMPTZ,
    muokkaaja                            VARCHAR(255),
    CONSTRAINT fk_tutkinto_tai_opinto_paatostieto FOREIGN KEY (paatostieto_id) REFERENCES paatostieto (id)
);

CREATE INDEX idx_tutkinto_tai_opinto_paatostieto ON tutkinto_tai_opinto (paatostieto_id);

COMMENT ON TABLE tutkinto_tai_opinto IS 'TUTU-hakemuksen päätöstiedon tutkintoon tai opintoon liittyvät tiedot';
COMMENT ON COLUMN tutkinto_tai_opinto.id IS 'Taulun rivin id';
COMMENT ON COLUMN tutkinto_tai_opinto.paatostieto_id IS 'Vastaavan päätöstiedon id päätöstieto-taulussa';
COMMENT ON COLUMN tutkinto_tai_opinto.tutkinto_tai_opinto IS 'Rinnastettava tutkinto tai opinto';
COMMENT ON COLUMN tutkinto_tai_opinto.myonteinen_paatos IS 'Onko tutkinnon tai opinnon päätös myönteinen (kyllä/ei)';
COMMENT ON COLUMN tutkinto_tai_opinto.myonteisen_paatoksen_lisavaatimukset IS 'Myönteisen tutkinnon tai opinnon päätöksen mahdolliset lisävaatimukset';
COMMENT ON COLUMN tutkinto_tai_opinto.kielteisen_paatoksen_perustelut IS 'Kielteisen tutkinnon tai opinnon päätöksen perustelut';
COMMENT ON COLUMN tutkinto_tai_opinto.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN tutkinto_tai_opinto.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN tutkinto_tai_opinto.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN tutkinto_tai_opinto.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';
