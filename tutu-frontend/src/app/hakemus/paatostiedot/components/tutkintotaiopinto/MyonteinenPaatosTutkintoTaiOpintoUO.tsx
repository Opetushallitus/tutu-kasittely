import { FormGroup, Stack } from '@mui/material';
import {
  OphCheckbox,
  OphFormFieldWrapper,
  OphRadioGroup,
} from '@opetushallitus/oph-design-system';
import React, { useMemo } from 'react';

import { SovellettuTilanneOikeustieteenMaisteri } from './oikeustieteenmaisteri/SovellettuTilanneOikeustieteenMaisteri';

import { InFoTeksti } from '@/src/app/hakemus/paatostiedot/components/Info';
import { KorvaavaToimenpideComponent } from '@/src/app/hakemus/paatostiedot/components/KorvaavaToimenpide';
import {
  MyonteinenPaatos,
  MyonteinenPaatosProps,
} from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/MyonteinenPaatos';
import { SovellettuTilanneSelection } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/SovellettuTilanneSelection';
import {
  EROT_KOULUTUKSESSA_BY_ENTITY,
  initOrUpdateTutkintoTaiOpintoMyonteinenUo,
  KEYWORDS_BY_TUTKINTO_TAI_OPINTO,
  ResolvedEntity,
  shouldShowLisavalinnat,
  SOVELLETTU_TILANNE_BY_ENTITY,
  translationForEroTarkennus,
} from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/tutkintoTaiOpintoUtils';
import {
  AMMATTIKOKEMUKSEN_HUOMIOIMINEN_OPTIONS,
  SUOMESSA_SUORITETTUJEN_OPINTOJEN_HUOMIOIMINEN_OPTIONS,
} from '@/src/app/hakemus/paatostiedot/constants';
import {
  emptyErotKoulutuksessaForModel,
  initOrUpdateErotKoulutuksessa,
  setKoulutusEroValues,
} from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { NamedBoolean } from '@/src/lib/types/common';
import {
  AmmattikokemuksenHuomioiminen,
  ErotKoulutuksessa,
  KorvaavaToimenpide,
  MyonteisenPaatoksenLisavaatimukset,
  MyonteisenPaatoksenLisavaatimusUpdateCallback,
  SuomessaSuoritettujenOpintojenHuomioiminen,
} from '@/src/lib/types/paatos';

