export type SortOrder = 'asc' | 'desc';

export const kasittelyTilat = ['kasittelyssa', 'kasitelty'] as const;

export type kasittelyTila = (typeof kasittelyTilat)[number];
