'use client';

import { ListAlt } from '@mui/icons-material';
import { Box, Stack } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { LexicalEditor } from 'lexical';
import React, { useEffect, useMemo, useRef } from 'react';

import { TekstipohjaEditori } from '@/src/app/tekstipohjat/components/TekstipohjaEditori';
import { importHtml } from '@/src/components/editor/editor-utils';
import { FullSpinner } from '@/src/components/FullSpinner';
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
    importHtml(editorRefs.fi.current, viestipohja?.sisalto.fi ?? '');
  }, [viestipohja?.sisalto.fi, editorRefs.fi]);

  useEffect(() => {
    importHtml(editorRefs.sv.current, viestipohja?.sisalto.sv ?? '');
  }, [viestipohja?.sisalto.sv, editorRefs.sv]);

  useEffect(() => {
    importHtml(editorRefs.en.current, viestipohja?.sisalto.en ?? '');
  }, [viestipohja?.sisalto.en, editorRefs.en]);

  const languages: Array<LanguageCode> = ['fi', 'sv', 'en'] as const;

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
      updateViestipohja(currentViestipohja, () => setValittuViestipohja(null));
    }
  };

  if (isViestipohjaLoading || !currentViestipohja) {
    return <FullSpinner />;
  }

  return (
    <TekstipohjaEditori
      id={viestipohja?.id}
      setValittuId={setValittuViestipohja}
      kategoriat={kategoriat}
      currentPohja={currentViestipohja}
      languages={languages}
      onSave={onSave}
      updateLocal={viestipohjaState.updateLocal}
      hasChanges={viestipohjaState.hasChanges}
      updateOngoing={updateOngoing}
      poistaPohja={() => poistaViestipohja(() => setValittuViestipohja(null))}
      editorRefs={editorRefs}
      translationKeyPrefix={'tekstipohjat.viestipohjat'}
    />
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

  const headerText = useMemo(() => {
    if (valittuViestipohjaId === null) {
      return t('tekstipohjat.viestipohjat');
    } else if (valittuViestipohjaId === undefined) {
      return t('tekstipohjat.viestipohjat.lisaa');
    } else {
      return t('tekstipohjat.viestipohjat.muokkaus');
    }
  }, [valittuViestipohjaId, t]);

  return (
    <Stack direction={'column'} gap={2} sx={{ marginTop: 4, width: '65%' }}>
      <OphTypography variant={'h2'}>{headerText}</OphTypography>
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
