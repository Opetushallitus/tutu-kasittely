'use client';
import { Stack, styled, useTheme } from '@mui/material';
import {
  ophColors,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import * as R from 'remeda';
import { kasittelyVaiheet } from '@/src/app/(root)/components/types';
import React from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { StyledLink } from '@/src/components/StyledLink';
import { CenteredRow } from '@/src/components/CenteredRow';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useHakemus } from '@/src/context/HakemusContext';
import { useKasittelyvaiheTranslation } from '@/src/lib/localization/hooks/useKasittelyvaiheTranslation';

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
  const {
    hakemusState: { editedData: hakemus },
  } = useHakemus();
  const kasittelyVaiheTranslation = useKasittelyvaiheTranslation(hakemus);

  return (
    <KasittelyvaiheStack gap={theme.spacing(2)}>
      <Stack direction="column" gap={theme.spacing(1)}>
        <OphTypography variant={'h4'}>
          {t('hakemus.sivupalkki.kasittelyvaihe')}
        </OphTypography>
        {showExtended ? (
          <OphSelectFormField
            placeholder={t('yleiset.valitse')}
            options={R.map(kasittelyVaiheet, (vaihe) => ({
              label: t(`hakemus.kasittelyvaihe.${vaihe.toLowerCase()}`),
              value: vaihe,
            }))}
            defaultValue={kasittelyVaiheet[0]}
          ></OphSelectFormField>
        ) : (
          <OphTypography
            variant={'label'}
            data-testid={'hakemus-sidebar-kasittelyvaihe'}
          >
            {kasittelyVaiheTranslation}
          </OphTypography>
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
