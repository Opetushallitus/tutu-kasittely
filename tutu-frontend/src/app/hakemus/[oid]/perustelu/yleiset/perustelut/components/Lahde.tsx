import { /*useEffect,*/ useState } from 'react';

import { Stack, useTheme } from '@mui/material';
import { OphCheckbox, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export const Lahde = () => {
  const { t } = useTranslations();
  const theme = useTheme();

  const [isLahtomaanKansallinenLahde, setIsLahtomaanKansallinenLahde] =
    useState<boolean>(false);

  const [isLahtomaanVirallinenVastaus, setIsLahtomaanVirallinenVastaus] =
    useState<boolean>(false);

  const [
    isKansainvalinenHakuteosTaiVerkkosivusto,
    setIsKansainvalinenHakuteosTaiVerkkosivusto,
  ] = useState<boolean>(false);

  const updateIsLahtomaanKansallinenLahde = (val: boolean) => {
    setIsLahtomaanKansallinenLahde(val);
    // Call update function passed in as param
  };

  const updateIsLahtomaanVirallinenVastaus = (val: boolean) => {
    setIsLahtomaanVirallinenVastaus(val);
    // Call update function passed in as param
  };

  const updateIsKansainvalinenHakuteosTaiVerkkosivusto = (val: boolean) => {
    setIsKansainvalinenHakuteosTaiVerkkosivusto(val);
    // Call update function passed in as param
  };

  // Add effect to set initial value

  return (
    <Stack direction="column" gap={theme.spacing(1)}>
      <OphTypography variant="h4">
        {t('hakemus.perustelu.yleiset.perustelut.lahde.otsikko')}
      </OphTypography>
      <OphCheckbox
        checked={isLahtomaanKansallinenLahde}
        label={t(
          'hakemus.perustelu.yleiset.perustelut.lahde.lahtomaanKansallinenLahde',
        )}
        onChange={(event) =>
          updateIsLahtomaanKansallinenLahde(event.target.checked)
        }
      />
      <OphCheckbox
        checked={isLahtomaanVirallinenVastaus}
        label={t(
          'hakemus.perustelu.yleiset.perustelut.lahde.lahtomaanVirallinenVastaus',
        )}
        onChange={(event) =>
          updateIsLahtomaanVirallinenVastaus(event.target.checked)
        }
      />
      <OphCheckbox
        checked={isKansainvalinenHakuteosTaiVerkkosivusto}
        label={t(
          'hakemus.perustelu.yleiset.perustelut.lahde.kansainvalinenHakuteosTaiVerkkosivusto',
        )}
        onChange={(event) =>
          updateIsKansainvalinenHakuteosTaiVerkkosivusto(event.target.checked)
        }
      />
    </Stack>
  );
};
