import { TableHeaderCell } from '@/src/app/(root)/components/TableHeaderCell';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

const TableSortLabel = (props: {
  mainKey: string;
  fieldKey: string;
  sortDef: string;
  handleSort: (sortDef: string) => void;
}) => {
  const { mainKey, fieldKey, sortDef, handleSort } = props;
  const { t } = useTranslations();
  return (
    <TableHeaderCell
      colId={fieldKey}
      sort={sortDef}
      title={t(`${mainKey}.${fieldKey}`)}
      setSort={handleSort}
      sortable={true}
    />
  );
};

export default TableSortLabel;
