'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';

import { EhdollinenPaatosComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/EhdollinenPaatosComponent';
import { LopullinenPaatosComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/LopullinenPaatosComponent';
import { PaatosHeader } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosHeader';
import {
  PreviewComponent,
  PreviewContent,
} from '@/src/app/hakemus/[oid]/paatostiedot/components/PreviewComponent';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useHakemus } from '@/src/context/HakemusContext';
import { useShowPreview } from '@/src/context/ShowPreviewContext';
import { EditableState, useEditableState } from '@/src/hooks/useEditableState';
import { usePaatos } from '@/src/hooks/usePaatos';
import useToaster from '@/src/hooks/useToaster';
import { useTutkinnot } from '@/src/hooks/useTutkinnot';
import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Hakemus, HakemusKoskee } from '@/src/lib/types/hakemus';
import { Paatos } from '@/src/lib/types/paatos';
import { Tutkinto } from '@/src/lib/types/tutkinto';
import { handleFetchError } from '@/src/lib/utils';

export default function PaatostiedotPage() {
  const { t } = useTranslations();
  const {
    isLoading: isHakemusLoading,
    hakemusState,
    error: hakemusError,
  } = useHakemus();

  const { tutkintoState } = useTutkinnot(hakemusState.editedData?.hakemusOid);
  const {
    isPaatosLoading,
    paatos,
    error: paatosError,
    generateError,
    updatePaatos,
    isUpdateOngoing: isPaatosUpdateOngoing,
    isUpdateSuccess: isPaatosUpdateSuccess,
    updateError: paatosUpdateError,
    paatosteksti,
    isPaatosTekstiLoading,
  } = usePaatos(hakemusState.editedData?.hakemusOid);

  const paatosState = useEditableState(paatos, updatePaatos);

  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
    handleFetchError(addToast, paatosError, 'virhe.paatoksenLataus', t);
    handleFetchError(addToast, paatosError, 'virhe.paatoksenLataus', t);
    handleFetchError(addToast, generateError, 'virhe.paatoksenLataus', t);
    handleFetchError(addToast, paatosUpdateError, 'virhe.tallennus', t, 4000);
  }, [
    addToast,
    hakemusError,
    paatosError,
    paatosUpdateError,
    generateError,
    t,
  ]);

  useEffect(() => {
    if (isPaatosUpdateSuccess) {
      addToast({
        key: 'yleiset.tallennusOnnistui',
        type: 'success',
        message: t('yleiset.tallennusOnnistui'),
        timeMs: 2500,
      });
    }
  }, [isPaatosUpdateSuccess, addToast, t]);

  if (hakemusError || paatosError) {
    return null;
  }

  if (isHakemusLoading || isPaatosLoading) {
    return <FullSpinner></FullSpinner>;
  }

  return (
    <Paatostiedot
      paatosState={paatosState}
      updateOngoing={isPaatosUpdateOngoing}
      hakemusState={hakemusState}
      tutkinnot={tutkintoState.editedData ?? []}
      paatosteksti={paatosteksti}
      isPaatosTekstiLoading={isPaatosTekstiLoading}
    />
  );
}

const Paatostiedot = ({
  paatosState,
  updateOngoing,
  hakemusState,
  tutkinnot,
  paatosteksti,
  isPaatosTekstiLoading,
}: {
  paatosState: EditableState<Paatos>;
  updateOngoing: boolean;
  hakemusState: EditableState<Hakemus>;
  tutkinnot: Tutkinto[];
  paatosteksti?: string | undefined;
  isPaatosTekstiLoading?: boolean;
}) => {
  const { t } = useTranslations();
  const theme = useTheme();
  const paatos = paatosState.editedData;
  const hakemus = hakemusState.editedData;

  const { showPaatosTekstiPreview, setShowPaatosTekstiPreview } =
    useShowPreview();

  useUnsavedChanges(paatosState.hasChanges, paatosState.discard);

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

  const content = isPaatosTekstiLoading ? (
    <FullSpinner />
  ) : (
    <PreviewContent>
      <div dangerouslySetInnerHTML={{ __html: paatosteksti ?? '' }} />
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
          {hakemus.hakemusKoskee === HakemusKoskee.LOPULLINEN_PAATOS ? (
            <LopullinenPaatosComponent
              t={t}
              theme={theme}
              paatos={paatos}
              updatePaatosField={updatePaatosField}
            />
          ) : (
            <EhdollinenPaatosComponent
              t={t}
              theme={theme}
              paatos={paatos}
              tutkinnot={tutkinnot}
              updatePaatosField={updatePaatosField}
            />
          )}
          <SaveRibbon
            onSave={() => {
              paatosState.save();
            }}
            isSaving={updateOngoing}
            hasChanges={paatosState.hasChanges}
            lastSaved={paatos.muokattu}
            modifier={paatos.muokkaaja}
          />
        </Stack>
        {showPaatosTekstiPreview && (
          <PreviewComponent
            hakemusOid={hakemus.hakemusOid}
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
