import { Stack, useTheme } from '@mui/material';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { KielteisenPaatoksenPerustelut } from '@/src/lib/types/paatos';

interface KielteisenPaatoksenPerusteluComponentProps {
  perustelut?: KielteisenPaatoksenPerustelut;
  updatePerustelutAction: (
    updatedPerustelut: Partial<KielteisenPaatoksenPerustelut>,
  ) => void;
  t: TFunction;
}
const kielteisenPaatoksenPerustelutKeys = [
  'epavirallinenKorkeakoulu',
  'epavirallinenTutkinto',
  'eiVastaaSuomessaSuoritettavaaTutkintoa',
  'muuPerustelu',
] as const satisfies (keyof KielteisenPaatoksenPerustelut)[];

export const KielteisenPaatoksenPerusteluComponent = ({
  perustelut,
  updatePerustelutAction,
  t,
}: KielteisenPaatoksenPerusteluComponentProps) => {
  const theme = useTheme();

  return (
    <Stack direction="column" gap={theme.spacing(2)}>
      <OphTypography variant="h5">
        {t('hakemus.paatos.kielteisenPaatoksenPerustelut.otsikko')}
      </OphTypography>
      {kielteisenPaatoksenPerustelutKeys.map((key) => (
        <OphCheckbox
          key={key}
          data-testid={`kielteinenPaatos-${key}`}
          label={t(`hakemus.paatos.kielteisenPaatoksenPerustelut.${key}`)}
          checked={perustelut?.[key] || false}
          onChange={(e) =>
            updatePerustelutAction({
              [key]: e.target.checked,
            })
          }
        />
      ))}
      {perustelut?.muuPerustelu && (
        <OphInputFormField
          label={t('hakemus.paatos.kielteisenPaatoksenPerustelut.muuPerustelu')}
          multiline={true}
          minRows={3}
          value={perustelut.muuPerusteluKuvaus || ''}
          onChange={(e) =>
            updatePerustelutAction({ muuPerusteluKuvaus: e.target.value })
          }
          data-testid={`kielteinenPaatos-muuPerustelu-kuvaus-input`}
        />
      )}
    </Stack>
  );
};
