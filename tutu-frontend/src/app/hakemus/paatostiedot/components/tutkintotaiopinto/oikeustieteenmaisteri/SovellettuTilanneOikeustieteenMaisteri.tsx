import { InfoOutlined } from '@mui/icons-material';
import { Stack } from '@mui/material';
import {
  OphFormFieldWrapper,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { InFoTeksti } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/Info';
import { EurooppaOpinnot } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/oikeustieteenmaisteri/EurooppaOpinnot';
import { OpintoOptionWithLaajuusInput } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/oikeustieteenmaisteri/OpintoOptionWithLaajuusInput';
import { OpintopisteTaulukko } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/oikeustieteenmaisteri/OpintopisteTaulukko';
import { SuomiOpinnot } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/oikeustieteenmaisteri/SuomiOpinnot';
import {
  emptyOikeustieteenMaisterinOpinnot,
  initOrUpdateOikeustieteenMaisteriOpinnot,
  newLaajuusValue,
} from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  MyonteisenPaatoksenLisavaatimukset,
  MyonteisenPaatoksenLisavaatimusUpdateCallback,
  OikeustieteenMaisteriLisavaatimukset,
} from '@/src/lib/types/paatos';

interface SovellettuTilanneOikeustieteenMaisteriProps {
  t: TFunction;
  updateLisavaatimukset: MyonteisenPaatoksenLisavaatimusUpdateCallback;
  lisavaatimukset?: MyonteisenPaatoksenLisavaatimukset;
}

const SOVELLETUT_TILANTEET_FOR_TALLINNA_OPINNOT = ['1', '1a', '1b', '2', '2a'];
const SOVELLETUT_TILANTEET_FOR_EUROPPA_OPINNOT = ['2', '2a'];

const Tayttoohje = ({ t }: { t: TFunction }) => {
  return (
    <Stack direction="row" gap={1}>
      <InfoOutlined />
      <OphTypography>
        {t('hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.tayttoOhje')}
      </OphTypography>
    </Stack>
  );
};

const SovellettuTilanneComponent = ({
  t,
  lisavaatimukset,
  sovellettuTilanne,
  updateAction,
}: {
  t: TFunction;
  lisavaatimukset: OikeustieteenMaisteriLisavaatimukset;
  sovellettuTilanne: string;
  updateAction: (
    updatedData: Partial<OikeustieteenMaisteriLisavaatimukset>,
  ) => void;
}) => {
  const showTallinnaOpinnot: boolean =
    SOVELLETUT_TILANTEET_FOR_TALLINNA_OPINNOT.includes(sovellettuTilanne);
  const showEurooppaOpinnot: boolean =
    SOVELLETUT_TILANTEET_FOR_EUROPPA_OPINNOT.includes(sovellettuTilanne);

  return (
    <Stack direction="column" gap={3}>
      <Tayttoohje t={t} />
      {showTallinnaOpinnot && (
        <OphFormFieldWrapper
          sx={{ gap: 1 }}
          label={t(
            'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.tallinnaOpinnot',
          )}
          renderInput={() => (
            <Stack direction="column" gap={3}>
              <OpintoOptionWithLaajuusInput
                t={t}
                checkboxLabel={
                  'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.tallinnaOpinnotHuomioitu'
                }
                laajuusLabel={
                  'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.tallinnaOpinnotLaajuus'
                }
                checkboxDataTestId={
                  'sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot'
                }
                laajuusDataTestId={
                  'sovellettuTilanne-oikeustieteenMaisteri-tallinnaOpinnot-laajuus'
                }
                isChecked={lisavaatimukset.tallinnassaSuoritettujaOpintoja}
                laajuus={lisavaatimukset.tallinnaOpintojenLaajuus}
                updateCb={(checked?: boolean, val?: number | null) => {
                  const updatedLisavaatimukset: Partial<OikeustieteenMaisteriLisavaatimukset> =
                    {};
                  if (val !== undefined) {
                    updatedLisavaatimukset.isTallinnaOpintojenLaajuusModified = true;
                  }
                  updatedLisavaatimukset.tallinnassaSuoritettujaOpintoja =
                    checked ?? lisavaatimukset.tallinnassaSuoritettujaOpintoja;
                  updatedLisavaatimukset.tallinnaOpintojenLaajuus =
                    newLaajuusValue(
                      lisavaatimukset.tallinnaOpintojenLaajuus,
                      val,
                    );
                  updateAction(updatedLisavaatimukset);
                }}
              />
            </Stack>
          )}
        />
      )}
      {showEurooppaOpinnot && (
        <OphFormFieldWrapper
          sx={{ gap: 1 }}
          label={t(
            'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.eurooppaOpinnot',
          )}
          renderInput={() => (
            <EurooppaOpinnot
              t={t}
              vaatimukset={lisavaatimukset}
              updateAction={updateAction}
            />
          )}
        />
      )}
      <OphFormFieldWrapper
        sx={{ gap: 1 }}
        label={t(
          'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.suomiOpinnot',
        )}
        renderInput={() => (
          <SuomiOpinnot
            t={t}
            vaatimukset={lisavaatimukset}
            updateAction={updateAction}
          />
        )}
      />
    </Stack>
  );
};

