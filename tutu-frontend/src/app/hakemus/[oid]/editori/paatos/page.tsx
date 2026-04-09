'use client';

import { CopyAllOutlined } from '@mui/icons-material';
import { Stack } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { LexicalEditor } from 'lexical';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Editor } from '@/src/app/hakemus/[oid]/editori/components/Editor';
import {
  exportHtml,
  exportMarkdown,
  importHtml,
} from '@/src/app/hakemus/[oid]/editori/components/editor-utils';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { usePaatosteksti } from '@/src/hooks/usePaatosteksti';
import useToaster from '@/src/hooks/useToaster';
import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { handleFetchError } from '@/src/lib/utils';

export default function PaatosEditorPage() {
  const { t } = useTranslations();
  const editorRef = useRef<LexicalEditor | null>(null);
  const { oid } = useParams<{ oid: string }>();
  const { paatosteksti, savePaatosteksti, updateOngoing, error, updateError } =
    usePaatosteksti(oid);
  const [hasChanges, setHasChanges] = useState(false);
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
      savePaatosteksti({
        ...paatosteksti,
        sisalto: exportHtml(editorRef.current),
      });
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
        <Editor editorRef={editorRef} onChange={updateHasChanges}></Editor>
        <OphButton
          sx={{ alignSelf: 'flex-end' }}
          variant={'contained'}
          startIcon={<CopyAllOutlined />}
          onClick={() =>
            showConfirmation({
              header: t(`hakemus.editori.paatos.vahvistus.modal.otsikko`),
              content: t(`hakemus.editori.paatos.vahvistus.modal.teksti`),
              confirmButtonText: t(
                `hakemus.editori.paatos.vahvistus.modal.vahvista`,
              ),
              handleConfirmAction: () => {
                savePaatosteksti(
                  {
                    ...paatosteksti,
                    sisalto: exportHtml(editorRef.current),
                  },
                  true,
                );
                navigator.clipboard
                  .writeText(exportMarkdown(editorRef.current))
                  .finally(() => {});
              },
            })
          }
        >
          {t('hakemus.editori.paatos.vahvista')}
        </OphButton>
      </Stack>
      <SaveRibbon
        onSave={onSave}
        isSaving={updateOngoing}
        hasChanges={hasChanges}
        lastSaved={paatosteksti.muokattu}
        modifier={paatosteksti.muokkaaja}
      />
    </>
  );
}
