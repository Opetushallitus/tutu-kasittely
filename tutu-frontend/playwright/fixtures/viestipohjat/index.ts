import { _viestipohjatKategorioittain } from '@/playwright/fixtures/viestipohjat/_viestipohjatKategorioittain';
import { KategorianTekstipohjat } from '@/src/lib/types/viesti';

export const mockViestipohjatKategorioittain = (): KategorianTekstipohjat[] => {
  return _viestipohjatKategorioittain;
};
