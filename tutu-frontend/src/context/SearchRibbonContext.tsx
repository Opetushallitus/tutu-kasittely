'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import { HakemusListItem } from '@/src/lib/types/hakemusListItem';

type SearchRibbonContextValue = {
  searchResults: HakemusListItem[] | null;
  setSearchResults: (results: HakemusListItem[] | null) => void;
  selectedOid: string | null;
  setSelectedOid: (oid: string | null) => void;
  originalOid: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (total: number) => void;
  ribbonVisible: boolean;
  setRibbonVisible: (visible: boolean) => void;
  closeRibbon: () => void;
  registerOnClose: (fn: () => void) => void;
};

export const SearchRibbonContext =
  createContext<SearchRibbonContextValue | null>(null);

export const useSearchRibbon = () => {
  const ctx = useContext(SearchRibbonContext);
  if (!ctx)
    throw new Error('useSearchRibbon must be used within SearchRibbonProvider');
  return ctx;
};

export const SearchRibbonProvider = ({
  originalOid,
  children,
}: {
  originalOid: string;
  children: ReactNode;
}) => {
  const [selectedOid, setSelectedOid] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<HakemusListItem[] | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ribbonVisible, setRibbonVisible] = useState(false);

  const onCloseRef = useRef<(() => void) | null>(null);
  const registerOnClose = useCallback((fn: () => void) => {
    onCloseRef.current = fn;
  }, []);

  const closeRibbon = useCallback(() => {
    setSelectedOid(null);
    setSearchResults(null);
    setRibbonVisible(false);
    onCloseRef.current?.();
  }, []);

  return (
    <SearchRibbonContext.Provider
      value={{
        searchResults,
        setSearchResults,
        selectedOid,
        setSelectedOid,
        originalOid,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        ribbonVisible,
        setRibbonVisible,
        closeRibbon,
        registerOnClose,
      }}
    >
      {children}
    </SearchRibbonContext.Provider>
  );
};
