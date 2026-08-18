import { CopyAllOutlined } from '@mui/icons-material';
import { Stack } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { LexicalEditor } from 'lexical';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { Editor } from '@/src/components/editor/Editor';
import {
  exportHtml,
  exportMarkdown,
  importHtml,
  pasteHtml,
} from '@/src/components/editor/editor-utils';
import { TekstipohjaLista } from '@/src/components/editor/TekstipohjaLista';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { UnsavedChangesGuard } from '@/src/components/UnsavedChangesGuard';
import { DATE_TIME_PLACEHOLDER } from '@/src/constants/constants';
import { useShowTekstipohjat } from '@/src/context/TekstipohjaContext';
import { usePaatosteksti } from '@/src/hooks/usePaatosteksti';
import useToaster from '@/src/hooks/useToaster';
import { formatHelsinki } from '@/src/lib/dateUtils';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Paatospohja } from '@/src/lib/types/paatosteksti';
import { handleFetchError } from '@/src/lib/utils';

const copy2Clipboard = (editor: LexicalEditor) =>
  navigator.clipboard.writeText(exportMarkdown(editor)).finally(() => {});

export default function PaatosEditorPage() {
  const { t } = useTranslations();
  const editorRef = useRef<LexicalEditor | null>(null);
  const { oid } = useParams<{ oid: string }>();
  const {
    paatosteksti,
    savePaatosteksti,
    updateOngoing,
    error,
    updateError,
    generatePaatosTeksti,
  } = usePaatosteksti(oid ?? '');
  const [hasChanges, setHasChanges] = useState(false);
  const { showTekstipohjaLista, setShowTekstipohjaLista } =
    useShowTekstipohjat();

  const { showConfirmation } = useGlobalConfirmationModal();
  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.paatostekstiLataus', t);
    handleFetchError(addToast, updateError, 'virhe.paatostekstiTallennus', t);
  }, [error, updateError, addToast, t]);

  useEffect(() => {
    if (paatosteksti) {
      importHtml(editorRef.current, paatosteksti.sisalto);
    }
  }, [paatosteksti]);

  const onSave = useCallback(() => {
    if (paatosteksti) {
      savePaatosteksti(
        {
          ...paatosteksti,
          sisalto: exportHtml(editorRef.current),
        },
        false,
        () => setHasChanges(false),
      );
    }
  }, [paatosteksti, savePaatosteksti]);

  const updateHasChanges = (editor: LexicalEditor | null) => {
    if (paatosteksti) {
      setHasChanges(paatosteksti.sisalto !== exportHtml(editor));
    }
  };

  if (!paatosteksti) {
    return <FullSpinner />;
  }

  const vahvistaPainikeAction = async () => {
    if (paatosteksti.vahvistettu) {
      await copy2Clipboard(editorRef.current!);
      return;
    }

    showConfirmation({
      header: t(`hakemus.editori.paatos.vahvistus.modal.otsikko`),
      content: t(`hakemus.editori.paatos.vahvistus.modal.teksti`),
      confirmButtonText: t(`hakemus.editori.paatos.vahvistus.modal.vahvista`),
      handleConfirmAction: async () => {
        savePaatosteksti(
          {
            ...paatosteksti,
            sisalto: exportHtml(editorRef.current),
          },
          true,
          () => setHasChanges(false),
        );
        await copy2Clipboard(editorRef.current!);
      },
    });
  };

  const vahvistaPainikkeenTeksti = paatosteksti.vahvistettu
    ? t('hakemus.editori.paatos.kopioi')
    : t('hakemus.editori.paatos.vahvista');

  const palautaGeneroituPainikeAction = async () => {
    showConfirmation({
      header: t(`hakemus.editori.paatos.palauta.modal.otsikko`),
      content: '',
      confirmButtonText: t(`hakemus.editori.paatos.palauta.modal.vahvista`),
      handleConfirmAction: async () => {
        importHtml(editorRef.current, await generatePaatosTeksti());
        updateHasChanges(editorRef.current);
      },
    });
  };

  return (
    <>
      <UnsavedChangesGuard enabled={hasChanges} />
      <Stack
        direction="column"
        gap={2}
        sx={{ width: '100%', marginRight: 3, marginTop: 1 }}
      >
        <OphTypography variant={'h2'}>
          {t('hakemus.editori.paatos.otsikko')}
        </OphTypography>
        <Editor
          editorRef={editorRef}
          onChange={updateHasChanges}
          valitsePohjaProps={{
            showButton: !showTekstipohjaLista,
            buttonText: t(`tekstipohjat.paatospohjat.valitse`),
            onValitsePohja: () => setShowTekstipohjaLista(true),
          }}
        ></Editor>
        <Stack direction="row-reverse" justifyContent="space-between">
          <OphButton
            sx={{ alignSelf: 'flex-end' }}
            variant={'contained'}
            startIcon={<CopyAllOutlined />}
            onClick={vahvistaPainikeAction}
            data-testid={'vahvista-kopioi-painike'}
          >
            {vahvistaPainikkeenTeksti}
          </OphButton>
          {paatosteksti.vahvistettu && (
            <OphTypography
              variant={'body1'}
              data-testid="vahvistettu-aikaleima"
            >
              {t(`hakemus.editori.paatos.vahvistettu`, {
                date: formatHelsinki(
                  paatosteksti.vahvistettu,
                  DATE_TIME_PLACEHOLDER,
                ),
              })}
            </OphTypography>
          )}
          <OphButton
            sx={{ alignSelf: 'flex-end' }}
            variant={'outlined'}
            onClick={palautaGeneroituPainikeAction}
            data-testid={'palauta-generoitu-painike'}
          >
            {t('hakemus.editori.paatos.palauta')}
          </OphButton>
        </Stack>
      </Stack>
      <SaveRibbon
        onSave={onSave}
        isSaving={updateOngoing}
        hasChanges={hasChanges}
        lastSaved={paatosteksti.muokattu}
        modifier={paatosteksti.muokkaaja}
      />
      {showTekstipohjaLista && (
        <TekstipohjaLista
          url="paatospohja"
          headerText={t('tekstipohjat.paatospohjat.valitse')}
          close={() => setShowTekstipohjaLista(false)}
          selectPohja={(pohja: Paatospohja) => {
            const lang = paatosteksti.kieli;
            const kielistettyTeksti = lang ? pohja.sisalto[lang] : '';

            if (kielistettyTeksti) {
              pasteHtml(editorRef.current, kielistettyTeksti);
              addToast({
                key: 'tekstipohjat.paatospohjat.valittu',
                message: t('tekstipohjat.paatospohjat.valittu'),
                type: 'success',
                timeMs: 2500,
              });
            }
          }}
        ></TekstipohjaLista>
      )}
    </>
  );
}
