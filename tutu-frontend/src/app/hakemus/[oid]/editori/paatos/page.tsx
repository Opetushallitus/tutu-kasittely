'use client';

import { Stack } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { LexicalEditor } from 'lexical';
import React, { useEffect, useRef } from 'react';

import { Editor } from '@/src/app/hakemus/[oid]/editori/components/Editor';
import {
  exportHtml,
  importHtml,
} from '@/src/app/hakemus/[oid]/editori/components/editor-utils';
import { usePaatosteksti } from '@/src/hooks/usePaatosteksti';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export default function PaatosEditorPage() {
  const { t } = useTranslations();
  const editorRef = useRef<LexicalEditor | null>(null);
  usePaatosteksti('');

  useEffect(() => {
    importHtml(
      editorRef.current,
      '<h1>Moi!</h1><p>toiehrjlsafhesjlf</p><p>fsefesfsefesfsfes</p>',
    );
  }, []);

  return (
    <Stack direction="column" sx={{ width: '100%', marginRight: 3, gap: 1 }}>
      <OphTypography variant={'h2'}>
        {t('hakemus.editori.paatos.otsikko')}
      </OphTypography>
      <Editor editorRef={editorRef}></Editor>
      <OphButton
        onClick={() => {
          console.log(exportHtml(editorRef.current));
        }}
      >
        {t('hakemus.editori.paatos.vahvista')}
      </OphButton>
    </Stack>
  );
}
