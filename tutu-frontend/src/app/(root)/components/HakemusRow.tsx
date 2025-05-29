import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { styled, TableCell, TableRow } from '@mui/material';
import Link from 'next/link';
import { hakemusKoskeeOptions } from '@/src/app/(root)/components/types';

const StyledTableCell = styled(TableCell)({
  borderBottom: 'none',
});

export default function HakemusRow({ hakemus }: { hakemus: HakemusListItem }) {
  const hakemusKoskee = `hakemuslista.hakemuskoskee.${
    hakemusKoskeeOptions.find(
      (option) => option.value === String(hakemus.hakemusKoskee),
    )?.label || ''
  }`;
  console.log(hakemusKoskee);
  console.log(hakemus.hakemusKoskee);
  return (
    <TableRow data-testid={'hakemus-row'}>
      <StyledTableCell>
        <Link href={`/hakemus/${hakemus.hakemusOid}/perustiedot`}>
          {hakemus.hakija}
        </Link>
      </StyledTableCell>
      <StyledTableCell>{hakemus.asiatunnus}</StyledTableCell>
      <StyledTableCell>{hakemus.vaihe}</StyledTableCell>
      <StyledTableCell>{hakemusKoskee}</StyledTableCell>
      <StyledTableCell>{hakemus.aika}</StyledTableCell>
    </TableRow>
  );
}
