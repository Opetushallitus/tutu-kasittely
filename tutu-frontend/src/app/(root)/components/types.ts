export type SortOrder = 'asc' | 'desc';

//placeholder, oikeat tilat pitää määrittää fiksummin
export const kasittelyTilat = ['kasittelyssa', 'kasitelty'] as const;

export type KasittelyTila = (typeof kasittelyTilat)[number];

export const hakemusKoskeeQueryStates = [
  { key: null, value: '' },
  { key: 0, value: 'tutkinnon-tason-rinnakkaistaminen' },
  { key: 1, value: 'kelpoisuus-ammattiin' },
  { key: 2, value: 'tutkinto-suoritus-rinnakkaistaminen' },
  { key: 3, value: 'riittavat-opinnot' },
] as const;

export type HakemusKoskeeQueryState = (typeof hakemusKoskeeQueryStates)[number];

export const naytaQueryStates = ['kaikki', 'omat'] as const;

export type NaytaQueryState = (typeof naytaQueryStates)[number];
