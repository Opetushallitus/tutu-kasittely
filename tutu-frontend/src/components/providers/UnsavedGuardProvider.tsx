'use client';

import { useState } from 'react';

import { UnsavedChangesDialog } from '@/src/components/UnsavedChangesDialog';

type Resolver = (accepted: boolean) => void;

let setResolver: (fn: () => Resolver) => void = () => {};

export function showUnsavedDialog(resolve: Resolver) {
  setResolver(() => resolve);
}

export const UnsavedGuardProvider = () => {
  const [resolver, setResolverState] = useState<Resolver | null>(null);
  setResolver = setResolverState;

  return (
    <UnsavedChangesDialog
      active={resolver !== null}
      accept={() => {
        resolver?.(true);
        setResolverState(null);
      }}
      reject={() => {
        resolver?.(false);
        setResolverState(null);
      }}
    />
  );
};
