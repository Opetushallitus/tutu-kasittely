import { OphSelectOption } from '@/src/components/OphSelect';

export const hakemusKoskeeOptions: Array<OphSelectOption<string>> = [
  { value: '0', label: 'tutkinnonTasonRinnastaminen' },
  { value: '1', label: 'kelpoisuusAmmattiin' },
  { value: '2', label: 'tutkintoSuoritusRinnastaminen' },
  { value: '3', label: 'riittavatOpinnot' },
  { value: '4', label: 'kelpoisuusAmmattiinAPHakemus' },
].sort((a, b) => a.label.localeCompare(b.label));
