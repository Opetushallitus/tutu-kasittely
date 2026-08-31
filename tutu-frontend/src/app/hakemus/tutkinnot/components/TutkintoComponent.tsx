import { DeleteOutline } from '@mui/icons-material';
import { Divider, Stack } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { HakijanIlmoittamaFieldWrapper } from './HakijanIlmoittamaFieldWrapper';
import { useHakijanIlmoittamaTieto } from '../hooks/useHakijanIlmoittamaTieto';

import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { OphSelectFormFieldPatched } from '@/src/components/OphSelectFormFieldPatched';
import { useHakemus } from '@/src/context/HakemusContext';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { OphSelectOption } from '@/src/lib/types/common';
import { Tutkinto } from '@/src/lib/types/tutkinto';

// Remember to update these in PaatosTekstiGenerator

const primaryTutkintotodistusOtsikko = {
  fi: [
    { value: 'tutkintotodistus', label: 'Tutkintotodistus' },
    { value: 'tutkintotodistukset', label: 'Tutkintotodistukset' },
    { value: 'todistus', label: 'Todistus' },
    { value: 'todistukset', label: 'Todistukset' },
  ],
  sv: [
    { value: 'examensbevis', label: 'Examensbevis' },
    { value: 'bevis', label: 'Bevis' },
  ],
};

const tutkintotodistusOtsikko = {
  fi: [
    { value: 'muutodistus', label: 'Muu todistus' },
    { value: 'muuttodistukset', label: 'Muut todistukset' },
    {
      value: 'edeltaneetkorkeakouluopinnot',
      label: 'Edeltäneet korkeakouluopinnot',
    },
  ],
  sv: [
    { value: 'ovrigbevis', label: 'Övrig bevis' },
    { value: 'ovrigabevis', label: 'Övriga bevis' },
    { value: 'foregaendehogskolestudier', label: 'Föregående högskolestudier' },
  ],
};

export type TutkintoProps = {
  tutkinto: Tutkinto;
  maatJaValtiotOptions: OphSelectOption[];
  koulutusLuokitusOptions: OphSelectOption[];
  updateTutkintoAction: (tutkinto: Tutkinto) => void;
  deleteTutkintoAction: (tutkinto: Tutkinto) => void;
  paatosKieli: string;
  t: TFunction;
};

