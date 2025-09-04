import { /*useEffect,*/ useState } from 'react';

import { Stack, useTheme, Link } from '@mui/material';
import { OphRadio, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ophColors } from '@/src/lib/theme';

import { EditOffOutlined } from '@mui/icons-material';

export const VirallinenTutkinto = () => {
  const { t } = useTranslations();
  const theme = useTheme();

  const [isVirallinenTutkinto, setIsVirallinenTutkinto] = useState<
    boolean | undefined | null
  >();

  const updateIsVirallinenTutkinto = (val: boolean | undefined | null) => {
    if (val !== isVirallinenTutkinto) {
      setIsVirallinenTutkinto(val);
      // Call update function passed in as param
    }
  };

  // Add effect to set initial value

  const poistopainike = (
    <Link href="" onClick={() => updateIsVirallinenTutkinto(null)}>
      <EditOffOutlined sx={{ color: ophColors.blue2 }} />
    </Link>
  );

  const naytaPoisto =
    isVirallinenTutkinto !== undefined && isVirallinenTutkinto !== null;

  return (
    <Stack direction="column" gap={theme.spacing(1)}>
      <Stack direction="row" gap={theme.spacing(3)}>
        <OphTypography variant="h4">
          {t('hakemus.perustelu.yleiset.perustelut.virallinenTutkinto')}
        </OphTypography>
        {naytaPoisto && poistopainike}
      </Stack>
      <Stack direction="row" gap={theme.spacing(3)}>
        <OphRadio
          value={'true'}
          checked={isVirallinenTutkinto === true}
          label={t('yleiset.kylla')}
          name="virallinen_tutkinnon_myontaja_true_false"
          onChange={() => updateIsVirallinenTutkinto(true)}
        ></OphRadio>
        <OphRadio
          value={'false'}
          checked={isVirallinenTutkinto === false}
          label={t('yleiset.ei')}
          name="virallinen_tutkinnon_myontaja_true_false"
          onChange={() => updateIsVirallinenTutkinto(false)}
        ></OphRadio>
      </Stack>
    </Stack>
  );
};
