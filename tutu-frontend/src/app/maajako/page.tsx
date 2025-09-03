'use client';

import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { BoxWrapper } from '@/src/components/BoxWrapper';

export default function MaajakoPage() {
  const { t } = useTranslations();
  return (
    <BoxWrapper sx={{ borderBottom: 'none' }}>
      <OphTypography variant={'body1'}>{t('maajako.kuvaus')}</OphTypography>
    </BoxWrapper>
  );
}
