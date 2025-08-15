export const emptyOption: Array<{
  value: string;
  label: string;
}> = [
  {
    value: '',
    label: '',
  },
];

export const hakemusKoskeeOptions: Array<{
  value: string;
  label: string;
}> = [
  { value: '0', label: 'tutkinnonTasonRinnakkaistaminen' },
  { value: '1', label: 'kelpoisuusAmmattiin' },
  { value: '2', label: 'tutkintoSuoritusRinnakkaistaminen' },
  { value: '3', label: 'riittavatOpinnot' },
  { value: '4', label: 'kelpoisuusAmmattiinAPHakemus' },
].sort((a, b) => a.label.localeCompare(b.label));
