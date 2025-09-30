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

export const VirallinenTutkinnonMyontaja = ({
  perustelu: maybePerustelu,
  updatePerustelu,
}: Props) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const [isVirallinenTutkinnonMyontaja, setIsVirallinenTutkinnonMyontaja] =
    useState<boolean | undefined>();

  const updateIsVirallinenTutkinnonMyontaja = (val: boolean | undefined) => {
    if (val !== isVirallinenTutkinnonMyontaja) {
      setIsVirallinenTutkinnonMyontaja(val);
      updatePerustelu({
        virallinenTutkinnonMyontaja: val,
      });
    }
  };

  useEffect(() => {
    setIsVirallinenTutkinnonMyontaja(
      maybePerustelu?.virallinenTutkinnonMyontaja,
    );
  }, [maybePerustelu?.virallinenTutkinnonMyontaja]);

  const poistopainike = (
    <Link
      data-testid={`virallinen-tutkinnon-myontaja__none`}
      href=""
      onClick={() => updateIsVirallinenTutkinnonMyontaja(undefined)}
    >
      <EditOffOutlined sx={{ color: ophColors.blue2 }} />
    </Link>
  );

  const naytaPoisto = isNonNullish(isVirallinenTutkinnonMyontaja);

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
          data-testid={`virallinen-tutkinnon-myontaja__on`}
          value={'true'}
          checked={isVirallinenTutkinnonMyontaja === true}
          label={t('yleiset.kylla')}
          name="virallinen_tutkinnon_myontaja_true_false"
          onChange={() => updateIsVirallinenTutkinnonMyontaja(true)}
        ></OphRadio>
        <OphRadio
          data-testid={`virallinen-tutkinnon-myontaja__off`}
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
