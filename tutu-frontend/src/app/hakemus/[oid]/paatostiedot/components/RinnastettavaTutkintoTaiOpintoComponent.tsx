import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { TutkintoTaiOpinto } from '@/src/lib/types/paatos';

interface RinnastettavaTutkintoTaiOpintoComponentProps {
  t: TFunction;
  rinnastettavaTutkintoTaiOpinto: TutkintoTaiOpinto;
}

export const RinnastettavaTutkintoTaiOpintoComponent = ({
  t,
  rinnastettavaTutkintoTaiOpinto,
}: RinnastettavaTutkintoTaiOpintoComponentProps) => {
  return (
    <>{t(`hakemus.paatos.paatostyyppi.${rinnastettavaTutkintoTaiOpinto}`)}</>
  );
};
