'use client';

import { DeleteOutline, CopyAll } from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { Stack } from '@mui/system';
import {
  OphButton,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { LexicalEditor } from 'lexical';
import React, { RefObject, useEffect, useRef } from 'react';

import { Editor } from '@/src/app/hakemus/[oid]/editori/components/Editor';
import {
  exportHtml,
  exportMarkdown,
  importHtml,
} from '@/src/app/hakemus/[oid]/editori/components/editor-utils';
import { KieliSelect } from '@/src/app/hakemus/[oid]/editori/viesti/components/KieliSelect';
import { ViestityyppiComponent } from '@/src/app/hakemus/[oid]/editori/viesti/components/Viestityyppi';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useHakemus } from '@/src/context/HakemusContext';
import { EditableState, useEditableState } from '@/src/hooks/useEditableState';
import useToaster, { AddToastCallback } from '@/src/hooks/useToaster';
import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
import { useViesti, ViestiUpdateCallback } from '@/src/hooks/useViesti';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { Hakemus } from '@/src/lib/types/hakemus';
import { Viesti, Viestityyppi } from '@/src/lib/types/viesti';
import {
  handleFetchError,
  nullifyStringFieldsIfEmpty,
  handleSuccessMessage,
} from '@/src/lib/utils';

export default function ViestiPage() {
  const { t } = useTranslations();

  const {
    isLoading: isHakemusLoading,
    hakemusState,
    error: hakemusError,
  } = useHakemus();

  const hakemus = hakemusState.editedData;

  const {
    isViestiLoading,
    viesti,
    viestiLoadingError,
    updateViesti,
    vahvistaViesti,
    updateOrVahvistusOngoing,
    viestiUpdateSuccess,
    viestiUpdateError,
    vahvistusSuccess,
    vahvistusError,
  } = useViesti(hakemus?.hakemusOid);

  const viestiState = useEditableState(viesti, (viesti) =>
    updateViesti(viesti),
  );

  useUnsavedChanges(viestiState.hasChanges);

  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
    handleFetchError(addToast, viestiLoadingError, 'virhe.viestinLataus', t);
    handleFetchError(addToast, viestiUpdateError, 'virhe.viestinPaivitys', t);
    handleFetchError(addToast, vahvistusError, 'virhe.viestinVahvistus', t);
  }, [
    hakemusError,
    viestiLoadingError,
    viestiUpdateError,
    vahvistusError,
    addToast,
    t,
  ]);

  useEffect(() => {
    handleSuccessMessage(
      viestiUpdateSuccess,
      addToast,
      'hakemus.viesti.paivitetty',
      t,
    );
  }, [addToast, t, viestiUpdateSuccess]);

  useEffect(() => {
    handleSuccessMessage(
      vahvistusSuccess,
      addToast,
      'hakemus.viesti.vahvistettu',
      t,
    );
  }, [addToast, t, vahvistusSuccess]);

  if (hakemusError || viestiLoadingError) {
    return null;
  }

  if (
    isHakemusLoading ||
    isViestiLoading ||
    !hakemus ||
    !viestiState.editedData
  ) {
    return <FullSpinner></FullSpinner>;
  }
  return (
    <ViestiPageComponent
      t={t}
      viestiState={viestiState}
      hakemus={hakemus}
      updateOngoing={updateOrVahvistusOngoing}
      vahvistaViesti={vahvistaViesti}
    />
  );
}

const handleCopy = (
  viesti: string,
  addToast: AddToastCallback,
  t: TFunction,
) => {
  navigator.clipboard.writeText(viesti);
  addToast({
    key: 'hakemus.viesti.kopioi.toaster',
    message: t('hakemus.viesti.kopioituToast'),
    type: 'success',
  });
};

