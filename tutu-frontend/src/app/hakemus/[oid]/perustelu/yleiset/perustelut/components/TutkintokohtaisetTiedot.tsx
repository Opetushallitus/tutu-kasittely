import React, { useState, useEffect } from 'react';
import {
  OphTypography,
  OphInputFormField,
  OphRadioGroup,
} from '@opetushallitus/oph-design-system';
import { Stack, useTheme } from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

import { Hakemus, Tutkinto } from '@/src/lib/types/hakemus';

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
  const { t } = useTranslations();
  return (
    <>
      <OphTypography variant="h4">
        {t('hakemus.perustelu.yleiset.tutkinnot.opinnaytetyo')}
      </OphTypography>
      <OphRadioGroup
        labelId="opinnaytetyo-radio-group-label"
        data-testid={`yleiset-perustelut__tutkinto-${tutkinto.jarjestys}--opinnaytetyo`}
        options={[
          { value: 'true', label: t('yleiset.kylla') },
          { value: 'false', label: t('yleiset.ei') },
        ]}
        row
        value={String(tutkinto.opinnaytetyo) || ''}
        onChange={(e) => {
          updateTutkinto({ opinnaytetyo: e.target.value === 'true' });
        }}
      />
    </>
  );
};

const Harjoittelu = ({ tutkinto, updateTutkinto }: FieldProps) => {
  const { t } = useTranslations();
  return (
    <>
      <OphTypography variant="h4">
        {t('hakemus.perustelu.yleiset.tutkinnot.harjoittelu')}
      </OphTypography>

      <OphRadioGroup
        labelId="harjoittelu-radio-group-label"
        data-testid={`yleiset-perustelut__tutkinto-${tutkinto.jarjestys}--harjoittelu`}
        options={[
          { value: 'true', label: t('yleiset.kylla') },
          { value: 'false', label: t('yleiset.ei') },
        ]}
        row
        value={String(tutkinto.harjoittelu) || ''}
        onChange={(e) => {
          updateTutkinto({ harjoittelu: e.target.value === 'true' });
        }}
      />
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
  updateHakemus: (update: { tutkinnot: Tutkinto[] }) => void;
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

  // Sync parent hakemus tutkinnot to local state
  useEffect(() => {
    if (hakemus?.tutkinnot) {
      setTutkinnot(sortTutkinnot(hakemus.tutkinnot));
    }
  }, [hakemus?.tutkinnot]);

  // Update tutkinto immediately (no debounce)
  const updateTutkinto = (next: Tutkinto) => {
    const oldTutkinnot = tutkinnot.filter(
      (tutkinto) => tutkinto.id !== next.id,
    );
    const newTutkinnot = sortTutkinnot([...oldTutkinnot, next]);
    setTutkinnot(newTutkinnot);
    updateHakemus({ tutkinnot: newTutkinnot });
  };

  const varsinaisetTutkinnot = tutkinnot.filter(
    (tutkinto) => tutkinto.jarjestys !== 'MUU',
  );

  return varsinaisetTutkinnot.map((tutkinto: Tutkinto) => {
    const updateTutkintoWithPartial = (muutos: Partial<Tutkinto>) => {
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
