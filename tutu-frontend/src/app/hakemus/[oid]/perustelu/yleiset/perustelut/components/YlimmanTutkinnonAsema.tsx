import { useEffect, useState } from 'react';

import { Stack, useTheme } from '@mui/material';
import { OphRadio, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Perustelu } from '@/src/lib/types/perustelu';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Perustelu) => void;
}

export const YlimmanTutkinnonAsema = ({
  perustelu: maybePerustelu,
  updatePerustelu,
}: Props) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const [ylimmanTutkinnonAsema, setYlimmanTutkinnonAsema] = useState<
    string | undefined
  >();

  const updateYlimmanTutkinnonAsema = (val: string | undefined) => {
    if (val !== ylimmanTutkinnonAsema) {
      setYlimmanTutkinnonAsema(val);
      const perustelu = maybePerustelu ?? ({} as Perustelu);
      updatePerustelu({
        ...perustelu,
        ylimmanTutkinnonAsemaLahtomaanJarjestelmassa: val,
      });
    }
  };

  useEffect(() => {
    setYlimmanTutkinnonAsema(
      maybePerustelu?.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa,
    );
  }, [maybePerustelu?.ylimmanTutkinnonAsemaLahtomaanJarjestelmassa]);

  const tutkinnonAsemat = [
    'alempi_korkeakouluaste',
    'ylempi_korkeakouluaste',
    'alempi_ja_ylempi_korkeakouluaste',
    'tutkijakoulutusaste',
    'ei_korkeakouluaste',
  ];

  return (
    <Stack direction="column" gap={theme.spacing(1)}>
      <OphTypography variant="h4">
        {t(
          'hakemus.perustelu.yleiset.perustelut.ylimmanTutkinnonAsema.otsikko',
        )}
      </OphTypography>
      {tutkinnonAsemat.map((tutkinnonAsema) => {
        return (
          <OphRadio
            key={`checkboxTutkinnonAsema.${tutkinnonAsema}`}
            value={'tutkinnonAsema'}
            checked={ylimmanTutkinnonAsema === tutkinnonAsema}
            label={t(
              `hakemus.perustelu.yleiset.perustelut.ylimmanTutkinnonAsema.${tutkinnonAsema}`,
            )}
            name="ylimmanTutkinnonAsema"
            onChange={() => updateYlimmanTutkinnonAsema(tutkinnonAsema)}
          />
        );
      })}
    </Stack>
  );
};
