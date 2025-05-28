import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { styled, TableCell, TableRow } from '@mui/material';
import Link from 'next/link';

const StyledTableCell = styled(TableCell)({
  borderBottom: 'none',
});

export default function HakemusRow({ hakemus }: { hakemus: HakemusListItem }) {
  return (
    <TableRow data-testid={'hakemus-row'}>
      <StyledTableCell>
        <Link href={`/hakemus/${hakemus.hakemusOid}/perustiedot`}>
          {hakemus.hakija}
        </Link>
      </StyledTableCell>
      <StyledTableCell>{hakemus.asiatunnus}</StyledTableCell>
      <StyledTableCell>{hakemus.vaihe}</StyledTableCell>
      <StyledTableCell>{hakemus.aika}</StyledTableCell>
    </TableRow>
  );
}
