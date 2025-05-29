export type SortOrder = 'asc' | 'desc';

//placeholder, oikeat tilat pitää määrittää fiksummin
export const kasittelyTilat = ['kasittelyssa', 'kasitelty'] as const;

export type KasittelyTila = (typeof kasittelyTilat)[number];

export const hakemusKoskeeQueryStates = ['', '0', '1', '2', '3'] as const;

export type HakemusKoskeeQueryState = (typeof hakemusKoskeeQueryStates)[number];

export const naytaQueryStates = ['kaikki', 'omat'] as const;

export type NaytaQueryState = (typeof naytaQueryStates)[number];

export const hakemusKoskeeOptions: Array<{
  value: string;
  label: string;
}> = [
  { value: '', label: '' },
  { value: '0', label: 'tutkinnon-tason-rinnakkaistaminen' },
  { value: '1', label: 'kelpoisuus-ammattiin' },
  { value: '2', label: 'tutkinto-suoritus-rinnakkaistaminen' },
  { value: '3', label: 'riittavat-opinnot' },
];
