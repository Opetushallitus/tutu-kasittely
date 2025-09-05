CREATE TABLE IF NOT EXISTS lausuntotieto (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    perustelu_id uuid NOT NULL,

    pyyntojen_lisatiedot TEXT,
    sisalto TEXT,

    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),

    CONSTRAINT fk_lausuntotieto_perustelu_yleiset FOREIGN KEY (perustelu_id) REFERENCES perustelu_yleiset(id)
    );

COMMENT ON TABLE lausuntotieto IS 'Tutu-hakemuksen lausuntotiedot';
COMMENT ON COLUMN lausuntotieto.id IS 'Taulun rivin id';
COMMENT ON COLUMN lausuntotieto.perustelu_id IS 'Perustelu_yleiset -taulun perustelutiedon id';

COMMENT ON COLUMN lausuntotieto.pyyntojen_lisatiedot IS 'Lausuntopyyntöjen lisätiedot';
COMMENT ON COLUMN lausuntotieto.sisalto IS 'Lausunnon sisältö';

COMMENT ON COLUMN lausuntotieto.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN lausuntotieto.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN lausuntotieto.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN lausuntotieto.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';


CREATE TABLE IF NOT EXISTS lausuntopyynto (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    lausuntotieto_id uuid NOT NULL,

    lausunnon_antaja TEXT,
    lahetetty TIMESTAMPTZ,
    saapunut TIMESTAMPTZ,

    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),

    CONSTRAINT fk_lausuntopyynto_lausuntotieto FOREIGN KEY (lausuntotieto_id) REFERENCES lausuntotieto(id)
    );

COMMENT ON TABLE lausuntopyynto IS 'Tutu-hakemuksen lausuntopyynnöt';
COMMENT ON COLUMN lausuntopyynto.id IS 'Taulun rivin id';
COMMENT ON COLUMN lausuntopyynto.lausuntotieto_id IS 'Lausuntotietotaulun lausunto id';

COMMENT ON COLUMN lausuntopyynto.lausunnon_antaja IS 'Lausunnon antaja';
COMMENT ON COLUMN lausuntopyynto.lahetetty IS 'Lausuntopyynnön lähetysaika';
COMMENT ON COLUMN lausuntopyynto.saapunut IS 'Lausuntopyynnön saapumisaika';

COMMENT ON COLUMN lausuntopyynto.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN lausuntopyynto.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN lausuntopyynto.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN lausuntopyynto.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';
