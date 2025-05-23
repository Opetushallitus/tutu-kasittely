import { HakemusListItem } from '@/lib/types/hakemusListItem';
import { styled, TableCell, TableRow } from '@mui/material';

const StyledTableCell = styled(TableCell)({
  borderBottom: 'none',
});

export default function HakemusRow({ hakemus }: { hakemus: HakemusListItem }) {
  return (
    <TableRow data-testid={'hakemus-row'}>
      <StyledTableCell>{hakemus.hakija}</StyledTableCell>
      <StyledTableCell>{hakemus.asiatunnus}</StyledTableCell>
      <StyledTableCell>{hakemus.vaihe}</StyledTableCell>
      <StyledTableCell>{hakemus.paatostyyppi}</StyledTableCell>
      <StyledTableCell>{hakemus.aika}</StyledTableCell>
    </TableRow>
  );
}
