'use client';
import { Divider, Stack, useTheme } from '@mui/material';
import { HakemusTabs } from '@/src/components/HakemusTabs';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { HakemusHeader } from '@/src/components/HakemusHeader';
import { SideBar } from '@/src/components/sidebar/SideBar';
import { useShowPreview } from '@/src/context/ShowPreviewContext';

export const HakemusDetailLayout = ({
  hakemusOid,
  children,
}: {
  hakemusOid: string;
  children: React.ReactNode;
}) => {
  const theme = useTheme();
  const { showPaatosTekstiPreview } = useShowPreview();

  return (
    <Stack direction="row" spacing={theme.spacing(3, 3)}>
      <HakemusTabs hakemusOid={hakemusOid}></HakemusTabs>
      <Stack direction="column" spacing={theme.spacing(0, 3)} width={'100%'}>
        <BoxWrapper sx={{ borderBottom: 0, paddingBottom: 0 }}>
          <HakemusHeader />
        </BoxWrapper>
        <BoxWrapper sx={{ borderTop: 0 }}>
          <Divider orientation="horizontal" flexItem />
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ paddingTop: 2 }}
          >
            {children}
            {!showPaatosTekstiPreview && <SideBar />}
          </Stack>
        </BoxWrapper>
      </Stack>
    </Stack>
  );
};
