'use client';

import { DeleteOutline } from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { Stack } from '@mui/system';
import {
  OphButton,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { LexicalEditor } from 'lexical';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { KieliSelect } from '@/src/app/hakemus/[oid]/editori/viesti/components/KieliSelect';
import { VahvistettuList } from '@/src/app/hakemus/[oid]/editori/viesti/components/VahvistettuList';
import { ViestityyppiComponent } from '@/src/app/hakemus/[oid]/editori/viesti/components/Viestityyppi';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { Editor } from '@/src/components/editor/Editor';
import {
  exportMarkdown,
  importHtml,
  normalizedEditorContent,
} from '@/src/components/editor/editor-utils';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useHakemus } from '@/src/context/HakemusContext';
import { useEditableState } from '@/src/hooks/useEditableState';
import useToaster from '@/src/hooks/useToaster';
import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
import { useViestiAll } from '@/src/hooks/useViestiAll';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Hakemus } from '@/src/lib/types/hakemus';
import { Viesti, Viestityyppi } from '@/src/lib/types/viesti';
import { handleFetchError } from '@/src/lib/utils';

export default function ViestiPage() {
  const { addToast } = useToaster();
  const { t } = useTranslations();
  const {
    isLoading: isHakemusLoading,
    hakemusState,
    error: hakemusError,
  } = useHakemus();

  const hakemus = hakemusState.editedData;

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
  }, [hakemusError, addToast, t]);

  if (hakemusError) {
    return null;
  }

  if (isHakemusLoading || !hakemus) {
    return <FullSpinner></FullSpinner>;
  }

  return <ViestiPageComponent hakemus={hakemus} />;
}

const ViestiPageComponent = ({ hakemus }: { hakemus: Hakemus }) => {
  const { t } = useTranslations();
  const theme = useTheme();
  const { addToast } = useToaster();
  const editorRef = useRef<LexicalEditor | null>(null);
  const { showConfirmation } = useGlobalConfirmationModal();

  const {
    isLoading,
    viesti,
    viestiLista,
    oletusSisalto,
    updateViesti,
    vahvistaViesti,
    poistaViesti,
    paivitaVahvistettuLista,
    setViestityyppi: setViestityyppiForOletussisalto,
    updateOngoing,
    maybeError,
  } = useViestiAll(hakemus?.hakemusOid);

  const viestiState = useEditableState(viesti, (viesti) =>
    updateViesti(viesti),
  );

  const currentViesti = viestiState.editedData;
  const [editorHasChanges, setEditorHasChanges] = useState(false);
  const [editorEmpty, setEditorEmpty] = useState(!viesti?.viesti);

  useUnsavedChanges(
    viestiState.hasChanges || editorHasChanges,
    viestiState.discard,
  );

  useEffect(() => {
    const toBeSisalto = currentViesti?.viesti || oletusSisalto;
    importHtml(editorRef.current, toBeSisalto || '');
  }, [editorRef, currentViesti?.viesti, oletusSisalto]);

  useEffect(() => {
    setViestityyppiForOletussisalto(currentViesti?.tyyppi || null);
  }, [currentViesti?.tyyppi, setViestityyppiForOletussisalto]);

  const viestiToBeSaved = useCallback(() => {
    if (editorHasChanges) {
      return {
        ...currentViesti!,
        viesti: normalizedEditorContent(editorRef.current),
      };
    }
    return currentViesti!;
  }, [currentViesti, editorHasChanges]);

  const onSave = () => {
    updateViesti(viestiToBeSaved());
    setEditorHasChanges(false);
  };

  const updateEditorChanges = (editor: LexicalEditor) => {
    const normalizedContent = normalizedEditorContent(editor);
    const savedContent = currentViesti?.viesti || '';
    setEditorHasChanges(savedContent !== normalizedContent);
    setEditorEmpty(!normalizedContent);
  };

  const isViestiEmpty =
    !currentViesti?.tyyppi && !currentViesti?.otsikko && editorEmpty;

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

  if (maybeError?.isCritical) {
    return null;
  }

  if (isLoading || !viesti) {
    return <FullSpinner></FullSpinner>;
  }

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
        oletusKieli={currentViesti?.kieli || 'fi'}
        updateKieli={(kieli) => updateViestiPartially({ kieli: kieli })}
        t={t}
        theme={theme}
      />
      <ViestityyppiComponent
        viestityyppi={currentViesti?.tyyppi}
        updateViestityyppi={(tyyppi: Viestityyppi) => {
          updateViestiPartially({ tyyppi: tyyppi });
        }}
        t={t}
      />
      <OphInputFormField
        label={t('hakemus.viesti.otsikko')}
        value={currentViesti?.otsikko || ''}
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
              handleConfirmAction: () => {
                if (currentViesti?.id) {
                  updateViestiPartially(
                    {
                      tyyppi: null,
                      otsikko: null,
                      viesti: null,
                    },
                    true,
                  );
                } else {
                  viestiState.discard();
                  addToast({
                    key: 'hakemus.viesti.tyhjenna.toaster',
                    message: t('hakemus.viesti.tyhjennettyToast'),
                    type: 'success',
                    timeMs: 2500,
                  });
                }
              },
            })
          }
        >
          {t(`hakemus.viesti.tyhjenna`)}
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
                navigator.clipboard.writeText(
                  exportMarkdown(editorRef.current),
                );
                vahvistaViesti(viestiToBeSaved(), () => {
                  paivitaVahvistettuLista();
                });
                if (viestiState.hasChanges) {
                  // Vahvistettaessa viesti myös tallennetaan
                  // Vahvistamisen jälkeen editoriin tuodaan uusi tallentamaton viesti,
                  // joten discardataan mahdolliset muutokset
                  viestiState.discard();
                  setEditorHasChanges(false);
                  setEditorEmpty(true);
                }
              },
            })
          }
        >
          {t(`hakemus.viesti.vahvistaJaKopioi`)}
        </OphButton>
      </Stack>
      <VahvistettuList
        t={t}
        theme={theme}
        viestiLista={viestiLista || []}
        paivitaVahvistetut={paivitaVahvistettuLista}
        lisaaEditoriin={(html: string) => {
          importHtml(
            editorRef.current,
            `${currentViesti?.viesti || ''}${html}`,
          );
        }}
        poistaViesti={(viestiId) =>
          showConfirmation({
            header: t(`hakemus.viesti.poista.modal.otsikko`),
            content: t(`hakemus.viesti.poista.modal.teksti`),
            confirmButtonText: t(`hakemus.viesti.poista.modal.poistaViesti`),
            handleConfirmAction: () =>
              poistaViesti(viestiId, () => {
                paivitaVahvistettuLista();
              }),
          })
        }
      />
      <SaveRibbon
        onSave={onSave}
        isSaving={updateOngoing}
        hasChanges={viestiState.hasChanges || editorHasChanges}
        lastSaved={currentViesti?.muokattu}
        modifier={currentViesti?.muokkaaja}
      />
    </Stack>
  );
};
