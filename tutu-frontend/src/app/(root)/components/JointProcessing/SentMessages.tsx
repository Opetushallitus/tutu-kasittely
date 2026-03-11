import { Table, TableContainer, TableHead, TableRow } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import * as R from 'remeda';

import MessageRow from '@/src/app/(root)/components/JointProcessing/MessageRow';
import StyledTableBody from '@/src/app/(root)/components/StyledTableBody';
import { User } from '@/src/lib/types/user';
import { YhteisenKasittelynViesti } from '@/src/lib/types/yhteisenKasittelynViesti';
import { setQueryStateAndLocalStorage } from '@/src/lib/utils';

import TableSortLabel from '../TableSortLabel';

const FIELD_KEYS = {
  lahetetty: 'lahetetty',
  tila: 'tila',
  hakijanNimi: 'hakija',
  asiatunnus: 'asiatunnus',
};

export default function SentMessages({
  messageList,
  user,
}: {
  messageList: YhteisenKasittelynViesti[] | null;
  user: User | null;
}) {
  const queryClient = useQueryClient();
  const [sortDef, setSortDef] = useQueryState('sort', {
    ...parseAsString.withDefault('tila:asc'),
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
                mainKey="yhteinenKasittely"
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
