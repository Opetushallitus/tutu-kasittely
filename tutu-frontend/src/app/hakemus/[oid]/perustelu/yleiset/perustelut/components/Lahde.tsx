import { useEffect, useState } from 'react';

import { Stack, useTheme } from '@mui/material';
import { OphCheckbox, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Perustelu } from '@/src/lib/types/perustelu';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Perustelu) => void;
}

export const Lahde = ({ perustelu, updatePerustelu }: Props) => {
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
    const _perustelu = perustelu ?? ({} as Perustelu);
    updatePerustelu({
      ..._perustelu,
      lahdeLahtomaanKansallinenLahde: val,
    });
  };

  const updateIsLahtomaanVirallinenVastaus = (val: boolean) => {
    setIsLahtomaanVirallinenVastaus(val);
    const _perustelu = perustelu ?? ({} as Perustelu);
    updatePerustelu({
      ..._perustelu,
      lahdeLahtomaanVirallinenVastaus: val,
    });
  };

  const updateIsKansainvalinenHakuteosTaiVerkkosivusto = (val: boolean) => {
    setIsKansainvalinenHakuteosTaiVerkkosivusto(val);
    const _perustelu = perustelu ?? ({} as Perustelu);
    updatePerustelu({
      ..._perustelu,
      lahdeKansainvalinenHakuteosTaiVerkkosivusto: val,
    });
  };

  useEffect(() => {
    setIsLahtomaanKansallinenLahde(
      perustelu?.lahdeLahtomaanKansallinenLahde ?? false,
    );
    setIsLahtomaanVirallinenVastaus(
      perustelu?.lahdeLahtomaanVirallinenVastaus ?? false,
    );
    setIsKansainvalinenHakuteosTaiVerkkosivusto(
      perustelu?.lahdeKansainvalinenHakuteosTaiVerkkosivusto ?? false,
    );
  }, [
    perustelu?.lahdeLahtomaanKansallinenLahde,
    perustelu?.lahdeLahtomaanVirallinenVastaus,
    perustelu?.lahdeKansainvalinenHakuteosTaiVerkkosivusto,
  ]);

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
