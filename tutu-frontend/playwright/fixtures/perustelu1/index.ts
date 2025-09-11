import { Perustelu } from '@/src/lib/types/perustelu';
import _perustelu from './_perustelu.json';

export const getPerustelu = () => {
  const perustelu: Perustelu = { ..._perustelu };
  return perustelu;
};
