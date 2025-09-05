'use client';

import { OphTypography } from '@opetushallitus/oph-design-system';
import { useEffect } from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { BoxWrapper } from '@/src/components/BoxWrapper';
import { useMaakoodit } from '@/src/hooks/useMaakoodit';
import { FullSpinner } from '@/src/components/FullSpinner';

export default function MaajakoPage() {
  const { t } = useTranslations();
  const { data: maakoodit, isLoading, error } = useMaakoodit();

  useEffect(() => {
    if (!isLoading && !error && maakoodit) {
      const names = maakoodit
        .filter((maakoodi) => maakoodi.esittelijaId === null)
        .map((maakoodi) => maakoodi.nimi)
        .join(', ');
      console.log(
        'TODO WORK IN PROGRESS OPHTUTU-193 Maakoodit ilman esittelijää:',
        names,
      );
    }
  }, [maakoodit, isLoading, error]);

  if (isLoading) {
    return <FullSpinner />;
  }

  if (error) {
    return (
      <BoxWrapper sx={{ borderBottom: 'none' }}>
        <OphTypography variant={'body2'} color="error">
          {t('virhe.maakoodi')}
        </OphTypography>
      </BoxWrapper>
    );
  }

  return (
    <BoxWrapper sx={{ borderBottom: 'none' }}>
      <OphTypography variant={'h3'} style={{ paddingBottom: '10px' }}>
        {t('maajako.otsikko2')}{' '}
      </OphTypography>
      <OphTypography variant={'body1'}>{t('maajako.kuvaus')}</OphTypography>
    </BoxWrapper>
  );
}
