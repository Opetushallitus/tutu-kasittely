import { Hakemus } from '@/lib/types/hakemus';
import { styled, TableCell, TableRow } from '@mui/material';

const StyledTableCell = styled(TableCell)({
  borderBottom: 'none',
});

export default function HakemusRow({ hakemus }: { hakemus: Hakemus }) {
  return (
    <TableRow>
      <StyledTableCell>{hakemus.hakija}</StyledTableCell>
      <StyledTableCell>{hakemus.asiatunnus}</StyledTableCell>
      <StyledTableCell>{hakemus.vaihe}</StyledTableCell>
      <StyledTableCell>{hakemus.paatostyyppi}</StyledTableCell>
      <StyledTableCell>{hakemus.aika}</StyledTableCell>
    </TableRow>
  );
}
