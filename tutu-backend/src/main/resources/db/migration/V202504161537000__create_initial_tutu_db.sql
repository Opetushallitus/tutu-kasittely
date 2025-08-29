CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- UPDATE FUNCTION
CREATE OR REPLACE FUNCTION update_muokattu_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.muokattu := now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ESITTELIJA
CREATE TABLE IF NOT EXISTS esittelija (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    maakoodi VARCHAR(255) UNIQUE NOT NULL,
    esittelija_oid VARCHAR(255),
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255)
);

COMMENT ON TABLE esittelija IS 'Tutu-hakemusten esittelijät ja esittelijöiden vastuualueet';
COMMENT ON COLUMN esittelija.id IS 'Taulun rivin id';
COMMENT ON COLUMN esittelija.maakoodi IS 'Maatjavaltiot-koodiston arvo, joka on esittelijän vastuualuetta';
COMMENT ON COLUMN esittelija.esittelija_oid IS 'Esittelijän henkilöOID';
COMMENT ON COLUMN esittelija.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN esittelija.luotu IS 'Taulun rivin luoja';
COMMENT ON COLUMN esittelija.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN esittelija.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE INDEX idx_esittelija_oid ON esittelija(esittelija_oid);
CREATE INDEX idx_esittelija_maakoodi ON esittelija(maakoodi);

CREATE OR REPLACE TRIGGER trg_esittelija_update_muokattu_timestamp
    BEFORE UPDATE ON esittelija
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

-- ASIAKIRJA
CREATE TYPE valmistumisen_vahvistus_vastaus_enum AS ENUM (
    'Myonteinen',
    'Kielteinen',
    'EiVastausta'
    );

CREATE TABLE IF NOT EXISTS asiakirja
(
    id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    allekirjoitukset_tarkistettu BOOLEAN NOT NULL DEFAULT false,
    allekirjoitukset_tarkistettu_lisatiedot TEXT DEFAULT NULL,
    imi_pyynto BOOLEAN,
    imi_pyynto_numero VARCHAR(255),
    imi_pyynto_lahetetty TIMESTAMPTZ,
    imi_pyynto_vastattu TIMESTAMPTZ,
    alkuperaiset_asiakirjat_saatu_nahtavaksi BOOLEAN NOT NULL DEFAULT false,
    alkuperaiset_asiakirjat_saatu_nahtavaksi_lisatiedot TEXT DEFAULT NULL,
    selvitykset_saatu BOOLEAN NOT NULL DEFAULT false,
    ap_hakemus BOOLEAN,
    suostumus_vahvistamiselle_saatu BOOLEAN NOT NULL DEFAULT false,
    valmistumisen_vahvistus BOOLEAN NOT NULL DEFAULT false,
    valmistumisen_vahvistus_pyynto_lahetetty TIMESTAMPTZ,
    valmistumisen_vahvistus_saatu TIMESTAMPTZ,
    valmistumisen_vahvistus_vastaus valmistumisen_vahvistus_vastaus_enum,
    valmistumisen_vahvistus_lisatieto VARCHAR(255),
    viimeinen_asiakirja_hakijalta TIMESTAMPTZ,
    luotu            TIMESTAMPTZ      DEFAULT now(),
    luoja            VARCHAR(255)      NOT NULL,
    muokattu         TIMESTAMPTZ,
    muokkaaja        VARCHAR(255)
    );

