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

export const syykoodit = [
  { koodi: 0, selite: 'hakemuslista.syykoodi.0' },
  { koodi: 1, selite: 'hakemuslista.syykoodi.1' },
  { koodi: 2, selite: 'hakemuslista.syykoodi.2' },
  { koodi: 3, selite: 'hakemuslista.syykoodi.3' },
];
