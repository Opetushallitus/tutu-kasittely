import { useAuthorizedUser } from '@/components/providers/AuthorizedUserProvider';
import { LanguageCode } from '@/lib/types/common';

export const useAsiointiKieli = () => {
  const user = useAuthorizedUser();
  return (user?.asiointikieli as LanguageCode) ?? 'fi';
};
