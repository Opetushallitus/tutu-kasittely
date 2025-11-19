'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { usePathname } from 'next/navigation';

interface PreviewContextType {
  showPaatosTekstiPreview: boolean;
  setShowPaatosTekstiPreview: (value: boolean) => void;
  showPerusteluMuistioPreview: boolean;
  setShowPerusteluMuistioPreview: (value: boolean) => void;
}

const ShowPreviewContext = createContext<PreviewContextType | undefined>(
  undefined,
);

export const ShowPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [showPaatosTekstiPreview, setShowPaatosTekstiPreview] = useState(false);
  const [showPerusteluMuistioPreview, setShowPerusteluMuistioPreview] =
    useState(false);
  const pathName = usePathname();

  useEffect(() => {
    setShowPaatosTekstiPreview(false);
    setShowPerusteluMuistioPreview(false);
  }, [pathName, setShowPaatosTekstiPreview, setShowPerusteluMuistioPreview]);

  return (
    <ShowPreviewContext.Provider
      value={{
        showPaatosTekstiPreview: showPaatosTekstiPreview,
        setShowPaatosTekstiPreview,
        showPerusteluMuistioPreview: showPerusteluMuistioPreview,
        setShowPerusteluMuistioPreview,
      }}
    >
      {children}
    </ShowPreviewContext.Provider>
  );
};

export const useShowPreview = () => {
  const context = useContext(ShowPreviewContext);
  if (context === undefined) {
    throw new Error(
      'useShowPreview must be used within a ShowPaatosTekstiPreviewProvider',
    );
  }
  return context;
};
