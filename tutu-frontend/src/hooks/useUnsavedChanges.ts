'use client';

import { useNavigationGuard } from 'next-navigation-guard';
import { useEffect } from 'react';

import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { registerAuthRedirectConfirmHandler } from '@/src/lib/navigation/authRedirect';

const navigationApi =
  typeof window !== 'undefined' ? window.navigation : undefined;

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

  // Navigation API: intercept back/forward (traverse) natively.
  useEffect(() => {
    if (!enabled || !navigationApi) {
      return;
    }

    let resuming = false;

    const handleNavigate = (e: NavigateEvent) => {
      if (e.navigationType !== 'traverse' || !e.cancelable) return;

      if (resuming) {
        resuming = false;
        return;
      }

      e.preventDefault();

      const destinationKey = e.destination.key;
      showConfirmation({
        header: t('yleiset.tallentamattomiaMuutoksia'),
        content: t('yleiset.lomakkeellaOnMuutoksia'),
        confirmButtonText: t('yleiset.jatkaTallentamatta'),
        cancelButtonText: t('yleiset.palaaTallentamaan'),
        confirmPrimary: false,
        handleConfirmAction: () => {
          onDiscard?.();
          if (destinationKey != null) {
            // Set flag for re-triggered event
            resuming = true;
            navigationApi.traverseTo(destinationKey);
          }
        },
      });
    };

    navigationApi.addEventListener('navigate', handleNavigate);
    return () => navigationApi.removeEventListener('navigate', handleNavigate);
  }, [enabled, onDiscard, t, showConfirmation]);

  // Handles nextjs links and others that don't trigger the native navigation API.
  const guard = useNavigationGuard({
    enabled: () => enabled,
  });

  useEffect(() => {
    if (guard.active) {
      showConfirmation({
        header: t('yleiset.tallentamattomiaMuutoksia'),
        content: t('yleiset.lomakkeellaOnMuutoksia'),
        confirmButtonText: t('yleiset.jatkaTallentamatta'),
        cancelButtonText: t('yleiset.palaaTallentamaan'),
        confirmPrimary: false,
        handleConfirmAction: () => {
          onDiscard?.();
          guard.accept();
        },
        handleCloseAction: () => {
          guard.reject();
        },
      });
    }
  }, [guard, enabled, onDiscard, t, showConfirmation]);
}
