import { useEffect } from 'react';

import { OphCheckbox, OphInput } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

import { useObservable } from 'react-rx';

import { isDefined } from '@/src/lib/utils';
import { useDebounced } from '@/src/hooks/useDebounced';

export const AllekirjoitustenTarkistus = ({ hakemus, updateHakemus }) => {
  const [lisatietoSubject, setLisatieto] = useDebounced((val) => {
    updateHakemus({
      ...hakemus,
      allekirjoituksetTarkistettu: isDefined(val),
      allekirjoituksetTarkistettuLisatiedot: val,
    });
  });

  useEffect(() => {
    if (hakemus?.hakemusOid) {
      const lisatieto = hakemus?.allekirjoituksetTarkistettu
        ? hakemus.allekirjoituksetTarkistettuLisatiedot
        : null;
      setLisatieto(lisatieto, { debounce: false });
    }
  }, [
    hakemus?.hakemusOid,
    hakemus?.allekirjoituksetTarkistettu,
    hakemus.allekirjoituksetTarkistettuLisatiedot,
    setLisatieto,
  ]);

  return (
    <StatelessAllekirjoitustenTarkistus
      lisatietoSubject={lisatietoSubject}
      setLisatieto={setLisatieto}
    />
  );
};

const StatelessAllekirjoitustenTarkistus = ({
  lisatietoSubject,
  setLisatieto,
}) => {
  const { t } = useTranslations();

  const lisatieto = useObservable(lisatietoSubject);
  const checked = isDefined(lisatieto);

  return (
    <>
      <OphCheckbox
        label={t('hakemus.asiakirjat.allekirjoitukset_tarkistettu')}
        checked={checked}
        onChange={() => setLisatieto(checked ? null : '')}
      />
      {checked ? (
        <LisatietojaAllekirjoituksista
          value={lisatieto}
          onChange={setLisatieto}
        />
      ) : null}
    </>
  );
};

const LisatietojaAllekirjoituksista = ({ value = '', onChange }) => {
  const { t } = useTranslations();

  return (
    <OphInput
      multiline={true}
      label={t('hakemus.asiakirjat.allekirjoitukset_tarkistettu_lisatietoja')}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
