import { Stack, useTheme } from '@mui/material';
import {
  OphCheckbox,
  OphFormFieldWrapper,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { kielteisenPaatoksenPerustelutKeysFor } from '@/src/app/hakemus/paatostiedot/constants';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  KielteisenPaatoksenPerustelut,
  Paatostyyppi,
  SovellettuLaki,
} from '@/src/lib/types/paatos';

interface KielteisenPaatoksenPerusteluComponentProps {
  perustelut?: KielteisenPaatoksenPerustelut;
  updatePerustelutAction: (
    updatedPerustelut: Partial<KielteisenPaatoksenPerustelut>,
  ) => void;
  t: TFunction;
  paatosTyyppi?: Paatostyyppi;
  sovellettuLaki?: SovellettuLaki;
}

export const KielteisenPaatoksenPerusteluComponent = ({
  perustelut,
  updatePerustelutAction,
  t,
  paatosTyyppi,
  sovellettuLaki,
}: KielteisenPaatoksenPerusteluComponentProps) => {
  const theme = useTheme();
  const perustelutKeys = kielteisenPaatoksenPerustelutKeysFor(
    paatosTyyppi,
    sovellettuLaki,
  );

  return (
    <OphFormFieldWrapper
      label={t('hakemus.paatos.kielteisenPaatoksenPerustelut.otsikko')}
      sx={{ flexDirection: 'column', gap: theme.spacing(2) }}
      renderInput={() => (
        <Stack direction="column" spacing={1}>
          {perustelutKeys.map((key) => (
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
              label={t(
                'hakemus.paatos.kielteisenPaatoksenPerustelut.muuPerustelu',
              )}
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
      )}
    />
  );
};
