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

export const hakuNakymaValintaOptions: Array<OphSelectOption> = [
  { value: 'kaikki', label: 'kaikki' },
  { value: 'perustiedot', label: 'perustiedot' },
  { value: 'asiakirjat', label: 'asiakirjat' },
  { value: 'tutkinnot', label: 'tutkinnot' },
  { value: 'perustelu-yleiset', label: 'perusteluYleiset' },
  { value: 'perustelu-uoro', label: 'perusteluUoro' },
  { value: 'perustelu-ap', label: 'perusteluAP' },
  { value: 'paatostiedot', label: 'paatostiedot' },
  { value: 'valitustiedot', label: 'valitustiedot' },
  { value: 'yhteinenkasittely', label: 'yhteinenkasittely' },
  { value: 'viestit', label: 'viestit' },
  { value: 'perustelumuistio', label: 'perustelumuistio' },
  { value: 'paatosteksti', label: 'paatosteksti' },
];
