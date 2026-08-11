import { DeleteOutline } from '@mui/icons-material';
import { Stack } from '@mui/material';
import {
  OphButton,
  ophColors,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { FC, useMemo } from 'react';
import { match, P } from 'ts-pattern';

import { MyonteinenTaiKielteinenPaatosComponent } from '@/src/app/hakemus/paatostiedot/components/MyonteinenTaiKielteinenPaatosComponent';
import {
  MyonteinenPaatos,
  MyonteinenPaatosProps,
} from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/MyonteinenPaatos';
import { MyonteinenPaatosLuokanopettajaTaiAineenopettaja } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/MyonteinenPaatosLuokanopettajaTaiAineenopettaja';
import { MyonteinenPaatosSteiner } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/MyonteinenPaatosSteiner';
import { MyonteinenPaatosTutkintoTaiOpintoUO } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/MyonteinenPaatosTutkintoTaiOpintoUO';
import {
  AINEENOPETTAJA_OPTION_KEYS,
  LUOKANOPETTAJA_OPTION_KEYS,
} from '@/src/app/hakemus/paatostiedot/constants';
import { getPaatosTietoDropdownOptions } from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { SelectTreeDropdown } from '@/src/components/SelectTreeDropdown';
import { useAsiointiKieli } from '@/src/hooks/useAsiointikieli';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  MyonteisenPaatoksenLisavaatimukset,
  PaatosTieto,
  PaatosTietoOptionGroup,
  TutkintoTaiOpinto,
} from '@/src/lib/types/paatos';

interface RinnastettavaTutkintoTaiOpintoComponentProps {
  t: TFunction;
  index: number;
  tutkintoTaiOpinto: TutkintoTaiOpinto;
  paatosTieto: PaatosTieto;
  paatosTietoOptions: PaatosTietoOptionGroup;
  updateTutkintoTaiOpintoAction: (
    updatedTutkintoTaiOpinto: TutkintoTaiOpinto,
    index: number,
  ) => void;
  deleteTutkintoTaiOpintoAction: (id: string | undefined) => void;
}

const myonteinenPaatosComponent = (
  paatosTieto: PaatosTieto,
  tutkintoTaiOpinto: TutkintoTaiOpinto,
): [FC<MyonteinenPaatosProps>, boolean] => {
  switch (paatosTieto.paatosTyyppi) {
    case 'RiittavatOpinnot':
      return match(tutkintoTaiOpinto.tutkintoTaiOpinto)
        .returnType<[FC<MyonteinenPaatosProps>, boolean]>()
        .with(
          P.when((t) =>
            AINEENOPETTAJA_OPTION_KEYS.concat(LUOKANOPETTAJA_OPTION_KEYS).some(
              (key) => t?.includes(key),
            ),
          ),
          () => [MyonteinenPaatosLuokanopettajaTaiAineenopettaja, true],
        )

        .with(
          P.when((t) => t?.includes('Steiner')),
          () => [MyonteinenPaatosSteiner, false],
        )
        .otherwise(() => [MyonteinenPaatos, true]);
    default:
      return paatosTieto.sovellettuLaki === 'uo'
        ? [MyonteinenPaatosTutkintoTaiOpintoUO, true]
        : [MyonteinenPaatos, true];
  }
};

export const RinnastettavaTutkintoTaiOpintoComponent = ({
  t,
  index,
  tutkintoTaiOpinto,
  paatosTieto,
  paatosTietoOptions,
  updateTutkintoTaiOpintoAction,
  deleteTutkintoTaiOpintoAction,
}: RinnastettavaTutkintoTaiOpintoComponentProps) => {
  const asiointikieli = useAsiointiKieli();
  const { showConfirmation } = useGlobalConfirmationModal();

  const { naytaKielivalinta, LisavaatimusComponent } = useMemo(() => {
    const [component, naytaKielivalinta] = myonteinenPaatosComponent(
      paatosTieto,
      tutkintoTaiOpinto,
    );
    return {
      naytaKielivalinta,
      LisavaatimusComponent: component,
    };
  }, [paatosTieto, tutkintoTaiOpinto]);

  const paatosTyyppi =
    paatosTieto.paatosTyyppi === 'RiittavatOpinnot'
      ? 'riittavatOpinnot'
      : 'tiettyTutkintoTaiOpinnot';

  const rinnastettavaTutkintoTaiOpinnotOptions =
    paatosTieto.paatosTyyppi === 'RiittavatOpinnot'
      ? getPaatosTietoDropdownOptions(
          asiointikieli,
          paatosTietoOptions.riittavatOpinnotOptions,
        )
      : getPaatosTietoDropdownOptions(
          asiointikieli,
          paatosTietoOptions.tiettyTutkintoTaiOpinnotOptions,
        );

  const updateTutkintoTaiOpintoFieldAction = (fieldVal: string) => {
    const tobeTutkinto = { ...tutkintoTaiOpinto };
    if (fieldVal !== null) {
      tobeTutkinto.myonteinenPaatos = undefined;
      tobeTutkinto.opetuskieli = undefined;
      tobeTutkinto.kielteisenPaatoksenPerustelut = undefined;
      tobeTutkinto.myonteisenPaatoksenLisavaatimukset = undefined;
    }
    updateTutkintoTaiOpintoAction(
      {
        ...tobeTutkinto,
        tutkintoTaiOpinto: fieldVal,
      },
      index,
    );
  };

  const myonteisenPaatoksenLisavaatimusProps = {
    lisavaatimukset:
      tutkintoTaiOpinto.myonteisenPaatoksenLisavaatimukset as MyonteisenPaatoksenLisavaatimukset,
    t: t,
    tutkintoTaiOpinto: tutkintoTaiOpinto.tutkintoTaiOpinto,
  };

  return (
    <Stack
      direction={'column'}
      gap={2}
      sx={{ width: '100%', padding: 2, backgroundColor: ophColors.grey50 }}
    >
      <Stack
        key={`stack-${index}`}
        direction={'row'}
        gap={2}
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
                  `hakemus.paatos.paatostyyppi.${paatosTyyppi}.modal.otsikko`,
                ),
                content: t(
                  `hakemus.paatos.paatostyyppi.${paatosTyyppi}.modal.teksti`,
                ),
                confirmButtonText: t(
                  `hakemus.paatos.paatostyyppi.${paatosTyyppi}.modal.poistaTutkintoTaiOpinnot`,
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
      {paatosTyyppi === 'riittavatOpinnot' && naytaKielivalinta && (
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
        MyonteisenPaatoksenLisavaatimusComponent={LisavaatimusComponent}
        lisavaatimusComponentProps={myonteisenPaatoksenLisavaatimusProps}
        myonteinenPaatos={tutkintoTaiOpinto.myonteinenPaatos}
        kielteisenPaatoksenPerustelut={
          tutkintoTaiOpinto.kielteisenPaatoksenPerustelut
        }
        updatePaatosAction={(paatos) =>
          updateTutkintoTaiOpintoAction(
            { ...tutkintoTaiOpinto, ...paatos },
            index,
          )
        }
        t={t}
      />
    </Stack>
  );
};
