import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { registerAuthRedirectConfirmHandler } from '@/src/lib/navigation/authRedirect';

export function useUnsavedChanges(enabled: boolean, onDiscard?: () => void) {
  const { t } = useTranslations();
  const { showConfirmation } = useGlobalConfirmationModal();

  // Show ConfirmationModal if saving fails and user is redirected to login
  useEffect(() => {
    registerAuthRedirectConfirmHandler(async () => {
      if (!enabled) {
        return true;
      }

      return new Promise<boolean>((resolve) => {
        showConfirmation({
          header: t('yleiset.tallentamattomiaMuutoksia'),
          content: t('virhe.tallennus'),
          confirmButtonText: t('yleiset.jatkaTallentamatta'),
          cancelButtonText: t('yleiset.palaaTallentamaan'),
          confirmPrimary: false,
          handleConfirmAction: () => {
            onDiscard?.();
            resolve(true);
          },
          handleCloseAction: () => resolve(false),
        });
      });
    });

    return () => {
      registerAuthRedirectConfirmHandler(null);
    };
  }, [enabled, onDiscard, t, showConfirmation]);

  // React Router blocker: intercept in-app navigations (links, navigate())
  // as well as browser back/forward (POP). The data router manages history
  // itself, so the blocker handles every navigation type reliably and cross-
  // browser. Navigations that only change search params (e.g. nuqs) keep the
  // same pathname and are allowed through.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      enabled && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      showConfirmation({
        header: t('yleiset.tallentamattomiaMuutoksia'),
        content: t('yleiset.lomakkeellaOnMuutoksia'),
        confirmButtonText: t('yleiset.jatkaTallentamatta'),
        cancelButtonText: t('yleiset.palaaTallentamaan'),
        confirmPrimary: false,
        handleConfirmAction: () => {
          onDiscard?.();
          blocker.proceed();
        },
        handleCloseAction: () => {
          blocker.reset();
        },
      });
    }
  }, [blocker, onDiscard, t, showConfirmation]);
}
