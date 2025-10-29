import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Direktiivitaso, Kelpoisuus, SovellettuLaki } from '@/src/lib/types/paatos';
import { Stack, useTheme } from '@mui/material';
import {
  OphButton,
  OphFormFieldWrapper,
  OphInputFormField,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { DeleteOutline } from '@mui/icons-material';
import { ophColors } from '@/src/lib/theme';
import { OphSelectMultiple } from '@/src/components/OphSelectMultiple';
import { direktiivitasoOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';

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
};

export const KelpoisuusComponent = ({
  t,
  index,
  kelpoisuus,
  sovellettuLaki,
  updateKelpoisuusAction,
  deleteKelpoisuusAction,
}: kelpoisuusComponentProps) => {
  const theme = useTheme();
  const { showConfirmation } = useGlobalConfirmationModal();
  const showDirektiivitasoFields =
    sovellettuLaki === 'ap' || sovellettuLaki === 'ap_seut';

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
            data-testid={`poista-tutkinto-tai-opinto-button`}
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
        <OphSelectFormField
          placeholder={t('yleiset.valitse')}
          label={t(`hakemus.paatos.paatostyyppi.kelpoisuus.otsikko`)}
          sx={{ width: '100%' }}
          //TODO seuraavassa vaiheessa oikeat optionsit
          options={[{ value: 'testi', label: 'TODO' }]}
          onChange={(e) =>
            updateKelpoisuusAction(
              { ...kelpoisuus, kelpoisuus: e.target.value },
              index,
            )
          }
          value={kelpoisuus.kelpoisuus || ''}
          data-testid={`kelpoisuus-select`}
          //TODO seuraavassa vaiheessa näytetään oikeat kentät ammatin mukaan
        />
        {showDirektiivitasoFields && (
          <>
            <OphSelectFormField
              placeholder={t('yleiset.valitse')}
              label={t(`hakemus.paatos.paatostyyppi.kelpoisuus.opetettavaAine`)}
              sx={{ width: '100%' }}
              //TODO seuraavassa vaiheessa oikeat optionsit
              options={[{ value: 'testi', label: 'TUDU' }]}
              onChange={(e) =>
                updateKelpoisuusAction(
                  { ...kelpoisuus, opetettavaAine: e.target.value },
                  index,
                )
              }
              value={kelpoisuus.kelpoisuus || ''}
              data-testid={`opetettava-aine-select`}
            />
            <Stack>
              <OphTypography variant={'label'}>
                {t('hakemus.paatos.paatostyyppi.kelpoisuus.muuAmmatti')}
              </OphTypography>
              <OphInputFormField
                sx={{
                  '& .MuiFormLabel-root': {
                    fontWeight: 'normal',
                  },
                }}
                label={t(
                  `hakemus.paatos.paatostyyppi.kelpoisuus.muuAmmattiKuvaus`,
                )}
                multiline={true}
                minRows={3}
                value={kelpoisuus.direktiivitasoLisatiedot || ''}
                onChange={(e) =>
                  updateKelpoisuusAction(
                    { ...kelpoisuus, direktiivitasoLisatiedot: e.target.value },
                    index,
                  )
                }
                data-testid={`direktiivitasoLisatieto-input`}
              />
            </Stack>
            <OphSelectFormField
              placeholder={t('yleiset.valitse')}
              label={t(`hakemus.paatos.paatostyyppi.kelpoisuus.direktiivitaso`)}
              sx={{ width: '100%' }}
              options={direktiivitasoOptions(t)}
              onChange={(e) =>
                updateKelpoisuusAction(
                  {
                    ...kelpoisuus,
                    direktiivitaso: e.target.value as Direktiivitaso,
                  },
                  index,
                )
              }
              value={kelpoisuus.direktiivitaso || ''}
              data-testid={`direktiivitaso-select`}
            />
            <OphInputFormField
              label={t(
                `hakemus.paatos.paatostyyppi.kelpoisuus.direktiivitasoLisatieto`,
              )}
              multiline={true}
              minRows={3}
              value={kelpoisuus.direktiivitasoLisatiedot || ''}
              onChange={(e) =>
                updateKelpoisuusAction(
                  { ...kelpoisuus, direktiivitasoLisatiedot: e.target.value },
                  index,
                )
              }
              data-testid={`direktiivitasoLisatieto-input`}
            />
            <OphSelectFormField
              placeholder={t('yleiset.valitse')}
              label={t(
                `hakemus.paatos.paatostyyppi.kelpoisuus.kansallisestiVaadittavaDirektiivitaso`,
              )}
              sx={{ width: '100%' }}
              options={direktiivitasoOptions(t)}
              onChange={(e) =>
                updateKelpoisuusAction(
                  {
                    ...kelpoisuus,
                    kansallisestiVaadittavaDirektiivitaso: e.target
                      .value as Direktiivitaso,
                  },
                  index,
                )
              }
              value={kelpoisuus.kansallisestiVaadittavaDirektiivitaso || ''}
              data-testid={`kansallisestiVaadittavaDirektiivitaso-select`}
            />
          </>
        )}
      </Stack>
    </Stack>
  );
};
