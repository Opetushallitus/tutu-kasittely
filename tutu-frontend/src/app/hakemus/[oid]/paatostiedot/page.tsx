'use client';

import { Add } from '@mui/icons-material';
import { Divider, Stack, useTheme } from '@mui/material';
import {
  OphCheckbox,
  OphTypography,
  OphSelectFormField,
  OphButton,
} from '@opetushallitus/oph-design-system';
import React, { useEffect, useState } from 'react';

import { PaatosHeader } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosHeader';
import { PaatosTietoList } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosTietoList';
import { PeruutuksenTaiRaukeamisenSyyComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/PeruutuksenTaiRaukeamisenSyyComponent';
import {
  PreviewComponent,
  PreviewContent,
} from '@/src/app/hakemus/[oid]/paatostiedot/components/PreviewComponent';
import { ratkaisutyyppiOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useHakemus } from '@/src/context/HakemusContext';
import { useShowPreview } from '@/src/context/ShowPreviewContext';
import { EditableState, useEditableState } from '@/src/hooks/useEditableState';
import { getPaatosTeksti, usePaatos } from '@/src/hooks/usePaatos';
import useToaster from '@/src/hooks/useToaster';
import { useTutkinnot } from '@/src/hooks/useTutkinnot';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Hakemus, HakemusKoskee } from '@/src/lib/types/hakemus';
import { Paatos, PaatosTieto, Ratkaisutyyppi } from '@/src/lib/types/paatos';
import { Tutkinto } from '@/src/lib/types/tutkinto';
import { handleFetchError } from '@/src/lib/utils';

const emptyPaatosTieto = (paatosId: string): PaatosTieto => ({
  id: undefined,
  paatosId: paatosId,
  paatosTyyppi: undefined,
  kielteisenPaatoksenPerustelut: undefined,
  rinnastettavatTutkinnotTaiOpinnot: [],
  kelpoisuudet: [],
});

export default function PaatostiedotPage() {
  const { t } = useTranslations();
  const {
    isLoading: isHakemusLoading,
    hakemusState,
    error: hakemusError,
    isSaving,
  } = useHakemus();
  const { tutkintoState } = useTutkinnot(hakemusState.editedData?.hakemusOid);
  const {
    isPaatosLoading,
    paatos,
    error: paatosError,
    updatePaatos,
    updateOngoing,
    updateSuccess: paatosUpdateSuccess,
  } = usePaatos(hakemusState.editedData?.hakemusOid);

  const paatosState = useEditableState(paatos, updatePaatos);

  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
    handleFetchError(addToast, paatosError, 'virhe.paatoksenLataus', t);
  }, [addToast, hakemusError, paatosError, t]);

  if (hakemusError || paatosError) {
    return null;
  }

  if (isHakemusLoading || isPaatosLoading) {
    return <FullSpinner></FullSpinner>;
  }

  return (
    <Paatostiedot
      paatosState={paatosState}
      updateOngoing={isSaving || updateOngoing}
      hakemusState={hakemusState}
      updateSuccess={paatosUpdateSuccess}
      tutkinnot={tutkintoState.editedData ?? []}
    />
  );
}

const Paatostiedot = ({
  paatosState,
  updateOngoing,
  hakemusState,
  updateSuccess,
  tutkinnot,
}: {
  paatosState: EditableState<Paatos>;
  updateOngoing: boolean;
  hakemusState: EditableState<Hakemus>;
  updateSuccess: boolean;
  tutkinnot: Tutkinto[];
}) => {
  const { t } = useTranslations();
  const theme = useTheme();
  const paatos = paatosState.editedData;
  const hakemus = hakemusState.editedData;

  const [isPaatosTekstiLoading, setIsPaatosTekstiLoading] =
    useState<boolean>(true);
  const [paatosTeksti, setPaatosTeksti] = useState<string>('');
  const { showPaatosTekstiPreview, setShowPaatosTekstiPreview } =
    useShowPreview();

  useEffect(() => {
    if (showPaatosTekstiPreview) {
      getPaatosTeksti(hakemus!.hakemusOid).then((sisalto: string) => {
        setPaatosTeksti(sisalto || '');
        setIsPaatosTekstiLoading(false);
      });
    }
    return () => {
      setIsPaatosTekstiLoading(true);
    };
  }, [hakemus, showPaatosTekstiPreview, updateSuccess]);

  const [currentPaatosTiedot, setCurrentPaatosTiedot] = React.useState<
    PaatosTieto[]
  >([]);

  useEffect(() => {
    if (paatos) {
      setCurrentPaatosTiedot(
        paatos.paatosTiedot?.length
          ? paatos.paatosTiedot
          : [emptyPaatosTieto(paatos.id!)],
      );
    }
  }, [paatos]);

  if (!hakemus || !paatos) {
    return <FullSpinner></FullSpinner>;
  }

  const updatePaatosField = (
    updatedPaatos: Partial<Paatos>,
    immediateSave?: boolean,
  ) => {
    const newPaatos: Paatos = { ...paatos, ...updatedPaatos };
    if (immediateSave) {
      paatosState.updateImmediately(updatedPaatos);
      return;
    }
    paatosState.updateLocal(newPaatos);
  };

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

  const content = isPaatosTekstiLoading ? (
    <FullSpinner />
  ) : (
    <PreviewContent>
      <div dangerouslySetInnerHTML={{ __html: paatosTeksti }} />
    </PreviewContent>
  );

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{
        flexGrow: 1,
        marginRight: showPaatosTekstiPreview
          ? theme.spacing(0)
          : theme.spacing(3),
      }}
    >
      <Stack direction={'row'} gap={theme.spacing(2)}>
        <Stack
          gap={theme.spacing(2)}
          direction={'column'}
          sx={{ width: showPaatosTekstiPreview ? '50%' : '100%' }}
        >
          <PaatosHeader
            paatos={paatos}
            updatePaatosField={updatePaatosField}
            t={t}
          />
          <Divider />
          <OphTypography variant={'h3'}>
            {t('hakemus.paatos.ratkaisuJaPaatos')}
          </OphTypography>
          {hakemus.hakemusKoskee !== HakemusKoskee.LOPULLINEN_PAATOS && (
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
          )}
          <OphSelectFormField
            placeholder={t('yleiset.valitse')}
            label={t('hakemus.paatos.ratkaisutyyppi.otsikko')}
            options={ratkaisutyyppiOptions(t)}
            value={paatos.ratkaisutyyppi || ''}
            onChange={(event) =>
              updatePaatosField({
                ratkaisutyyppi: event.target.value as Ratkaisutyyppi,
                paatosTiedot: [],
                peruutuksenTaiRaukeamisenSyy: undefined,
              })
            }
            data-testid={'paatos-ratkaisutyyppi'}
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
          <SaveRibbon
            onSave={() => {
              paatosState.save();
              hakemusState.save();
            }}
            isSaving={updateOngoing}
            hasChanges={paatosState.hasChanges || hakemusState.hasChanges}
            lastSaved={hakemus.muokattu}
            modifierFirstName={hakemus.muokkaajaKutsumanimi}
            modifierLastName={hakemus.muokkaajaSukunimi}
          />
        </Stack>
        {showPaatosTekstiPreview && (
          <PreviewComponent
            setShowPreview={setShowPaatosTekstiPreview}
            headerText={'hakemus.paatos.paatosteksti'}
            closeButtonText={'yleiset.sulje'}
            content={content}
          />
        )}
      </Stack>
    </Stack>
  );
};
