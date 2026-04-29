import { Add } from '@mui/icons-material';
import { Divider } from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  OphButton,
  OphCheckbox,
  OphSelectFormField,
} from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';

import { PaatosTietoList } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosTietoList';
import { PeruutuksenTaiRaukeamisenSyyComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/PeruutuksenTaiRaukeamisenSyyComponent';
import { ratkaisutyyppiOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { emptyPaatosTieto } from '@/src/app/hakemus/[oid]/paatostiedot/paatostietoUtils';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Paatos, PaatosTieto, Ratkaisutyyppi } from '@/src/lib/types/paatos';
import { Tutkinto } from '@/src/lib/types/tutkinto';

export type EhdollinenPaatosComponentProps = {
  t: TFunction;
  theme: Theme;
  paatos: Paatos;
  tutkinnot: Tutkinto[];
  updatePaatosField: (paatos: Partial<Paatos>, immediateSave?: boolean) => void;
};

export const EhdollinenPaatosComponent = ({
  t,
  theme,
  paatos,
  tutkinnot,
  updatePaatosField,
}: EhdollinenPaatosComponentProps) => {
  const [currentPaatosTiedot, setCurrentPaatosTiedot] = React.useState<
    PaatosTieto[]
  >([]);

  const updatePaatosTieto = (
    updatedPaatosTieto: PaatosTieto,
    index: number,
    immediateSave?: boolean,
  ) => {
    const newPaatosTiedot = [...currentPaatosTiedot];
    newPaatosTiedot[index] = updatedPaatosTieto;
    setCurrentPaatosTiedot(newPaatosTiedot);
    updatePaatosField({ paatosTiedot: newPaatosTiedot }, immediateSave);
  };

  const addPaatosTieto = () => {
    setCurrentPaatosTiedot((oldPaatosTiedot) =>
      oldPaatosTiedot.concat([emptyPaatosTieto(paatos.id!)]),
    );
  };

  const deletePaatosTieto = (id: string | undefined) => {
    const newPaatosTiedot = id
      ? currentPaatosTiedot.filter((paatostieto) => paatostieto.id !== id)
      : currentPaatosTiedot.slice(0, -1);
    setCurrentPaatosTiedot(newPaatosTiedot);
    updatePaatosField({ paatosTiedot: newPaatosTiedot }, true);
  };

  const reorderPaatosTieto = (
    fromIndex: number,
    toIndex: number,
    immediateSave: boolean = false,
  ) => {
    const newPaatosTiedot = [...currentPaatosTiedot];
    if (toIndex < 0 || toIndex >= newPaatosTiedot.length) {
      // Invalid params
      return;
    }

    const itemAtSource = newPaatosTiedot[fromIndex];
    const itemAtTarget = newPaatosTiedot[toIndex];

    newPaatosTiedot[fromIndex] = itemAtTarget;
    newPaatosTiedot[toIndex] = itemAtSource;

    setCurrentPaatosTiedot(newPaatosTiedot);
    updatePaatosField({ paatosTiedot: newPaatosTiedot }, immediateSave);
  };

  useEffect(() => {
    if (paatos) {
      setCurrentPaatosTiedot(
        paatos.paatosTiedot?.length
          ? paatos.paatosTiedot
          : [emptyPaatosTieto(paatos.id!)],
      );
    }
  }, [paatos]);

  return (
    <>
      <OphCheckbox
        label={t('hakemus.paatos.seut')}
        checked={paatos.seutArviointi}
        onChange={() => {
          updatePaatosField({
            seutArviointi: !paatos.seutArviointi,
          });
        }}
        data-testid={'paatos-seut'}
      />
      <OphSelectFormField
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.paatos.ratkaisutyyppi.otsikko')}
        data-testid={'paatos-ratkaisutyyppi'}
        inputProps={{
          'aria-label': t('hakemus.paatos.ratkaisutyyppi.otsikko'),
        }}
        value={paatos.ratkaisutyyppi || ''}
        options={ratkaisutyyppiOptions(t)}
        onChange={(event) =>
          updatePaatosField({
            ratkaisutyyppi: event.target.value as Ratkaisutyyppi,
            paatosTiedot: [],
            peruutuksenTaiRaukeamisenSyy: undefined,
          })
        }
      />
      {paatos.ratkaisutyyppi === 'PeruutusTaiRaukeaminen' && (
        <PeruutuksenTaiRaukeamisenSyyComponent
          t={t}
          theme={theme}
          syy={paatos.peruutuksenTaiRaukeamisenSyy}
          updatePeruutuksenTaiRaukeamisenSyy={(syy) =>
            updatePaatosField({ peruutuksenTaiRaukeamisenSyy: syy })
          }
        />
      )}
      {paatos.ratkaisutyyppi === 'Paatos' && (
        <>
          <PaatosTietoList
            t={t}
            paatosTiedot={currentPaatosTiedot}
            paatosTietoOptions={paatos.paatosTietoOptions}
            updatePaatosTietoAction={updatePaatosTieto}
            deletePaatosTieto={deletePaatosTieto}
            reorderPaatosTieto={reorderPaatosTieto}
            tutkinnot={tutkinnot}
          />
          <OphButton
            sx={{
              alignSelf: 'flex-start',
            }}
            data-testid={`lisaa-paatos-button`}
            variant="outlined"
            startIcon={<Add />}
            onClick={addPaatosTieto}
          >
            {t('hakemus.paatos.paatostyyppi.lisaaPaatos')}
          </OphButton>
          <Divider />
        </>
      )}
    </>
  );
};