COMMENT ON TABLE asiakirja IS 'Tutu-hakemuksen asiakirjat';
COMMENT ON COLUMN asiakirja.allekirjoitukset_tarkistettu IS 'Allekirjoitukset tarkistettu -- true jos tarkistus suoritettu';
COMMENT ON COLUMN asiakirja.allekirjoitukset_tarkistettu_lisatiedot IS 'Allekirjoitusten tarkastusten lisätiedot';
COMMENT ON COLUMN asiakirja.imi_pyynto IS 'IMI-pyyntö';
COMMENT ON COLUMN asiakirja.imi_pyynto_numero IS 'IMI-pyynnön numero';
COMMENT ON COLUMN asiakirja.imi_pyynto_lahetetty IS 'IMI-pyyntö lähetetty';
COMMENT ON COLUMN asiakirja.imi_pyynto_vastattu IS 'IMI-pyynnön vastaus saatu';
COMMENT ON COLUMN asiakirja.alkuperaiset_asiakirjat_saatu_nahtavaksi IS 'Alkuperäiset asiakirjat saatu nähtäväksi -- true jos on saatu nähtäväksi';
COMMENT ON COLUMN asiakirja.alkuperaiset_asiakirjat_saatu_nahtavaksi_lisatiedot IS 'Alkuperäisten asiakirjojen nähtäväksi saannin lisätiedot';
COMMENT ON COLUMN asiakirja.selvitykset_saatu IS 'Kaikki tarvittavat selvitykset saatu -- true jos on saatu';
COMMENT ON COLUMN asiakirja.ap_hakemus IS 'true jos hakemus on AP hakemus';
COMMENT ON COLUMN asiakirja.suostumus_vahvistamiselle_saatu IS 'Suostumuslomake saatu asiakirjojen vahvistamiselle -- true jos on saatu';
COMMENT ON COLUMN asiakirja.valmistumisen_vahvistus IS 'Valmistuminen vahvistettu asiakirjan myöntäjältä tai toimivaltaiselta viranomaiselta';
COMMENT ON COLUMN asiakirja.valmistumisen_vahvistus_pyynto_lahetetty IS 'Milloin vahvistuspyyntö lähetetty';
COMMENT ON COLUMN asiakirja.valmistumisen_vahvistus_saatu IS 'Milloin vahvistus saatu';
COMMENT ON COLUMN asiakirja.valmistumisen_vahvistus_vastaus IS 'Vahvistuspyynnön vastaus';
COMMENT ON COLUMN asiakirja.valmistumisen_vahvistus_lisatieto IS 'Lisätietoja vastaukseen liittyen';
COMMENT ON COLUMN asiakirja.viimeinen_asiakirja_hakijalta IS 'Aika, jolloin viimeinen asiakirja hakijalta saatu';

CREATE OR REPLACE TRIGGER trg_asiakirja_update_muokattu_timestamp
    BEFORE UPDATE ON asiakirja
    FOR EACH ROW
EXECUTE FUNCTION update_muokattu_timestamp();

-- HAKEMUS
CREATE TABLE IF NOT EXISTS hakemus (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_oid VARCHAR(255) UNIQUE NOT NULL,
    esittelija_id uuid,
    asiakirja_id uuid,
    esitelty TIMESTAMPTZ,
    paatos TIMESTAMPTZ,
    hakemus_koskee INTEGER NOT NULL default 9,
    asiatunnus VARCHAR(15),
    kasittely_vaihe VARCHAR(50) NOT NULL DEFAULT 'AlkukasittelyKesken',
    yhteistutkinto BOOLEAN,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),
    CONSTRAINT fk_hakemus_esittelija FOREIGN KEY (esittelija_id) REFERENCES esittelija(id),
    CONSTRAINT fk_hakemus_asiakirja FOREIGN KEY (asiakirja_id) REFERENCES asiakirja(id)
);

