import { Stack, useTheme } from '@mui/material';
import { OphInput, OphTypography } from '@opetushallitus/oph-design-system';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { InfoBox } from '@/src/components/InfoBox';
import { Hakija, HAKIJA_FIELDS_WO_SAHKOPOSTI } from '@/src/lib/types/hakija';
import { Grid } from '@mui/system';
import * as R from 'remeda';
import { match, P } from 'ts-pattern';
import { TranslatedName } from '@/src/lib/localization/localizationTypes';
import { Theme } from '@mui/material/styles';
import { ReactNode } from 'react';

const HenkilotietoGrid = ({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode | ReactNode[];
}) => {
  return (
    <Grid container spacing={theme.spacing(2)} columns={6}>
      {children}
    </Grid>
  );
};

const HenkilotietoRivi = ({
  nimi,
  arvo,
  t,
}: {
  nimi: string;
  arvo: string;
  t: TFunction;
}) => {
  return (
    <>
      <Grid size={2}>
        <OphTypography variant={'label'}>
          {t(`hakemus.perustiedot.henkilotiedot.${nimi}`)}
        </OphTypography>
      </Grid>
      <Grid size={4}>
        <OphTypography data-testid={nimi} variant={'body1'}>
          {arvo}
        </OphTypography>
      </Grid>
    </>
  );
};
export const Henkilotiedot = ({
  hakija,
  paatosKieli,
  asiointiKieli,
}: {
  hakija: Hakija;
  paatosKieli: string;
  asiointiKieli: string;
}) => {
  const { t, getLanguage } = useTranslations();
  const theme = useTheme();

  const lan = getLanguage();

  const containsTranslatedName = (fieldValue: TranslatedName) => {
    return Object.keys(fieldValue).includes(lan);
  };

  const arvo = (fieldValue: string | TranslatedName | undefined) => {
    return match(fieldValue)
      .with(P.nullish, () => '')
      .with(P.string, (str) => str)
      .with(P._, (fieldValue) => {
        if (containsTranslatedName(fieldValue)) return fieldValue[lan]!;
        return '';
      })
      .otherwise(() => '');
  };

  return (
    <Stack gap={theme.spacing(2)}>
      <OphTypography variant={'h3'}>
        {t('hakemus.perustiedot.henkilotiedot.otsikko')}
      </OphTypography>
      <InfoBox infoText={t('hakemus.perustiedot.henkilotiedot.huomautus')} />
      <HenkilotietoGrid theme={theme}>
        {R.map(Object.values(HAKIJA_FIELDS_WO_SAHKOPOSTI), (fieldKey) => (
          <HenkilotietoRivi
            key={fieldKey}
            t={t}
            nimi={fieldKey}
            arvo={arvo(hakija[fieldKey as keyof Hakija])}
          ></HenkilotietoRivi>
        ))}
      </HenkilotietoGrid>
      <Stack>
        <OphTypography variant={'label'}>
          {t('hakemus.perustiedot.henkilotiedot.sahkopostiosoite')}
        </OphTypography>
        <OphInput
          inputProps={{ 'data-testid': 'sahkopostiosoite' }}
          readOnly={true}
          value={hakija.sahkopostiosoite || ''}
        ></OphInput>
      </Stack>
      <OphTypography variant={'h3'}>
        {t('hakemus.perustiedot.henkilotiedot.kielet')}
      </OphTypography>
      <HenkilotietoGrid theme={theme}>
        <HenkilotietoRivi nimi={'paatoskieli'} arvo={paatosKieli} t={t} />
        <HenkilotietoRivi nimi={'asiointikieli'} arvo={asiointiKieli} t={t} />
      </HenkilotietoGrid>
    </Stack>
  );
};
