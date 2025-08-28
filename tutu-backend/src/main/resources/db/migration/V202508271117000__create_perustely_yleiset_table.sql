-- PERUSTELU YLEISET
CREATE TYPE tutkinnon_asema AS ENUM (
    'korkeakoulu_1',               -- Vähintään kolmivuotinen ensimmäisen vaiheen korkeakoulututkinto 
    'korkeakoulu_2',               -- Toisen vaiheen korkeakoulututkinto
    'korkeakoulu_1_ja_2',          -- Yksiportainen tutkinto, johon sisältyvät ensimmäisen ja toisen vaiheen tutkinnot
    'tieteellinen_jatkotutkinto',  -- Tieteellinen jatkotutknto
    'alle_korkeakoulutason'        -- Alle korkeakoulutasoinen koulutus
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

CREATE OR REPLACE TRIGGER trg_perustelu_yleiset_update_muokattu_timestamp
    BEFORE UPDATE ON perustelu_yleiset
    FOR EACH ROW
    EXECUTE FUNCTION update_muokattu_timestamp();

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
COMMENT ON COLUMN perustelu_yleiset.luotu IS 'Taulun rivin luoja';
COMMENT ON COLUMN perustelu_yleiset.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN perustelu_yleiset.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';