COMMENT ON TABLE hakemus IS 'Tutu-hakemuksen tiedot';
COMMENT ON COLUMN hakemus.id IS 'Taulun rivin id';
COMMENT ON COLUMN hakemus.hakemus_oid IS 'Hakemuspalvelun hakemustunniste';
COMMENT ON COLUMN hakemus.esittelija_id IS 'Esittelija-taulun esittelijä-id';
COMMENT ON COLUMN hakemus.asiakirja_id IS 'Asiakirja-taulun id';
COMMENT ON COLUMN hakemus.esitelty IS 'Hakemuksen esittelyaika';
COMMENT ON COLUMN hakemus.paatos IS 'Hakemuksen päätöksen ajankohta';
COMMENT ON COLUMN hakemus.hakemus_koskee IS 'Hakemuksen syy';
COMMENT ON COLUMN hakemus.asiatunnus IS 'Hakemuksen asiatunnus';
COMMENT ON COLUMN hakemus.kasittely_vaihe IS 'Hakemuksen käsittelyvaihe';
COMMENT ON COLUMN hakemus.yhteistutkinto IS 'true jos hakemus on yhteistutkinto';
COMMENT ON COLUMN hakemus.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN hakemus.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN hakemus.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN hakemus.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE INDEX idx_hakemus_oid ON hakemus(hakemus_oid);
CREATE INDEX idx_hakemus_esittelija ON hakemus(esittelija_id);

CREATE OR REPLACE TRIGGER trg_hakemus_update_muokattu_timestamp
    BEFORE UPDATE ON hakemus
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

-- MUISTIO
CREATE TYPE hakemuksen_osa AS ENUM (
  'hakemus',
  'hakija',
  'tutkinnot',
  'asiakirjat',
  'paatos',
  'valitus',
  'yhteinen_kasittely',
  'perustelut-yleiset',
  'perustelut-ro-uo',
  'perustelut-ap',
  'tutkinnot_muu_tutkinto_huomio'
);

CREATE TABLE IF NOT EXISTS muistio (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_id uuid NOT NULL,
    sisalto TEXT NOT NULL,
    sisainen_huomio boolean NOT NULL DEFAULT FALSE,
    hakemuksen_osa hakemuksen_osa NOT NULL DEFAULT 'hakemus',
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),
    CONSTRAINT fk_muistio_hakemus FOREIGN KEY (hakemus_id) REFERENCES hakemus(id)
);

COMMENT ON TABLE muistio IS 'Tutu-hakemuksen muistiot';
COMMENT ON COLUMN muistio.id IS 'Taulun rivin id';
COMMENT ON COLUMN muistio.hakemus_id IS 'Hakemustaulun hakemuksen id';
COMMENT ON COLUMN muistio.sisalto IS 'Muistion sisälto';
COMMENT ON COLUMN muistio.sisainen_huomio IS 'Sisäinen huomio – ei näy muistiossa';
COMMENT ON COLUMN muistio.hakemuksen_osa IS 'Hakemuksen osa, johon muistion rivi liittyy';
COMMENT ON COLUMN muistio.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN muistio.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN muistio.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN muistio.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE INDEX idx_muistio_hakemus_id ON muistio(hakemus_id);
CREATE UNIQUE INDEX idx_unique_hakemus_osa_sisainen
    ON muistio (hakemus_id, hakemuksen_osa, sisainen_huomio);

CREATE OR REPLACE TRIGGER trg_muistio_update_muokattu_timestamp
    BEFORE UPDATE ON muistio
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

-- PAATOS
CREATE TABLE IF NOT EXISTS paatos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_id uuid NOT NULL,
    sisalto TEXT NOT NULL,
    tyyppi VARCHAR(20),
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),
    CONSTRAINT fk_paatos_hakemus FOREIGN KEY (hakemus_id) REFERENCES hakemus(id)
);

COMMENT ON TABLE paatos IS 'Tutu-hakemuksen päätökset';
COMMENT ON COLUMN paatos.id IS 'Taulun rivin id';
COMMENT ON COLUMN paatos.hakemus_id IS 'Hakemustaulun hakemuksen id';
COMMENT ON COLUMN paatos.sisalto IS 'Päätöksen sisälto';
COMMENT ON COLUMN paatos.tyyppi IS 'Päätöksen tyyppi';
COMMENT ON COLUMN paatos.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN paatos.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN paatos.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN paatos.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE INDEX idx_paatos_hakemus ON paatos(hakemus_id);

