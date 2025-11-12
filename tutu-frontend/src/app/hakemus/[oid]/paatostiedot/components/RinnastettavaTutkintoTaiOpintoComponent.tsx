import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  MyonteisenPaatoksenLisavaatimukset,
  PaatosTietoOptionGroup,
  TutkintoTaiOpinto,
} from '@/src/lib/types/paatos';
import { Stack, useTheme } from '@mui/material';
import {
  OphButton,
  ophColors,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { MyonteinenPaatos } from '@/src/app/hakemus/[oid]/paatostiedot/components/MyonteinenPaatos';
import { DeleteOutline } from '@mui/icons-material';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { getPaatosTietoDropdownOptions } from '@/src/app/hakemus/[oid]/paatostiedot/paatostietoUtils';
import { useAsiointiKieli } from '@/src/hooks/useAsiointikieli';
import { PaatosTietoDropdown } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosTietoDropdown';

interface RinnastettavaTutkintoTaiOpintoComponentProps {
  t: TFunction;
  index: number;
  tutkintoTaiOpinto: TutkintoTaiOpinto;
  paatosTyyppi: string;
  paatosTietoOptions: PaatosTietoOptionGroup;
  updateTutkintoTaiOpintoAction: (
    updatedTutkintoTaiOpinto: TutkintoTaiOpinto,
    index: number,
  ) => void;
  deleteTutkintoTaiOpintoAction: (id: string | undefined) => void;
  tyyppi: string;
}

export const RinnastettavaTutkintoTaiOpintoComponent = ({
  t,
  index,
  tutkintoTaiOpinto,
  paatosTyyppi,
  paatosTietoOptions,
  updateTutkintoTaiOpintoAction,
  deleteTutkintoTaiOpintoAction,
  tyyppi,
}: RinnastettavaTutkintoTaiOpintoComponentProps) => {
  const updateMyonteinenPaatos = (
    myonteinenPaatos: boolean,
    lisavaatimukset?: MyonteisenPaatoksenLisavaatimukset,
  ) => {
    updateTutkintoTaiOpintoAction(
      {
        ...tutkintoTaiOpinto,
        myonteinenPaatos: myonteinenPaatos,
        ...(lisavaatimukset && {
          myonteisenPaatoksenLisavaatimukset: lisavaatimukset,
        }),
      },
      index,
    );
  };
  const theme = useTheme();
  const asiointikieli = useAsiointiKieli();
  const { showConfirmation } = useGlobalConfirmationModal();

  const rinnastettavaTutkintoTaiOpinnotOptions =
    tyyppi === 'riittavatOpinnot'
      ? getPaatosTietoDropdownOptions(
          asiointikieli,
          paatosTietoOptions.riittavatOpinnotOptions,
        )
      : getPaatosTietoDropdownOptions(
          asiointikieli,
          paatosTietoOptions.tiettyTutkintoTaiOpinnotOptions,
        );

  const updateTutkintoTaiOpintoFieldAction = (fieldVal: string) => {
    updateTutkintoTaiOpintoAction(
      {
        ...tutkintoTaiOpinto,
        tutkintoTaiOpinto: fieldVal,
      },
      index,
    );
  };

  return (
    <Stack
      direction={'column'}
      gap={theme.spacing(2)}
      sx={{ width: '100%', padding: 2, backgroundColor: ophColors.grey50 }}
    >
      <Stack
        key={`stack-${index}`}
        direction={'row'}
        gap={theme.spacing(2)}
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <OphTypography variant={'h3'}>
          {t(`hakemus.paatos.paatostyyppi.${paatosTyyppi}.otsikko`) +
            (index + 1)}
        </OphTypography>
        {index > 0 && (
          <OphButton
            sx={{
              alignSelf: 'flex-end',
            }}
            data-testid={`poista-tutkinto-tai-opinto-button`}
            variant="text"
            startIcon={<DeleteOutline />}
            onClick={() =>
              showConfirmation({
                header: t(
                  `hakemus.paatos.paatostyyppi.${tyyppi}.modal.otsikko`,
                ),
                content: t(
                  `hakemus.paatos.paatostyyppi.${tyyppi}.modal.teksti`,
                ),
                confirmButtonText: t(
                  `hakemus.paatos.paatostyyppi.${tyyppi}.modal.poistaTutkintoTaiOpinnot`,
                ),
                handleConfirmAction: () =>
                  deleteTutkintoTaiOpintoAction(tutkintoTaiOpinto.id),
              })
            }
          >
            {t(`hakemus.paatos.paatostyyppi.${paatosTyyppi}.poista`)}
          </OphButton>
        )}{' '}
      </Stack>
      <PaatosTietoDropdown
        label={t(
          `hakemus.paatos.paatostyyppi.${paatosTyyppi}.rinnastettavaTutkintoTaiOpinnot`,
        )}
        options={rinnastettavaTutkintoTaiOpinnotOptions}
        updateAction={updateTutkintoTaiOpintoFieldAction}
        value={tutkintoTaiOpinto.tutkintoTaiOpinto || ''}
        dataTestId={'rinnastettava-tutkinto-tai-opinto-select'}
      />
      {tyyppi === 'riittavatOpinnot' && (
        <OphInputFormField
          label={t('hakemus.paatos.paatostyyppi.riittavatOpinnot.opetuskieli')}
          value={tutkintoTaiOpinto.opetuskieli ?? ''}
          onChange={(event) =>
            updateTutkintoTaiOpintoAction(
              {
                ...tutkintoTaiOpinto,
                opetuskieli: event.target.value,
              },
              index,
            )
          }
          data-testid={'riittavat-opinnot-opetuskieli-input'}
        ></OphInputFormField>
      )}
      <MyonteinenPaatos
        t={t}
        myonteinenPaatos={tutkintoTaiOpinto.myonteinenPaatos}
        lisavaatimukset={tutkintoTaiOpinto.myonteisenPaatoksenLisavaatimukset}
        updateMyonteinenPaatosAction={updateMyonteinenPaatos}
      />
    </Stack>
  );
};
