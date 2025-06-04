'use client';

import HomeIcon from '@mui/icons-material/HomeOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PageHeaderRow } from '@/src/app/(root)/hakemus/[oid]/components/PageHeaderRow';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import Link from 'next/link';
import { styled } from '@mui/material';

export default function HeaderPage() {
  const { t } = useTranslations();

  const StyledHomeIcon = styled(HomeIcon)({
    color: ophColors.blue2,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    paddingBottom: '2px',
  });

  const StyledLink = styled(Link)({
    color: ophColors.blue2,
    border: '2px solid',
    borderRadius: '5px',
    padding: '8px',
    height: '40px',
    width: '40px',
    display: 'flex',
    justifyContent: 'center',
  });

  const StyledChevronRightIcon = styled(ChevronRightIcon)({
    color: ophColors.grey400,
  });

  return (
    <PageHeaderRow>
      <StyledLink href={`/`}>
        <StyledHomeIcon />
      </StyledLink>
      <StyledChevronRightIcon />
      <OphTypography variant={'h2'} component={'h1'}>
        {t('hakemus.otsikko')}
      </OphTypography>
    </PageHeaderRow>
  );
}
