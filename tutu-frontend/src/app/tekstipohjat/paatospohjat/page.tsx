'use client';

import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';

import TekstipohjaLista from '@/src/app/tekstipohjat/components/TekstipohjaLista';
import PaatospohjaEditori from '@/src/app/tekstipohjat/paatospohjat/components/PaatospohjaEditori';
import { FullSpinner } from '@/src/components/FullSpinner';
import { usePaatospohjat } from '@/src/hooks/usePaatospohjat';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { handleFetchError } from '@/src/lib/utils';

export default function PaatospohjatPage() {
  const {
    paatospohjat,
    kategoriat,
    tallennaKategoria,
    paatospohjatError,
    kategoriatError,
    tallennaKategoriaError,
    kategoriatLoading,
    paatospohjatLoading,
    tallennaKategoriaPending,
  } = usePaatospohjat();
  const { addToast } = useToaster();
  const { t } = useTranslations();

  const [valittuPaatospohjaId, setValittuPaatospohjaId] = useState<
    string | null | undefined
  >(null);

  useEffect(() => {
    handleFetchError(
      addToast,
      paatospohjatError,
      'virhe.paatospohjatLataus',
      t,
    );
    handleFetchError(
      addToast,
      kategoriatError,
      'virhe.paatospohjaKategoriatLataus',
      t,
    );
    handleFetchError(
      addToast,
      tallennaKategoriaError,
      'virhe.paatospohjaKategoriatTallennus',
      t,
    );
  }, [paatospohjatError, kategoriatError, tallennaKategoriaError, addToast, t]);

  if (paatospohjatLoading || kategoriatLoading || tallennaKategoriaPending) {
    return <FullSpinner />;
  }

  return (
    <Stack
      direction={'row'}
      sx={{ minHeight: '1200px' }}
      justifyContent={'space-between'}
    >
      <PaatospohjaEditori
        kategoriat={kategoriat ?? []}
        valittuPaatospohjaId={valittuPaatospohjaId}
        setValittuPaatospohjaId={setValittuPaatospohjaId}
      />
      <TekstipohjaLista
        pohjat={paatospohjat ?? []}
        kategoriat={kategoriat ?? []}
        setValittuId={setValittuPaatospohjaId}
        tallennaKategoria={tallennaKategoria}
        tPrefix={'tekstipohjat.paatospohjat'}
      />
    </Stack>
  );
}
