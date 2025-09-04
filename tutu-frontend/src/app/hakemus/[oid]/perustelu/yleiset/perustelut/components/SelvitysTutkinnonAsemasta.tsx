import { useHakemus } from '@/src/context/HakemusContext';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

import { Muistio } from '@/src/components/Muistio';

export const SelvitysTutkinnonAsemasta = () => {
  const { t } = useTranslations();
  const { hakemus } = useHakemus();

  return (
    <Muistio
      label={t('hakemus.perustelu.yleiset.muistio.selvitysTutkinnonAsemasta')}
      hakemus={hakemus}
      sisainen={false}
      hakemuksenOsa={'perustelut-yleiset--selvitys-tutkinnon-asemasta'}
    />
  );
};
