import { Stack } from '@mui/material';
import {
  OphCheckbox,
  OphFormFieldWrapper,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { KelpoisuudenLisavaatimukset } from '@/src/lib/types/paatos';

type AmmattikokemusJaOpinnotYhdessaComponentProps = {
  korvaavatKokonaan?: boolean;
  tasmennys?: string | null;
  updateLisavaatimukset: (
    lisavaatimukset: Partial<KelpoisuudenLisavaatimukset>,
  ) => void;
  t: TFunction;
};

export const AmmattikokemusJaOpinnotYhdessaComponent = ({
  korvaavatKokonaan,
  tasmennys,
  updateLisavaatimukset,
  t,
}: AmmattikokemusJaOpinnotYhdessaComponentProps) => {
  return (
    <OphFormFieldWrapper
      label={t(
        'hakemus.paatos.paatostyyppi.kelpoisuus.uo.ammattikokemusJaOpinnotYhdessa',
      )}
      renderInput={() => (
        <Stack spacing={2}>
          <OphCheckbox
            data-testid="uo-ammattikokemusJaOpinnotYhdessaKorvaavatKokonaan-checkbox"
            label={t(
              'hakemus.paatos.paatostyyppi.kelpoisuus.uo.ammattikokemusJaOpinnotYhdessa.korvaavatKokonaan',
            )}
            checked={!!korvaavatKokonaan}
            onChange={(e) =>
              updateLisavaatimukset({
                ammattikokemusJaOpinnotYhdessaKorvaavatKokonaan:
                  e.target.checked,
              })
            }
          />
          {korvaavatKokonaan && (
            <OphInputFormField
              label={t(
                'hakemus.paatos.paatostyyppi.kelpoisuus.uo.ammattikokemusJaOpinnotYhdessa.tasmennys',
              )}
              multiline={false}
              value={tasmennys ?? ''}
              onChange={(e) =>
                updateLisavaatimukset({
                  ammattikokemusJaOpinnotYhdessaTasmennys: e.target.value,
                })
              }
              data-testid="uo-ammattikokemusJaOpinnotYhdessaTasmennys-input"
            />
          )}
        </Stack>
      )}
    />
  );
};
