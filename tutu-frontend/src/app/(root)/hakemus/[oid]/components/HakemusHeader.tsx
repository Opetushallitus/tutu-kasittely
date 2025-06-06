'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import { useHakemus } from '@/src/context/HakemusContext';
import {
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import * as dateFns from 'date-fns';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import { emptyOption } from '@/src/constants/dropdownOptions';
import * as R from 'remeda';

export const HakemusHeader = () => {
  const { hakemus } = useHakemus();
  const theme = useTheme();
  const { t } = useTranslations();
  const { isLoading: isLoadingEsittelijat, data: esittelijat } =
    useEsittelijat();

  const esittelijaOptions = isLoadingEsittelijat
    ? []
    : emptyOption.concat(
        R.map(esittelijat!, (esittelija) => {
          return {
            value: esittelija.esittelijaOid,
            label: `${esittelija.etunimi} ${esittelija.sukunimi}`,
          };
        }),
      );

  return (
    hakemus && (
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={5}
      >
        <Stack direction="column" width="100%" spacing={theme.spacing(2, 3)}>
          <OphTypography variant="label" data-testid="hakemusotsikko-hakija">
            {hakemus?.hakijanSukunimi}, {hakemus?.hakijanEtunimet} -{' '}
            {hakemus?.hakijanHetu || t('hakemusotsikko.hetuPuuttuu')}
          </OphTypography>
          <OphTypography data-testid="hakemusotsikko-asiatunnus">
            {hakemus?.asiatunnus || t('hakemusotsikko.asiatunnusPuuttuu')}
          </OphTypography>
        </Stack>
        <Stack direction="column" width="100%" spacing={theme.spacing(2, 3)}>
          <OphTypography data-testid="hakemusotsikko-kirjauspvm">
            {t('hakemusotsikko.kirjausPvm')}{' '}
            {dateFns.format(Date.parse(hakemus?.kirjausPvm), 'dd.MM.yyyy') ||
              t('hakemusotsikko.kirjausPvmPuuttuu')}
          </OphTypography>
          <OphTypography data-testid="hakemusotsikko-esittelypvm">
            {t('hakemusotsikko.esittelyPvm')}{' '}
            {dateFns.format(Date.parse(hakemus?.esittelyPvm), 'dd.MM.yyyy') ||
              t('puuttuu')}
          </OphTypography>
        </Stack>
        <Stack direction="column" width="100%" spacing={theme.spacing(2, 3)}>
          <OphTypography data-testid="hakemusotsikko-lopullinenpaatospvm">
            {t('hakemusotsikko.lopullinenPaatosPvm')}{' '}
            {dateFns.format(Date.parse(hakemus?.paatosPvm), 'dd.MM.yyyy') ||
              t('puuttuu')}
          </OphTypography>
          <OphTypography
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            {t('hakemusotsikko.esittelija')}{' '}
            <OphSelectFormField
              options={esittelijaOptions}
              value={hakemus?.esittelijaOid}
              sx={{ width: '50%', paddingLeft: theme.spacing(2) }}
              data-testid={'hakemusotsikko-esittelija'}
            />
          </OphTypography>
        </Stack>
      </Stack>
    )
  );
};
