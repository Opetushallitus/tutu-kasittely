'use client';

import HomeIcon from '@mui/icons-material/Home';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { PageHeaderRow } from '@/src/app/(root)/hakemus/[oid]/components/PageHeaderRow';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import Link from 'next/link';

export default function HeaderPage() {
  const { t } = useTranslations();

  return (
    <PageHeaderRow>
      <Link href={`/`}>
        <HomeIcon />
      </Link>
      <ChevronRightIcon />
      <OphTypography variant={'h2'} component={'h1'}>
        {t('hakemus.otsikko')}
      </OphTypography>
    </PageHeaderRow>
  );
}
