import {
  styled,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { useQueryClient } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import * as R from 'remeda';

import MessageRow from '@/src/app/(root)/components/JointProcessing/MessageRow';
import { User } from '@/src/lib/types/user';
import { YhteisenKasittelynViesti } from '@/src/lib/types/yhteisenKasittelynViesti';
import { setQueryStateAndLocalStorage } from '@/src/lib/utils';

import TableSortLabel from '../TableSortLabel';

const StyledTableBody = styled(TableBody)({
  '& .MuiTableRow-root': {
    '&:nth-of-type(even)': {
      '.MuiTableCell-root': {
        backgroundColor: ophColors.grey50,
      },
    },
    '&:nth-of-type(odd)': {
      '.MuiTableCell-root': {
        backgroundColor: ophColors.white,
      },
    },
    '&:hover': {
      '.MuiTableCell-root': {
        backgroundColor: ophColors.lightBlue2,
      },
    },
  },
});

const FIELD_KEYS = {
  lahetetty: 'lahetetty',
  tila: 'tila',
  hakijanNimi: 'hakijanNimi',
  asiatunnus: 'asiatunnus',
};

export default function ReceivedMessages({
  messageList,
  user,
}: {
  messageList: YhteisenKasittelynViesti[] | null;
  user: User | null;
}) {
  const queryClient = useQueryClient();
  const [sortDef, setSortDef] = useQueryState('sort', {
    ...parseAsString.withDefault(''),
    clearOnDefault: false,
  });
  const messageRows =
    messageList && user
      ? R.map(messageList, (message, index) => {
          return <MessageRow message={message} key={index} />;
        })
      : [];

  const handleSort = async (sortDef: unknown) => {
    await setQueryStateAndLocalStorage(queryClient, setSortDef, sortDef);
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {R.map(Object.values(FIELD_KEYS), (fieldKey) => (
              <TableSortLabel
                mainKey="yhteineKasittely"
                key={fieldKey}
                fieldKey={fieldKey}
                sortDef={sortDef}
                handleSort={handleSort}
              />
            ))}
          </TableRow>
        </TableHead>
        <StyledTableBody data-testid={'saapuneet-viestit-list'} tabIndex={0}>
          {messageRows}
        </StyledTableBody>
      </Table>
    </TableContainer>
  );
}
