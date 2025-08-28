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

ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS asiakirja_id uuid;
ALTER TABLE hakemus
    ADD CONSTRAINT fk_hakemus_asiakirja FOREIGN KEY (asiakirja_id) REFERENCES asiakirja(id);

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