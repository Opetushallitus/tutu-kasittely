import React, { useState } from 'react';
import {
  OphTypography,
  OphRadio,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import { Stack, useTheme } from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useDebounce } from '@/src/hooks/useDebounce';

import { Hakemus, PartialHakemus, Tutkinto } from '@/src/lib/types/hakemus';

const RangeDash = () => (
  <OphTypography variant="body1" sx={{ marginTop: '6px' }}>
    –
  </OphTypography>
);

interface FieldProps {
  tutkinto: Tutkinto;
  updateTutkinto: (tutkinto: Partial<Tutkinto>) => void;
}

const OhjeellinenLaajuus = ({ tutkinto, updateTutkinto }: FieldProps) => {
  const { t } = useTranslations();
  return (
    <OphInputFormField
      multiline={false}
      data-testid={`yleiset-perustelut__tutkinto-${tutkinto.jarjestys}--ohjeellinen-laajuus`}
      label={t('hakemus.perustelu.yleiset.tutkinnot.ohjeellinenLaajuus')}
      value={tutkinto.ohjeellinenLaajuus || ''}
      onChange={(event) =>
        updateTutkinto({ ohjeellinenLaajuus: event.target.value })
      }
      inputProps={{ size: 40 }}
    />
  );
};

const Suoritusvuodet = ({ tutkinto, updateTutkinto }: FieldProps) => {
  const theme = useTheme();
  const { t } = useTranslations();
  return (
    <Stack direction="column">
      <OphTypography variant="label">
        {t('hakemus.perustelu.yleiset.tutkinnot.suoritusvuodet')}
      </OphTypography>
      <Stack direction="row" gap={theme.spacing(0.5)}>
        <OphInputFormField
          multiline={false}
          data-testid={`yleiset-perustelut__tutkinto-${tutkinto.jarjestys}--suoritusvuodet-alku`}
          value={tutkinto.aloitusVuosi || ''}
          onChange={(event) =>
            updateTutkinto({ aloitusVuosi: Number(event.target.value) })
          }
          inputProps={{ maxLength: 4, size: 6 }}
        />
        <RangeDash />
        <OphInputFormField
          multiline={false}
          data-testid={`yleiset-perustelut__tutkinto-${tutkinto.jarjestys}--suoritusvuodet-loppu`}
          value={tutkinto.paattymisVuosi || ''}
          onChange={(event) =>
            updateTutkinto({ paattymisVuosi: Number(event.target.value) })
          }
          inputProps={{ maxLength: 4, size: 6 }}
        />
      </Stack>
    </Stack>
  );
};

const Opinnaytetyo = ({ tutkinto, updateTutkinto }: FieldProps) => {
  const theme = useTheme();
  const { t } = useTranslations();
  return (
    <>
      <OphTypography variant="h4">
        {t('hakemus.perustelu.yleiset.tutkinnot.opinnaytetyo')}
      </OphTypography>
      <Stack direction="row" gap={theme.spacing(1)}>
        <OphRadio
          data-testid={`yleiset-perustelut__tutkinto-${tutkinto.jarjestys}--opinnaytetyo__on`}
          value={'true'}
          checked={tutkinto.opinnaytetyo === true}
          label={t('yleiset.kylla')}
          name="opinnaytetyo_true_false"
          onChange={() => updateTutkinto({ opinnaytetyo: true })}
        ></OphRadio>
        <OphRadio
          data-testid={`yleiset-perustelut__tutkinto-${tutkinto.jarjestys}--opinnaytetyo__off`}
          value={'false'}
          checked={tutkinto.opinnaytetyo === false}
          label={t('yleiset.ei')}
          name="opinnaytetyo_true_false"
          onChange={() => updateTutkinto({ opinnaytetyo: false })}
        ></OphRadio>
      </Stack>
    </>
  );
};

