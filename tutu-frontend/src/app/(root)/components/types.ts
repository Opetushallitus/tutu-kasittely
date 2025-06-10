export type SortOrder = 'asc' | 'desc';

//placeholder, oikeat tilat pitää määrittää fiksummin
export const kasittelyTilat = [
  'alkukäsittely kesken',
  'käsittelyssä',
  'käsitelty',
] as const;

export type KasittelyTila = (typeof kasittelyTilat)[number];

export const hakemusKoskeeQueryStates = ['', '0', '1', '2', '3'] as const;

export type HakemusKoskeeQueryState = (typeof hakemusKoskeeQueryStates)[number];

export const naytaQueryStates = ['kaikki', 'omat'] as const;

export type NaytaQueryState = (typeof naytaQueryStates)[number];
