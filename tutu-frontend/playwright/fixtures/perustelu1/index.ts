import { Perustelu } from '@/src/lib/types/perustelu';

import _perustelu from './_perustelu.json';

export const getPerustelu = (): Perustelu => {
  return { ..._perustelu };
};