const Harjoittelu = ({ tutkinto, updateTutkinto }: FieldProps) => {
  const theme = useTheme();
  const { t } = useTranslations();
  return (
    <>
      <OphTypography variant="h4">
        {t('hakemus.perustelu.yleiset.tutkinnot.harjoittelu')}
      </OphTypography>
      <Stack direction="row" gap={theme.spacing(1)}>
        <OphRadio
          data-testid={`yleiset-perustelut__tutkinto-${tutkinto.jarjestys}--harjoittelu__on`}
          value={'true'}
          checked={tutkinto.harjoittelu === true}
          label={t('yleiset.kylla')}
          name="harjoittelu_true_false"
          onChange={() => updateTutkinto({ harjoittelu: true })}
        ></OphRadio>
        <OphRadio
          data-testid={`yleiset-perustelut__tutkinto-${tutkinto.jarjestys}--harjoittelu__off`}
          value={'false'}
          checked={tutkinto.harjoittelu === false}
          label={t('yleiset.ei')}
          name="harjoittelu_true_false"
          onChange={() => updateTutkinto({ harjoittelu: false })}
        ></OphRadio>
      </Stack>
    </>
  );
};

const Lisatietoja = ({ tutkinto, updateTutkinto }: FieldProps) => {
  const { t } = useTranslations();
  return (
    <OphInputFormField
      multiline={true}
      data-testid={`yleiset-perustelut__tutkinto-${tutkinto.jarjestys}--lisatietoja`}
      label={t('hakemus.perustelu.yleiset.tutkinnot.lisatietoja')}
      value={tutkinto.perustelunLisatietoja || ''}
      onChange={(event) =>
        updateTutkinto({ perustelunLisatietoja: event.target.value })
      }
      minRows={3}
    />
  );
};

interface TutkintokohtaisetTiedotProps {
  hakemus: Hakemus | undefined;
  updateHakemus: (patchHakemus: PartialHakemus) => void;
}

const sortTutkinnot = (tutkinnot: Tutkinto[]) => {
  return tutkinnot.sort((a, b) => a?.jarjestys.localeCompare(b?.jarjestys));
};

export const TutkintokohtaisetTiedot = ({
  hakemus,
  updateHakemus,
}: TutkintokohtaisetTiedotProps) => {
  const theme = useTheme();
  const { t } = useTranslations();

  const [tutkinnot, setTutkinnot] = useState<Tutkinto[]>(
    sortTutkinnot(hakemus?.tutkinnot || []),
  );

  const debouncedUpdateTutkinto = useDebounce((newTutkinnot: Tutkinto[]) => {
    updateHakemus({ tutkinnot: newTutkinnot });
  }, 1000);

  const updateTutkinto = (next: Tutkinto) => {
    const oldTutkinnot = tutkinnot.filter(
      (tutkinto) => tutkinto.id !== next.id,
    );
    const newTutkinnot = sortTutkinnot([...oldTutkinnot, next]);
    setTutkinnot(newTutkinnot);
    debouncedUpdateTutkinto(newTutkinnot);
  };

  const varsinaisetTutkinnot = tutkinnot.filter(
    (tutkinto) => tutkinto.jarjestys !== 'MUU',
  );

  return varsinaisetTutkinnot.map((tutkinto: Tutkinto) => {
    const updateTutkintoWithPartial = (muutos: Partial<Tutkinto>) => {
      console.log(tutkinto?.id, muutos);
      return updateTutkinto({ ...tutkinto, ...muutos });
    };

    return (
      <React.Fragment
        key={`yleiset-perustelut__tutkinto--${tutkinto.jarjestys}`}
      >
        <OphTypography variant="h4">
          {t('hakemus.perustelu.yleiset.tutkinnot.tutkintoOtsake', {
            jarjestys: tutkinto.jarjestys,
          })}
        </OphTypography>
        <Stack direction="row" gap={theme.spacing(4)}>
          <OhjeellinenLaajuus
            updateTutkinto={updateTutkintoWithPartial}
            tutkinto={tutkinto}
          />
          <Suoritusvuodet
            updateTutkinto={updateTutkintoWithPartial}
            tutkinto={tutkinto}
          />
        </Stack>
        <Opinnaytetyo
          updateTutkinto={updateTutkintoWithPartial}
          tutkinto={tutkinto}
        />
        <Harjoittelu
          updateTutkinto={updateTutkintoWithPartial}
          tutkinto={tutkinto}
        />
        <Lisatietoja
          updateTutkinto={updateTutkintoWithPartial}
          tutkinto={tutkinto}
        />
      </React.Fragment>
    );
  });
};
