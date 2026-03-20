import { RefObject, useCallback, useEffect } from 'react';

export const useCloseOnClickOutside = (
  ref: RefObject<HTMLElement | null>,
  onClick: () => void,
) => {
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
        onClick();
      }
    },
    [ref, onClick],
  );
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);
};
