import { useEffect, useRef, useCallback } from 'react';

import { OphCheckbox, OphInput } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

import { debounceTime, Subject, distinctUntilChanged, filter, map } from 'rxjs';
import { useObservable } from 'react-rx';

// const clicks = fromEvent(document, 'click');
// const result = clicks.pipe(debounceTime(1000));
// result.subscribe(x => console.log(x));

const isDefined = (val) => val !== undefined && val !== null;

const useDebounced = (
  debounceCallback = () => {},
  { delay = 1500 } = {},
  // deps = [],
) => {
  const subject = useRef(new Subject()).current;
  const valueObservable = useRef(
    subject.pipe(
      filter((params) => params.debounce !== false),
      map(({ value }) => value),
      distinctUntilChanged(),
    ),
  ).current;
  const debounceObservable = useRef(
    subject.pipe(
      debounceTime(delay),
      filter((params) => params.debounce !== false),
      map((params) => params.value),
      distinctUntilChanged(),
    ),
  ).current;

  const setValue = useCallback(
    (value, { debounce } = {}) => subject.next({ value, debounce }),
    [subject],
  );

  useEffect(() => {
    const subscription = debounceObservable.subscribe((val) =>
      debounceCallback(val),
    );
    return () => subscription.unsubscribe();
  }, [debounceObservable, debounceCallback]);

  return [valueObservable, setValue];
};

export const AllekirjoitustenTarkistus = ({ hakemus, updateHakemus }) => {
  const [lisatietoSubject, setLisatieto] = useDebounced((val) => {
    console.log(`DEBOUNCE: ${val}`);
    updateHakemus({ ...hakemus, allekirjoituksetTarkistettu: val });
  });

  useEffect(() => {
    if (hakemus?.hakemusOid) {
      const lisatieto = isDefined(hakemus?.allekirjoituksetTarkistettu)
        ? hakemus.allekirjoituksetTarkistettu
        : null;
      setLisatieto(lisatieto, { debounce: false });
    }
  }, [hakemus?.hakemusOid, hakemus?.allekirjoituksetTarkistettu, setLisatieto]);

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
