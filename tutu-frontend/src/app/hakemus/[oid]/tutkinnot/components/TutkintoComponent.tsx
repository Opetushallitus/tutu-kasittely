'use client';

import { DeleteOutline } from '@mui/icons-material';
import { Divider, Stack, Box } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { OphSelectOption } from '@/src/components/OphSelect';
import { useHakemus } from '@/src/context/HakemusContext';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Tutkinto } from '@/src/lib/types/tutkinto';

import { HakijanIlmoittamaPopover } from './HakijanIlmoittamaPopover';
import { useHakijanIlmoittamaTieto } from '../hooks/useHakijanIlmoittamaTieto';

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
  maatJaValtiotOptions: OphSelectOption<string>[];
  koulutusLuokitusOptions: OphSelectOption<string>[];
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

  const [nimiAnchorEl, setNimiAnchorEl] = React.useState<HTMLElement | null>(
    null,
  );
  const [oppilaitosAnchorEl, setOppilaitosAnchorEl] =
    React.useState<HTMLElement | null>(null);
  const [maaAnchorEl, setMaaAnchorEl] = React.useState<HTMLElement | null>(
    null,
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
      <OphSelectFormField
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
      />
      <Stack direction="column" gap={0.5}>
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
        <Box>
          <OphButton
            variant="text"
            size="small"
            sx={{
              padding: 0,
              minWidth: 'auto',
              textTransform: 'none',
              color: 'primary.main',
              fontWeight: 400,
            }}
            onClick={(event) => setNimiAnchorEl(event.currentTarget)}
            data-testid={`tutkinto-nimi-hakijan-ilmoittama-link-${tutkinto.jarjestys}`}
          >
            {t('hakemus.tutkinnot.hakijanIlmoittamaTieto.linkki')}
          </OphButton>
        </Box>
      </Stack>
      <OphInputFormField
        label={t('hakemus.tutkinnot.tutkinto.tutkinnonPaaaineTaiErikoisala')}
        onChange={(event) =>
          updateCurrentTutkinto({
            ...tutkinto,
            paaaaineTaiErikoisala: event.target.value,
          })
        }
        multiline={true}
        value={tutkinto.paaaaineTaiErikoisala ?? ''}
        inputProps={{
          'data-testid': `tutkinto-paaaine-${tutkinto.jarjestys}`,
        }}
      />
      <Stack direction="column" gap={0.5}>
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
        <Box>
          <OphButton
            variant="text"
            size="small"
            sx={{
              padding: 0,
              minWidth: 'auto',
              textTransform: 'none',
              color: 'primary.main',
              fontWeight: 400,
            }}
            onClick={(event) => setOppilaitosAnchorEl(event.currentTarget)}
            data-testid={`tutkinto-oppilaitos-hakijan-ilmoittama-link-${tutkinto.jarjestys}`}
          >
            {t('hakemus.tutkinnot.hakijanIlmoittamaTieto.linkki')}
          </OphButton>
        </Box>
      </Stack>
      <Stack direction="column" gap={0.5}>
        <OphSelectFormField
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
        />
        <Box>
          <OphButton
            variant="text"
            size="small"
            sx={{
              padding: 0,
              minWidth: 'auto',
              textTransform: 'none',
              color: 'primary.main',
              fontWeight: 400,
            }}
            onClick={(event) => setMaaAnchorEl(event.currentTarget)}
            data-testid={`tutkinto-maa-hakijan-ilmoittama-link-${tutkinto.jarjestys}`}
          >
            {t('hakemus.tutkinnot.hakijanIlmoittamaTieto.linkki')}
          </OphButton>
        </Box>
      </Stack>
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
        <OphSelectFormField
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
        />
      )}
      <HakijanIlmoittamaPopover
        anchorEl={nimiAnchorEl}
        onClose={() => setNimiAnchorEl(null)}
        sisalto={hakijanTieto.nimi}
      />
      <HakijanIlmoittamaPopover
        anchorEl={oppilaitosAnchorEl}
        onClose={() => setOppilaitosAnchorEl(null)}
        sisalto={hakijanTieto.oppilaitos}
      />
      <HakijanIlmoittamaPopover
        anchorEl={maaAnchorEl}
        onClose={() => setMaaAnchorEl(null)}
        sisalto={hakijanTieto.maakoodiUri}
      />
      <Divider orientation={'horizontal'} />
    </Stack>
  );
};
