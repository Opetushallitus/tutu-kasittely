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
  initOrUpdateTutkintoTaiOpintoMyonteinenUo,
  resolveEntity,
} from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/tutkintoTaiOpintoUtils';
import {
  AINEENOPETTAJA_OPTION_KEY,
  LUOKANOPETTAJA_OPTION_KEY,
} from '@/src/app/hakemus/paatostiedot/constants';
import {
  getPaatosTietoDropdownOptions,
  getTiettyTutkintoTaiOpinnotAdditionalOptions,
  emptyKielteisenPaatoksenPerustelut,
  emptyMyonteisenPaatoksenLisavaatimukset,
} from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
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

type MyonteinenPaatosConfig = {
  LisavaatimusComponent: FC<MyonteinenPaatosProps>;
  naytaKielivalinta: boolean;
  defaultMyonteisetLisavaatimukset?: () => MyonteisenPaatoksenLisavaatimukset;
};

const myonteinenPaatosConfig = (
  paatosTieto: PaatosTieto,
  tutkintoTaiOpinto: TutkintoTaiOpinto,
): MyonteinenPaatosConfig => {
  switch (paatosTieto.paatosTyyppi) {
    case 'RiittavatOpinnot':
      return match(tutkintoTaiOpinto.tutkintoTaiOpinto)
        .returnType<MyonteinenPaatosConfig>()
        .with(
          P.when((t) =>
            [AINEENOPETTAJA_OPTION_KEY, LUOKANOPETTAJA_OPTION_KEY].some((key) =>
              t?.includes(key),
            ),
          ),
          () => ({
            LisavaatimusComponent:
              MyonteinenPaatosLuokanopettajaTaiAineenopettaja,
            naytaKielivalinta: true,
          }),
        )

        .with(
          P.when((t) => t?.includes('Steiner')),
          () => ({
            LisavaatimusComponent: MyonteinenPaatosSteiner,
            naytaKielivalinta: false,
          }),
        )
        .otherwise(() => ({
          LisavaatimusComponent: MyonteinenPaatos,
          naytaKielivalinta: true,
        }));
    default:
      return paatosTieto.sovellettuLaki === 'uo'
        ? {
            LisavaatimusComponent: MyonteinenPaatosTutkintoTaiOpintoUO,
            naytaKielivalinta: true,
            defaultMyonteisetLisavaatimukset: () =>
              initOrUpdateTutkintoTaiOpintoMyonteinenUo(
                resolveEntity(tutkintoTaiOpinto.tutkintoTaiOpinto),
                {},
                emptyMyonteisenPaatoksenLisavaatimukset(),
              ),
          }
        : {
            LisavaatimusComponent: MyonteinenPaatos,
            naytaKielivalinta: true,
          };
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

  const {
    LisavaatimusComponent,
    naytaKielivalinta,
    defaultMyonteisetLisavaatimukset = emptyMyonteisenPaatoksenLisavaatimukset,
  } = useMemo(
    () => myonteinenPaatosConfig(paatosTieto, tutkintoTaiOpinto),
    [paatosTieto, tutkintoTaiOpinto],
  );

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
      : (() => {
          const options = getPaatosTietoDropdownOptions(
            asiointikieli,
            paatosTietoOptions.tiettyTutkintoTaiOpinnotOptions,
          );
          // Lisätään "additional options" ennen viimeistä elementtiä
          return [
            ...options.slice(0, -1),
            ...getTiettyTutkintoTaiOpinnotAdditionalOptions(t),
            ...options.slice(-1),
          ];
        })();

  const updateTutkintoTaiOpintoFieldAction = (fieldVal: string) => {
    const tobeTutkinto = { ...tutkintoTaiOpinto };
    if (fieldVal !== null) {
      tobeTutkinto.myonteinenPaatos = undefined;
      tobeTutkinto.opetuskieli = undefined;
      tobeTutkinto.kielteisenPaatoksenPerustelut =
        emptyKielteisenPaatoksenPerustelut();
      tobeTutkinto.myonteisenPaatoksenLisavaatimukset =
        emptyMyonteisenPaatoksenLisavaatimukset();
    }
    updateTutkintoTaiOpintoAction(
      {
        ...tobeTutkinto,
        tutkintoTaiOpinto: fieldVal,
      },
      index,
    );
  };

  return (
    <Stack
      direction={'column'}
      spacing={2}
      sx={{ width: '100%', padding: 2, backgroundColor: ophColors.grey50 }}
    >
      <Stack
        key={`stack-${index}`}
        direction={'row'}
        spacing={2}
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
        myonteinenPaatos={tutkintoTaiOpinto.myonteinenPaatos}
        kielteisenPaatoksenPerustelut={
          tutkintoTaiOpinto.kielteisenPaatoksenPerustelut
        }
        updateMyonteinenPaatos={(paatos) =>
          updateTutkintoTaiOpintoAction(
            {
              ...tutkintoTaiOpinto,
              ...paatos,
              myonteisenPaatoksenLisavaatimukset: paatos.myonteinenPaatos
                ? defaultMyonteisetLisavaatimukset()
                : emptyMyonteisenPaatoksenLisavaatimukset(),
            },
            index,
          )
        }
        updateKielteisenPaatoksenPerustelut={(perustelut) =>
          updateTutkintoTaiOpintoAction(
            {
              ...tutkintoTaiOpinto,
              kielteisenPaatoksenPerustelut: perustelut,
            },
            index,
          )
        }
        t={t}
        paatosTyyppi={paatosTieto.paatosTyyppi}
        sovellettuLaki={paatosTieto.sovellettuLaki}
        myonteisenPaatoksenKentat={
          <LisavaatimusComponent
            t={t}
            tutkintoTaiOpinto={tutkintoTaiOpinto.tutkintoTaiOpinto}
            lisavaatimukset={
              tutkintoTaiOpinto.myonteisenPaatoksenLisavaatimukset
            }
            updateLisavaatimukset={(lisavaatimukset) =>
              updateTutkintoTaiOpintoAction(
                {
                  ...tutkintoTaiOpinto,
                  myonteisenPaatoksenLisavaatimukset: {
                    ...emptyMyonteisenPaatoksenLisavaatimukset(),
                    ...lisavaatimukset,
                  },
                },
                index,
              )
            }
          />
        }
      />
    </Stack>
  );
};
