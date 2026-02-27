'use client';

import { useNavigationGuard } from 'next-navigation-guard';
import { useEffect } from 'react';

import { showUnsavedDialog } from '../components/providers/UnsavedGuardProvider';

const navigationApi =
  typeof window !== 'undefined' ? window.navigation : undefined;

export function useUnsavedChanges(enabled: boolean, onDiscard?: () => void) {
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
      showUnsavedDialog((accepted) => {
        if (accepted) {
          onDiscard?.();
          if (destinationKey != null) {
            // Set flag for re-triggered event
            resuming = true;
            navigationApi.traverseTo(destinationKey);
          }
        }
      });
    };

    navigationApi.addEventListener('navigate', handleNavigate);
    return () => navigationApi.removeEventListener('navigate', handleNavigate);
  }, [enabled, onDiscard]);

  // Handles nextjs links and others that don't trigger the native navigation API.
  const guard = useNavigationGuard({
    enabled: () => enabled,
  });

  useEffect(() => {
    if (guard.active) {
      showUnsavedDialog((accepted) => {
        if (accepted) {
          onDiscard?.();
          guard.accept();
        } else {
          guard.reject();
        }
      });
    }
  }, [guard, enabled, onDiscard]);
}
