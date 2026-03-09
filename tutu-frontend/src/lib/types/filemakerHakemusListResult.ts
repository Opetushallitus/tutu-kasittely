import { FilemakerHakemus } from '../utils/filemakerDataUtils';

export type FilemakerHakemusListResult = {
  items: FilemakerHakemus[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
