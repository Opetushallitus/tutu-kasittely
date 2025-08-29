export type Option = {
  value: string;
  label: string;
};

export const hakemusKoskeeOptions: Array<Option> = [
  { value: '0', label: 'tutkinnonTasonRinnakkaistaminen' },
  { value: '1', label: 'kelpoisuusAmmattiin' },
  { value: '2', label: 'tutkintoSuoritusRinnakkaistaminen' },
  { value: '3', label: 'riittavatOpinnot' },
  { value: '4', label: 'kelpoisuusAmmattiinAPHakemus' },
].sort((a, b) => a.label.localeCompare(b.label));
