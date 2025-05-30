import { LanguageCode } from '@/src/lib/types/common';
import { useAuthorizedUser } from '@/src/components/providers/AuthorizedUserProvider';

export const useAsiointiKieli = () => {
  const user = useAuthorizedUser();
  return (user?.asiointikieli as LanguageCode) ?? 'fi';
};
