import { formatInTimeZone } from 'date-fns-tz';

// Formatoi Suomen aikavyöhykkeellä backendista tulevat timestampit
export const formatHelsinki = (
  value: string | Date | number,
  fmt: string,
): string => formatInTimeZone(new Date(value), 'Europe/Helsinki', fmt);

type Muokkaus = { muokattu?: string | null; muokkaaja?: string | null };

export function lastModifiedInArray(entries: Muokkaus[]): Muokkaus {
  let latest: Muokkaus = { muokattu: undefined, muokkaaja: undefined };

  if (!entries || entries.length === 0) {
    return latest;
  }

  let latestMs = 0;

  for (const e of entries) {
    if (!e.muokattu) continue;
    const t = new Date(e.muokattu).getTime();
    if (t && t > latestMs) {
      latest = e;
      latestMs = t;
    }
  }

  return latest;
}
