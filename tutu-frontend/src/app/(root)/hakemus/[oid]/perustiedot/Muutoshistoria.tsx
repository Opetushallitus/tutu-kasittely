import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/useTranslations';

export const Muutoshistoria = () => {
  const { t } = useTranslations();
  return (
    <OphTypography variant={'h3'}>
      {t('hakemus.perustiedot.muutoshistoria.otsikko')}
    </OphTypography>
  );
};