CREATE OR REPLACE TRIGGER trg_paatos_update_muokattu_timestamp
    BEFORE UPDATE ON paatos
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

-- PYYDETETTÄVÄ ASIAKIRJA
CREATE TYPE asiakirjan_tyyppi AS ENUM (
    'tutkintotodistustenjaljennokset',
    'liitteidenjaljennokset',
    'tutkintotodistustenkaannokset',
    'liitteidenkaannokset',
    'alkuperaisettutkintotodistukset',
    'alkuperaisetliitteet',
    'vaitoskirja',
    'tyotodistukset',
    'ammattipatevyys',
    'kansalaisuus',
    'nimenmuutos'
    );

CREATE TABLE IF NOT EXISTS pyydettava_asiakirja
(
    id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    asiakirja_id       uuid              NOT NULL,
    asiakirja_tyyppi asiakirjan_tyyppi NOT NULL,
    luotu            TIMESTAMPTZ      DEFAULT now(),
    luoja            VARCHAR(255)      NOT NULL,
    muokattu         TIMESTAMPTZ,
    muokkaaja        VARCHAR(255),
    CONSTRAINT fk_pyydettava_asiakirja_asiakirja FOREIGN KEY (asiakirja_id) REFERENCES asiakirja (id)
    );

CREATE INDEX idx_pyydettava_asiakirja_asiakirja_id ON pyydettava_asiakirja(asiakirja_id);

COMMENT ON TABLE pyydettava_asiakirja IS 'Tutu-hakemusten hakijalta pyydettävät asiakirjat';
COMMENT ON COLUMN pyydettava_asiakirja.id IS 'Taulun rivin id';
COMMENT ON COLUMN pyydettava_asiakirja.asiakirja_tyyppi IS 'Asiakirjan tyyppi';
COMMENT ON COLUMN pyydettava_asiakirja.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN pyydettava_asiakirja.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN pyydettava_asiakirja.muokkaaja IS 'Taulun rivin muokkausaika';
COMMENT ON COLUMN pyydettava_asiakirja.muokattu IS 'Taulun rivin muokkaaja';

CREATE OR REPLACE TRIGGER trg_pyydettava_asiakirja_update_muokattu_timestamp
    BEFORE UPDATE ON pyydettava_asiakirja
    FOR EACH ROW
EXECUTE FUNCTION update_muokattu_timestamp();

-- ASIAKIRJAMALLI TUTKINNOSTA
CREATE TYPE asiakirja_malli_lahde AS ENUM (
    'ece',
    'UK_enic',
    'naric_portal',
    'nuffic',
    'aacrao',
    'muu'
    );

CREATE TABLE IF NOT EXISTS asiakirjamalli_tutkinnosta (
                                                          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    asiakirja_id uuid NOT NULL,
    lahde asiakirja_malli_lahde NOT NULL,
    vastaavuus BOOLEAN NOT NULL,
    kuvaus TEXT,
    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),
    CONSTRAINT fk_asiakirjamalli_tutkinnosta_asiakirja FOREIGN KEY (asiakirja_id) REFERENCES asiakirja(id)
    );

COMMENT ON TABLE asiakirjamalli_tutkinnosta IS 'Asiakirjamallit vastaavista tutkinnoista';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.id IS 'Taulun rivin id';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.asiakirja_id IS 'Vastaavan asiakirjakokonaisuuden id';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.lahde IS 'Asiakirjamallin lähde';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.vastaavuus IS 'vastaako tietty asiakirjamalli hakemuksen asiakirjaa';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.kuvaus IS 'Kuvaus siitä vastaako tietty asiakirjamalli hakemuksen asiakirjaa';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN asiakirjamalli_tutkinnosta.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE UNIQUE INDEX idx_asiakirjamalli_tutkinnosta_asiakirja_lahde ON asiakirjamalli_tutkinnosta(asiakirja_id, lahde);

