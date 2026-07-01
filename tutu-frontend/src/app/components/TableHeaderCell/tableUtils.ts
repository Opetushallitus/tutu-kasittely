export type SortDirection = 'asc' | 'desc';

export const getSortParts = (sortStr?: string, colId?: string) => {
  const [orderBy, direction] = sortStr?.split(':') ?? [];

  if (
    (colId === undefined || colId === orderBy) &&
    (direction === 'asc' || direction === 'desc')
  ) {
    return { orderBy, direction } as {
      orderBy: string;
      direction: SortDirection;
    };
  }
  return {
    orderBy: undefined,
    direction: undefined,
  };
};
