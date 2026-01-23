'use client';
import { OphTypography, ophColors } from '@opetushallitus/oph-design-system';
import React from 'react';
import { Stack, useTheme, styled } from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { StyledLink } from '@/src/components/StyledLink';
import { useHakemus } from '@/src/context/HakemusContext';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { CenteredRow } from '@/src/components/CenteredRow';
import { getConfiguration } from '@/src/lib/configuration/clientConfiguration';
import { ApHakemusBadge } from '../Badges';

const OpenInNewOutlinedIconBlue = styled(OpenInNewOutlinedIcon)({
  color: ophColors.blue2,
  fontSize: '1.2rem',
});

export const HakemusKoskee = () => {
  const theme = useTheme();
  const { t } = useTranslations();
  const VIRKAILIJA_URL = getConfiguration().VIRKAILIJA_URL;
  const { hakemusState } = useHakemus();

  const hakemus = hakemusState.editedData!;

  const isAPHakemus = hakemus.asiakirja.apHakemus;

  const hakemusKoskeeLabel = hakemusKoskeeOptions.find(
    (option) => option.value === String(hakemus.hakemusKoskee),
  )?.label;

  return (
    <Stack direction="column" gap={theme.spacing(0.25)}>
      <OphTypography variant={'h5'}>
        {t('hakemus.perustiedot.hakemusKoskee')}
      </OphTypography>
      <OphTypography variant={'body1'}>
        {t(`valinnat.hakemusKoskeeValinta.${hakemusKoskeeLabel ?? ''}`)}
      </OphTypography>
      {isAPHakemus && (
        <ApHakemusBadge
          sx={{
            alignSelf: 'flex-start',
          }}
          label={t('hakemus.apHakemus')}
        />
      )}
      <StyledLink
        href={`${VIRKAILIJA_URL}/lomake-editori/applications/${hakemus.lomakeOid}?application-key=${hakemus.hakemusOid}&ensisijaisesti=false`}
        target="_blank"
        rel="noopener"
        sx={{ fontWeight: 'normal' }}
      >
        <CenteredRow gap={theme.spacing(0.25)}>
          {t('hakemus.sivupalkki.avaaHakemus')}
          <OpenInNewOutlinedIconBlue />
        </CenteredRow>
      </StyledLink>
    </Stack>
  );
};
