import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Theme } from '@mui/material/styles';
import { PeruutuksenTaiRaukeamisenSyy } from '@/src/lib/types/paatos';
import { OphCheckbox, OphTypography } from '@opetushallitus/oph-design-system';
import { Stack } from '@mui/material';

export const PeruutuksenTaiRaukeamisenSyyComponent = ({
  syy,
  updatePeruutuksenTaiRaukeamisenSyy,
  t,
  theme,
}: {
  syy?: PeruutuksenTaiRaukeamisenSyy;
  updatePeruutuksenTaiRaukeamisenSyy: (
    syy: PeruutuksenTaiRaukeamisenSyy,
  ) => void;
  t: TFunction;
  theme: Theme;
}) => {
  const updateSyy = (updated: Partial<PeruutuksenTaiRaukeamisenSyy>) => {
    updatePeruutuksenTaiRaukeamisenSyy({
      ...syy,
      ...updated,
    });
  };

  return (
    <Stack
      gap={theme.spacing(1)}
      data-testid={'peruutuksenTaiRaukeamisenSyyComponent'}
    >
      <OphTypography variant="label">
        {t('hakemus.paatos.peruutuksenTaiRaukeamisenSyy.otsikko')}
      </OphTypography>
      <OphCheckbox
        label={t(
          'hakemus.paatos.peruutuksenTaiRaukeamisenSyy.eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada',
        )}
        checked={syy?.eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada || false}
        onChange={() =>
          updateSyy({
            eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada:
              !syy?.eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada,
          })
        }
        data-testid={'eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada'}
      />
      <OphCheckbox
        label={t(
          'hakemus.paatos.peruutuksenTaiRaukeamisenSyy.muutenTyytymatonRatkaisuun',
        )}
        checked={syy?.muutenTyytymatonRatkaisuun || false}
        onChange={() =>
          updateSyy({
            muutenTyytymatonRatkaisuun: !syy?.muutenTyytymatonRatkaisuun,
          })
        }
        data-testid={'muutenTyytymatonRatkaisuun'}
      />
      <OphCheckbox
        label={t(
          'hakemus.paatos.peruutuksenTaiRaukeamisenSyy.eiApMukainenTutkintoTaiHaettuaPatevyytta',
        )}
        checked={syy?.eiApMukainenTutkintoTaiHaettuaPatevyytta || false}
        onChange={() =>
          updateSyy({
            eiApMukainenTutkintoTaiHaettuaPatevyytta:
              !syy?.eiApMukainenTutkintoTaiHaettuaPatevyytta,
          })
        }
        data-testid={'eiApMukainenTutkintoTaiHaettuaPatevyytta'}
      />
      <OphCheckbox
        label={t(
          'hakemus.paatos.peruutuksenTaiRaukeamisenSyy.eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa',
        )}
        checked={syy?.eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa || false}
        onChange={() =>
          updateSyy({
            eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa:
              !syy?.eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa,
          })
        }
        data-testid={'eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa'}
      />
      <OphCheckbox
        label={t(
          'hakemus.paatos.peruutuksenTaiRaukeamisenSyy.epavirallinenKorkeakouluTaiTutkinto',
        )}
        checked={syy?.epavirallinenKorkeakouluTaiTutkinto || false}
        onChange={() =>
          updateSyy({
            epavirallinenKorkeakouluTaiTutkinto:
              !syy?.epavirallinenKorkeakouluTaiTutkinto,
          })
        }
        data-testid={'epavirallinenKorkeakouluTaiTutkinto'}
      />
      <OphCheckbox
        label={t(
          'hakemus.paatos.peruutuksenTaiRaukeamisenSyy.eiEdellytyksiaRoEikaTasopaatokselle',
        )}
        checked={syy?.eiEdellytyksiaRoEikaTasopaatokselle || false}
        onChange={() =>
          updateSyy({
            eiEdellytyksiaRoEikaTasopaatokselle:
              !syy?.eiEdellytyksiaRoEikaTasopaatokselle,
          })
        }
        data-testid={'eiEdellytyksiaRoEikaTasopaatokselle'}
      />
      <OphCheckbox
        label={t(
          'hakemus.paatos.peruutuksenTaiRaukeamisenSyy.eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin',
        )}
        checked={syy?.eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin || false}
        onChange={() =>
          updateSyy({
            eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin:
              !syy?.eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin,
          })
        }
        data-testid={'eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin'}
      />
      <OphCheckbox
        label={t(
          'hakemus.paatos.peruutuksenTaiRaukeamisenSyy.hakijallaJoPaatosSamastaKoulutusKokonaisuudesta',
        )}
        checked={syy?.hakijallaJoPaatosSamastaKoulutusKokonaisuudesta || false}
        onChange={() =>
          updateSyy({
            hakijallaJoPaatosSamastaKoulutusKokonaisuudesta:
              !syy?.hakijallaJoPaatosSamastaKoulutusKokonaisuudesta,
          })
        }
        data-testid={'hakijallaJoPaatosSamastaKoulutusKokonaisuudesta'}
      />
      <OphCheckbox
        label={t('hakemus.paatos.peruutuksenTaiRaukeamisenSyy.muuSyy')}
        checked={syy?.muuSyy || false}
        onChange={() =>
          updateSyy({
            muuSyy: !syy?.muuSyy,
          })
        }
        data-testid={'muuSyy'}
      />
    </Stack>
  );
};
