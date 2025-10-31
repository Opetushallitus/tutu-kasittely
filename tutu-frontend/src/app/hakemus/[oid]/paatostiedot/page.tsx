'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import {
  OphCheckbox,
  OphTypography,
  OphSelectFormField,
  OphButton,
} from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { usePaatos } from '@/src/hooks/usePaatos';
import { FullSpinner } from '@/src/components/FullSpinner';
import { handleFetchError } from '@/src/lib/utils';
import {
  Paatos,
  PaatosTieto,
  PaatosUpdateCallback,
  Ratkaisutyyppi,
} from '@/src/lib/types/paatos';
import useToaster from '@/src/hooks/useToaster';
import { PeruutuksenTaiRaukeamisenSyyComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/PeruutuksenTaiRaukeamisenSyyComponent';
import { ratkaisutyyppiOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { Add } from '@mui/icons-material';
import { PaatosTietoList } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosTietoList';
import { Hakemus } from '@/src/lib/types/hakemus';
import { CalendarComponent } from '@/src/components/calendar-component';
import { DATE_TIME_STANDARD_PLACEHOLDER } from '@/src/constants/constants';
import * as dateFns from 'date-fns';

const emptyPaatosTieto = (paatosId: string): PaatosTieto => ({
  id: undefined,
  paatosId: paatosId,
  paatosTyyppi: undefined,
  myonteisenPaatoksenLisavaatimukset: '{}',
  kielteisenPaatoksenPerustelut: '{}',
  rinnastettavatTutkinnotTaiOpinnot: [],
  kelpoisuudet: [],
});

export default function PaatostiedotPage() {
  const { t } = useTranslations();
  const {
    isLoading: isHakemusLoading,
    hakemus,
    error: hakemusError,
  } = useHakemus();
  const {
    isPaatosLoading,
    paatos,
    error: paatosError,
    updatePaatos,
    updateOngoing,
  } = usePaatos(hakemus?.hakemusOid, hakemus?.lomakeId);
  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
    handleFetchError(addToast, paatosError, 'virhe.paatoksenLataus', t);
  }, [addToast, hakemusError, paatosError, t]);

  if (hakemusError || paatosError || !paatos) {
    return null;
  }

  if (isHakemusLoading || isPaatosLoading) {
    return <FullSpinner></FullSpinner>;
  }

  return (
    <Paatostiedot
      paatos={paatos}
      updatePaatos={updatePaatos}
      updateOngoing={updateOngoing}
      hakemus={hakemus!}
    />
  );
}

