import { useAuthorizedUser } from '@/src/app/contexts/AuthorizedUserProvider';
import { LanguageCode } from '@/src/lib/types/common';

export const useAsiointiKieli = () => {
  const user = useAuthorizedUser();
  return (user?.asiointikieli as LanguageCode) ?? 'fi';
};
