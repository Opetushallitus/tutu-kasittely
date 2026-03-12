import { OphSelectOption } from '../lib/types/common';

// Katso HakemusKoskee hakemus.ts
export const hakemusKoskeeOptions: Array<OphSelectOption> = [
  { value: '0', label: 'tutkinnonTasonRinnastaminen' },
  { value: '1', label: 'kelpoisuusAmmattiin' },
  { value: '2', label: 'tutkintoSuoritusRinnastaminen' },
  { value: '3', label: 'riittavatOpinnot' },
  { value: '4', label: 'kelpoisuusAmmattiinAPHakemus' },
  { value: '5', label: 'lopullinenPaatos' },
].sort((a, b) => a.label.localeCompare(b.label));
