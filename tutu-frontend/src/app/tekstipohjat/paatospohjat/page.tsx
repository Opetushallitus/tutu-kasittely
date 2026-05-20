'use client';

import { Stack } from '@mui/material';
import { useState } from 'react';

import TekstipohjaLista from '@/src/app/tekstipohjat/components/TekstipohjaLista';
import PaatospohjaEditori from '@/src/app/tekstipohjat/paatospohjat/components/PaatospohjaEditori';
import { usePaatospohjat } from '@/src/hooks/usePaatospohjat';

export default function PaatospohjatPage() {
  const { paatospohjat, kategoriat, tallennaKategoria } = usePaatospohjat();
  // const { addToast } = useToaster();
  // const { t } = useTranslations();

  const [valittuPaatospohjaId, setValittuPaatospohjaId] = useState<
    string | null | undefined
  >(null);

  // useEffect(() => {
  //   handleFetchError(
  //     addToast,
  //     paatospohjatError,
  //     'virhe.viestipohjatLataus',
  //     t,
  //   );
  //   handleFetchError(
  //     addToast,
  //     kategoriatError,
  //     'virhe.viestipohjaKategoriatLataus',
  //     t,
  //   );
  //   handleFetchError(
  //     addToast,
  //     tallennaKategoriaError,
  //     'virhe.viestipohjaKategoriatTallennus',
  //     t,
  //   );
  // }, [viestipohjatError, kategoriatError, tallennaKategoriaError, addToast, t]);

  // if (viestipohjatLoading || kategoriatLoading || tallennaKategoriaPending) {
  //   return <FullSpinner />;
  // }

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
