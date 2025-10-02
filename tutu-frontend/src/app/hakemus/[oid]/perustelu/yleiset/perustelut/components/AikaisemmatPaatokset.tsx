import { useEffect, useState } from 'react';

import { Stack, useTheme } from '@mui/material';
import { OphRadio, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Perustelu } from '@/src/lib/types/perustelu';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Partial<Perustelu>) => void;
}

export const AikaisemmatPaatokset = ({
  perustelu: maybePerustelu,
  updatePerustelu,
}: Props) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const [selectedValue, setValue] = useState<boolean | undefined>();

  const updateValue = (val: boolean | undefined) => {
    if (val !== selectedValue) {
      setValue(val);
      updatePerustelu({
        aikaisemmatPaatokset: val,
      });
    }
  };

  useEffect(() => {
    setValue(maybePerustelu?.aikaisemmatPaatokset);
  }, [maybePerustelu?.aikaisemmatPaatokset]);

  return (
    <Stack direction="column" gap={theme.spacing(1)}>
      <OphTypography variant="h4">
        {t(
          'hakemus.perustelu.yleiset.muutPerustelut.aikaisemmatPaatokset.otsikko',
        )}
      </OphTypography>
      <OphRadio
        data-testid={`aiemmat-paatokset--kylla`}
        value={true}
        checked={selectedValue === true}
        label={t(
          `hakemus.perustelu.yleiset.muutPerustelut.aikaisemmatPaatokset.kylla`,
        )}
        name="aikaisemmat-paatokset"
        onChange={() => updateValue(true)}
      />
      <OphRadio
        data-testid={`aiemmat-paatokset--ei`}
        value={false}
        checked={selectedValue === false}
        label={t(
          `hakemus.perustelu.yleiset.muutPerustelut.aikaisemmatPaatokset.ei`,
        )}
        name="aikaisemmat-paatokset"
        onChange={() => updateValue(false)}
      />
    </Stack>
  );
};
