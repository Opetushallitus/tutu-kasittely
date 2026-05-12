'use client';

import { DeleteOutline, ListAlt } from '@mui/icons-material';
import { Box, Stack } from '@mui/material';
import {
  OphButton,
  ophColors,
  OphInputFormField,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { LexicalEditor } from 'lexical';
import React, { useEffect, useRef, useState } from 'react';

import { Tabs } from '@/src/app/(root)/components/Tabs';
import { Editor } from '@/src/components/editor/Editor';
import {
  importHtml,
  normalizedEditorContent,
} from '@/src/components/editor/editor-utils';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useEditableState } from '@/src/hooks/useEditableState';
import useToaster from '@/src/hooks/useToaster';
import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
import { useViestipohja } from '@/src/hooks/useViestipohja';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { LanguageCode } from '@/src/lib/types/common';
import { Viestipohja, ViestipohjaKategoria } from '@/src/lib/types/viesti';
import { handleFetchError } from '@/src/lib/utils';

const emptyViestipohja: Viestipohja = {
  nimi: '',
  kategoriaId: '',
  sisalto: {
    fi: '',
    sv: '',
    en: '',
  },
};

const ValittuViestipohja = ({
  viestipohjaId,
  kategoriat,
  setValittuViestipohja,
}: {
  viestipohjaId?: string;
  kategoriat: Array<ViestipohjaKategoria>;
  setValittuViestipohja: (valittuViestipohjaId?: string | null) => void;
}) => {
  const { t } = useTranslations();
  const { addToast } = useToaster();

  const {
    viestipohja,
    poistaViestipohja,
    isViestipohjaLoading,
    updateViestipohja,
    updateOngoing,
    viestipohjaLoadingError,
    viestipohjaUpdateError,
    poistoError,
  } = useViestipohja(viestipohjaId);

  const viestipohjaState = useEditableState(
    viestipohja ?? emptyViestipohja,
    updateViestipohja,
  );
  useUnsavedChanges(viestipohjaState.hasChanges);
  const currentViestipohja = viestipohjaState.editedData;

  const editorRefs = {
    fi: useRef<LexicalEditor | null>(null),
    en: useRef<LexicalEditor | null>(null),
    sv: useRef<LexicalEditor | null>(null),
  };

  useEffect(() => {
    importHtml(editorRefs.fi.current, currentViestipohja?.sisalto.fi ?? '');
  }, [currentViestipohja?.sisalto.fi, editorRefs.fi]);

  useEffect(() => {
    importHtml(editorRefs.sv.current, currentViestipohja?.sisalto.sv ?? '');
  }, [currentViestipohja?.sisalto.sv, editorRefs.sv]);

  useEffect(() => {
    importHtml(editorRefs.en.current, currentViestipohja?.sisalto.en ?? '');
  }, [currentViestipohja?.sisalto.en, editorRefs.en]);

  const languages: Array<LanguageCode> = ['fi', 'sv', 'en'];
  const [language, setLanguage] = useState<LanguageCode>('fi');

  useEffect(() => {
    handleFetchError(
      addToast,
      viestipohjaLoadingError,
      'virhe.viestipohjaLataus',
      t,
    );
    handleFetchError(
      addToast,
      viestipohjaUpdateError,
      'virhe.viestipohjaTallennus',
      t,
    );
    handleFetchError(addToast, poistoError, 'virhe.viestipohjaPoisto', t);
  }, [
    viestipohjaLoadingError,
    viestipohjaUpdateError,
    poistoError,
    addToast,
    t,
  ]);

  const onSave = () => {
    if (currentViestipohja) {
      updateViestipohja(currentViestipohja);
    }
  };

  if (isViestipohjaLoading || !currentViestipohja) {
    return <FullSpinner />;
  }

  return (
    <>
      <OphInputFormField
        label={t('viestipohjat.nimi')}
        value={currentViestipohja.nimi}
        onChange={(e) => {
          viestipohjaState.updateLocal({ nimi: e.target.value });
        }}
      ></OphInputFormField>
      <OphSelectFormField
        label={t('viestipohjat.kategoria')}
        value={currentViestipohja.kategoriaId}
        options={kategoriat.map((k) => ({ value: k.id, label: k.nimi }))}
        onChange={(e) => {
          viestipohjaState.updateLocal({
            kategoriaId: e.target.value,
          });
        }}
      />
      <Tabs
        buttons={languages.map((lang) => ({
          tabName: lang,
          onClick: () => setLanguage(lang),
          active: language === lang,
        }))}
        tPrefix={'viestipohjat.kieli'}
      ></Tabs>
      {languages.map((lang) => (
        <div
          style={{ display: language === lang ? 'block' : 'none' }}
          key={lang}
        >
          <Editor
            key={`viestipohja-editor-${lang}`}
            editorRef={editorRefs[lang]}
            onChange={(editor) => {
              viestipohjaState.updateLocal({
                sisalto: {
                  ...currentViestipohja.sisalto,
                  [lang]: normalizedEditorContent(editor),
                },
              });
            }}
          />
        </div>
      ))}
      <OphButton
        variant={viestipohja?.id ? 'text' : 'outlined'}
        onClick={() => {
          if (viestipohja?.id) {
            poistaViestipohja(() => setValittuViestipohja(null));
          } else {
            setValittuViestipohja(null);
          }
        }}
        sx={{ marginLeft: 'auto' }}
        startIcon={viestipohja?.id ? <DeleteOutline /> : undefined}
      >
        {t(viestipohja?.id ? 'viestipohjat.poista' : 'yleiset.peruuta')}
      </OphButton>
      <SaveRibbon
        onSave={onSave}
        isSaving={updateOngoing}
        hasChanges={viestipohjaState.hasChanges}
        lastSaved={viestipohja?.muokattu}
        modifier={viestipohja?.muokkaaja}
      />
    </>
  );
};

export default function ViestipohjaEditori({
  kategoriat,
  valittuViestipohjaId,
  setValittuViestipohjaId,
}: {
  kategoriat: Array<ViestipohjaKategoria>;
  valittuViestipohjaId?: string | null;
  setValittuViestipohjaId: (valittuViestipohjaId?: string | null) => void;
}) {
  const { t } = useTranslations();

  return (
    <Stack direction={'column'} gap={2} sx={{ marginTop: 4, width: '65%' }}>
      <OphTypography variant={'h2'}>
        {t('tekstipohjat.viestipohjat.muokkaus')}
      </OphTypography>
      {valittuViestipohjaId !== null ? (
        <ValittuViestipohja
          viestipohjaId={valittuViestipohjaId}
          setValittuViestipohja={setValittuViestipohjaId}
          kategoriat={kategoriat}
        />
      ) : (
        <Stack
          direction={'column'}
          gap={2}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Box
            sx={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: ophColors.grey50,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: ophColors.grey700,
              marginTop: 4,
            }}
          >
            <ListAlt color={'inherit'} fontSize={'medium'} />
          </Box>
          <OphTypography variant={'body1'}>
            {t('tekstipohjat.valitseViestipohja')}
          </OphTypography>
        </Stack>
      )}
    </Stack>
  );
}
