import { formatInTimeZone } from 'date-fns-tz';

// Formatoi Suomen aikavyöhykkeellä backendista tulevat timestampit
export const formatHelsinki = (
  value: string | Date | number,
  fmt: string,
): string => formatInTimeZone(new Date(value), 'Europe/Helsinki', fmt);

// Formatoi UTC-aikavyöhykkeellä backendiin lähetettävät timestampit
export const formatUTC = (date: Date, fmt: string): string =>
  formatInTimeZone(date, 'UTC', fmt);
