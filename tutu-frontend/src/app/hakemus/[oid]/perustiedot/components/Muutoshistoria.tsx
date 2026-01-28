import {
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import * as R from 'remeda';
import { match } from 'ts-pattern';

import { TableHeaderCell } from '@/src/app/(root)/components/TableHeaderCell';
import { DATE_TIME_PLACEHOLDER } from '@/src/constants/constants';
import { HAKEMUS_MUUTOSHISTORIA_SORT_KEY } from '@/src/context/HakemusContext';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { MuutosHistoriaItem } from '@/src/lib/types/hakemus';
import { setLocalStorageAndLaunchHakemusQuery } from '@/src/lib/utils';

const FIELD_KEYS_ARRAY = [
  'hakemus.perustiedot.muutoshistoria.muokattu',
  'hakemus.perustiedot.muutoshistoria.muokkaaja',
];

const SORTABLE_FIELDS = ['muokattu'];

const isSortableField = (fieldKey: string) =>
  SORTABLE_FIELDS.includes(fieldKey.split('.').at(-1)!);

const StyledTableRow = styled(TableRow)({
  '&:last-child td, &:last-child th': {
    borderBottom: 'none',
  },
});

export const Muutoshistoria = ({
  muutosHistoria,
}: {
  muutosHistoria: MuutosHistoriaItem[];
}) => {
  const { t } = useTranslations();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [sortDef, setSortDef] = useState('');

  const handleSort = (sortDef: string) => {
    setSortDef(sortDef);
    setLocalStorageAndLaunchHakemusQuery(
      queryClient,
      HAKEMUS_MUUTOSHISTORIA_SORT_KEY,
      sortDef,
    );
  };

  const muokkaajaTieto = (muutos: MuutosHistoriaItem) => {
    return match(muutos.role)
      .with(
        'Esittelija',
        () =>
          `${muutos.modifiedBy} (${t('hakemus.perustiedot.muutoshistoria.esittelija')})`,
      )
      .with(
        'Hakija',
        () =>
          `${muutos.modifiedBy} (${t('hakemus.perustiedot.muutoshistoria.hakija')})`,
      )
      .otherwise(() => muutos.modifiedBy);
  };

  return (
    <Stack gap={theme.spacing(3)}>
      <OphTypography variant={'h3'}>
        {t('hakemus.perustiedot.muutoshistoria.otsikko')}
      </OphTypography>
      <TableContainer>
        <Table data-testid={'muutoshistoria-table'}>
          <TableHead>
            <TableRow>
              {R.map(FIELD_KEYS_ARRAY, (fieldKey) => (
                <TableHeaderCell
                  key={fieldKey}
                  colId={fieldKey}
                  title={t(fieldKey)}
                  sort={sortDef}
                  setSort={handleSort}
                  sortable={isSortableField(fieldKey)}
                ></TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {R.map(muutosHistoria, (muutos) => (
              <StyledTableRow key={muutos.time}>
                <TableCell>
                  {format(Date.parse(muutos.time), DATE_TIME_PLACEHOLDER)}
                </TableCell>
                <TableCell>{muokkaajaTieto(muutos)}</TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
