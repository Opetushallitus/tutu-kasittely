ALTER TABLE hakemus
    ADD COLUMN IF NOT EXISTS saapumis_pvm TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS ataru_hakemus_muokattu TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS hakija_etunimet VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hakija_sukunimi VARCHAR(255);

COMMENT ON COLUMN hakemus.saapumis_pvm IS 'AtaruHakemus.submitted: aika jolloin hakija on lähettänyt hakemuksen';
COMMENT ON COLUMN hakemus.ataru_hakemus_muokattu IS 'AtaruHakemus.modified (latestVersionCreated): viimeisin Ataru-version luontiaika';
COMMENT ON COLUMN hakemus.hakija_etunimet IS 'Hakijan etunimet Atarusta';
COMMENT ON COLUMN hakemus.hakija_sukunimi IS 'Hakijan sukunimi Atarusta';

ALTER TABLE esittelija
    ADD COLUMN IF NOT EXISTS kutsumanimi VARCHAR(255),
    ADD COLUMN IF NOT EXISTS sukunimi VARCHAR(255);

COMMENT ON COLUMN esittelija.kutsumanimi IS 'Esittelijän kutsumanimi ONR:stä, synkataan ajastettuna';
COMMENT ON COLUMN esittelija.sukunimi IS 'Esittelijän sukunimi ONR:stä, synkataan ajastettuna';

CREATE INDEX IF NOT EXISTS idx_hakemus_saapumis_pvm ON hakemus (saapumis_pvm);
CREATE INDEX IF NOT EXISTS idx_hakemus_ataru_muokattu ON hakemus (ataru_hakemus_muokattu);
CREATE INDEX IF NOT EXISTS idx_hakemus_hakija ON hakemus (hakija_etunimet, hakija_sukunimi);

CREATE INDEX IF NOT EXISTS idx_esittelija_nimi ON esittelija (kutsumanimi, sukunimi);

-- Hakulistaukselle puuttuvat indeksit
CREATE INDEX IF NOT EXISTS idx_hakemus_asiatunnus ON hakemus (asiatunnus);
CREATE INDEX IF NOT EXISTS idx_hakemus_koskee ON hakemus (hakemus_koskee);
CREATE INDEX IF NOT EXISTS idx_asiakirja_viimeinen_hakijalta ON asiakirja (viimeinen_asiakirja_hakijalta);
