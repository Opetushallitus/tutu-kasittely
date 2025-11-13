'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ShowPaatosTekstiPreviewContextType {
  ShowPaatosTekstiPreview: boolean;
  setShowPaatosTekstiPreview: (value: boolean) => void;
}

const ShowPaatosTekstiPreviewContext = createContext<
  ShowPaatosTekstiPreviewContextType | undefined
>(undefined);

export const ShowPaatosTekstiPreviewProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [ShowPaatosTekstiPreview, setShowPaatosTekstiPreview] = useState(false);

  return (
    <ShowPaatosTekstiPreviewContext.Provider
      value={{ ShowPaatosTekstiPreview, setShowPaatosTekstiPreview }}
    >
      {children}
    </ShowPaatosTekstiPreviewContext.Provider>
  );
};

export const useShowPaatosTekstiPreview = () => {
  const context = useContext(ShowPaatosTekstiPreviewContext);
  if (context === undefined) {
    throw new Error(
      'useShowPaatosTekstiPreview must be used within a ShowPaatosTekstiPreviewProvider',
    );
  }
  return context;
};
