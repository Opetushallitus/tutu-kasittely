import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  KelpoisuudenLisavaatimukset,
  Kelpoisuus,
  KelpoisuusUpdateCallback,
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
} from '@/src/app/hakemus/[oid]/paatostiedot/paatostietoUtils';
import { PaatosTietoDropdown } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosTietoDropdown';
import { DirektiivitasoComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/DirektiivitasoComponent';
import { MyonteinenTaiKielteinenPaatosComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/MyonteinenTaiKielteinenPaatosComponent';
import { Theme } from '@mui/material/styles';
import { MyonteinenKelpoisuusPaatos } from '@/src/app/hakemus/[oid]/paatostiedot/components/kelpoisuus/MyonteinenKelpoisuusPaatos';

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
  theme,
  kelpoisuus,
  kelpoisuusKey,
  updateAction,
}: {
  t: TFunction;
  theme: Theme;
  kelpoisuus: Kelpoisuus;
  kelpoisuusKey?: string;
  updateAction: KelpoisuusUpdateCallback;
}) => {
  const myonteisenPaatoksenLisavaatimusProps = {
    lisavaatimukset:
      kelpoisuus.myonteisenPaatoksenLisavaatimukset as KelpoisuudenLisavaatimukset,
    kelpoisuusKey,
    t: t,
    theme: theme,
  };
  return (
    <>
      {kelpoisuus.kelpoisuus === getKelpoisuusMuuAmmattiDropdownValue(t) && (
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
            onChange={(e) => updateAction({ muuAmmattiKuvaus: e.target.value })}
            data-testid={`muuAmmattikuvaus-input`}
          />
        </Stack>
      )}
      <DirektiivitasoComponent
        t={t}
        label={t(`hakemus.paatos.paatostyyppi.kelpoisuus.direktiivitaso`)}
        direktiivitaso={kelpoisuus.direktiivitaso}
        updateDirektiivitaso={(taso) => updateAction({ direktiivitaso: taso })}
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
          updateAction({ direktiivitasoLisatiedot: e.target.value })
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
          updateAction({ kansallisestiVaadittavaDirektiivitaso: taso })
        }
        dataTestId={'kansallisestiVaadittavaDirektiivitaso-select'}
      />
      <MyonteinenTaiKielteinenPaatosComponent
        MyonteisenPaatoksenLisavaatimusComponent={MyonteinenKelpoisuusPaatos}
        lisavaatimusComponentProps={myonteisenPaatoksenLisavaatimusProps}
        myonteinenPaatos={kelpoisuus.myonteinenPaatos}
        kielteisenPaatoksenPerustelut={kelpoisuus.kielteisenPaatoksenPerustelut}
        updatePaatosAction={(paatos) => {
          updateAction({ ...kelpoisuus, ...paatos });
        }}
        t={t}
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

  const selectedKelpoisuusKey = useMemo(() => {
    if (
      kelpoisuus.kelpoisuus &&
      kelpoisuus.kelpoisuus !== getKelpoisuusMuuAmmattiDropdownValue(t)
    ) {
      return findOptionByValue(
        asiointikieli,
        kelpoisuusOptions,
        kelpoisuus.kelpoisuus,
      );
    }
    return null;
  }, [asiointikieli, kelpoisuus.kelpoisuus, kelpoisuusOptions, t]);

  const availableOpetettavaAineOptions = useMemo(() => {
    return getPaatosTietoDropdownOptions(
      asiointikieli,
      selectedKelpoisuusKey?.children || [],
    );
  }, [asiointikieli, selectedKelpoisuusKey?.children]);

  const updateKelpoisuus: KelpoisuusUpdateCallback = (
    updatedKelpoisuus: Partial<Kelpoisuus>,
  ) => {
    const tobeKelpoisuus = { ...kelpoisuus };
    if (updatedKelpoisuus.kelpoisuus) {
      tobeKelpoisuus.opetettavaAine = undefined;
      tobeKelpoisuus.direktiivitaso = undefined;
      tobeKelpoisuus.direktiivitasoLisatiedot = undefined;
      tobeKelpoisuus.kansallisestiVaadittavaDirektiivitaso = undefined;
      tobeKelpoisuus.muuAmmattiKuvaus = undefined;
      tobeKelpoisuus.myonteinenPaatos = undefined;
      tobeKelpoisuus.kielteisenPaatoksenPerustelut = undefined;
      tobeKelpoisuus.myonteisenPaatoksenLisavaatimukset = undefined;
    }
    updateKelpoisuusAction({ ...tobeKelpoisuus, ...updatedKelpoisuus }, index);
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
          updateAction={(val) => updateKelpoisuus({ kelpoisuus: val })}
          dataTestId="kelpoisuus-select"
        />
        {availableOpetettavaAineOptions.length > 0 &&
          kelpoisuus.kelpoisuus !== getKelpoisuusMuuAmmattiDropdownValue(t) && (
            <PaatosTietoDropdown
              label={t(`hakemus.paatos.paatostyyppi.kelpoisuus.opetettavaAine`)}
              value={kelpoisuus.opetettavaAine}
              options={availableOpetettavaAineOptions}
              updateAction={(val) => updateKelpoisuus({ opetettavaAine: val })}
              dataTestId="opetettavaAine-select"
            />
          )}
        {showDirektiivitasoFields && (
          <KelpoisuusDirektiiviLiitannaisComponent
            t={t}
            theme={theme}
            kelpoisuus={kelpoisuus}
            kelpoisuusKey={selectedKelpoisuusKey?.value?.['fi']}
            updateAction={updateKelpoisuus}
          />
        )}
      </Stack>
    </Stack>
  );
};
