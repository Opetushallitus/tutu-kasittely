import { useAuthorizedUser } from '@/app/contexts/AuthorizedUserProvider';
import { LanguageCode } from '@/lib/types/common';

export const useAsiointiKieli = () => {
  const user = useAuthorizedUser();
  return (user?.asiointikieli as LanguageCode) ?? 'fi';
};
