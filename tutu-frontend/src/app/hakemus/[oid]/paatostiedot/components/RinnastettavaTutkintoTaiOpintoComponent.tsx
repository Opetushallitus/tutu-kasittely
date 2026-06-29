import { DeleteOutline } from '@mui/icons-material';
import { Stack, useTheme } from '@mui/material';
import {
  OphButton,
  ophColors,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useEffect, useState } from 'react';

import { MyonteinenPaatos } from '@/src/app/hakemus/[oid]/paatostiedot/components/MyonteinenPaatos';
import { MyonteinenPaatosLuokanopettajaTaiAineenopettaja } from '@/src/app/hakemus/[oid]/paatostiedot/components/MyonteinenPaatosLuokanopettajaTaiAineenopettaja';
import { MyonteinenPaatosSteiner } from '@/src/app/hakemus/[oid]/paatostiedot/components/MyonteinenPaatosSteiner';
import { MyonteinenTaiKielteinenPaatosComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/MyonteinenTaiKielteinenPaatosComponent';
import { getPaatosTietoDropdownOptions } from '@/src/app/hakemus/[oid]/paatostiedot/paatostietoUtils';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { SelectTreeDropdown } from '@/src/components/SelectTreeDropdown';
import { useAsiointiKieli } from '@/src/hooks/useAsiointikieli';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  MyonteisenPaatoksenLisavaatimukset,
  PaatosTietoOptionGroup,
  TutkintoTaiOpinto,
} from '@/src/lib/types/paatos';

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

enum Opinnot {
  Steiner,
  Aineenopettaja,
  Luokanopettaja,
  Muu,
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
  const theme = useTheme();
  const asiointikieli = useAsiointiKieli();
  const { showConfirmation } = useGlobalConfirmationModal();
  const [opinnot, setOpinnot] = useState<Opinnot>(Opinnot.Muu);

  useEffect(() => {
    if (tutkintoTaiOpinto.tutkintoTaiOpinto?.includes('Steiner')) {
      setOpinnot(Opinnot.Steiner);
    } else if (
      tutkintoTaiOpinto.tutkintoTaiOpinto?.includes('Aineenopettaja') ||
      tutkintoTaiOpinto.tutkintoTaiOpinto?.includes('Ämneslärare') ||
      tutkintoTaiOpinto.tutkintoTaiOpinto?.includes('Subject teacher')
    ) {
      setOpinnot(Opinnot.Aineenopettaja);
    } else if (
      tutkintoTaiOpinto.tutkintoTaiOpinto?.includes('Luokanopettaja') ||
      tutkintoTaiOpinto.tutkintoTaiOpinto?.includes('Klasslärare') ||
      tutkintoTaiOpinto.tutkintoTaiOpinto?.includes('Class teacher')
    ) {
      setOpinnot(Opinnot.Luokanopettaja);
    } else {
      setOpinnot(Opinnot.Muu);
    }
  }, [tutkintoTaiOpinto.tutkintoTaiOpinto]);

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

  const myonteisenPaatoksenLisavaatimusProps = {
    lisavaatimukset:
      tutkintoTaiOpinto.myonteisenPaatoksenLisavaatimukset as MyonteisenPaatoksenLisavaatimukset,
    t: t,
    theme: theme,
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
      <SelectTreeDropdown
        label={t(
          `hakemus.paatos.paatostyyppi.${paatosTyyppi}.rinnastettavaTutkintoTaiOpinnot`,
        )}
        options={rinnastettavaTutkintoTaiOpinnotOptions}
        onChange={updateTutkintoTaiOpintoFieldAction}
        value={tutkintoTaiOpinto.tutkintoTaiOpinto || ''}
        data-testid={'rinnastettava-tutkinto-tai-opinto-select'}
      />
      {tyyppi === 'riittavatOpinnot' && opinnot !== Opinnot.Steiner && (
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
      <MyonteinenTaiKielteinenPaatosComponent
        MyonteisenPaatoksenLisavaatimusComponent={
          opinnot === Opinnot.Steiner
            ? MyonteinenPaatosSteiner
            : opinnot === Opinnot.Aineenopettaja ||
                opinnot === Opinnot.Luokanopettaja
              ? MyonteinenPaatosLuokanopettajaTaiAineenopettaja
              : MyonteinenPaatos
        }
        lisavaatimusComponentProps={myonteisenPaatoksenLisavaatimusProps}
        myonteinenPaatos={tutkintoTaiOpinto.myonteinenPaatos}
        kielteisenPaatoksenPerustelut={
          tutkintoTaiOpinto.kielteisenPaatoksenPerustelut
        }
        updatePaatosAction={(paatos) => {
          updateTutkintoTaiOpintoAction(
            {
              ...tutkintoTaiOpinto,
              ...paatos,
            },
            index,
          );
        }}
        t={t}
      />
    </Stack>
  );
};