export const SovellettuTilanneOikeustieteenMaisteri = ({
  t,
  lisavaatimukset,
  updateLisavaatimukset,
}: SovellettuTilanneOikeustieteenMaisteriProps) => {
  const updateAction = (
    updatedData: Partial<OikeustieteenMaisteriLisavaatimukset>,
  ) => {
    const toBeLisavaatimukset = initOrUpdateOikeustieteenMaisteriOpinnot(
      {
        ...emptyOikeustieteenMaisterinOpinnot(),
        ...lisavaatimukset?.oikeustieteenMaisteriLisavaatimukset,
      },
      updatedData,
    );
    updateLisavaatimukset({
      ...lisavaatimukset,
      oikeustieteenMaisteriLisavaatimukset: toBeLisavaatimukset,
    });
  };
  const sovellettuTilanne = lisavaatimukset?.sovellettuTilanne ?? '';
  return (
    <Stack direction="column" gap={3}>
      {sovellettuTilanne === 'muu' ? (
        <OphInputFormField
          multiline={true}
          minRows={3}
          value={
            lisavaatimukset?.oikeustieteenMaisteriLisavaatimukset
              ?.muuSovellettuTilanneLisatieto || ''
          }
          onChange={(e) => {
            updateAction({
              muuSovellettuTilanneLisatieto: e.target.value,
            });
          }}
          data-testid={
            'sovellettuTilanne-oikeustieteenMaisteri-muuSovellettuTilanneLisatieto'
          }
        />
      ) : (
        <>
          <SovellettuTilanneComponent
            t={t}
            lisavaatimukset={
              lisavaatimukset?.oikeustieteenMaisteriLisavaatimukset ??
              emptyOikeustieteenMaisterinOpinnot()
            }
            updateAction={updateAction}
            sovellettuTilanne={lisavaatimukset?.sovellettuTilanne ?? ''}
          />
          <OpintopisteTaulukko
            t={t}
            sovellettuTilanne={lisavaatimukset?.sovellettuTilanne ?? ''}
            tallinnaOpintojenLaajuus={
              lisavaatimukset?.oikeustieteenMaisteriLisavaatimukset
                ?.tallinnaOpintojenLaajuus
            }
            eurooppaOpintojenLaajuus={
              lisavaatimukset?.oikeustieteenMaisteriLisavaatimukset
                ?.eurooppaOpintojenLaajuus
            }
            suomiOpintojenLaajuus={
              lisavaatimukset?.oikeustieteenMaisteriLisavaatimukset
                ?.suomiOpintojenLaajuus
            }
          />
          <InFoTeksti
            infoTeksti={t(
              'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.vahimmaismaaraHuomautus',
            )}
          />
        </>
      )}
    </Stack>
  );
};
