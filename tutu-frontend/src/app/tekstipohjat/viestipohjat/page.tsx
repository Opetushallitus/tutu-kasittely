'use client';

import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';

import { FullSpinner } from '@/src/components/FullSpinner';
import useToaster from '@/src/hooks/useToaster';
import { useViestipohjat } from '@/src/hooks/useViestipohjat';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { handleFetchError } from '@/src/lib/utils';

import ViestipohjaEditori from './components/ViestipohjaEditori';
import TekstipohjaLista from '../components/TekstipohjaLista';

export default function ViestipohjatPage() {
  const {
    viestipohjat,
    kategoriat,
    tallennaKategoria,
    viestipohjatError,
    tallennaKategoriaError,
    kategoriatError,
    viestipohjatLoading,
    kategoriatLoading,
    tallennaKategoriaPending,
  } = useViestipohjat();
  const { addToast } = useToaster();
  const { t } = useTranslations();

  const [valittuViestipohjaId, setValittuViestipohjaId] = useState<
    string | null | undefined
  >(null);

  useEffect(() => {
    handleFetchError(
      addToast,
      viestipohjatError,
      'virhe.viestipohjatLataus',
      t,
    );
    handleFetchError(
      addToast,
      kategoriatError,
      'virhe.viestipohjaKategoriatLataus',
      t,
    );
    handleFetchError(
      addToast,
      tallennaKategoriaError,
      'virhe.viestipohjaKategoriatTallennus',
      t,
    );
  }, [viestipohjatError, kategoriatError, tallennaKategoriaError, addToast, t]);

  if (viestipohjatLoading || kategoriatLoading || tallennaKategoriaPending) {
    return <FullSpinner />;
  }

  return (
    <Stack
      direction={'row'}
      sx={{ minHeight: '1200px' }}
      justifyContent={'space-between'}
    >
      <ViestipohjaEditori
        kategoriat={kategoriat ?? []}
        valittuViestipohjaId={valittuViestipohjaId}
        setValittuViestipohjaId={setValittuViestipohjaId}
      />
      <TekstipohjaLista
        pohjat={viestipohjat ?? []}
        kategoriat={kategoriat ?? []}
        setValittuId={setValittuViestipohjaId}
        tallennaKategoria={tallennaKategoria}
        tPrefix={'tekstipohjat.viestipohjat'}
      />
    </Stack>
  );
}
