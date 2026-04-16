import { useEffect, useMemo, useState } from 'react';
import { match, P } from 'ts-pattern';

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

  const maybeError: ErrorItem | null = useMemo(
    () =>
      match([
        viestiLoadingError,
        viestiUpdateError,
        vahvistusError,
        poistoError,
        listaError,
        sisaltoLoadingError,
      ])
        .with([P.not(P.nullish), null, null, null, null, null], () =>
          errorItem(viestiLoadingError!, 'virhe.viestinLataus', true),
        )
        .with([null, P.not(P.nullish), null, null, null, null], () =>
          errorItem(viestiUpdateError!, 'virhe.viestinPaivitys'),
        )
        .with([null, null, P.not(P.nullish), null, null, null], () =>
          errorItem(vahvistusError!, 'virhe.viestinVahvistus'),
        )
        .with([null, null, null, P.not(P.nullish), null, null], () =>
          errorItem(poistoError!, 'virhe.viestinPoisto'),
        )
        .with([null, null, null, null, P.not(P.nullish), null], () =>
          errorItem(listaError!, 'virhe.viestiListanLataus'),
        )
        .with([null, null, null, null, null, P.not(P.nullish)], () =>
          errorItem(sisaltoLoadingError!, 'virhe.viestiSisallonLataus'),
        )
        .otherwise(() => null),
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
      match([viestiUpdateSuccess, vahvistusSuccess, poistoSuccess])
        .with([true, false, false], () => 'hakemus.viesti.paivitetty')
        .with([false, true, false], () => 'hakemus.viesti.vahvistettu')
        .with([false, false, true], () => 'hakemus.viesti.poistettu')
        .otherwise(() => null),
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
