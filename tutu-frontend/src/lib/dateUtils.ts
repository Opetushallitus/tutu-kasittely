import { formatInTimeZone } from 'date-fns-tz';

// Formatoi Suomen aikavyöhykkeellä backendista tulevat timestampit
export const formatHelsinki = (
  value: string | Date | number,
  fmt: string,
): string => formatInTimeZone(new Date(value), 'Europe/Helsinki', fmt);
