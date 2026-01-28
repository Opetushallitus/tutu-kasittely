import { Stack, useTheme } from '@mui/material';
import { OphCheckbox, OphTypography } from '@opetushallitus/oph-design-system';
import { useEffect, useState } from 'react';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Perustelu } from '@/src/lib/types/perustelu';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Partial<Perustelu>) => void;
}

export const Lahde = ({
  perustelu: maybePerustelu,
  updatePerustelu,
}: Props) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const [state, setState] = useState({
    lahdeLahtomaanKansallinenLahde: false,
    lahdeLahtomaanVirallinenVastaus: false,
    lahdeKansainvalinenHakuteosTaiVerkkosivusto: false,
  });

  const updateValue = (field: string, value: boolean) => {
    const newState = {
      ...state,
      [field]: value,
    };
    setState(newState);
    updatePerustelu({
      [field]: value,
    });
  };

  useEffect(() => {
    const newState = {
      lahdeLahtomaanKansallinenLahde:
        maybePerustelu?.lahdeLahtomaanKansallinenLahde ?? false,
      lahdeLahtomaanVirallinenVastaus:
        maybePerustelu?.lahdeLahtomaanVirallinenVastaus ?? false,
      lahdeKansainvalinenHakuteosTaiVerkkosivusto:
        maybePerustelu?.lahdeKansainvalinenHakuteosTaiVerkkosivusto ?? false,
    };
    setState(newState);
  }, [
    maybePerustelu?.lahdeLahtomaanKansallinenLahde,
    maybePerustelu?.lahdeLahtomaanVirallinenVastaus,
    maybePerustelu?.lahdeKansainvalinenHakuteosTaiVerkkosivusto,
  ]);

  return (
    <Stack direction="column" gap={theme.spacing(1)}>
      <OphTypography variant="h4">
        {t('hakemus.perustelu.yleiset.perustelut.lahde.otsikko')}
      </OphTypography>
      <OphCheckbox
        data-testid={`lahde__lahtomaan-kansallinen-lahde`}
        checked={state.lahdeLahtomaanKansallinenLahde}
        label={t(
          'hakemus.perustelu.yleiset.perustelut.lahde.lahtomaanKansallinenLahde',
        )}
        onChange={(event) =>
          updateValue('lahdeLahtomaanKansallinenLahde', event.target.checked)
        }
      />
      <OphCheckbox
        data-testid={`lahde__lahtomaan-virallinen-vastaus`}
        checked={state.lahdeLahtomaanVirallinenVastaus}
        label={t(
          'hakemus.perustelu.yleiset.perustelut.lahde.lahtomaanVirallinenVastaus',
        )}
        onChange={(event) =>
          updateValue('lahdeLahtomaanVirallinenVastaus', event.target.checked)
        }
      />
      <OphCheckbox
        data-testid={`lahde__kansainvalinen-hakuteos-tai-verkkosivusto`}
        checked={state.lahdeKansainvalinenHakuteosTaiVerkkosivusto}
        label={t(
          'hakemus.perustelu.yleiset.perustelut.lahde.kansainvalinenHakuteosTaiVerkkosivusto',
        )}
        onChange={(event) =>
          updateValue(
            'lahdeKansainvalinenHakuteosTaiVerkkosivusto',
            event.target.checked,
          )
        }
      />
    </Stack>
  );
};
