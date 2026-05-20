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
import { usePaatospohja } from '@/src/hooks/usePaatospohja';
import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { LanguageCode } from '@/src/lib/types/common';
import {
  Paatospohja,
  PaatospohjaKategoria,
} from '@/src/lib/types/paatosteksti';

const emptyPaatospohja: Paatospohja = {
  nimi: '',
  kategoriaId: '',
  sisalto: {
    fi: '',
    sv: '',
  },
};

const ValittuPaatospohja = ({
  paatospohjaId,
  kategoriat,
  setValittuPaatospohja,
}: {
  paatospohjaId?: string;
  kategoriat: Array<PaatospohjaKategoria>;
  setValittuPaatospohja: (valittuPaatospohjaId?: string | null) => void;
}) => {
  const {
    paatospohja,
    updatePaatospohja,
    poistaPaatospohja,
    isPaatospohjaLoading,
  } = usePaatospohja(paatospohjaId);

  const paatospohjaState = useEditableState(
    paatospohja ?? emptyPaatospohja,
    updatePaatospohja,
  );
  useUnsavedChanges(paatospohjaState.hasChanges);
  const currentPaatospohja = paatospohjaState.editedData;

  const editorRefs = {
    fi: useRef<LexicalEditor | null>(null),
    sv: useRef<LexicalEditor | null>(null),
  };

  useEffect(() => {
    importHtml(editorRefs.fi.current, paatospohja?.sisalto.fi ?? '');
  }, [paatospohja?.sisalto.fi, editorRefs.fi]);

  useEffect(() => {
    importHtml(editorRefs.sv.current, paatospohja?.sisalto.sv ?? '');
  }, [paatospohja?.sisalto.sv, editorRefs.sv]);

  const languages: Array<LanguageCode> = ['fi', 'sv'] as const;

  // useEffect(() => {
  //   handleFetchError(
  //     addToast,
  //     viestipohjaLoadingError,
  //     'virhe.viestipohjaLataus',
  //     t,
  //   );
  //   handleFetchError(
  //     addToast,
  //     viestipohjaUpdateError,
  //     'virhe.viestipohjaTallennus',
  //     t,
  //   );
  //   handleFetchError(addToast, poistoError, 'virhe.viestipohjaPoisto', t);
  // }, [
  //   viestipohjaLoadingError,
  //   viestipohjaUpdateError,
  //   poistoError,
  //   addToast,
  //   t,
  // ]);

  const onSave = () => {
    if (currentPaatospohja) {
      updatePaatospohja(currentPaatospohja);
    }
  };

  if (isPaatospohjaLoading || !currentPaatospohja) {
    return <FullSpinner />;
  }

  return (
    <TekstipohjaEditori
      id={paatospohja?.id}
      setValittuId={setValittuPaatospohja}
      kategoriat={kategoriat}
      currentPohja={currentPaatospohja}
      languages={languages}
      onSave={onSave}
      updateLocal={paatospohjaState.updateLocal}
      hasChanges={paatospohjaState.hasChanges}
      updateOngoing={false}
      poistaPohja={poistaPaatospohja}
      editorRefs={editorRefs}
    />
  );
};

export default function PaatospohjaEditori({
  kategoriat,
  valittuPaatospohjaId,
  setValittuPaatospohjaId,
}: {
  kategoriat: Array<PaatospohjaKategoria>;
  valittuPaatospohjaId?: string | null;
  setValittuPaatospohjaId: (valittuPaatospohjaId?: string | null) => void;
}) {
  const { t } = useTranslations();

  const headerText = useMemo(() => {
    if (valittuPaatospohjaId === null) {
      return t('tekstipohjat.paatospohjat');
    } else if (valittuPaatospohjaId === undefined) {
      return t('tekstipohjat.paatospohjat.lisaa');
    } else {
      return t('tekstipohjat.paatospohjat.muokkaus');
    }
  }, [valittuPaatospohjaId, t]);

  return (
    <Stack direction={'column'} gap={2} sx={{ marginTop: 4, width: '65%' }}>
      <OphTypography variant={'h2'}>{headerText}</OphTypography>
      {valittuPaatospohjaId !== null ? (
        <ValittuPaatospohja
          paatospohjaId={valittuPaatospohjaId}
          setValittuPaatospohja={setValittuPaatospohjaId}
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
            {t('tekstipohjat.valitsePaatospohja')}
          </OphTypography>
        </Stack>
      )}
    </Stack>
  );
}
