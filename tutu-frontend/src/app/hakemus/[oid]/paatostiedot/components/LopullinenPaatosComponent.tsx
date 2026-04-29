import { Theme } from '@mui/material/styles';
import { OphSelectFormField } from '@opetushallitus/oph-design-system';
import React from 'react';

import { KorvaavatToimenpiteet } from '@/src/app/hakemus/[oid]/paatostiedot/components/KorvaavatToimenpiteet';
import { SovellettuLakiComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/SovellettuLakiComponent';
import { ratkaisutyyppiOptionsForLopullinenPaatos } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import {
  emptyPaatosTieto,
  korvaavaToimenpide2Paatostiedot,
} from '@/src/app/hakemus/[oid]/paatostiedot/paatostietoUtils';
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
      <OphSelectFormField
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
