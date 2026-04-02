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
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Editor } from '@/src/app/hakemus/[oid]/editori/components/Editor';
import {
  exportHtml,
  exportMarkdown,
  importHtml,
} from '@/src/app/hakemus/[oid]/editori/components/editor-utils';
import { KieliSelect } from '@/src/app/hakemus/[oid]/editori/viesti/components/KieliSelect';
import { VahvistettuList } from '@/src/app/hakemus/[oid]/editori/viesti/components/VahvistettuList';
import { ViestityyppiComponent } from '@/src/app/hakemus/[oid]/editori/viesti/components/Viestityyppi';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useHakemus } from '@/src/context/HakemusContext';
import { useEditableState } from '@/src/hooks/useEditableState';
import useToaster, { AddToastCallback } from '@/src/hooks/useToaster';
import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
import { useVahvistetutViestit } from '@/src/hooks/useVahvistetutViestit';
import { useViesti, ViestiUpdateCallback } from '@/src/hooks/useViesti';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { Hakemus } from '@/src/lib/types/hakemus';
import {
  VahvistettuViestiListItem,
  Viesti,
  Viestityyppi,
} from '@/src/lib/types/viesti';
import {
  handleFetchError,
  handleSuccessMessage,
  anyRealContentInHtml,
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
    poistaViesti,
    updateOngoing,
    viestiUpdateSuccess,
    viestiUpdateError,
    vahvistusSuccess,
    vahvistusError,
    poistoOngoing,
    poistoSuccess,
    poistoError,
  } = useViesti(hakemus?.hakemusOid);

  const {
    viestiLista,
    refresh: paivitaVahvistettuLista,
    isLoading: listaLoading,
    error: listaError,
  } = useVahvistetutViestit(hakemus?.hakemusOid);

  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
    handleFetchError(addToast, viestiLoadingError, 'virhe.viestinLataus', t);
    handleFetchError(addToast, listaError, 'virhe.viestiListanLataus', t);
    handleFetchError(addToast, viestiUpdateError, 'virhe.viestinPaivitys', t);
    handleFetchError(addToast, vahvistusError, 'virhe.viestinVahvistus', t);
    handleFetchError(addToast, poistoError, 'virhe.viestinPoisto', t);
  }, [
    hakemusError,
    viestiLoadingError,
    viestiUpdateError,
    vahvistusError,
    addToast,
    t,
    listaError,
    poistoError,
  ]);

  useEffect(() => {
    handleSuccessMessage(
      viestiUpdateSuccess,
      addToast,
      'hakemus.viesti.paivitetty',
      t,
    );
    handleSuccessMessage(
      vahvistusSuccess,
      addToast,
      'hakemus.viesti.vahvistettu',
      t,
    );
    handleSuccessMessage(
      poistoSuccess,
      addToast,
      'hakemus.viesti.poistettu',
      t,
    );
  }, [addToast, t, viestiUpdateSuccess, vahvistusSuccess, poistoSuccess]);

  if (hakemusError || viestiLoadingError) {
    return null;
  }

  if (
    isHakemusLoading ||
    isViestiLoading ||
    listaLoading ||
    !hakemus ||
    !viesti ||
    poistoOngoing
  ) {
    return <FullSpinner></FullSpinner>;
  }

  const vahvistaViestiJaPaivitaLista = (viesti: Viesti) => {
    vahvistaViesti(viesti, () => {
      paivitaVahvistettuLista();
    });
  };

  const poistaViestiJaPaivitaLista = (viestiId: string) => {
    poistaViesti(viestiId, () => {
      paivitaVahvistettuLista();
    });
  };

  return (
    <ViestiPageComponent
      t={t}
      viesti={viesti}
      hakemus={hakemus}
      updateOngoing={updateOngoing}
      updateViesti={updateViesti}
      vahvistaViesti={vahvistaViestiJaPaivitaLista}
      poistaViesti={poistaViestiJaPaivitaLista}
      vahvistettuLista={viestiLista || []}
      paivitaVahvistettuLista={paivitaVahvistettuLista}
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
    timeMs: 2500,
  });
};

