import { useEffect, useMemo, useState } from 'react';

import useToaster from '@/src/hooks/useToaster';
import { useVahvistetutViestit } from '@/src/hooks/useVahvistetutViestit';
import { useViesti, useViestiOletusSisalto } from '@/src/hooks/useViesti';
import { errorItem, ErrorItem } from '@/src/lib/common';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Viestityyppi } from '@/src/lib/types/viesti';
import { handleFetchError, handleSuccessMessage } from '@/src/lib/utils';

export const useViestiAll = (hakemusOid?: string) => {
  const {
    isViestiLoading,
    viesti,
    viestiLoadingError,
    updateViesti,
    vahvistaViesti,
    poistaViesti,
    updateOngoing,
    vahvistusOngoing,
    viestiUpdateSuccess,
    viestiUpdateError,
    vahvistusSuccess,
    vahvistusError,
    poistoOngoing,
    poistoSuccess,
    poistoError,
  } = useViesti(hakemusOid);

  const {
    viestiLista,
    refresh: paivitaVahvistettuLista,
    isLoading: listaLoading,
    error: listaError,
  } = useVahvistetutViestit(hakemusOid);

  const [viestityyppi, setViestityyppi] = useState<Viestityyppi | null>(null);

  const {
    sisalto: oletusSisalto,
    isSisaltoLoading,
    sisaltoLoadingError,
  } = useViestiOletusSisalto(hakemusOid, viestityyppi);

  const maybeError: ErrorItem | undefined = useMemo(
    () =>
      [
        errorItem(viestiLoadingError, 'virhe.viestinLataus', true),
        errorItem(viestiUpdateError, 'virhe.viestinPaivitys'),
        errorItem(vahvistusError, 'virhe.viestinVahvistus'),
        errorItem(poistoError, 'virhe.viestinPoisto'),
        errorItem(listaError, 'virhe.viestiListanLataus'),
        errorItem(sisaltoLoadingError, 'virhe.viestiSisallonLataus'),
      ].find((err) => err.error),
    [
      listaError,
      poistoError,
      sisaltoLoadingError,
      vahvistusError,
      viestiLoadingError,
      viestiUpdateError,
    ],
  );

  const maybeSuccessMessage: string | null = useMemo(
    () =>
      [
        { when: viestiUpdateSuccess, value: 'hakemus.viesti.paivitetty' },
        {
          when: vahvistusSuccess,
          value: 'hakemus.viesti.vahvistettuJaKopioitu',
        },
        { when: poistoSuccess, value: 'hakemus.viesti.poistettu' },
      ].find((item) => item.when)?.value || null,
    [poistoSuccess, vahvistusSuccess, viestiUpdateSuccess],
  );

  const { addToast } = useToaster();
  const { t } = useTranslations();

  useEffect(() => {
    handleFetchError(
      addToast,
      maybeError?.error,
      maybeError?.translationKey || '',
      t,
    );
  }, [maybeError, addToast, t]);

  useEffect(() => {
    handleSuccessMessage(
      maybeSuccessMessage != null,
      addToast,
      maybeSuccessMessage!,
      t,
    );
  }, [addToast, t, maybeSuccessMessage]);

  // Käytännössä listan sisältö muuttuu vahvistuksen ja poiston seurauksena =>
  // asetetaan isLoading aktiiviseksi jo vahvistuksen/poiston aikana
  return {
    isLoading:
      isViestiLoading ||
      listaLoading ||
      isSisaltoLoading ||
      poistoOngoing ||
      vahvistusOngoing,
    viesti,
    viestiLista,
    oletusSisalto,
    updateViesti,
    vahvistaViesti,
    poistaViesti,
    paivitaVahvistettuLista,
    setViestityyppi,
    updateOngoing,
    maybeSuccessMessage,
    maybeError,
  };
};
