'use client';

import { Divider, SelectChangeEvent, Stack, useTheme } from '@mui/material';
import { useHakemus } from '@/src/context/HakemusContext';
import {
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import * as dateFns from 'date-fns';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import { DATE_PLACEHOLDER } from '@/src/constants/constants';

export const HakemusHeader = () => {
  const { hakemus, updateHakemus } = useHakemus();
  const theme = useTheme();
  const { t } = useTranslations();
  const { options: esittelijaOptions } = useEsittelijat();

  return (
    hakemus && (
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={5}
      >
        <Stack direction="column" width="100%" spacing={theme.spacing(2, 3)}>
          <OphTypography variant="label" data-testid="hakemusotsikko-hakija">
            {hakemus?.hakija?.sukunimi}, {hakemus?.hakija?.etunimet} -{' '}
            {hakemus?.hakija.hetu || t('hakemusotsikko.hetuPuuttuu')}
          </OphTypography>
          <OphTypography data-testid="hakemusotsikko-asiatunnus">
            {hakemus?.asiatunnus || t('hakemusotsikko.asiatunnusPuuttuu')}
          </OphTypography>
        </Stack>
        <Stack direction="column" width="100%" spacing={theme.spacing(2, 3)}>
          <OphTypography data-testid="hakemusotsikko-kirjauspvm">
            {t('hakemusotsikko.kirjausPvm')}{' '}
            {hakemus.kirjausPvm
              ? dateFns.format(
                  Date.parse(hakemus?.kirjausPvm),
                  DATE_PLACEHOLDER,
                )
              : t('puuttuu')}
          </OphTypography>
          <OphTypography data-testid="hakemusotsikko-esittelypvm">
            {t('hakemusotsikko.esittelyPvm')}{' '}
            {hakemus.esittelyPvm
              ? dateFns.format(
                  Date.parse(hakemus?.esittelyPvm),
                  DATE_PLACEHOLDER,
                )
              : t('puuttuu')}
          </OphTypography>
        </Stack>
        <Stack direction="column" width="100%" spacing={theme.spacing(2, 3)}>
          <OphTypography data-testid="hakemusotsikko-lopullinenpaatospvm">
            {t('hakemusotsikko.lopullinenPaatosPvm')}{' '}
            {hakemus.paatosPvm
              ? dateFns.format(Date.parse(hakemus?.paatosPvm), DATE_PLACEHOLDER)
              : t('puuttuu')}
          </OphTypography>
          <OphTypography
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              height: '100%',
            }}
          >
            {t('hakemusotsikko.esittelija')}{' '}
            <OphSelectFormField
              placeholder={t('yleiset.valitse')}
              options={esittelijaOptions}
              value={
                esittelijaOptions.some(
                  (opt) => opt.value === hakemus?.esittelijaOid,
                )
                  ? hakemus?.esittelijaOid
                  : ''
              }
              sx={{ width: '50%', paddingLeft: theme.spacing(2) }}
              data-testid={'hakemusotsikko-esittelija'}
              onChange={(event: SelectChangeEvent) =>
                updateHakemus({ esittelijaOid: event.target.value })
              }
            />
          </OphTypography>
        </Stack>
      </Stack>
    )
  );
};