const ViestiPageComponent = ({
  t,
  viesti,
  hakemus,
  updateOngoing,
  updateViesti,
  vahvistaViesti,
  poistaViesti,
  vahvistettuLista,
  paivitaVahvistettuLista,
}: {
  t: TFunction;
  viesti: Viesti;
  hakemus: Hakemus;
  updateOngoing: boolean;
  updateViesti: ViestiUpdateCallback;
  vahvistaViesti: ViestiUpdateCallback;
  poistaViesti: (viestiId: string) => void;
  vahvistettuLista: VahvistettuViestiListItem[];
  paivitaVahvistettuLista: () => void;
}) => {
  const theme = useTheme();
  const { addToast } = useToaster();
  const editorRef = useRef<LexicalEditor | null>(null);
  const { showConfirmation } = useGlobalConfirmationModal();
  const viestiState = useEditableState(viesti, (viesti) =>
    updateViesti(viesti),
  );

  const currentViesti = viestiState.editedData!;
  const [editorHasChanges, setEditorHasChanges] = useState(false);
  const [editorEmpty, setEditorEmpty] = useState(!viesti.viesti);

  useUnsavedChanges(
    viestiState.hasChanges || editorHasChanges,
    viestiState.discard,
  );

  useEffect(() => {
    importHtml(editorRef.current, currentViesti.viesti || '');
  }, [editorRef, currentViesti.viesti]);

  const normalizedEditorContent = useCallback(
    (editor: LexicalEditor | null) => {
      const editorContent = editor ? exportHtml(editor) : '';
      return anyRealContentInHtml(editorContent) ? editorContent : '';
    },
    [],
  );

  const viestiToBeSaved = useCallback(() => {
    if (editorHasChanges) {
      return {
        ...currentViesti,
        viesti: normalizedEditorContent(editorRef.current),
      };
    }
    return currentViesti;
  }, [currentViesti, editorHasChanges, normalizedEditorContent]);

  const onSave = useCallback(() => {
    updateViesti(viestiToBeSaved());
  }, [viestiToBeSaved, updateViesti]);

  const updateEditorChanges = (editor: LexicalEditor) => {
    const normalizedContent = normalizedEditorContent(editor);
    const savedContent = currentViesti.viesti || '';
    setEditorHasChanges(savedContent !== normalizedContent);
    setEditorEmpty(!normalizedContent);
  };

  const isViestiEmpty =
    !currentViesti.tyyppi && !currentViesti.otsikko && editorEmpty;

  const updateViestiPartially = (
    updatedViesti: Partial<Viesti>,
    immediateSave?: boolean,
  ) => {
    const newViesti = {
      ...currentViesti,
      ...updatedViesti,
    };
    if (immediateSave) {
      viestiState.updateImmediately(newViesti);
      return;
    }
    viestiState.updateLocal(newViesti);
  };

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{
        flexGrow: 1,
        marginRight: theme.spacing(3),
      }}
    >
      <OphTypography variant={'h2'} data-testid={'viesti-otsikko'}>
        {t('hakemus.viesti.sivunOtsikko')}
      </OphTypography>
      <KieliSelect
        oletusKieli={currentViesti.kieli || 'fi'}
        updateKieli={(kieli) => updateViestiPartially({ kieli: kieli })}
        t={t}
        theme={theme}
      />
      <ViestityyppiComponent
        viestityyppi={currentViesti.tyyppi}
        updateViestityyppi={(tyyppi: Viestityyppi) =>
          updateViestiPartially({ tyyppi: tyyppi })
        }
        t={t}
      />
      <OphInputFormField
        label={t('hakemus.viesti.otsikko')}
        value={currentViesti.otsikko || ''}
        onChange={(event) =>
          updateViestiPartially({
            otsikko: event.target.value,
          })
        }
        data-testid={'viesti-otsikko-input'}
      />
      <Editor editorRef={editorRef} onChange={updateEditorChanges}></Editor>
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
                `hakemus.viesti.tyhjenna.modal.tyhjennaKentat`,
              ),
              handleConfirmAction: () =>
                updateViestiPartially(
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
            disabled={editorEmpty}
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
                handleConfirmAction: () => {
                  vahvistaViesti(viestiToBeSaved());
                  if (viestiState.hasChanges) {
                    // Vahvistettaessa viesti myös tallennetaan
                    // Vahvistamisen jälkeen editoriin tuodaan uusi tallentamaton viesti,
                    // joten discardataan mahdolliset muutokset
                    viestiState.discard();
                    importHtml(editorRef.current, '');
                  }
                },
              })
            }
          >
            {t(`hakemus.viesti.vahvista`)}
          </OphButton>
        </Stack>
      </Stack>
      <VahvistettuList
        t={t}
        theme={theme}
        viestiLista={vahvistettuLista}
        paivitaVahvistetut={paivitaVahvistettuLista}
        lisaaEditoriin={(html: string) => {
          importHtml(editorRef.current, `${currentViesti.viesti || ''}${html}`);
        }}
        poistaViesti={(viestiId) =>
          showConfirmation({
            header: t(`hakemus.viesti.poista.modal.otsikko`),
            content: t(`hakemus.viesti.poista.modal.teksti`),
            confirmButtonText: t(`hakemus.viesti.poista.modal.poistaViesti`),
            handleConfirmAction: () => poistaViesti(viestiId),
          })
        }
      />
      <SaveRibbon
        onSave={onSave}
        isSaving={updateOngoing}
        hasChanges={viestiState.hasChanges || editorHasChanges}
        lastSaved={hakemus.muokattu}
        modifier={hakemus.muokkaaja}
      />
    </Stack>
  );
};
