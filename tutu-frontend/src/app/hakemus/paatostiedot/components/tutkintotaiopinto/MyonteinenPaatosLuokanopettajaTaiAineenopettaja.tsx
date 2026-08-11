import { Stack, useTheme } from '@mui/material';
import {
  OphCheckbox,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { MyonteinenPaatosProps } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/MyonteinenPaatos';

export const MyonteinenPaatosLuokanopettajaTaiAineenopettaja: React.FC<
  MyonteinenPaatosProps
> = ({ t, updateLisavaatimukset, lisavaatimukset }: MyonteinenPaatosProps) => {
  const theme = useTheme();
  return (
    <OphFormFieldWrapper
      sx={{ gap: theme.spacing(2) }}
      label={t('hakemus.paatos.myonteinenPaatos.otsikko')}
      renderInput={() => (
        <Stack direction="column" gap={theme.spacing(2)}>
          <OphCheckbox
            data-testid="myonteinenPaatos-kelpoisuuskoe"
            label={t('hakemus.paatos.myonteinenPaatos.kelpoisuuskoe')}
            checked={lisavaatimukset?.kelpoisuuskoe || false}
            onChange={(e) =>
              updateLisavaatimukset({
                ...lisavaatimukset,
                kelpoisuuskoe: e.target.checked,
              })
            }
          />
          {lisavaatimukset?.kelpoisuuskoe && (
            <Stack
              direction="column"
              gap={theme.spacing(2)}
              sx={{ marginLeft: theme.spacing(4) }}
            >
              <OphCheckbox
                data-testid="myonteinenPaatos-opettajuutta-tutkimassa"
                label={t(
                  'hakemus.paatos.myonteinenPaatos.opettajuuttaTutkimassa',
                )}
                checked={lisavaatimukset?.opettajuuttaTutkimassa || false}
                onChange={(e) =>
                  updateLisavaatimukset({
                    ...lisavaatimukset,
                    opettajuuttaTutkimassa: e.target.checked,
                  })
                }
              />
              <OphCheckbox
                data-testid="myonteinenPaatos-suomalainen-koulu"
                label={t('hakemus.paatos.myonteinenPaatos.suomalainenKoulu')}
                checked={lisavaatimukset?.suomalainenKoulu || false}
                onChange={(e) =>
                  updateLisavaatimukset({
                    ...lisavaatimukset,
                    suomalainenKoulu: e.target.checked,
                  })
                }
              />
              <OphCheckbox
                data-testid="myonteinenPaatos-opetusnayte"
                label={t('hakemus.paatos.myonteinenPaatos.opetusnayte')}
                checked={lisavaatimukset?.opetusNayte || false}
                onChange={(e) =>
                  updateLisavaatimukset({
                    ...lisavaatimukset,
                    opetusNayte: e.target.checked,
                  })
                }
              />
            </Stack>
          )}
        </Stack>
      )}
    />
  );
};
