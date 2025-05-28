export type SortOrder = 'asc' | 'desc';

//placeholder, oikeat tilat pitää määrittää fiksummin
export const kasittelyTilat = ['kasittelyssa', 'kasitelty'] as const;

export type KasittelyTila = (typeof kasittelyTilat)[number];

export const hakemusKoskeeQueryStates = [
  '',
  'kelpoisuus',
  'kelpoisuus-ap',
  'tutkinto-rinnakkaistaminen',
  'tutkinto-suoritus-rinnakkaistaminen',
] as const;

export type HakemusKoskeeQueryState = (typeof hakemusKoskeeQueryStates)[number];

export const naytaQueryStates = ['kaikki', 'omat'] as const;

export type NaytaQueryState = (typeof naytaQueryStates)[number];
