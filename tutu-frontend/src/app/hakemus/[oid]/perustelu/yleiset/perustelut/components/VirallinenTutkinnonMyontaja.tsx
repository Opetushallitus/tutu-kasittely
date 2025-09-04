import { /*useEffect,*/ useState } from 'react';

import { Stack, useTheme, Link } from '@mui/material';
import { OphRadio, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ophColors } from '@/src/lib/theme';

import { EditOffOutlined } from '@mui/icons-material';

export const VirallinenTutkinnonMyontaja = () => {
  const { t } = useTranslations();
  const theme = useTheme();

  const [isVirallinenTutkinnonMyontaja, setIsVirallinenTutkinnonMyontaja] =
    useState<boolean | undefined | null>();

  const updateIsVirallinenTutkinnonMyontaja = (
    val: boolean | undefined | null,
  ) => {
    if (val !== isVirallinenTutkinnonMyontaja) {
      setIsVirallinenTutkinnonMyontaja(val);
      // Call update function passed in as param
    }
  };

  // Add effect to set initial value

  const poistopainike = (
    <Link href="" onClick={() => updateIsVirallinenTutkinnonMyontaja(null)}>
      <EditOffOutlined sx={{ color: ophColors.blue2 }} />
    </Link>
  );

  const naytaPoisto =
    isVirallinenTutkinnonMyontaja !== undefined &&
    isVirallinenTutkinnonMyontaja !== null;

  return (
    <Stack direction="column" gap={theme.spacing(1)}>
      <Stack direction="row" gap={theme.spacing(3)}>
        <OphTypography variant="h4">
          {t(
            'hakemus.perustelu.yleiset.perustelut.virallinenTutkinnonMyontaja',
          )}
        </OphTypography>
        {naytaPoisto && poistopainike}
      </Stack>
      <Stack direction="row" gap={theme.spacing(3)}>
        <OphRadio
          value={'true'}
          checked={isVirallinenTutkinnonMyontaja === true}
          label={t('yleiset.kylla')}
          name="virallinen_tutkinnon_myontaja_true_false"
          onChange={() => updateIsVirallinenTutkinnonMyontaja(true)}
        ></OphRadio>
        <OphRadio
          value={'false'}
          checked={isVirallinenTutkinnonMyontaja === false}
          label={t('yleiset.ei')}
          name="virallinen_tutkinnon_myontaja_true_false"
          onChange={() => updateIsVirallinenTutkinnonMyontaja(false)}
        ></OphRadio>
      </Stack>
    </Stack>
  );
};
