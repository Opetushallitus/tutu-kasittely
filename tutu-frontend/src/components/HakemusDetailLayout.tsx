'use client';
import { Divider, Stack, useTheme } from '@mui/material';
import React, { useEffect } from 'react';

import { BoxWrapper } from '@/src/components/BoxWrapper';
import { FullSpinner } from '@/src/components/FullSpinner';
import { HakemusHeader } from '@/src/components/HakemusHeader';
import { HakemusTabs } from '@/src/components/HakemusTabs';
import { SideBar } from '@/src/components/sidebar/SideBar';
import { useHakemus } from '@/src/context/HakemusContext';
import { useShowPreview } from '@/src/context/ShowPreviewContext';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { handleFetchError } from '@/src/lib/utils';

export const HakemusDetailLayout = ({
  hakemusOid,
  children,
}: {
  hakemusOid: string;
  children: React.ReactNode;
}) => {
  const theme = useTheme();
  const { t } = useTranslations();
  const { addToast } = useToaster();
  const { showPaatosTekstiPreview } = useShowPreview();
  const {
    isLoading,
    hakemusState: { editedData: hakemus },
    error,
  } = useHakemus();

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuksenLataus', t);
  }, [error, addToast, t]);

  if (error) {
    return <></>;
  }

  if (isLoading || !hakemus) return <FullSpinner></FullSpinner>;

  return (
    <Stack direction="row" spacing={theme.spacing(3, 3)}>
      <HakemusTabs
        hakemusOid={hakemusOid}
        hakemusKoskee={hakemus.hakemusKoskee}
      ></HakemusTabs>
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
            {!showPaatosTekstiPreview && <SideBar hakemusOid={hakemusOid} />}
          </Stack>
        </BoxWrapper>
      </Stack>
    </Stack>
  );
};
