'use client';
import { Stack, useTheme } from '@mui/material';
import { HakemusTabs } from '@/src/app/(root)/hakemus/[oid]/components/HakemusTabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';

export const HakemusDetailLayout = ({
  hakemusOid,
  children,
}: {
  hakemusOid: string;
  children: React.ReactNode;
}) => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={theme.spacing(3, 3)}>
      <HakemusTabs hakemusOid={hakemusOid}></HakemusTabs>
      <BoxWrapper>{children}</BoxWrapper>
    </Stack>
  );
};
