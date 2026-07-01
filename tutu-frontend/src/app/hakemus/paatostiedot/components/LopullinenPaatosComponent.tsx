import { Theme } from '@mui/material/styles';
import React from 'react';

import { KorvaavatToimenpiteet } from '@/src/app/hakemus/paatostiedot/components/KorvaavatToimenpiteet';
import { SovellettuLakiComponent } from '@/src/app/hakemus/paatostiedot/components/SovellettuLakiComponent';
import { ratkaisutyyppiOptionsForLopullinenPaatos } from '@/src/app/hakemus/paatostiedot/constants';
import {
  emptyPaatosTieto,
  korvaavaToimenpide2Paatostiedot,
} from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { OphSelectFormFieldPatched } from '@/src/components/OphSelectFormFieldPatched';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  KorvaavaToimenpideDto,
  Paatos,
  SovellettuLaki,
} from '@/src/lib/types/paatos';

export type LopullinenPaatosComponentProps = {
  t: TFunction;
  theme: Theme;
  paatos: Paatos;
  updatePaatosField: (paatos: Partial<Paatos>, immediateSave?: boolean) => void;
};

export const LopullinenPaatosComponent = ({
  t,
  theme,
  paatos,
  updatePaatosField,
}: LopullinenPaatosComponentProps) => {
  const currentPaatosTieto =
    paatos.paatosTiedot && paatos.paatosTiedot.length > 0
      ? paatos.paatosTiedot[0]
      : undefined;
  return (
    <>
      <KorvaavatToimenpiteet
        t={t}
        theme={theme}
        paatos={paatos}
        updatePaatos={(toimenpideDto: KorvaavaToimenpideDto) => {
          const [updatedPaatos, updatedPaatostieto] =
            korvaavaToimenpide2Paatostiedot(toimenpideDto);
          const toBePaatos = { ...updatedPaatos };
          const origPaatosTieto = currentPaatosTieto
            ? currentPaatosTieto
            : emptyPaatosTieto(paatos.id!);
          if (updatedPaatostieto) {
            toBePaatos.paatosTiedot = [
              { ...origPaatosTieto, ...updatedPaatostieto },
            ];
          } else {
            toBePaatos.paatosTiedot = [];
          }
          updatePaatosField(toBePaatos);
        }}
      />
      <OphSelectFormFieldPatched
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.paatos.ratkaisutyyppi.otsikko')}
        data-testid={'paatos-ratkaisutyyppi'}
        inputProps={{
          'aria-label': t('hakemus.paatos.ratkaisutyyppi.otsikko'),
        }}
        value={paatos.ratkaisutyyppi || ''}
        options={ratkaisutyyppiOptionsForLopullinenPaatos(t)}
        readOnly={true}
        sx={{ pointerEvents: 'none' }}
      />
      {paatos.ratkaisutyyppi === 'Paatos' && currentPaatosTieto && (
        <SovellettuLakiComponent
          t={t}
          paatostieto={currentPaatosTieto}
          handleChange={(value: string) => {
            updatePaatosField({
              paatosTiedot: [
                {
                  ...currentPaatosTieto,
                  sovellettuLaki: value as SovellettuLaki,
                },
              ],
            });
          }}
        />
      )}
    </>
  );
};
