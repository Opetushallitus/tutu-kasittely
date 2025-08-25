import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Tutkinto } from '@/src/lib/types/hakemus';
import { Option } from '@/src/constants/dropdownOptions';
import {
  OphButton,
  OphInputFormField,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { Divider, Stack } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';

export type TutkintoProps = {
  tutkinto: Tutkinto;
  maatJaValtiotOptions: Option[];
  koulutusLuokitusOptions: Option[];
  updateTutkinto: (tutkinto: Tutkinto) => void;
  deleteTutkinto: (id: string | undefined) => void;
  t: TFunction;
};

export const TutkintoComponent = ({
  tutkinto,
  maatJaValtiotOptions,
  koulutusLuokitusOptions,
  updateTutkinto,
  deleteTutkinto,
  t,
}: TutkintoProps) => {
  const [currentTutkinto, setCurrentTutkinto] =
    React.useState<Tutkinto>(tutkinto);

  const updateCurrentTutkinto = (value: Tutkinto) => {
    updateTutkinto(value);
    setCurrentTutkinto(value);
  };

  return (
    <Stack direction="column" gap={2}>
      {currentTutkinto.jarjestys === 'MUU' ? (
        <>
          <OphTypography variant={'h2'}>
            {t('hakemus.tutkinnot.tutkinto.tutkintoOtsikkoMUU')}
          </OphTypography>
          <OphInputFormField
            minRows={9}
            multiline={true}
            label={t('hakemus.tutkinnot.tutkinto.tutkintoOtsikkoMUU')}
            value={currentTutkinto.muuTutkintoTieto}
            onChange={(event) =>
              updateCurrentTutkinto({
                ...currentTutkinto,
                muuTutkintoTieto: event.target.value,
              })
            }
          />
          <OphTypography variant={'h2'}>
            {t('hakemus.tutkinnot.tutkinto.muuTutkintoHuomio')}
          </OphTypography>
          <OphTypography variant={'body1'}>
            {t('hakemus.tutkinnot.tutkinto.muuTutkintoHuomioSelite')}
          </OphTypography>
          <OphInputFormField
            minRows={5}
            multiline={true}
            value={'TODO muu tutkintohuomio'}
            // onChange={(event) => null}
          />
        </>
      ) : (
        <>
          <OphTypography variant={'h2'}>
            {t('hakemus.tutkinnot.tutkinto.tutkintoOtsikko')}{' '}
            {currentTutkinto.jarjestys}
          </OphTypography>
          {currentTutkinto.jarjestys !== '1' && (
            <OphButton
              sx={{
                alignSelf: 'flex-end',
                paddingLeft: '32px',
                paddingRight: '16px',
              }}
              data-testid={`poista-tutkinto-button-${currentTutkinto.jarjestys}`}
              variant="text"
              startIcon={<DeleteOutline />}
              onClick={() => deleteTutkinto(tutkinto.id)}
            >
              {t('yleiset.poista')}
            </OphButton>
          )}
          <OphSelectFormField
            label={t('hakemus.tutkinnot.tutkinto.tutkintoTodistusOtsikko')}
            options={[]}
            defaultValue={''}
          />
          <OphInputFormField
            label={t('hakemus.tutkinnot.tutkinto.tutkinnonNimi')}
            onChange={(event) =>
              updateCurrentTutkinto({
                ...currentTutkinto,
                nimi: event.target.value,
              })
            }
            value={currentTutkinto.nimi}
            minRows={3}
          />
          <OphInputFormField
            label={t(
              'hakemus.tutkinnot.tutkinto.tutkinnonPaaaineTaiErikoisala',
            )}
            // onChange={(event) => null}
            value={'Todo pääaine'}
            minRows={3}
          />
          <OphSelectFormField
            label={t('hakemus.tutkinnot.tutkinto.tutkinnonMaa')}
            sx={{ width: '50%' }}
            options={maatJaValtiotOptions}
            value={
              currentTutkinto.maakoodi !== undefined
                ? String(currentTutkinto.maakoodi)
                : ''
            }
            onChange={(event) =>
              updateCurrentTutkinto({
                ...currentTutkinto,
                maakoodi:
                  event.target.value === ''
                    ? undefined
                    : Number(event.target.value),
              })
            }
          />
          <Stack direction="row" gap={2}>
            <OphInputFormField
              sx={{ width: '25%' }}
              label={t('hakemus.tutkinnot.tutkinto.opintojenAloitusVuosi')}
              onChange={(event) =>
                updateCurrentTutkinto({
                  ...currentTutkinto,
                  aloitusVuosi: Number(event.target.value),
                })
              }
              value={currentTutkinto.aloitusVuosi}
              minRows={3}
            />
            <OphInputFormField
              sx={{ width: '25%' }}
              label={t('hakemus.tutkinnot.tutkinto.opintojenPaattymisVuosi')}
              onChange={(event) =>
                updateCurrentTutkinto({
                  ...currentTutkinto,
                  paattymisVuosi: Number(event.target.value),
                })
              }
              value={currentTutkinto.paattymisVuosi}
              minRows={3}
            />
          </Stack>
          <OphInputFormField
            sx={{ width: '25%' }}
            label={t('hakemus.tutkinnot.tutkinto.todistuksenPvm')}
            onChange={(event) =>
              updateCurrentTutkinto({
                ...currentTutkinto,
                todistuksenPaivamaara: event.target.value,
              })
            }
            value={currentTutkinto.todistuksenPaivamaara}
            minRows={3}
          />
          <OphSelectFormField
            label={t('hakemus.tutkinnot.tutkinto.tutkinnonKoulutusala')}
            sx={{ width: '25%' }}
            options={koulutusLuokitusOptions}
            // onChange={(event) => null}
            defaultValue={''}
          />
        </>
      )}
      <Divider orientation={'horizontal'} />
    </Stack>
  );
};
