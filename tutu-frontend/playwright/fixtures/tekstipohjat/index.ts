import { _tekstipohjatKategorioittain } from '@/playwright/fixtures/tekstipohjat/_tekstipohjatKategorioittain';
import { KategorianTekstipohjat } from '@/src/lib/types/viesti';

export const mockTekstipohjatKategorioittain = (): KategorianTekstipohjat[] => {
  return _tekstipohjatKategorioittain;
};
