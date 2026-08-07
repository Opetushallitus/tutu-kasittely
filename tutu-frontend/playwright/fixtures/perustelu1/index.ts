import _perustelu from './_perustelu.json';

import { Perustelu } from '@/src/lib/types/perustelu';

export const getPerustelu = (): Perustelu => {
  return { ..._perustelu };
};