export const TutkintoComponent = ({
  tutkinto,
  maatJaValtiotOptions,
  koulutusLuokitusOptions,
  updateTutkintoAction,
  deleteTutkintoAction,
  paatosKieli,
  t,
}: TutkintoProps) => {
  const {
    hakemusState: { editedData: hakemus },
  } = useHakemus();
  const hakijanTieto = useHakijanIlmoittamaTieto(
    hakemus?.sisalto || [],
    tutkinto.jarjestys,
    hakemus?.lomakkeenKieli || 'fi',
  );

  const { showConfirmation } = useGlobalConfirmationModal();

  const updateCurrentTutkinto = (value: Tutkinto) => {
    updateTutkintoAction(value);
  };

  function resolveTutkintoTodistusOtsikkoOptions() {
    const key: 'fi' | 'sv' = paatosKieli === 'sv' ? 'sv' : 'fi';
    return tutkinto.jarjestys === '1'
      ? primaryTutkintotodistusOtsikko[key]
      : tutkintotodistusOtsikko[key];
  }

  return (
    <Stack direction="column" gap={2}>
      <Stack direction="row" justifyContent="space-between">
        <OphTypography
          variant={'h3'}
          data-testid={`tutkinto-otsikko-${tutkinto.jarjestys}`}
        >
          {t('hakemus.tutkinnot.tutkinto.tutkintoOtsikko')} {tutkinto.jarjestys}
        </OphTypography>
        {tutkinto.jarjestys !== '1' && (
          <OphButton
            sx={{
              alignSelf: 'flex-end',
            }}
            data-testid={`poista-tutkinto-button-${tutkinto.jarjestys}`}
            variant="text"
            startIcon={<DeleteOutline />}
            onClick={() =>
              showConfirmation({
                header: t('hakemus.tutkinnot.modal.otsikko'),
                content: t('hakemus.tutkinnot.modal.teksti'),
                confirmButtonText: t('hakemus.tutkinnot.modal.poistaPaatos'),
                handleConfirmAction: () => deleteTutkintoAction(tutkinto),
              })
            }
          >
            {t('hakemus.tutkinnot.poistaTutkinto')}
          </OphButton>
        )}
      </Stack>
      <OphSelectFormFieldPatched
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.tutkinnot.tutkinto.tutkintoTodistusOtsikko')}
        options={resolveTutkintoTodistusOtsikkoOptions()}
        value={tutkinto.todistusOtsikko ?? ''}
        onChange={(event) =>
          updateCurrentTutkinto({
            ...tutkinto,
            todistusOtsikko: event.target.value,
          })
        }
        data-testid={`tutkinto-todistusotsikko-${tutkinto.jarjestys}`}
        inputProps={{
          'aria-label': t('hakemus.tutkinnot.tutkinto.tutkintoTodistusOtsikko'),
        }}
      />
      <HakijanIlmoittamaFieldWrapper
        hakijanIlmoittamaSisalto={hakijanTieto.nimi}
        linkTestId={`tutkinto-nimi-hakijan-ilmoittama-link-${tutkinto.jarjestys}`}
        t={t}
      >
        <OphInputFormField
          label={t('hakemus.tutkinnot.tutkinto.tutkinnonNimi')}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...tutkinto,
              nimi: event.target.value,
            })
          }
          multiline={true}
          value={tutkinto.nimi ?? ''}
          inputProps={{
            'data-testid': `tutkinto-tutkintonimi-${tutkinto.jarjestys}`,
          }}
        />
      </HakijanIlmoittamaFieldWrapper>
      <HakijanIlmoittamaFieldWrapper
        hakijanIlmoittamaSisalto={hakijanTieto.nimiAlkuperaiskielella}
        linkTestId={`tutkinto-nimi-alkuperaiskieli-hakijan-ilmoittama-link-${tutkinto.jarjestys}`}
        t={t}
      >
        <OphInputFormField
          label={t(
            'hakemus.tutkinnot.tutkinto.tutkinnonNimiAlkuperaiskielella',
          )}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...tutkinto,
              nimiAlkuperaiskielella: event.target.value,
            })
          }
          multiline={true}
          value={tutkinto.nimiAlkuperaiskielella ?? ''}
          inputProps={{
            'data-testid': `tutkinto-tutkintonimi-alkuperaiskieli-${tutkinto.jarjestys}`,
          }}
        />
      </HakijanIlmoittamaFieldWrapper>
      <HakijanIlmoittamaFieldWrapper
        hakijanIlmoittamaSisalto={hakijanTieto.nimiKaannoksessa}
        linkTestId={`tutkinto-nimi-kaannos-hakijan-ilmoittama-link-${tutkinto.jarjestys}`}
        t={t}
      >
        <OphInputFormField
          label={t('hakemus.tutkinnot.tutkinto.tutkinnonNimiKaannoksessa')}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...tutkinto,
              nimiKaannoksessa: event.target.value,
            })
          }
          multiline={true}
          value={tutkinto.nimiKaannoksessa ?? ''}
          inputProps={{
            'data-testid': `tutkinto-tutkintonimi-kaannos-${tutkinto.jarjestys}`,
          }}
        />
      </HakijanIlmoittamaFieldWrapper>
      <OphInputFormField
        label={t('hakemus.tutkinnot.tutkinto.tutkinnonPaaaineTaiErikoisala')}
        onChange={(event) =>
          updateCurrentTutkinto({
            ...tutkinto,
            paaAineTaiErikoisala: event.target.value,
          })
        }
        multiline={true}
        value={tutkinto.paaAineTaiErikoisala ?? ''}
        inputProps={{
          'data-testid': `tutkinto-paaaine-${tutkinto.jarjestys}`,
        }}
      />
      <HakijanIlmoittamaFieldWrapper
        hakijanIlmoittamaSisalto={hakijanTieto.oppilaitos}
        linkTestId={`tutkinto-oppilaitos-hakijan-ilmoittama-link-${tutkinto.jarjestys}`}
        t={t}
      >
        <OphInputFormField
          label={t('hakemus.tutkinnot.tutkinto.oppilaitos')}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...tutkinto,
              oppilaitos: event.target.value,
            })
          }
          multiline={true}
          value={tutkinto.oppilaitos ?? ''}
          inputProps={{
            'data-testid': `tutkinto-oppilaitos-${tutkinto.jarjestys}`,
          }}
        />
      </HakijanIlmoittamaFieldWrapper>
      <HakijanIlmoittamaFieldWrapper
        hakijanIlmoittamaSisalto={hakijanTieto.oppilaitosAlkuperaiskielella}
        linkTestId={`tutkinto-oppilaitos-alkuperaiskieli-hakijan-ilmoittama-link-${tutkinto.jarjestys}`}
        t={t}
      >
        <OphInputFormField
          label={t('hakemus.tutkinnot.tutkinto.oppilaitosAlkuperaiskielella')}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...tutkinto,
              oppilaitosAlkuperaiskielella: event.target.value,
            })
          }
          multiline={true}
          value={tutkinto.oppilaitosAlkuperaiskielella ?? ''}
          inputProps={{
            'data-testid': `tutkinto-oppilaitos-alkuperaiskieli-${tutkinto.jarjestys}`,
          }}
        />
      </HakijanIlmoittamaFieldWrapper>
      <HakijanIlmoittamaFieldWrapper
        hakijanIlmoittamaSisalto={hakijanTieto.oppilaitosKaannoksessa}
        linkTestId={`tutkinto-oppilaitos-kaannos-hakijan-ilmoittama-link-${tutkinto.jarjestys}`}
        t={t}
      >
        <OphInputFormField
          label={t('hakemus.tutkinnot.tutkinto.oppilaitosKaannoksessa')}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...tutkinto,
              oppilaitosKaannoksessa: event.target.value,
            })
          }
          multiline={true}
          value={tutkinto.oppilaitosKaannoksessa ?? ''}
          inputProps={{
            'data-testid': `tutkinto-oppilaitos-kaannos-${tutkinto.jarjestys}`,
          }}
        />
      </HakijanIlmoittamaFieldWrapper>
      <HakijanIlmoittamaFieldWrapper
        hakijanIlmoittamaSisalto={hakijanTieto.maakoodiUri}
        linkTestId={`tutkinto-maa-hakijan-ilmoittama-link-${tutkinto.jarjestys}`}
        t={t}
      >
        <OphSelectFormFieldPatched
          placeholder={t('yleiset.valitse')}
          label={t('hakemus.tutkinnot.tutkinto.tutkinnonMaa')}
          sx={{ width: '50%' }}
          options={maatJaValtiotOptions}
          value={tutkinto.maakoodiUri ?? ''}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...tutkinto,
              maakoodiUri: event.target.value,
            })
          }
          data-testid={`tutkinto-maa-${tutkinto.jarjestys}`}
          inputProps={{
            'aria-label': t('hakemus.tutkinnot.tutkinto.tutkinnonMaa'),
          }}
        />
      </HakijanIlmoittamaFieldWrapper>
      <Stack direction="row" gap={2}>
        <OphInputFormField
          sx={{ width: '25%' }}
          label={t('hakemus.tutkinnot.tutkinto.opintojenAloitusVuosi')}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...tutkinto,
              aloitusVuosi: Number(event.target.value),
            })
          }
          value={tutkinto.aloitusVuosi ?? ''}
          inputProps={{
            'data-testid': `tutkinto-aloitusvuosi-${tutkinto.jarjestys}`,
          }}
        />
        <OphInputFormField
          sx={{ width: '25%' }}
          label={t('hakemus.tutkinnot.tutkinto.opintojenPaattymisVuosi')}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...tutkinto,
              paattymisVuosi: Number(event.target.value),
            })
          }
          value={tutkinto.paattymisVuosi ?? ''}
          inputProps={{
            'data-testid': `tutkinto-paattymisvuosi-${tutkinto.jarjestys}`,
          }}
        />
      </Stack>
      <OphInputFormField
        sx={{ width: '25%' }}
        label={t('hakemus.tutkinnot.tutkinto.todistuksenPvm')}
        onChange={(event) =>
          updateCurrentTutkinto({
            ...tutkinto,
            todistuksenPaivamaara: event.target.value,
          })
        }
        value={tutkinto.todistuksenPaivamaara ?? ''}
        inputProps={{
          'data-testid': `tutkinto-todistuksenpvm-${tutkinto.jarjestys}`,
        }}
      />
      {tutkinto.jarjestys === '1' && (
        <OphSelectFormFieldPatched
          placeholder={t('yleiset.valitse')}
          label={t('hakemus.tutkinnot.tutkinto.tutkinnonKoulutusala')}
          sx={{ width: '25%' }}
          options={koulutusLuokitusOptions}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...tutkinto,
              koulutusalaKoodiUri: event.target.value,
            })
          }
          value={tutkinto.koulutusalaKoodiUri ?? ''}
          data-testid={`tutkinto-koulutusala-${tutkinto.jarjestys}`}
          inputProps={{
            'aria-label': t('hakemus.tutkinnot.tutkinto.tutkinnonKoulutusala'),
          }}
        />
      )}
      <Divider orientation={'horizontal'} />
    </Stack>
  );
};
