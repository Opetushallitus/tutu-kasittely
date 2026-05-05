CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- hakemus
CREATE INDEX IF NOT EXISTS idx_hakemus_hakija_etunimet_trgm
    ON hakemus USING GIN (hakija_etunimet gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hakemus_hakija_sukunimi_trgm
    ON hakemus USING GIN (hakija_sukunimi gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hakemus_asiatunnus_trgm
    ON hakemus USING GIN (asiatunnus gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hakemus_esittelijan_huomioita_trgm
    ON hakemus USING GIN (esittelijan_huomioita gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hakemus_peruutus_lisatieto_trgm
    ON hakemus USING GIN (peruutus_lisatieto gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hakemus_lopullinen_paatos_ehdollisen_asiatunnus_trgm
    ON hakemus USING GIN (lopullinen_paatos_ehdollisen_asiatunnus gin_trgm_ops);

-- asiakirja
CREATE INDEX IF NOT EXISTS idx_asiakirja_allekirjoitukset_lisatiedot_trgm
    ON asiakirja USING GIN (allekirjoitukset_tarkistettu_lisatiedot gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_asiakirja_imi_pyynto_numero_trgm
    ON asiakirja USING GIN (imi_pyynto_numero gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_asiakirja_alkuperaiset_lisatiedot_trgm
    ON asiakirja USING GIN (alkuperaiset_asiakirjat_saatu_nahtavaksi_lisatiedot gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_asiakirja_huomiot_muistioon_trgm
    ON asiakirja USING GIN (huomiot_muistioon gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_asiakirja_esittelijan_huomioita_trgm
    ON asiakirja USING GIN (esittelijan_huomioita gin_trgm_ops);

-- tutkinto
CREATE INDEX IF NOT EXISTS idx_tutkinto_nimi_trgm
    ON tutkinto USING GIN (nimi gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tutkinto_oppilaitos_trgm
    ON tutkinto USING GIN (oppilaitos gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tutkinto_muu_tutkinto_tieto_trgm
    ON tutkinto USING GIN (muu_tutkinto_tieto gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tutkinto_paaaine_tai_erikoisala_trgm
    ON tutkinto USING GIN (paaaine_tai_erikoisala gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tutkinto_todistusotsikko_trgm
    ON tutkinto USING GIN (todistusotsikko gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tutkinto_ohjeellinen_laajuus_trgm
    ON tutkinto USING GIN (ohjeellinen_laajuus gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tutkinto_perustelun_lisatietoja_trgm
    ON tutkinto USING GIN (perustelun_lisatietoja gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tutkinto_muu_tutkinto_muistio_trgm
    ON tutkinto USING GIN (muu_tutkinto_muistio gin_trgm_ops);

-- perustelu
CREATE INDEX IF NOT EXISTS idx_perustelu_selvitys_myontaja_trgm
    ON perustelu USING GIN (selvitys_tutkinnon_myontajasta_ja_tutkinnon_virallisuudesta gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_perustelu_selvitys_asema_trgm
    ON perustelu USING GIN (selvitys_tutkinnon_asemasta_lahtomaan_jarjestelmassa gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_perustelu_jatko_opinto_kelpoisuus_lisatieto_trgm
    ON perustelu USING GIN (jatko_opinto_kelpoisuus_lisatieto gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_perustelu_muu_perustelu_trgm
    ON perustelu USING GIN (muu_perustelu gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_perustelu_lausunto_pyynto_lisatiedot_trgm
    ON perustelu USING GIN (lausunto_pyynto_lisatiedot gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_perustelu_lausunto_sisalto_trgm
    ON perustelu USING GIN (lausunto_sisalto gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_perustelu_tarkempia_selvityksia_trgm
    ON perustelu USING GIN (tarkempia_selvityksia gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_perustelu_uo_ro_sisalto_trgm
    ON perustelu USING GIN (((uo_ro_sisalto->>'koulutuksenSisalto')) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_perustelu_ap_sisalto_trgm
    ON perustelu USING GIN (
        (ap_sisalto->>'todistusEUKansalaisuuteenRinnasteisestaAsemasta') gin_trgm_ops,
        (ap_sisalto->>'ammattiJohonPatevoitynyt') gin_trgm_ops,
        (ap_sisalto->>'ammattitoiminnanPaaAsiallinenSisalto') gin_trgm_ops,
        (ap_sisalto->>'koulutuksenKestoJaSisalto') gin_trgm_ops,
        (ap_sisalto->>'lisatietoja') gin_trgm_ops,
        (ap_sisalto->>'muutAPPerustelut') gin_trgm_ops,
        (ap_sisalto->>'SEUTArviointi') gin_trgm_ops
    );

-- lausuntopyynto
CREATE INDEX IF NOT EXISTS idx_lausuntopyynto_lausunnon_antaja_muu_trgm
    ON lausuntopyynto USING GIN (lausunnon_antaja_muu gin_trgm_ops);

-- kelpoisuus
CREATE INDEX IF NOT EXISTS idx_kelpoisuus_kelpoisuus_trgm
    ON kelpoisuus USING GIN (kelpoisuus gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_kelpoisuus_opetettava_aine_trgm
    ON kelpoisuus USING GIN (opetettava_aine gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_kelpoisuus_muu_ammatti_kuvaus_trgm
    ON kelpoisuus USING GIN (muu_ammatti_kuvaus gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_kelpoisuus_direktiivitaso_trgm
    ON kelpoisuus USING GIN (direktiivitaso gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_kelpoisuus_direktiivitaso_lisatiedot_trgm
    ON kelpoisuus USING GIN (direktiivitaso_lisatiedot gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_kelpoisuus_kielteinen_muu_perustelu_trgm
    ON kelpoisuus USING GIN ((kielteisen_paatoksen_perustelut->>'muuPerusteluKuvaus') gin_trgm_ops);

-- tutkinto_tai_opinto
CREATE INDEX IF NOT EXISTS idx_tutkinto_tai_opinto_trgm
    ON tutkinto_tai_opinto USING GIN (tutkinto_tai_opinto gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tutkinto_tai_opinto_kielteinen_muu_perustelu_trgm
    ON tutkinto_tai_opinto USING GIN ((kielteisen_paatoksen_perustelut->>'muuPerusteluKuvaus') gin_trgm_ops);

-- paatostieto
CREATE INDEX IF NOT EXISTS idx_paatostieto_kielteinen_muu_perustelu_trgm
    ON paatostieto USING GIN ((kielteisen_paatoksen_perustelut->>'muuPerusteluKuvaus') gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_esittelijan_huomioita_toimenpiteista_trgm
    ON paatostieto USING GIN (esittelijan_huomioita_toimenpiteista gin_trgm_ops);

-- viesti
CREATE INDEX IF NOT EXISTS idx_viesti_otsikko_trgm
    ON viesti USING GIN (otsikko gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_viesti_viesti_trgm
    ON viesti USING GIN (viesti gin_trgm_ops);

-- yk_viesti
CREATE INDEX IF NOT EXISTS idx_yk_viesti_kysymys_trgm
    ON yk_viesti USING GIN (kysymys gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_yk_viesti_vastaus_trgm
    ON yk_viesti USING GIN (vastaus gin_trgm_ops);

-- paatosteksti
CREATE INDEX IF NOT EXISTS idx_paatosteksti_sisalto_trgm
    ON paatosteksti USING GIN (sisalto gin_trgm_ops);

-- Foreign index: yk_viesti.hakemus_oid
CREATE INDEX idx_yk_viesti_hakemus_oid ON yk_viesti(hakemus_oid);
