'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface TekstipohjatContextType {
  showTekstipohjaLista: boolean;
  setShowTekstipohjaLista: (show: boolean) => void;
}

const ShowTekstipohjaContext = createContext<
  TekstipohjatContextType | undefined
>(undefined);

export const ShowTekstipohjaContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [showTekstipohjaLista, setShowTekstipohjaLista] = useState(false);

  return (
    <ShowTekstipohjaContext.Provider
      value={{ showTekstipohjaLista, setShowTekstipohjaLista }}
    >
      {children}
    </ShowTekstipohjaContext.Provider>
  );
};

export const useShowTekstipohjat = () => {
  const context = useContext(ShowTekstipohjaContext);
  if (context === undefined) {
    throw new Error(
      'useShowTekstipohjat must be used within a ShowTekstipohjaContextProvider',
    );
  }
  return context;
};
