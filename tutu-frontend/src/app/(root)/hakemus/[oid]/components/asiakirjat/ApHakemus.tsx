import { useEffect } from 'react';

import { Stack, useTheme } from '@mui/material';
import { OphRadio, OphTypography } from '@opetushallitus/oph-design-system';
import {
  useTranslations,
  TFunction,
} from '@/src/lib/localization/hooks/useTranslations';

import { useObservable } from 'react-rx';

import {
  useDebounced,
  DebounceSetValue,
  Observable,
} from '@/src/hooks/useDebounced';

import { Hakemus } from '@/src/lib/types/hakemus';
import { isDefined } from 'remeda';

interface StatelessApHakemusProps {
  apHakemusObservable: Observable<boolean>;
  setApHakemus: DebounceSetValue<boolean>;
  t: TFunction;
}

const StatelessApHakemus = ({
  apHakemusObservable,
  setApHakemus,
  t,
}: StatelessApHakemusProps) => {
  const theme = useTheme();
  const apHakemus = useObservable(apHakemusObservable);

  return (
    <>
      <OphTypography variant="h4">
        {t('hakemus.asiakirjat.apHakemus')}
      </OphTypography>
      <Stack direction="row" gap={theme.spacing(3)}>
        <OphRadio
          value={'true'}
          checked={apHakemus === true}
          label={t('yleiset.kylla')}
          name="ap_hakemus_true_false"
          onChange={() => setApHakemus(true)}
        ></OphRadio>
        <OphRadio
          value={'false'}
          checked={apHakemus === false}
          label={t('yleiset.ei')}
          name="ap_hakemus_true_false"
          onChange={() => setApHakemus(false)}
        ></OphRadio>
      </Stack>
    </>
  );
};

interface ApHakemusProps {
  hakemus: Hakemus | undefined;
  updateHakemus: (patch: Partial<Hakemus>) => void;
}

export const ApHakemus = ({ hakemus, updateHakemus }: ApHakemusProps) => {
  const { t } = useTranslations();

  const [apHakemusObservable, setApHakemus] = useDebounced<boolean>((val) => {
    updateHakemus({
      ...hakemus,
      apHakemus: val,
    });
  });

  useEffect(() => {
    const apHakemus = hakemus?.apHakemus;
    if (isDefined(apHakemus)) {
      setApHakemus(apHakemus, { debounce: false });
    }
  }, [hakemus?.apHakemus, setApHakemus]);

  return (
    <StatelessApHakemus
      apHakemusObservable={apHakemusObservable}
      setApHakemus={setApHakemus}
      t={t}
    />
  );
};
