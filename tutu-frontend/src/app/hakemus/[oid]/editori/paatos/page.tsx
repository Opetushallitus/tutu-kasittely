'use client';

import { Stack } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { LexicalEditor } from 'lexical';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Editor } from '@/src/app/hakemus/[oid]/editori/components/Editor';
import {
  exportHtml,
  importHtml,
} from '@/src/app/hakemus/[oid]/editori/components/editor-utils';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { usePaatosteksti } from '@/src/hooks/usePaatosteksti';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export default function PaatosEditorPage() {
  const { t } = useTranslations();
  const editorRef = useRef<LexicalEditor | null>(null);
  const { oid } = useParams<{ oid: string }>();
  const { paatosteksti, savePaatosteksti, updateOngoing } =
    usePaatosteksti(oid);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (paatosteksti) {
      importHtml(editorRef.current, paatosteksti.sisalto);
    }
  }, [paatosteksti]);

  const onSave = useCallback(() => {
    savePaatosteksti({
      ...paatosteksti,
      sisalto: exportHtml(editorRef.current),
    });
  }, [paatosteksti, savePaatosteksti]);

  const updateHasChanges = (editor: LexicalEditor) => {
    setHasChanges(paatosteksti.sisalto !== exportHtml(editor));
  };

  if (!paatosteksti) {
    return <FullSpinner />;
  }

  return (
    <>
      <Stack direction="column" sx={{ width: '100%', marginRight: 3, gap: 1 }}>
        <OphTypography variant={'h2'}>
          {t('hakemus.editori.paatos.otsikko')}
        </OphTypography>
        <Editor
          editorRef={editorRef}
          updateHasChanges={updateHasChanges}
        ></Editor>
        <OphButton
          onClick={() => {
            console.log(exportHtml(editorRef.current));
          }}
        >
          {t('hakemus.editori.paatos.vahvista')}
        </OphButton>
      </Stack>
      <SaveRibbon
        onSave={onSave}
        isSaving={updateOngoing}
        hasChanges={hasChanges}
        lastSaved={paatosteksti.muokattu}
      />
    </>
  );
}