const ViestiPageComponent = ({
  t,
  viestiState,
  hakemus,
  updateOngoing,
  vahvistaViesti,
}: {
  t: TFunction;
  viestiState: EditableState<Viesti>;
  hakemus: Hakemus;
  updateOngoing: boolean;
  vahvistaViesti: ViestiUpdateCallback;
}) => {
  const theme = useTheme();
  const { addToast } = useToaster();
  const editorRef = useRef<LexicalEditor | null>(null);
  const { showConfirmation } = useGlobalConfirmationModal();
  const currentViesti = viestiState.editedData!;

  //@TODO: editorin / viestin sisältöä voitaneen jatkossa tutkia hasChanges-logiikalla
  const isViestiEmpty =
    !currentViesti.tyyppi && !currentViesti.otsikko && !currentViesti.viesti;

  const updateViestipartially = (
    updatedViesti: Partial<Viesti>,
    immediateSave?: boolean,
  ) => {
    const newViesti = {
      ...currentViesti,
      ...nullifyStringFieldsIfEmpty(updatedViesti, ['otsikko', 'viesti']),
    };
    if (immediateSave) {
      viestiState.updateImmediately(newViesti);
      return;
    }
    //@TODO: viestin sisältö asetetaan jatkossa erikseen, kun editoriin saadaan hasChanges-tuki
    viestiState.updateLocal({
      ...newViesti,
      viesti: exportHtml(editorRef.current),
    });
  };

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{
        flexGrow: 1,
        marginRight: theme.spacing(3),
      }}
    >
      <OphTypography variant={'h2'}>
        {t('hakemus.viesti.sivunOtsikko')}
      </OphTypography>
      <KieliSelect
        oletusKieli={currentViesti.kieli || 'fi'}
        updateKieli={(kieli) => updateViestipartially({ kieli: kieli })}
        t={t}
        theme={theme}
      />
      <ViestityyppiComponent
        viestityyppi={currentViesti.tyyppi}
        updateViestityyppi={(tyyppi: Viestityyppi) =>
          updateViestipartially({ tyyppi: tyyppi })
        }
        t={t}
      />
      <OphInputFormField
        label={t('hakemus.viesti.otsikko')}
        value={currentViesti.otsikko || ''}
        onChange={(event) =>
          updateViestipartially({
            otsikko: event.target.value,
          })
        }
        data-testid={'viesti-otsikko-input'}
      />
      <Editori editorRef={editorRef} viesti={currentViesti.viesti || ''} />
      <Stack
        direction="row"
        sx={{ marginLeft: theme.spacing(2) }}
        justifyContent="space-between"
      >
        <OphButton
          data-testid={`viesti-tyhjenna-button`}
          variant="text"
          startIcon={<DeleteOutline />}
          onClick={() =>
            showConfirmation({
              header: t(`hakemus.viesti.tyhjenna.modal.otsikko`),
              content: t(`hakemus.viesti.tyhjenna.modal.teksti`),
              confirmButtonText: t(
                `hakemus.viesti.tyhjenna.modal.tyhennaKentat`,
              ),
              handleConfirmAction: () =>
                updateViestipartially(
                  { tyyppi: null, otsikko: null, viesti: null },
                  true,
                ),
            })
          }
        >
          {t(`hakemus.viesti.tyhjenna`)}
        </OphButton>
        <Stack direction="row" gap={theme.spacing(1)}>
          <OphButton
            data-testid={`viesti-kopioi-button`}
            disabled={isViestiEmpty}
            variant="outlined"
            startIcon={<CopyAll />}
            onClick={() =>
              handleCopy(exportMarkdown(editorRef.current), addToast, t)
            }
          >
            {t(`hakemus.viesti.kopioi`)}
          </OphButton>
          <OphButton
            data-testid={`viesti-vahvista-button`}
            disabled={isViestiEmpty}
            variant="contained"
            onClick={() =>
              showConfirmation({
                header: t(`hakemus.viesti.vahvista.modal.otsikko`),
                content: t(`hakemus.viesti.vahvista.modal.teksti`),
                confirmButtonText: t(
                  `hakemus.viesti.vahvista.modal.vahvistaViesti`,
                ),
                handleConfirmAction: () => vahvistaViesti(currentViesti),
              })
            }
          >
            {t(`hakemus.viesti.vahvista`)}
          </OphButton>
        </Stack>
      </Stack>
      <SaveRibbon
        onSave={() => {
          viestiState.save();
        }}
        isSaving={updateOngoing}
        hasChanges={viestiState.hasChanges}
        lastSaved={hakemus.muokattu}
        modifier={hakemus.muokkaaja}
      />
    </Stack>
  );
};

const Editori = ({
  editorRef,
  viesti,
}: {
  editorRef: RefObject<LexicalEditor | null>;
  viesti: string;
}) => {
  useEffect(() => {
    importHtml(editorRef.current, viesti);
  }, [editorRef, viesti]);

  return <Editor editorRef={editorRef}></Editor>;
};
