-- PERUSTELU_UO_RO

CREATE TABLE IF NOT EXISTS perustelu_uo_ro
(
    id                                                         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    perustelu_id                                               uuid         NOT NULL,
    koulutuksen_sisalto                                        TEXT,
    opettajat_ero_monialaiset_opinnot_sisalto                  BOOLEAN,
    opettajat_ero_monialaiset_opinnot_laajuus                  BOOLEAN,
    opettajat_ero_pedagogiset_opinnot_sisalto                  BOOLEAN,
    opettajat_ero_pedagogiset_opinnot_laajuus                  BOOLEAN,
    opettajat_ero_kasvatustieteelliset_opinnot_sisalto         BOOLEAN,
    opettajat_ero_kasvatustieteelliset_opinnot_vaativuus       BOOLEAN,
    opettajat_ero_kasvatustieteelliset_opinnot_laajuus         BOOLEAN,
    opettajat_ero_opetettavat_aineet_opinnot_sisalto           BOOLEAN,
    opettajat_ero_opetettavat_aineet_opinnot_vaativuus         BOOLEAN,
    opettajat_ero_opetettavat_aineet_opinnot_laajuus           BOOLEAN,
    opettajat_ero_erityisopettajan_opinnot_sisalto             BOOLEAN,
    opettajat_ero_erityisopettajan_opinnot_laajuus             BOOLEAN,
    opettajat_muu_ero                                          BOOLEAN,
    opettajat_muu_ero_selite                                   TEXT,
    vk_opettajat_ero_kasvatustieteelliset_opinnot_sisalto      BOOLEAN,
    vk_opettajat_ero_kasvatustieteelliset_opinnot_laajuus      BOOLEAN,
    vk_opettajat_ero_varhaiskasvatus_esiopetus_opinnot_sisalto BOOLEAN,
    vk_opettajat_ero_varhaiskasvatus_esiopetus_opinnot_laajuus BOOLEAN,
    vk_opettajat_muu_ero                                       BOOLEAN,
    vk_opettajat_muu_ero_selite                                TEXT,
    otm_ero_opinnot_sisalto                                    BOOLEAN,
    otm_ero_opinnot_vaativuus                                  BOOLEAN,
    otm_ero_opinnot_laajuus                                    BOOLEAN,
    otm_muu_ero                                                BOOLEAN,
    otm_muu_ero_selite                                         TEXT,
    sovellettu_opettajan_pedagogiset_opinnot                   BOOLEAN,
    sovellettu_opetettavan_aineen_opinnot                      BOOLEAN,
    sovellettu_monialaiset_opinnot                             BOOLEAN,
    sovellettu_erityisopetus                                   BOOLEAN,
    sovellettu_varhaiskasvatus                                 BOOLEAN,
    sovellettu_rinnastaminen_kasvatustieteelliseen_tutkintoon  BOOLEAN,
    sovellettu_riittavat_opinnot                               BOOLEAN,
    sovellettu_rinnastaminen_otm_tutkintoon                    BOOLEAN,
    sovellettu_luokanopettaja                                  BOOLEAN,
    sovellettu_muu_tilanne                                     BOOLEAN,
    sovellettu_muu_tilanne_selite                              TEXT,
    tarkempia_selvityksia                                      TEXT,
    luotu                                                      TIMESTAMPTZ      DEFAULT now(),
    luoja                                                      VARCHAR(255) NOT NULL,
    muokattu                                                   TIMESTAMPTZ,
    muokkaaja                                                  VARCHAR(255),

    CONSTRAINT fk_perustelu_uo_ro_perustelu_yleiset FOREIGN KEY (perustelu_id) REFERENCES perustelu_yleiset (id)
);

CREATE INDEX idx_perustelu_uo_ro_perustelu_id ON perustelu_uo_ro (perustelu_id);

