import { useEffect, useState } from 'react';

import { OphCheckbox } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

import { Hakemus, HakemusUpdateCallback } from '@/src/lib/types/hakemus';
import { CalendarComponent } from '@/src/app/hakemus/[oid]/components/calendar-component';
import * as dateFns from 'date-fns';

interface KaikkiSelvityksetSaatuProps {
  hakemus: Hakemus;
  updateHakemus: HakemusUpdateCallback;
}

export const KaikkiSelvityksetSaatu = ({
  hakemus,
  updateHakemus,
}: KaikkiSelvityksetSaatuProps) => {
  const { t } = useTranslations();

  const [selvityksetSaatu, setSelvityksetSaatu] = useState<boolean>(
    hakemus.selvityksetSaatu,
  );

  const [viimeinenAsiakirjaHakijalta, setViimeinenAsiakirjaHakijalta] =
    useState<Date>(new Date());

  useEffect(() => {
    setSelvityksetSaatu(hakemus?.selvityksetSaatu || false);
  }, [hakemus.selvityksetSaatu]);

  return (
    <>
      <OphCheckbox
        label={t('hakemus.asiakirjat.kaikkiSelvityksetSaatu')}
        checked={selvityksetSaatu || false}
        onChange={() => {
          setSelvityksetSaatu(!selvityksetSaatu);
          updateHakemus({
            selvityksetSaatu: !selvityksetSaatu,
          });
        }}
      />
      <CalendarComponent
        selectedValue={viimeinenAsiakirjaHakijalta}
        setDate={(value) => {
          if (value) {
            setViimeinenAsiakirjaHakijalta(value);
            updateHakemus({
              viimeinenAsiakirjaHakijalta: dateFns.format(
                value,
                "yyyy-MM-dd'T'HH:mm",
              ),
            });
          }
        }}
        label={t('hakemus.asiakirjat.viimeinenAsiakirja')}
      />
    </>
  );
};