const Paatostiedot = ({
  paatos,
  updatePaatos,
  updateOngoing,
  hakemus,
}: {
  paatos: Paatos;
  updatePaatos: PaatosUpdateCallback;
  updateOngoing: boolean;
  hakemus: Hakemus;
}) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const [currentPaatos, setCurrentPaatos] = React.useState<Paatos>(paatos);
  const [currentPaatosTiedot, setCurrentPaatosTiedot] = React.useState<
    PaatosTieto[]
  >([]);

  useEffect(() => {
    setCurrentPaatos(paatos);
    setCurrentPaatosTiedot(
      paatos.paatosTiedot?.length
        ? paatos.paatosTiedot
        : [emptyPaatosTieto(paatos.id!)],
    );
  }, [paatos]);

  const updatePaatosField = (updatedPaatos: Partial<Paatos>) => {
    const newPaatos: Paatos = { ...currentPaatos, ...updatedPaatos };
    setCurrentPaatos(newPaatos);
    if (!updateOngoing) {
      updatePaatos(newPaatos);
    }
  };

  const updatePaatosTieto = (
    updatedPaatosTieto: PaatosTieto,
    index: number,
  ) => {
    const newPaatosTiedot = [...currentPaatosTiedot];
    newPaatosTiedot[index] = updatedPaatosTieto;
    setCurrentPaatosTiedot(newPaatosTiedot);
    updatePaatosField({ paatosTiedot: newPaatosTiedot });
  };

  const addPaatosTieto = () => {
    setCurrentPaatosTiedot((oldPaatosTiedot) =>
      oldPaatosTiedot.concat([emptyPaatosTieto(paatos.id!)]),
    );
  };

  const deletePaatosTieto = (id: string | undefined) => {
    const newPaatosTiedot = id
      ? currentPaatosTiedot.filter((paatostieto) => paatostieto.id !== id)
      : currentPaatosTiedot.slice(0, -1);
    setCurrentPaatosTiedot(newPaatosTiedot);
    updatePaatosField({ paatosTiedot: newPaatosTiedot });
  };

  const hyvaksymispaiva = paatos.hyvaksymispaiva
    ? new Date(paatos.hyvaksymispaiva)
    : null;
  const lahetyspaiva = paatos.lahetyspaiva
    ? new Date(paatos.lahetyspaiva)
    : null;

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Stack direction="column" gap={theme.spacing(3)}>
          <OphTypography variant={'h2'}>
            {t('hakemus.paatos.otsikko')}
          </OphTypography>
          <Stack direction="row" gap={theme.spacing(2)}>
            <CalendarComponent
              setDate={(date: Date | null) =>
                updatePaatosField({
                  hyvaksymispaiva: date
                    ? dateFns.format(date, DATE_TIME_STANDARD_PLACEHOLDER)
                    : null,
                })
              }
              selectedValue={hyvaksymispaiva}
              maxDate={null}
              label={t('hakemus.paatos.hyvaksymispaiva')}
              dataTestId="paatos-hyvaksymispaiva-calendar"
            />

            <CalendarComponent
              setDate={(date: Date | null) =>
                updatePaatosField({
                  lahetyspaiva: date
                    ? dateFns.format(date, DATE_TIME_STANDARD_PLACEHOLDER)
                    : null,
                })
              }
              selectedValue={lahetyspaiva}
              maxDate={null}
              label={t('hakemus.paatos.lahetyspaiva')}
              dataTestId="paatos-lahetyspaiva-calendar"
            />
          </Stack>
        </Stack>
      </Stack>
      <Divider />
      <OphTypography variant={'h3'}>
        {t('hakemus.paatos.ratkaisuJaPaatos')}
      </OphTypography>
      <OphCheckbox
        label={t('hakemus.paatos.seut')}
        checked={currentPaatos.seutArviointi}
        onChange={() => {
          updatePaatosField({ seutArviointi: !currentPaatos.seutArviointi });
        }}
        data-testid={'paatos-seut'}
      />
      <OphSelectFormField
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.paatos.ratkaisutyyppi.otsikko')}
        options={ratkaisutyyppiOptions(t)}
        value={currentPaatos.ratkaisutyyppi || ''}
        onChange={(event) =>
          updatePaatosField(
            (event.target.value as Ratkaisutyyppi) !== 'Paatos'
              ? {
                  ratkaisutyyppi: event.target.value as Ratkaisutyyppi,
                  paatosTiedot: [],
                }
              : { ratkaisutyyppi: event.target.value as Ratkaisutyyppi },
          )
        }
        data-testid={'paatos-ratkaisutyyppi'}
      />
      {currentPaatos.ratkaisutyyppi === 'PeruutusTaiRaukeaminen' && (
        <PeruutuksenTaiRaukeamisenSyyComponent
          t={t}
          theme={theme}
          syy={currentPaatos.peruutuksenTaiRaukeamisenSyy}
          updatePeruutuksenTaiRaukeamisenSyy={(syy) =>
            updatePaatosField({ peruutuksenTaiRaukeamisenSyy: syy })
          }
        />
      )}
      {currentPaatos.ratkaisutyyppi === 'Paatos' && (
        <>
          <PaatosTietoList
            t={t}
            paatosTiedot={currentPaatosTiedot}
            paatosTietoOptions={paatos.paatosTietoOptions}
            updatePaatosTietoAction={updatePaatosTieto}
            deletePaatosTieto={deletePaatosTieto}
            tutkinnot={hakemus.tutkinnot}
          />
          <OphButton
            sx={{
              alignSelf: 'flex-start',
            }}
            data-testid={`lisaa-paatos-button`}
            variant="outlined"
            startIcon={<Add />}
            onClick={addPaatosTieto}
          >
            {t('hakemus.paatos.paatostyyppi.lisaaPaatos')}
          </OphButton>
          <Divider />
        </>
      )}
    </Stack>
  );
};
