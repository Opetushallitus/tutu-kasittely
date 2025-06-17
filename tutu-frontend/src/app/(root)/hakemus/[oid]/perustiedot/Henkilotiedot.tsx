import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import { InfoBox } from '@/src/app/(root)/hakemus/[oid]/components/InfoBox';

export const Henkilotiedot = () => {
  const { t } = useTranslations();
  const theme = useTheme();

  return (
    <Stack gap={theme.spacing(2)}>
      <OphTypography variant={'h3'}>
        {t('hakemus.perustiedot.henkilotiedot.otsikko')}
      </OphTypography>
      <InfoBox infoText={t('hakemus.perustiedot.henkilotiedot.huomautus')} />
    </Stack>
  );
};
