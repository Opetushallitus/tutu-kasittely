import { HakemusListItem } from './hakemusListItem';

export type HakemusListResult = {
  items: HakemusListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