COMMENT ON TABLE perustelu_uo_ro IS 'Tutu-hakemuksen UO/RO-päätöksen perustelut';
COMMENT ON COLUMN perustelu_uo_ro.id IS 'Taulun rivin id';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_ero_monialaiset_opinnot_sisalto IS 'Opettajat - Ero monialaisten opintojen sisällössä';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_ero_monialaiset_opinnot_laajuus IS 'Opettajat - Ero monialaisten opintojen laajuudessa';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_ero_pedagogiset_opinnot_sisalto IS 'Opettajat - Ero pedagogisten opintojen sisällössä';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_ero_pedagogiset_opinnot_laajuus IS 'Opettajat - Ero pedagogisten opintojen laajuudessa';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_ero_kasvatustieteelliset_opinnot_sisalto IS 'Opettajat - Ero kasvatustieteellisten opintojen sisällössä (LO)';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_ero_kasvatustieteelliset_opinnot_vaativuus IS 'Opettajat - Ero kasvatustieteellisten opintojen vaativuudessa (LO)';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_ero_kasvatustieteelliset_opinnot_laajuus IS 'Opettajat - Ero kasvatustieteellisten opintojen laajuudessa (LO)';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_ero_opetettavat_aineet_opinnot_sisalto IS 'Opettajat - Ero opetettavan aineen opintojen sisällössä';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_ero_opetettavat_aineet_opinnot_vaativuus IS 'Opettajat - Ero opetettavan aineen opintojen vaativuudessa';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_ero_opetettavat_aineet_opinnot_laajuus IS 'Opettajat - Ero opetettavan aineen opintojen laajuudessa';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_ero_erityisopettajan_opinnot_sisalto IS 'Opettajat - Ero erityisopettajan opintojen sisällössä';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_ero_erityisopettajan_opinnot_laajuus IS 'Opettajat - Ero erityisopettajan opintojen laajuudessa';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_muu_ero IS 'Opettajat - Muu ero';
COMMENT ON COLUMN perustelu_uo_ro.opettajat_muu_ero_selite IS 'Opettajat - Muu ero selite';
COMMENT ON COLUMN perustelu_uo_ro.vk_opettajat_ero_kasvatustieteelliset_opinnot_sisalto IS 'Varhaiskasvatuksen opettajat - Ero kasvatustieteellisten opintojen sisällössä';
COMMENT ON COLUMN perustelu_uo_ro.vk_opettajat_ero_kasvatustieteelliset_opinnot_laajuus IS 'Varhaiskasvatuksen opettajat - Ero kasvatustieteellisten opintojen laajuudessa';
COMMENT ON COLUMN perustelu_uo_ro.vk_opettajat_ero_varhaiskasvatus_esiopetus_opinnot_sisalto IS 'Varhaiskasvatuksen opettajat - Ero varhaiskasvatuksen ja esiopetuksen opintojen sisällössä';
COMMENT ON COLUMN perustelu_uo_ro.vk_opettajat_ero_varhaiskasvatus_esiopetus_opinnot_laajuus IS 'Varhaiskasvatuksen opettajat - Ero varhaiskasvatuksen ja esiopetuksen opintojen laajuudessa';
COMMENT ON COLUMN perustelu_uo_ro.vk_opettajat_muu_ero IS 'Varhaiskasvatuksen opettajat - Muu ero';
COMMENT ON COLUMN perustelu_uo_ro.vk_opettajat_muu_ero_selite IS 'Varhaiskasvatuksen opettajat - Muu ero selite';
COMMENT ON COLUMN perustelu_uo_ro.otm_ero_opinnot_sisalto IS 'Oikeustieteen maisteri - Ero oikeustieteellisten opintojen sisällössä';
COMMENT ON COLUMN perustelu_uo_ro.otm_ero_opinnot_vaativuus IS 'Oikeustieteen maisteri - Ero oikeustieteellisten opintojen vaativuudessa';
COMMENT ON COLUMN perustelu_uo_ro.otm_ero_opinnot_laajuus IS 'Oikeustieteen maisteri - Ero oikeustieteellisten opintojen laajuudessa';
COMMENT ON COLUMN perustelu_uo_ro.otm_muu_ero IS 'Oikeustieteen maisteri - Muu ero';
COMMENT ON COLUMN perustelu_uo_ro.otm_muu_ero_selite IS 'Oikeustieteen maisteri - Muu ero selite';
COMMENT ON COLUMN perustelu_uo_ro.sovellettu_opettajan_pedagogiset_opinnot IS 'Sovellettu tilanne - Opettajan pedagogiset opinnot';
COMMENT ON COLUMN perustelu_uo_ro.sovellettu_opetettavan_aineen_opinnot IS 'Sovellettu tilanne - Opetettavan aineen opinnot';
COMMENT ON COLUMN perustelu_uo_ro.sovellettu_monialaiset_opinnot IS 'Sovellettu tilanne - Monialaiset opinnot';
COMMENT ON COLUMN perustelu_uo_ro.sovellettu_erityisopetus IS 'Sovellettu tilanne - Erityisopetus';
COMMENT ON COLUMN perustelu_uo_ro.sovellettu_varhaiskasvatus IS 'Sovellettu tilanne - Varhaiskasvatus';
COMMENT ON COLUMN perustelu_uo_ro.sovellettu_rinnastaminen_kasvatustieteelliseen_tutkintoon IS 'Sovellettu tilanne - Rinnastaminen kasvatustieteelliseen tutkintoon';
COMMENT ON COLUMN perustelu_uo_ro.sovellettu_riittavat_opinnot IS 'Sovellettu tilanne - Riittävät opinnot';
COMMENT ON COLUMN perustelu_uo_ro.sovellettu_rinnastaminen_otm_tutkintoon IS 'Sovellettu tilanne - Rinnastaminen oikeustieteen maisterin tutkintoon';
COMMENT ON COLUMN perustelu_uo_ro.sovellettu_luokanopettaja IS 'Sovellettu tilanne - Luokanopettaja';
COMMENT ON COLUMN perustelu_uo_ro.sovellettu_muu_tilanne IS 'Sovellettu tilanne - Muu tilanne';
COMMENT ON COLUMN perustelu_uo_ro.sovellettu_muu_tilanne_selite IS 'Sovellettu tilanne - Muu tilanne selite';
COMMENT ON COLUMN perustelu_uo_ro.tarkempia_selvityksia IS 'Tarkempia selvityksiä, ei näy muistiossa';
COMMENT ON COLUMN perustelu_uo_ro.luotu IS 'Taulun rivin luontiaika';
COMMENT ON COLUMN perustelu_uo_ro.luoja IS 'Taulun rivin luoja';
COMMENT ON COLUMN perustelu_uo_ro.muokattu IS 'Taulun rivin viimeisin muokkausaika';
COMMENT ON COLUMN perustelu_uo_ro.muokkaaja IS 'Taulun rivin viimeisin muokkaaja';

CREATE OR REPLACE TRIGGER trg_perustelu_uo_ro_update_muokattu_timestamp
    BEFORE UPDATE
    ON perustelu_uo_ro
    FOR EACH ROW
EXECUTE FUNCTION update_muokattu_timestamp();
