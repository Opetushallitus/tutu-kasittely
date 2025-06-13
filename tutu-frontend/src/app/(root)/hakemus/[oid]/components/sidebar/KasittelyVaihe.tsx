'use client';
import { Stack, styled, useTheme } from '@mui/material';
import {
  ophColors,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import * as R from 'remeda';
import { kasittelyTilat } from '@/src/app/(root)/components/types';
import React from 'react';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import { StyledLink } from '@/src/app/(root)/hakemus/[oid]/components/StyledLink';
import { CenteredRow } from '@/src/app/(root)/hakemus/[oid]/components/CenteredRow';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useHakemus } from '@/src/context/HakemusContext';

const OpenInNewIconBlue = styled(OpenInNewIcon)({
  color: ophColors.blue2,
  paddingTop: '3px',
});

const KasittelyvaiheStack = styled(Stack)(({ theme }) => ({
  backgroundColor: ophColors.green5,
  padding: theme.spacing(1, 1),
}));

export const KasittelyVaihe = ({ showExtended }: { showExtended: boolean }) => {
  const theme = useTheme();
  const { t } = useTranslations();
  const { hakemus } = useHakemus();

  return (
    <KasittelyvaiheStack gap={theme.spacing(2)}>
      <Stack direction="column" gap={theme.spacing(1)}>
        <OphTypography variant={'h4'}>
          {t('hakemus.sivupalkki.kasittelyvaihe')}
        </OphTypography>
        {showExtended ? (
          <OphSelectFormField
            options={R.map(kasittelyTilat, (tila) => ({
              label: tila,
              value: tila,
            }))}
            defaultValue={kasittelyTilat[0]}
          ></OphSelectFormField>
        ) : (
          <OphTypography variant={'label'}>Alkukäsittely kesken</OphTypography>
        )}
      </Stack>
      <Stack direction="column" gap={theme.spacing(1)}>
        <OphTypography variant={'h4'}>
          {t('hakemus.sivupalkki.hakemuspalvelunvaihe')}
        </OphTypography>
        <OphTypography
          variant={'label'}
          data-testid={'hakemus-sidebar-ataruhakemus-tila'}
        >
          {t(
            `hakemus.ataruhakemuksentila.${hakemus?.ataruHakemuksenTila.toLowerCase()}`,
          )}
        </OphTypography>
      </Stack>
      {showExtended && (
        <StyledLink href="/">
          <CenteredRow gap={theme.spacing(1)}>
            {t('hakemus.sivupalkki.muokkaa')}
            <OpenInNewIconBlue />
          </CenteredRow>
        </StyledLink>
      )}
    </KasittelyvaiheStack>
  );
};
