import { FormGroup } from '@mui/material';
import {
  OphCheckbox,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { setKoulutusEroValues } from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { NamedBoolean } from '@/src/lib/types/common';
import { ErotKoulutuksessa } from '@/src/lib/types/paatos';

type ErotKoulutuksessaComponentProps = {
  erotKoulutuksessa: ErotKoulutuksessa;
  eroModelId: string;
  updateErotKoulutuksessa: (erotKoulutuksessa: ErotKoulutuksessa) => void;
  t: TFunction;
};

export const ErotKoulutuksessaComponent = ({
  erotKoulutuksessa,
  eroModelId,
  updateErotKoulutuksessa,
  t,
}: ErotKoulutuksessaComponentProps) => {
  const updateEro = (eroName: string, value: boolean) =>
    updateErotKoulutuksessa({
      ...erotKoulutuksessa,
      erot: setKoulutusEroValues(erotKoulutuksessa.erot!, eroName, value),
    });

  const updateTarkennus = (
    eroName: string,
    tarkennusName: string,
    value: boolean,
  ) =>
    updateErotKoulutuksessa({
      ...erotKoulutuksessa,
      eroTarkennukset: {
        ...erotKoulutuksessa.eroTarkennukset,
        [eroName]: setKoulutusEroValues(
          erotKoulutuksessa.eroTarkennukset![eroName],
          tarkennusName,
          value,
        ),
      },
    });

  return (
    <OphFormFieldWrapper
      label={t(`hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.otsikko`)}
      renderInput={({ labelId }) => (
        <FormGroup aria-labelledby={labelId}>
          {erotKoulutuksessa.erot!.map((ero: NamedBoolean) => {
            const tarkennukset = erotKoulutuksessa.eroTarkennukset?.[ero.name];
            return (
              <React.Fragment key={ero.name}>
                <OphCheckbox
                  data-testid={`erotKoulutuksessa-${ero.name}`}
                  label={t(
                    `hakemus.paatos.paatostyyppi.kelpoisuus.paatos.uo.erotKoulutuksessa.${eroModelId}.${ero.name}`,
                  )}
                  checked={ero.value}
                  onChange={(e) => updateEro(ero.name, e.target.checked)}
                />
                {ero.value && tarkennukset && (
                  <FormGroup sx={{ paddingLeft: 4 }}>
                    {tarkennukset.map((tarkennus: NamedBoolean) => (
                      <OphCheckbox
                        key={tarkennus.name}
                        data-testid={`erotKoulutuksessa-${ero.name}-${tarkennus.name}`}
                        label={t(
                          `hakemus.paatos.paatostyyppi.kelpoisuus.paatos.uo.erotKoulutuksessa.${eroModelId}.${ero.name}.${tarkennus.name}`,
                        )}
                        checked={tarkennus.value}
                        onChange={(e) =>
                          updateTarkennus(
                            ero.name,
                            tarkennus.name,
                            e.target.checked,
                          )
                        }
                      />
                    ))}
                  </FormGroup>
                )}
              </React.Fragment>
            );
          })}
        </FormGroup>
      )}
    />
  );
};