CREATE OR REPLACE TRIGGER trg_asiakirjamalli_tutkinnosta_update_muokattu_timestamp
    BEFORE UPDATE ON asiakirjamalli_tutkinnosta
    FOR EACH ROW
EXECUTE FUNCTION update_muokattu_timestamp();

-- TUTKINTO
CREATE TABLE IF NOT EXISTS tutkinto
(
    id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_id              uuid         NOT NULL,
    jarjestys               VARCHAR(255) NOT NULL,
    nimi                    VARCHAR(255),
    oppilaitos              VARCHAR(255),
    aloitus_vuosi           INT,
    paattymis_vuosi         INT,
    maakoodi                VARCHAR(4),
    muu_tutkinto_tieto      TEXT,
    todistuksen_paivamaara  VARCHAR(255),
    koulutusala_koodi       VARCHAR(4),
    paaaine_tai_erikoisala  VARCHAR(255),
    todistusotsikko         VARCHAR(255),
    muu_tutkinto_muistio_id uuid,
    luotu                   TIMESTAMPTZ      DEFAULT now(),
    luoja                   VARCHAR(255) NOT NULL,
    muokattu                TIMESTAMPTZ,
    muokkaaja               VARCHAR(255),
    CONSTRAINT fk_tutkinto_hakemus FOREIGN KEY (hakemus_id) REFERENCES hakemus (id),
    CONSTRAINT fk_tutkinto_muistio FOREIGN KEY (muu_tutkinto_muistio_id) REFERENCES muistio (id),
    CONSTRAINT unique_hakemus_id_jarjestys UNIQUE (hakemus_id, jarjestys)
    );

COMMENT ON TABLE tutkinto IS 'Tutu-hakemuksen tutkintotiedot';
COMMENT ON COLUMN tutkinto.id IS 'Taulun rivin id';
COMMENT ON COLUMN tutkinto.hakemus_id IS 'Hakemustaulun hakemuksen id';
COMMENT ON COLUMN tutkinto.jarjestys IS 'Tutkinnon järjestysnumero, 1, 2, 3 -> tai MUU';
COMMENT ON COLUMN tutkinto.nimi IS 'Tutkinnon nimi';
COMMENT ON COLUMN tutkinto.oppilaitos IS 'Tutkinnon suorituksen oppilaitos';
COMMENT ON COLUMN tutkinto.aloitus_vuosi IS 'Tutkinnon aloitusvuosi';
COMMENT ON COLUMN tutkinto.paattymis_vuosi IS 'Tutkinnon päättymisvuosi';
COMMENT ON COLUMN tutkinto.maakoodi IS 'Tutkinnon suoritus maa';
COMMENT ON COLUMN tutkinto.muu_tutkinto_tieto IS 'Tutkinnon huomiot päätökseen';
COMMENT ON COLUMN tutkinto.todistuksen_paivamaara IS 'Todistuksen päivämäärä (tekstikenttä)';
COMMENT ON COLUMN tutkinto.koulutusala_koodi IS 'Kansallinen koulutusluokitus, koulutusala-koodiston arvo';
COMMENT ON COLUMN tutkinto.paaaine_tai_erikoisala IS 'Tutkinnon pääaine tai erikoisala';
COMMENT ON COLUMN tutkinto.todistusotsikko IS 'Tutkintotodistusotsikko';
COMMENT ON COLUMN tutkinto.muu_tutkinto_muistio_id IS 'Muun tutkinnon muistiotaulun Id';
COMMENT ON COLUMN tutkinto.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN tutkinto.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN tutkinto.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN tutkinto.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE INDEX idx_tutkinto_hakemus ON tutkinto (hakemus_id);

CREATE OR REPLACE TRIGGER trg_tutkinto_update_muokattu_timestamp
    BEFORE UPDATE
    ON tutkinto
    FOR EACH ROW
EXECUTE FUNCTION update_muokattu_timestamp();

