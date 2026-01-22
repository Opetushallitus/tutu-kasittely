'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useUnsavedChanges(isDirty: boolean) {
  const router = useRouter();

  // Estä refresh / tabin sulkeminen
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Estä back / forward
  useEffect(() => {
    if (!isDirty) return;

    const handlePopState = () => {
      const confirmLeave = confirm(
        'Sinulla on tallentamatonta dataa. Haluatko varmasti poistua?',
      );

      if (!confirmLeave) {
        history.pushState(null, '', location.href);
      }
    };

    history.pushState(null, '', location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty]);

  return {
    push: (href: string) => {
      if (
        !isDirty ||
        confirm('Sinulla on tallentamatonta dataa. Haluatko varmasti poistua?')
      ) {
        router.push(href);
      }
    },
  };
}
