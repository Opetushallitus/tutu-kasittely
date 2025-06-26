import { useTranslations } from '@/src/lib/localization/useTranslations';
import { TableHeaderCell } from '@/src/app/(root)/components/TableHeaderCell';

const TableSortLabel = (props: {
  fieldKey: string;
  sortDef: string;
  handleSort: (sortDef: string) => void;
}) => {
  const { fieldKey, sortDef, handleSort } = props;
  const { t } = useTranslations();
  return (
    <TableHeaderCell
      colId={fieldKey}
      sort={sortDef}
      title={t(fieldKey)}
      setSort={handleSort}
      sortable={true}
    />
  );
};

export default TableSortLabel;