const Lisavalinnat = ({
  updateLisavaatimukset,
  lisavaatimukset,
  t,
  selectedEntity,
  erotKoulutuksessa,
}: {
  updateLisavaatimukset: MyonteisenPaatoksenLisavaatimusUpdateCallback;
  lisavaatimukset?: MyonteisenPaatoksenLisavaatimukset;
  t: TFunction;
  selectedEntity: ResolvedEntity;
  erotKoulutuksessa: ErotKoulutuksessa | undefined;
}) => {
  const showLisavalinnat = useMemo(() => {
    return shouldShowLisavalinnat(
      selectedEntity,
      lisavaatimukset?.sovellettuTilanne,
    );
  }, [selectedEntity, lisavaatimukset?.sovellettuTilanne]);

  if (!showLisavalinnat) {
    return (
      <InFoTeksti
        infoTeksti={t('hakemus.paatos.myonteinenPaatos.uo.eiKoulutusEroja')}
      />
    );
  }

  return (
    <>
      {erotKoulutuksessa && (
        <OphFormFieldWrapper
          renderInput={({ labelId }) => (
            <FormGroup aria-labelledby={labelId}>
              {erotKoulutuksessa.erot!.map((ero: NamedBoolean) => (
                <React.Fragment key={ero.name}>
                  <OphCheckbox
                    data-testid={`myonteinenPaatos-uo-erotKoulutuksessa-${ero.name}`}
                    label={t(
                      `hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.${ResolvedEntity[selectedEntity]}.${ero.name}`,
                    )}
                    checked={ero.value}
                    onChange={(e) => {
                      const updatedEroValue = e.target.checked;
                      const tarkennukset =
                        erotKoulutuksessa.eroTarkennukset?.[ero.name];
                      updateLisavaatimukset({
                        erotKoulutuksessa: {
                          ...erotKoulutuksessa,
                          erot: setKoulutusEroValues(
                            erotKoulutuksessa.erot!,
                            ero.name,
                            updatedEroValue,
                          ),
                          eroTarkennukset:
                            !updatedEroValue && tarkennukset
                              ? {
                                  ...erotKoulutuksessa.eroTarkennukset,
                                  [ero.name]: tarkennukset.map((tarkennus) => ({
                                    ...tarkennus,
                                    value: false,
                                  })),
                                }
                              : erotKoulutuksessa.eroTarkennukset,
                        },
                      });
                    }}
                  />
                  {ero.value &&
                    erotKoulutuksessa.eroTarkennukset?.[ero.name] && (
                      <FormGroup sx={{ paddingLeft: 4 }}>
                        {erotKoulutuksessa.eroTarkennukset![ero.name].map(
                          (tarkennus: NamedBoolean) => (
                            <OphCheckbox
                              key={tarkennus.name}
                              data-testid={`erotKoulutuksessa-${ero.name}-${tarkennus.name}`}
                              label={translationForEroTarkennus(
                                t,
                                `hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.${ResolvedEntity[selectedEntity]}.${ero.name}.${tarkennus.name}`,
                              )}
                              checked={tarkennus.value}
                              onChange={(e) => {
                                updateLisavaatimukset({
                                  erotKoulutuksessa: {
                                    ...erotKoulutuksessa,
                                    eroTarkennukset: {
                                      ...erotKoulutuksessa.eroTarkennukset,
                                      [ero.name]: setKoulutusEroValues(
                                        erotKoulutuksessa.eroTarkennukset![
                                          ero.name
                                        ],
                                        tarkennus.name,
                                        e.target.checked,
                                      ),
                                    },
                                  },
                                });
                              }}
                            />
                          ),
                        )}
                      </FormGroup>
                    )}
                </React.Fragment>
              ))}
            </FormGroup>
          )}
          label={t(
            `hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.otsikko`,
          )}
        />
      )}
      <KorvaavaToimenpideComponent
        korvaavaToimenpide={
          lisavaatimukset?.lahtokohtaisetOsaamisenTaydentamisenTavat
        }
        label={t(
          'hakemus.paatos.myonteinenPaatos.uo.lahtokohtaisetOsaamisenTaydentamisenTavat.otsikko',
        )}
        updateKorvaavaToimenpide={(korvaavaToimenpide: KorvaavaToimenpide) => {
          updateLisavaatimukset({
            ...lisavaatimukset,
            lahtokohtaisetOsaamisenTaydentamisenTavat: korvaavaToimenpide,
          });
        }}
        t={t}
        kelpoisuuskoeTransKeyBase={
          'hakemus.paatos.myonteinenPaatos.uo.kelpoisuuskoe'
        }
        testIdPrefix={'lahtokohtaisetOsaamisenTaydentamisenTavat'}
        showTaydentavatOpinnot
        kelpoisuuskoeFieldLabelPrefix={ResolvedEntity[selectedEntity]}
        useOrdinalForKelpoisuuskoeLabels={true}
      />
      <OphFormFieldWrapper
        label={t(
          `hakemus.paatos.myonteinenPaatos.uo.ammattikokemuksenHuomioiminen`,
        )}
        renderInput={({ labelId }) => (
          <OphRadioGroup
            sx={{ marginTop: 1 }}
            options={AMMATTIKOKEMUKSEN_HUOMIOIMINEN_OPTIONS.map((option) => ({
              label: t(
                `hakemus.paatos.myonteinenPaatos.uo.ammattikokemuksenHuomioiminen.${option}`,
              ),
              value: option,
            }))}
            labelId={labelId}
            value={lisavaatimukset?.ammattikokemuksenHuomioiminen || ''}
            onChange={(event) => {
              updateLisavaatimukset({
                ammattikokemuksenHuomioiminen: event.target
                  .value as AmmattikokemuksenHuomioiminen,
              });
            }}
            data-testid={`uo-ammattikokemuksenHuomioiminen-radio`}
          />
        )}
      />
      <OphFormFieldWrapper
        label={t(
          `hakemus.paatos.myonteinenPaatos.uo.suomessaSuoritettujenOpintojenHuomioiminen`,
        )}
        renderInput={({ labelId }) => (
          <OphRadioGroup
            options={SUOMESSA_SUORITETTUJEN_OPINTOJEN_HUOMIOIMINEN_OPTIONS.map(
              (option) => ({
                label: t(
                  `hakemus.paatos.myonteinenPaatos.uo.suomessaSuoritettujenOpintojenHuomioiminen.${option}`,
                ),
                value: option,
              }),
            )}
            sx={{ marginTop: 1 }}
            labelId={labelId}
            value={
              lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen || ''
            }
            onChange={(event) => {
              updateLisavaatimukset({
                suomessaSuoritettujenOpintojenHuomioiminen: event.target
                  .value as SuomessaSuoritettujenOpintojenHuomioiminen,
              });
            }}
            data-testid={`uo-suomessaSuoritettujenOpintojenHuomioiminen-radio`}
          />
        )}
      />
      {lisavaatimukset?.korvaavaToimenpide && (
        <KorvaavaToimenpideComponent
          korvaavaToimenpide={lisavaatimukset?.korvaavaToimenpide}
          label={t(
            'hakemus.paatos.myonteinenPaatos.uo.osaamisenTaydentamisenTavat',
          )}
          updateKorvaavaToimenpide={(
            korvaavaToimenpide: KorvaavaToimenpide,
          ) => {
            updateLisavaatimukset({
              korvaavaToimenpide: korvaavaToimenpide,
            });
          }}
          t={t}
          kelpoisuuskoeTransKeyBase={
            'hakemus.paatos.myonteinenPaatos.uo.kelpoisuuskoe'
          }
          testIdPrefix={'osaamisenTaydentamisenTavat'}
          kelpoisuuskoeFieldLabelPrefix={ResolvedEntity[selectedEntity]}
          useOrdinalForKelpoisuuskoeLabels={true}
          showTaydentavatOpinnot
        />
      )}
      {lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen ===
        'EiHuomioida' &&
        lisavaatimukset?.ammattikokemuksenHuomioiminen === 'EiHuomioida' && (
          <InFoTeksti
            infoTeksti={t(
              'hakemus.paatos.myonteinenPaatos.uo.kaytetaanLahtokohtaisiaOsaamisenTaydentamisenTapoja',
            )}
          />
        )}
    </>
  );
};

