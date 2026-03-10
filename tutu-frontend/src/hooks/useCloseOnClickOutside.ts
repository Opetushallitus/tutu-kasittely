import { RefObject, useEffect } from 'react';

export const useCloseOnClickOutside = (
  ref: RefObject<HTMLElement | undefined>,
  onClick: () => void,
) => {
  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
      onClick();
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
};
