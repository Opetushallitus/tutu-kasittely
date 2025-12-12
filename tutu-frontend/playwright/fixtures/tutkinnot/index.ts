import { _tutkinnot } from '@/playwright/fixtures/tutkinnot/_tutkinnot';
import { Tutkinto } from '@/src/lib/types/tutkinto';

export const getMockTutkinnot = (): Tutkinto[] => {
  return _tutkinnot;
};
