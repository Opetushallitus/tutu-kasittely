'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
  useMemo,
} from 'react';

import { HakemusListItem } from '@/src/lib/types/hakemusListItem';

type SearchRibbonContextValue = {
  searchResults: (HakemusListItem | undefined)[] | null;
  setPageResults: (page: number, items: HakemusListItem[]) => void;
  clearResults: () => void;
  selectedOid: string | null;
  setSelectedOid: (oid: string | null) => void;
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
  originalOid: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (total: number) => void;
  totalCount: number;
  setTotalCount: (total: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  ribbonVisible: boolean;
  setRibbonVisible: (visible: boolean) => void;
  closeRibbon: () => void;
  registerOnClose: (fn: () => void) => void;
  registerFetchPage: (fn: (page: number) => void) => void;
  fetchPage: (page: number) => void;
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // Merged results from per page results (may contain undefined), null for loading.
  const [results, setResults] = useState<
    (HakemusListItem | undefined)[] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [ribbonVisible, setRibbonVisible] = useState(false);

  const onCloseRef = useRef<(() => void) | null>(null);
  const fetchPageRef = useRef<((page: number) => void) | null>(null);
  const registerOnClose = useCallback((fn: () => void) => {
    onCloseRef.current = fn;
  }, []);

  const fetchPage = useCallback((page: number) => {
    fetchPageRef.current?.(page);
  }, []);

  const registerFetchPage = useCallback((fn: (page: number) => void) => {
    fetchPageRef.current = fn;
  }, []);

  const closeRibbon = useCallback(() => {
    setSelectedOid(null);
    setSelectedIndex(null);
    setResults(null);
    setRibbonVisible(false);
    onCloseRef.current?.();
  }, []);

  const setPageResults = useCallback(
    (page: number, items: HakemusListItem[]) =>
      setResults((prev) => {
        const base: (HakemusListItem | undefined)[] = prev ? [...prev] : [];
        for (const [index, item] of items.entries()) {
          const offset = (page - 1) * pageSize + index;
          base[offset] = item;
        }
        return base;
      }),
    [pageSize],
  );

  const clearResults = useCallback(() => {
    setTotalCount(0);
    setResults(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      searchResults: results,
      setPageResults,
      clearResults,
      selectedOid,
      setSelectedOid,
      selectedIndex,
      setSelectedIndex,
      originalOid,
      currentPage,
      setCurrentPage,
      totalPages,
      setTotalPages,
      totalCount,
      setTotalCount,
      pageSize,
      setPageSize,
      ribbonVisible,
      setRibbonVisible,
      closeRibbon,
      registerOnClose,
      registerFetchPage,
      fetchPage,
    }),
    [
      results,
      setPageResults,
      clearResults,
      selectedOid,
      selectedIndex,
      originalOid,
      currentPage,
      totalPages,
      totalCount,
      pageSize,
      ribbonVisible,
      closeRibbon,
      registerOnClose,
      registerFetchPage,
      fetchPage,
    ],
  );

  return (
    <SearchRibbonContext.Provider value={contextValue}>
      {children}
    </SearchRibbonContext.Provider>
  );
};
