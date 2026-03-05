import {
  Stack,
  Table,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { format } from 'date-fns';
import { parseAsString, useQueryState } from 'nuqs';
import * as R from 'remeda';

import { TableHeaderCell } from '@/src/app/(root)/components/TableHeaderCell';
import { StyledTableBody } from '@/src/components/StyledTableBody';
import { StyledTableCell } from '@/src/components/StyledTableCell';
import { DATE_TIME_PLACEHOLDER } from '@/src/constants/constants';
import {
  useVahvistetutViestit,
  VAHVISTETUT_VIESTIT_SORT_KEY,
} from '@/src/hooks/useVahvistetutViestit';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { VahvistettuViestiListItem } from '@/src/lib/types/viesti';

const FIELD_KEYS_ARRAY = [
  'hakemus.viesti.lista.vahvistettu',
  'hakemus.viesti.tyyppi',
  'hakemus.viesti.otsikko',
];

const SORTABLE_FIELDS = ['vahvistettu'];

const isSortableField = (fieldKey: string) =>
  SORTABLE_FIELDS.includes(fieldKey.split('.').at(-1)!);

export const VahvistettuList = ({
  t,
  theme,
  hakemusOid,
}: {
  t: TFunction;
  theme: Theme;
  hakemusOid: string;
}) => {
  const [sortDef, setSortDef] = useQueryState('vahvistetutSort', {
    ...parseAsString.withDefault('vahvistusPvm:desc'),
    clearOnDefault: false,
  });

  const { viestiLista, refresh } = useVahvistetutViestit(hakemusOid);

  const handleSort = (sortDef: string) => {
    setSortDef(sortDef);
    localStorage.setItem(VAHVISTETUT_VIESTIT_SORT_KEY, sortDef);
    refresh();
  };

  return (
    <Stack gap={theme.spacing(3)}>
      <OphTypography variant={'h3'}>
        {t('hakemus.viesti.listanOtsikko')}
      </OphTypography>
      <TableContainer>
        <Table data-testid={'muutoshistoria-table'}>
          <TableHead>
            <TableRow>
              {R.map(FIELD_KEYS_ARRAY, (fieldKey) => (
                <TableHeaderCell
                  key={fieldKey}
                  colId={fieldKey.split('.').at(-1)}
                  title={t(fieldKey)}
                  sort={sortDef}
                  setSort={handleSort}
                  sortable={isSortableField(fieldKey)}
                ></TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <StyledTableBody>
            {R.map(viestiLista || [], (viesti: VahvistettuViestiListItem) => (
              <TableRow key={viesti.id}>
                <StyledTableCell>
                  {format(
                    Date.parse(viesti.vahvistettu),
                    DATE_TIME_PLACEHOLDER,
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {t(`hakemus.viesti.${viesti.tyyppi}`)}
                </StyledTableCell>
                <StyledTableCell>{viesti.otsikko}</StyledTableCell>
              </TableRow>
            ))}
          </StyledTableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