export const MyonteinenPaatosTutkintoTaiOpintoUO: React.FC<
  MyonteinenPaatosProps
> = ({
  t,
  updateLisavaatimukset,
  tutkintoTaiOpinto,
  lisavaatimukset,
}: MyonteinenPaatosProps) => {
  const { selectedEntity, sovellettuTilanneOptions, erotKoulutuksessa } =
    useMemo(() => {
      const entity =
        KEYWORDS_BY_TUTKINTO_TAI_OPINTO.find(
          (item) =>
            item.keyword && (tutkintoTaiOpinto ?? '').includes(item.keyword),
        )?.tutkintoTaiOpinto ?? ResolvedEntity.muu;
      const koulutusEroModel = EROT_KOULUTUKSESSA_BY_ENTITY[entity];
      const erotKoulutuksessa = koulutusEroModel
        ? initOrUpdateErotKoulutuksessa(
            emptyErotKoulutuksessaForModel(koulutusEroModel),
            lisavaatimukset?.erotKoulutuksessa,
          )
        : undefined;

      return {
        selectedEntity: entity,
        sovellettuTilanneOptions: SOVELLETTU_TILANNE_BY_ENTITY[entity],
        erotKoulutuksessa,
      };
    }, [tutkintoTaiOpinto, lisavaatimukset?.erotKoulutuksessa]);

  const updateAction = (
    updatedData: Partial<MyonteisenPaatoksenLisavaatimukset>,
  ) => {
    const toBeLisavaatimukset = initOrUpdateTutkintoTaiOpintoMyonteinenUo(
      selectedEntity,
      updatedData,
      lisavaatimukset,
    );
    updateLisavaatimukset(toBeLisavaatimukset);
  };

  if (selectedEntity === ResolvedEntity.muu) {
    return (
      <MyonteinenPaatos
        t={t}
        lisavaatimukset={lisavaatimukset}
        updateLisavaatimukset={updateAction}
      />
    );
  }
  const sovellettuTilanneSetOrNotNeeded =
    lisavaatimukset?.sovellettuTilanne || sovellettuTilanneOptions.length === 0;

  return (
    <Stack spacing={3}>
      <SovellettuTilanneSelection
        t={t}
        sovellettuTilanne={lisavaatimukset?.sovellettuTilanne}
        sovellettuTilanneOptions={sovellettuTilanneOptions}
        updateCb={(st) => updateAction({ sovellettuTilanne: st })}
      />
      {sovellettuTilanneSetOrNotNeeded && (
        <>
          {selectedEntity === ResolvedEntity.oikeustieteenMaisteri ? (
            <SovellettuTilanneOikeustieteenMaisteri
              t={t}
              lisavaatimukset={lisavaatimukset}
              updateLisavaatimukset={updateAction}
            />
          ) : (
            <Lisavalinnat
              lisavaatimukset={lisavaatimukset}
              updateLisavaatimukset={updateAction}
              t={t}
              selectedEntity={selectedEntity}
              erotKoulutuksessa={erotKoulutuksessa}
            />
          )}
        </>
      )}
    </Stack>
  );
};
