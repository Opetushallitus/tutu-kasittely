export type SortOrder = 'asc' | 'desc';

export const kasittelyVaiheet = [
  'AlkukasittelyKesken',
  'OdottaaTaydennysta',
  'OdottaaIMIVastausta',
  'OdottaaVahvistusta',
  'OdottaaLausuntoa',
  'ValmisKasiteltavaksi',
  'HakemustaTaydennetty',
  'HyvaksynnassaTaiLoppukasittelyssa',
  'HyvaksyttyEiLahetetty',
  'LoppukasittelyValmis',
] as const;

export type KasittelyVaihe = (typeof kasittelyVaiheet)[number];

export const hakemusKoskeeQueryStates = ['0', '1', '2', '3', '4'] as const;

export type HakemusKoskeeQueryState = (typeof hakemusKoskeeQueryStates)[number];

export const naytaQueryStates = ['kaikki', 'omat'] as const;

export type NaytaQueryState = (typeof naytaQueryStates)[number];