-- PERUSTELU YLEISET
CREATE TYPE tutkinnon_asema AS ENUM (
    'alempi_korkeakouluaste',            -- Vähintään kolmivuotinen ensimmäisen vaiheen korkeakoulututkinto
    'ylempi_korkeakouluaste',            -- Toisen vaiheen korkeakoulututkinto
    'alempi_ja_ylempi_korkeakouluaste',  -- Yksiportainen tutkinto, johon sisältyvät ensimmäisen ja toisen vaiheen tutkinnot
    'tutkijakoulutusaste',               -- Tieteellinen jatkotutknto
    'ei_korkeakouluaste'                 -- Alle korkeakoulutasoinen koulutus
);

CREATE TABLE IF NOT EXISTS perustelu_yleiset (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    hakemus_id uuid NOT NULL,

    virallinen_tutkinnon_myontaja BOOLEAN,
    virallinen_tutkinto BOOLEAN,
    lahde_lahtomaan_kansallinen_lahde BOOLEAN NOT NULL DEFAULT false,
    lahde_lahtomaan_virallinen_vastaus BOOLEAN NOT NULL DEFAULT false,
    lahde_kansainvalinen_hakuteos_tai_verkkosivusto BOOLEAN NOT NULL DEFAULT false,
    selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta TEXT NOT NULL,
    ylimman_tutkinnon_asema_lahtomaan_jarjestelmassa tutkinnon_asema,
    selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa TEXT NOT NULL,

    luotu TIMESTAMPTZ DEFAULT now(),
    luoja VARCHAR(255) NOT NULL,
    muokattu TIMESTAMPTZ,
    muokkaaja VARCHAR(255),

    CONSTRAINT fk_perustelu_yleiset_hakemus FOREIGN KEY (hakemus_id) REFERENCES hakemus(id)
);

COMMENT ON TABLE perustelu_yleiset IS 'Tutu-hakemuksen yleiset perustelut';
COMMENT ON COLUMN perustelu_yleiset.id IS 'Taulun rivin id';
COMMENT ON COLUMN perustelu_yleiset.hakemus_id IS 'Hakemustaulun hakemuksen id';

COMMENT ON COLUMN perustelu_yleiset.virallinen_tutkinnon_myontaja IS 'Virallinen tutkinnon myöntäjä';
COMMENT ON COLUMN perustelu_yleiset.virallinen_tutkinto IS 'Virallinen tutkinto';
COMMENT ON COLUMN perustelu_yleiset.lahde_lahtomaan_kansallinen_lahde IS 'Lähde: Lähtömaan kansallinen lähde (verkkosivut, lainsäädäntö, julkaisut)';
COMMENT ON COLUMN perustelu_yleiset.lahde_lahtomaan_virallinen_vastaus IS 'Lähde: Lähtömaan viranomaisen vastaus';
COMMENT ON COLUMN perustelu_yleiset.lahde_kansainvalinen_hakuteos_tai_verkkosivusto IS 'Lähde: Kansainvälinen hakuteos tai verkkosivusto';
COMMENT ON COLUMN perustelu_yleiset.selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta IS 'Lyhyt selvitys tutkinnon myöntäjästä ja tutkinnon virallisuudesta';
COMMENT ON COLUMN perustelu_yleiset.ylimman_tutkinnon_asema_lahtomaan_jarjestelmassa IS 'Ylimmän tutkinnon asema lähtömaan järjestelmässä';
COMMENT ON COLUMN perustelu_yleiset.selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa IS 'Lyhyt selvitys tutkinnon asemasta lähtömaan järjestelmässä';

COMMENT ON COLUMN perustelu_yleiset.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN perustelu_yleiset.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN perustelu_yleiset.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN perustelu_yleiset.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE OR REPLACE TRIGGER trg_perustelu_yleiset_update_muokattu_timestamp
    BEFORE UPDATE ON perustelu_yleiset
    FOR EACH ROW
EXECUTE FUNCTION update_muokattu_timestamp();
