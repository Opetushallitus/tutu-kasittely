'use client';

import { Divider, SelectChangeEvent, Stack, useTheme } from '@mui/material';
import {
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import * as dateFns from 'date-fns';

import { DATE_PLACEHOLDER } from '@/src/constants/constants';
import { useHakemus } from '@/src/context/HakemusContext';
import { useEsittelijat } from '@/src/hooks/useEsittelijat';
import { useKasittelyvaiheTranslation } from '@/src/lib/localization/hooks/useKasittelyvaiheTranslation';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

import { PeruutettuBadge } from './Badges';

export const HakemusHeader = () => {
  const {
    hakemusState: { editedData: hakemus, updateLocal: updateHakemusLocal },
  } = useHakemus();
  const theme = useTheme();
  const { t } = useTranslations();
  const { options: esittelijaOptions } = useEsittelijat();
  const { translation: kasittelyVaiheTranslation } =
    useKasittelyvaiheTranslation(hakemus);

  return (
    hakemus && (
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={5}
      >
        <Stack direction="column" width="100%" spacing={theme.spacing(2, 3)}>
          <OphTypography variant="label" data-testid="hakemusotsikko-hakija">
            {hakemus?.hakija?.sukunimi}, {hakemus?.hakija?.etunimet}
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
          <OphTypography
            noWrap={true}
            data-testid="hakemusotsikko-kasittelyvaihe"
            sx={{
              display: 'flex',
              gap: '13px',
            }}
          >
            {kasittelyVaiheTranslation}
            {hakemus?.onkoPeruutettu && (
              <PeruutettuBadge
                label={t('hakemus.ataruhakemuksentila.peruutettu')}
              />
            )}
          </OphTypography>
        </Stack>
        <Stack direction="column" width="100%" spacing={theme.spacing(2, 3)}>
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
                  (opt) => opt.value === hakemus.esittelijaOid,
                )
                  ? hakemus.esittelijaOid
                  : ''
              }
              sx={{ width: '50%', paddingLeft: theme.spacing(2) }}
              data-testid={'hakemusotsikko-esittelija'}
              onChange={(event: SelectChangeEvent) =>
                updateHakemusLocal({ esittelijaOid: event.target.value })
              }
              inputProps={{ 'aria-label': t('hakemusotsikko.esittelija') }}
            />
          </OphTypography>
        </Stack>
      </Stack>
    )
  );
};
