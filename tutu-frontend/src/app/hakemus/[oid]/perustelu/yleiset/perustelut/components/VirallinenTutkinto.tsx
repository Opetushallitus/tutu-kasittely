import { useEffect, useState } from 'react';
import { isNonNullish } from 'remeda';

import { Stack, useTheme, Link } from '@mui/material';
import { OphRadio, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ophColors } from '@/src/lib/theme';

import { EditOffOutlined } from '@mui/icons-material';
import { Perustelu } from '@/src/lib/types/perustelu';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Partial<Perustelu>) => void;
}

export const VirallinenTutkinto = ({
  perustelu: maybePerustelu,
  updatePerustelu,
}: Props) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const [isVirallinenTutkinto, setIsVirallinenTutkinto] = useState<
    boolean | undefined
  >();

  const updateIsVirallinenTutkinto = (val: boolean | undefined) => {
    if (val !== isVirallinenTutkinto) {
      setIsVirallinenTutkinto(val);
      updatePerustelu({
        virallinenTutkinto: val,
      });
    }
  };

  useEffect(() => {
    setIsVirallinenTutkinto(maybePerustelu?.virallinenTutkinto);
  }, [maybePerustelu?.virallinenTutkinto]);

  const poistopainike = (
    <Link
      data-testid={`virallinen-tutkinto__none`}
      href=""
      onClick={() => updateIsVirallinenTutkinto(undefined)}
    >
      <EditOffOutlined sx={{ color: ophColors.blue2 }} />
    </Link>
  );

  const naytaPoisto = isNonNullish(isVirallinenTutkinto);

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
          data-testid={`virallinen-tutkinto__on`}
          value={'true'}
          checked={isVirallinenTutkinto === true}
          label={t('yleiset.kylla')}
          name="virallinen_tutkinnon_myontaja_true_false"
          onChange={() => updateIsVirallinenTutkinto(true)}
        ></OphRadio>
        <OphRadio
          data-testid={`virallinen-tutkinto__off`}
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
