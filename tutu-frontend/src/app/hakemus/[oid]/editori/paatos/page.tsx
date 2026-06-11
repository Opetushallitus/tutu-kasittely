'use client';

import { CopyAllOutlined } from '@mui/icons-material';
import { Stack } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { LexicalEditor } from 'lexical';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
import { DATE_TIME_PLACEHOLDER } from '@/src/constants/constants';
import { useShowTekstipohjat } from '@/src/context/TekstipohjaContext';
import { usePaatosteksti } from '@/src/hooks/usePaatosteksti';
import useToaster from '@/src/hooks/useToaster';
import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
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
  const { paatosteksti, savePaatosteksti, updateOngoing, error, updateError } =
    usePaatosteksti(oid);
  const [hasChanges, setHasChanges] = useState(false);
  const { showTekstipohjaLista, setShowTekstipohjaLista } =
    useShowTekstipohjat();

  useUnsavedChanges(hasChanges);

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

  const updateHasChanges = (editor: LexicalEditor) => {
    if (paatosteksti) {
      setHasChanges(paatosteksti.sisalto !== exportHtml(editor));
    }
  };

  if (!paatosteksti) {
    return <FullSpinner />;
  }

  const painikeAction = () => {
    if (paatosteksti.vahvistettu) {
      copy2Clipboard(editorRef.current!);
      return;
    }

    showConfirmation({
      header: t(`hakemus.editori.paatos.vahvistus.modal.otsikko`),
      content: t(`hakemus.editori.paatos.vahvistus.modal.teksti`),
      confirmButtonText: t(`hakemus.editori.paatos.vahvistus.modal.vahvista`),
      handleConfirmAction: () => {
        savePaatosteksti(
          {
            ...paatosteksti,
            sisalto: exportHtml(editorRef.current),
          },
          true,
          () => setHasChanges(false),
        );
        copy2Clipboard(editorRef.current!);
      },
    });
  };

  const painikkeenTeksti = paatosteksti.vahvistettu
    ? t('hakemus.editori.paatos.kopioi')
    : t('hakemus.editori.paatos.vahvista');

  return (
    <>
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
            onClick={painikeAction}
            data-testid={'vahvista-kopioi-painike'}
          >
            {painikkeenTeksti}
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
            const pt = paatosteksti as unknown as {
              kieli?: string;
              kielikoodi?: string;
            };
            const lang = pt?.kieli || pt?.kielikoodi || 'fi';
            const sisaltoObj = pohja.sisalto as
              | Record<string, string>
              | undefined;
            const kielistettyTeksti = sisaltoObj?.[lang] ?? '';

            if (kielistettyTeksti && paatosteksti) {
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
