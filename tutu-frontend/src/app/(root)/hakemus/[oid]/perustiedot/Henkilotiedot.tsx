import { Stack, useTheme } from '@mui/material';
import { OphInput, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import { InfoBox } from '@/src/app/(root)/hakemus/[oid]/components/InfoBox';
import { Hakija, HAKIJA_FIELDS_WO_SAHKOPOSTI } from '@/src/lib/types/hakija';
import { Grid } from '@mui/system';
import * as R from 'remeda';
import { match, P } from 'ts-pattern';
import { Kielistetty } from '@/src/lib/types/common';

const HenkilotietoRivi = ({ nimi, arvo }: { nimi: string; arvo: string }) => {
  return (
    <>
      <Grid size={1}>
        <OphTypography variant={'label'}>{nimi}</OphTypography>
      </Grid>
      <Grid size={5}>
        <OphTypography variant={'body1'}>{arvo}</OphTypography>
      </Grid>
    </>
  );
};
export const Henkilotiedot = ({ hakija }: { hakija: Hakija }) => {
  const { t, getLanguage } = useTranslations();
  const theme = useTheme();

  const lan = getLanguage();
  const htKey = (key: string) => {
    return `hakemus.perustiedot.henkilotiedot.${key}`;
  };

  const containsKielistettyArvo = (fieldValue: Kielistetty) => {
    return Object.keys(fieldValue).includes(lan);
  };

  const arvo = (fieldValue: string | Kielistetty | undefined) => {
    return match(fieldValue)
      .with(P.nullish, () => '')
      .with(P.string, (str) => str)
      .with(P._, (fieldValue) => {
        if (containsKielistettyArvo(fieldValue)) return fieldValue[lan];
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
      <Grid container spacing={theme.spacing(2)} columns={6}>
        {R.map(Object.values(HAKIJA_FIELDS_WO_SAHKOPOSTI), (fieldKey) => (
          <HenkilotietoRivi
            key={fieldKey}
            nimi={t(htKey(fieldKey))}
            arvo={arvo(hakija[fieldKey as keyof Hakija])}
          ></HenkilotietoRivi>
        ))}
      </Grid>
      <Stack>
        <OphTypography variant={'label'}>
          {t(htKey('sahkopostiosoite'))}
        </OphTypography>
        <OphInput
          sx={{ width: '50%' }}
          readOnly={true}
          value={hakija.sahkopostiosoite || ''}
        ></OphInput>
      </Stack>
    </Stack>
  );
};
