ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS alkuperaiset_asiakirjat_saatu_nahtavaksi BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE hakemus ADD COLUMN IF NOT EXISTS alkuperaiset_asiakirjat_saatu_nahtavaksi_lisatiedot TEXT DEFAULT NULL;

COMMENT ON COLUMN hakemus.alkuperaiset_asiakirjat_saatu_nahtavaksi IS 'Alkuperäiset asiakirjat saatu nähtäväksi -- true jos on saatu nähtäväksi';
COMMENT ON COLUMN hakemus.alkuperaiset_asiakirjat_saatu_nahtavaksi_lisatiedot IS 'Alkuperäisten asiakirjojen nähtäväksi saannin lisätiedot';
