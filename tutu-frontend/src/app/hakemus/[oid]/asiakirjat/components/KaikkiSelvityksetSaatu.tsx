import { useEffect, useState } from 'react';

import { OphCheckbox } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

import {
  AsiakirjaTieto,
  AsiakirjaTietoUpdateCallback,
  HakemusTyyppi,
} from '@/src/lib/types/hakemus';
import { CalendarComponent } from '@/src/components/calendar-component';
import * as dateFns from 'date-fns';

type KaikkiSelvityksetSaatuProps = {
  asiakirjaTieto: AsiakirjaTieto;
  updateAsiakirjaTieto: AsiakirjaTietoUpdateCallback;
  kirjausPvm: string;
  hakemusKoskee: HakemusTyyppi;
};

export const KaikkiSelvityksetSaatu = ({
  asiakirjaTieto,
  updateAsiakirjaTieto,
  kirjausPvm,
  hakemusKoskee,
}: KaikkiSelvityksetSaatuProps) => {
  const { t } = useTranslations();

  const [selvityksetSaatu, setSelvityksetSaatu] = useState<boolean>(
    asiakirjaTieto.selvityksetSaatu,
  );

  const [viimeinenAsiakirjaHakijalta, setViimeinenAsiakirjaHakijalta] =
    useState<Date | null>(new Date());

  useEffect(() => {
    setSelvityksetSaatu(asiakirjaTieto.selvityksetSaatu);
  }, [asiakirjaTieto.selvityksetSaatu]);

  useEffect(() => {
    if (asiakirjaTieto.viimeinenAsiakirjaHakijalta) {
      setViimeinenAsiakirjaHakijalta(
        new Date(asiakirjaTieto.viimeinenAsiakirjaHakijalta),
      );
    }
  }, [asiakirjaTieto.viimeinenAsiakirjaHakijalta]);

  return (
    <>
      <OphCheckbox
        label={t('hakemus.asiakirjat.kaikkiSelvityksetSaatu')}
        checked={selvityksetSaatu}
        onChange={() => {
          setSelvityksetSaatu(!selvityksetSaatu);
          updateAsiakirjaTieto({
            selvityksetSaatu: !selvityksetSaatu,
          });
        }}
        data-testid={'kaikki-selvitykset-saatu'}
      />
      {hakemusKoskee !== HakemusTyyppi.LOPULLINEN_PAATOS && (
        <CalendarComponent
          selectedValue={viimeinenAsiakirjaHakijalta}
          setDate={(value) => {
            if (value) {
              setViimeinenAsiakirjaHakijalta(value);
              updateAsiakirjaTieto({
                viimeinenAsiakirjaHakijalta: dateFns.format(
                  value,
                  "yyyy-MM-dd'T'HH:mm",
                ),
              });
            }
          }}
          label={t('hakemus.asiakirjat.viimeinenAsiakirjaHakijalta')}
          dataTestId={'viimeinen-asiakirja-hakijalta'}
          maxDate={new Date()}
          minDate={new Date(kirjausPvm)}
        />
      )}
    </>
  );
};
