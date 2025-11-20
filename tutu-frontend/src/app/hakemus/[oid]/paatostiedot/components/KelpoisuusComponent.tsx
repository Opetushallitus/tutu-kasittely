import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  Kelpoisuus,
  KelpoisuusFieldUpdateCallback,
  PaatosTietoOption,
  SovellettuLaki,
} from '@/src/lib/types/paatos';
import { Stack, useTheme } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useMemo } from 'react';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { DeleteOutline } from '@mui/icons-material';
import { ophColors } from '@/src/lib/theme';
import { useAsiointiKieli } from '@/src/hooks/useAsiointikieli';
import {
  findOptionByValue,
  getKelpoisuusMuuAmmattiDropdownOption,
  getKelpoisuusMuuAmmattiDropdownValue,
  getPaatosTietoDropdownOptions,
  PaatosTietoDropdownOption,
} from '@/src/app/hakemus/[oid]/paatostiedot/paatostietoUtils';
import { PaatosTietoDropdown } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosTietoDropdown';
import { DirektiivitasoComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/DirektiivitasoComponent';

type kelpoisuusComponentProps = {
  t: TFunction;
  index: number;
  kelpoisuus: Kelpoisuus;
  sovellettuLaki?: SovellettuLaki;
  updateKelpoisuusAction: (
    updatedKelpoisuus: Kelpoisuus,
    index: number,
  ) => void;
  deleteKelpoisuusAction: (id?: string) => void;
  kelpoisuusOptions: PaatosTietoOption[];
};

const KelpoisuusDirektiiviLiitannaisComponent = ({
  t,
  kelpoisuus,
  muuAmmattiOptionSelected,
  opetettavaAineOptions,
  updateFieldAction,
}: {
  t: TFunction;
  kelpoisuus: Kelpoisuus;
  muuAmmattiOptionSelected: boolean;
  opetettavaAineOptions: PaatosTietoDropdownOption[];
  updateFieldAction: KelpoisuusFieldUpdateCallback;
}) => {
  const theme = useTheme();
  return (
    <>
      {muuAmmattiOptionSelected ? (
        <Stack gap={theme.spacing(2)}>
          <OphTypography variant={'label'}>
            {t('hakemus.paatos.paatostyyppi.kelpoisuus.muuAmmatti')}
          </OphTypography>
          <OphInputFormField
            sx={{
              '& .MuiFormLabel-root': {
                fontWeight: 'normal',
              },
            }}
            label={t(`hakemus.paatos.paatostyyppi.kelpoisuus.muuAmmattiKuvaus`)}
            multiline={true}
            minRows={3}
            value={kelpoisuus.muuAmmattiKuvaus || ''}
            onChange={(e) =>
              updateFieldAction('muuAmmattiKuvaus', e.target.value)
            }
            data-testid={`muuAmmattikuvaus-input`}
          />
        </Stack>
      ) : (
        <PaatosTietoDropdown
          label={t(`hakemus.paatos.paatostyyppi.kelpoisuus.opetettavaAine`)}
          value={kelpoisuus.opetettavaAine}
          options={opetettavaAineOptions}
          updateAction={(val) => updateFieldAction('opetettavaAine', val)}
          dataTestId="opetettavaAine-select"
        />
      )}
      <DirektiivitasoComponent
        t={t}
        label={t(`hakemus.paatos.paatostyyppi.kelpoisuus.direktiivitaso`)}
        direktiivitaso={kelpoisuus.direktiivitaso}
        updateDirektiivitaso={(taso) =>
          updateFieldAction('direktiivitaso', taso)
        }
        dataTestId={'direktiivitaso-select'}
      />
      <OphInputFormField
        label={t(
          `hakemus.paatos.paatostyyppi.kelpoisuus.direktiivitasoLisatieto`,
        )}
        multiline={true}
        minRows={3}
        value={kelpoisuus.direktiivitasoLisatiedot || ''}
        onChange={(e) =>
          updateFieldAction('direktiivitasoLisatiedot', e.target.value)
        }
        data-testid={`direktiivitasoLisatieto-input`}
      />
      <DirektiivitasoComponent
        t={t}
        label={t(
          `hakemus.paatos.paatostyyppi.kelpoisuus.kansallisestiVaadittavaDirektiivitaso`,
        )}
        direktiivitaso={kelpoisuus.kansallisestiVaadittavaDirektiivitaso}
        updateDirektiivitaso={(taso) =>
          updateFieldAction('kansallisestiVaadittavaDirektiivitaso', taso)
        }
        dataTestId={'kansallisestiVaadittavaDirektiivitaso-select'}
      />
    </>
  );
};

export const KelpoisuusComponent = ({
  t,
  index,
  kelpoisuus,
  sovellettuLaki,
  updateKelpoisuusAction,
  deleteKelpoisuusAction,
  kelpoisuusOptions,
}: kelpoisuusComponentProps) => {
  const theme = useTheme();
  const { showConfirmation } = useGlobalConfirmationModal();
  const asiointikieli = useAsiointiKieli();
  const showDirektiivitasoFields =
    kelpoisuus.kelpoisuus &&
    (sovellettuLaki === 'ap' || sovellettuLaki === 'ap_seut');
  const topLevelOptions = useMemo(
    () => [
      ...getPaatosTietoDropdownOptions(asiointikieli, kelpoisuusOptions, 2),
      getKelpoisuusMuuAmmattiDropdownOption(t),
    ],
    [asiointikieli, kelpoisuusOptions, t],
  );

  const muuAmmattiOptionValue = useMemo(
    () => getKelpoisuusMuuAmmattiDropdownValue(t),
    [t],
  );

  const availableOpetettavaAineOptions = useMemo(() => {
    if (
      !kelpoisuus.kelpoisuus ||
      kelpoisuus.kelpoisuus === muuAmmattiOptionValue
    ) {
      return [];
    }
    const kelpoisuusOption = findOptionByValue(
      asiointikieli,
      kelpoisuusOptions,
      kelpoisuus.kelpoisuus!,
    );
    return getPaatosTietoDropdownOptions(
      asiointikieli,
      kelpoisuusOption?.children || [],
    );
  }, [
    asiointikieli,
    kelpoisuusOptions,
    kelpoisuus.kelpoisuus,
    muuAmmattiOptionValue,
  ]);

  const updateField: KelpoisuusFieldUpdateCallback = <
    K extends keyof Kelpoisuus,
  >(
    key: K,
    value: Kelpoisuus[K],
  ) => {
    const tobeKelpoisuus = { ...kelpoisuus };
    if (key === 'kelpoisuus') {
      tobeKelpoisuus.opetettavaAine = undefined;
      tobeKelpoisuus.direktiivitaso = undefined;
      tobeKelpoisuus.direktiivitasoLisatiedot = undefined;
      tobeKelpoisuus.kansallisestiVaadittavaDirektiivitaso = undefined;
      tobeKelpoisuus.muuAmmattiKuvaus = undefined;
    }
    updateKelpoisuusAction(
      {
        ...tobeKelpoisuus,
        [key]: value,
      },
      index,
    );
  };

  return (
    <Stack
      key={`kelpoisuus-stack-${index}`}
      gap={theme.spacing(2)}
      sx={{ width: '100%' }}
    >
      <Stack
        direction={'row'}
        gap={theme.spacing(2)}
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <OphTypography variant={'h3'}>
          {t(`hakemus.paatos.paatostyyppi.kelpoisuus.otsikko`)} {index + 1}
        </OphTypography>
        {index > 0 && (
          <OphButton
            sx={{
              alignSelf: 'flex-end',
            }}
            data-testid={`poista-kelpoisuus-button-${index}`}
            variant="text"
            startIcon={<DeleteOutline />}
            onClick={() =>
              showConfirmation({
                header: t(
                  `hakemus.paatos.paatostyyppi.kelpoisuus.modal.otsikko`,
                ),
                content: t(
                  `hakemus.paatos.paatostyyppi.kelpoisuus.modal.teksti`,
                ),
                confirmButtonText: t(
                  `hakemus.paatos.paatostyyppi.kelpoisuus.modal.poistaKelpoisuus`,
                ),
                handleConfirmAction: () =>
                  deleteKelpoisuusAction(kelpoisuus.id),
              })
            }
          >
            {t(`hakemus.paatos.paatostyyppi.kelpoisuus.poista`)}
          </OphButton>
        )}
      </Stack>
      <Stack
        sx={{ backgroundColor: ophColors.grey50 }}
        padding={theme.spacing(2)}
        gap={theme.spacing(2)}
      >
        <PaatosTietoDropdown
          label={t(`hakemus.paatos.paatostyyppi.kelpoisuus.otsikko`)}
          value={kelpoisuus.kelpoisuus}
          options={topLevelOptions}
          updateAction={(val) => updateField('kelpoisuus', val)}
          dataTestId="kelpoisuus-select"
        />
        {showDirektiivitasoFields && (
          <KelpoisuusDirektiiviLiitannaisComponent
            t={t}
            kelpoisuus={kelpoisuus}
            muuAmmattiOptionSelected={
              kelpoisuus.kelpoisuus === muuAmmattiOptionValue
            }
            opetettavaAineOptions={availableOpetettavaAineOptions}
            updateFieldAction={updateField}
          />
        )}
      </Stack>
    </Stack>
  );
};
