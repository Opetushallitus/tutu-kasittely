'use client';
import { Divider, Stack, useTheme } from '@mui/material';
import { HakemusTabs } from '@/src/app/(root)/hakemus/[oid]/components/HakemusTabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { HakemusHeader } from '@/src/app/(root)/hakemus/[oid]/components/HakemusHeader';

export const HakemusDetailLayout = ({
  hakemusOid,
  children,
}: {
  hakemusOid: string;
  children: React.ReactNode;
}) => {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      spacing={theme.spacing(3, 3)}
      test-id="hakemus-detail-layout"
    >
      <HakemusTabs hakemusOid={hakemusOid}></HakemusTabs>
      <Stack direction="column" spacing={theme.spacing(0, 3)} width={'100%'}>
        <BoxWrapper sx={{ borderBottom: 0, paddingBottom: 0 }}>
          <HakemusHeader />
        </BoxWrapper>
        <BoxWrapper sx={{ borderTop: 0 }}>
          <Divider orientation="horizontal" flexItem />
          {children}
        </BoxWrapper>
      </Stack>
    </Stack>
  );
};
