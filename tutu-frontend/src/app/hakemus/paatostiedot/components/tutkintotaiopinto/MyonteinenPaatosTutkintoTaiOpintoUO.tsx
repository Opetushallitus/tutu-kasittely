import { Info } from '@mui/icons-material';
import { FormGroup, Paper, Stack } from '@mui/material';
import {
  OphCheckbox,
  ophColors,
  OphFormFieldWrapper,
  OphRadioGroup,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useMemo } from 'react';

import { KorvaavaToimenpideComponent } from '@/src/app/hakemus/paatostiedot/components/KorvaavaToimenpide';
import { MyonteinenPaatosProps } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/MyonteinenPaatos';
import { SovellettuTilanneOikeustieteenMaisteri } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/oikeustieteenmaisteri/SovellettuTilanneOikeustieteenMaisteri';
import {
  SovellettuTilanneSelection,
  SovellettuTilanneOption,
} from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/SovellettuTilanneSelection';
import {
  OIKEUSTIETEEN_MAISTERI_KEYS,
  OPETTAJAN_PEDAGOGISET_OPINNOT_KEYS,
  SimpleKoulutusEroModel,
} from '@/src/app/hakemus/paatostiedot/constants';
import {
  initOrUpdateErotKoulutuksessa,
  setKoulutusEroValues,
} from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { NamedBoolean } from '@/src/lib/types/common';
import {
  AmmattikokemuksenHuomioiminen,
  KorvaavaToimenpide,
  SuomessaSuoritettujenOpintojenHuomioiminen,
} from '@/src/lib/types/paatos';

enum ResolvedEntity {
  oikeustieteenMaisteri,
  opetettavaAine,
  opettajanPedagogisetOpinnot,
  erityisopetus,
  oppilasJaOpintoOhjaus,
  kasvatustieteellinenAla,
  sosiaaliJaTerveysAla,
  monialaisetOpinnot,
  ammatillisetValmiudet,
  muu,
}

const KEYWORDS_BY_TUTKINTO_TAI_OPINTO = [
  {
    tutkintoTaiOpinto: ResolvedEntity.oikeustieteenMaisteri,
    keywords: OIKEUSTIETEEN_MAISTERI_KEYS,
  },
  { tutkintoTaiOpinto: ResolvedEntity.opetettavaAine, keywords: [] },
  {
    tutkintoTaiOpinto: ResolvedEntity.opettajanPedagogisetOpinnot,
    keywords: OPETTAJAN_PEDAGOGISET_OPINNOT_KEYS,
  },
  { tutkintoTaiOpinto: ResolvedEntity.erityisopetus, keywords: [] },
  { tutkintoTaiOpinto: ResolvedEntity.oppilasJaOpintoOhjaus, keywords: [] },
  { tutkintoTaiOpinto: ResolvedEntity.kasvatustieteellinenAla, keywords: [] },
  { tutkintoTaiOpinto: ResolvedEntity.sosiaaliJaTerveysAla, keywords: [] },
  { tutkintoTaiOpinto: ResolvedEntity.monialaisetOpinnot, keywords: [] },
  { tutkintoTaiOpinto: ResolvedEntity.ammatillisetValmiudet, keywords: [] },
  { tutkintoTaiOpinto: ResolvedEntity.muu, keywords: [] },
];

const SOVELLETTU_TILANNE_BY_ENTITY: Record<
  ResolvedEntity,
  SovellettuTilanneOption[]
> = {
  [ResolvedEntity.oikeustieteenMaisteri]: [
    { value: '1' },
    { value: '1a' },
    { value: '1b' },
    { value: '2' },
    { value: '2a' },
    { value: '3' },
    { value: '4' },
    { value: '4a' },
    { value: 'muu', tKey: 'muuOikeustieteenMaisteri' },
  ],
  [ResolvedEntity.opetettavaAine]: [],
  [ResolvedEntity.opettajanPedagogisetOpinnot]: [
    { value: 'pedagogiset1', tKey: 'pedagogiset', ordinal: '1' },
    { value: 'pedagogiset2', tKey: 'pedagogiset', ordinal: '2' },
    { value: 'pedagogiset3', tKey: 'pedagogiset', ordinal: '3' },
  ],
  [ResolvedEntity.erityisopetus]: [],
  [ResolvedEntity.oppilasJaOpintoOhjaus]: [],
  [ResolvedEntity.kasvatustieteellinenAla]: [],
  [ResolvedEntity.sosiaaliJaTerveysAla]: [],
  [ResolvedEntity.monialaisetOpinnot]: [],
  [ResolvedEntity.ammatillisetValmiudet]: [],
  [ResolvedEntity.muu]: [],
};

const EROT_KOULUTUKSESSA_BY_ENTITY: Record<
  ResolvedEntity,
  SimpleKoulutusEroModel | undefined
> = {
  [ResolvedEntity.oikeustieteenMaisteri]: undefined,
  [ResolvedEntity.opetettavaAine]: undefined,
  [ResolvedEntity.opettajanPedagogisetOpinnot]: {
    kelpoisuusKohtainenEroLkm: 2,
  },
  [ResolvedEntity.erityisopetus]: undefined,
  [ResolvedEntity.oppilasJaOpintoOhjaus]: undefined,
  [ResolvedEntity.kasvatustieteellinenAla]: undefined,
  [ResolvedEntity.sosiaaliJaTerveysAla]: undefined,
  [ResolvedEntity.monialaisetOpinnot]: undefined,
  [ResolvedEntity.ammatillisetValmiudet]: undefined,
  [ResolvedEntity.muu]: undefined,
};

const AMMATTIKOKEMUKSEN_HUOMIOIMINEN_OPTIONS: Array<AmmattikokemuksenHuomioiminen> =
  [
    'SuomessaHankittuKokonaan',
    'SuomessaHankittuOsittain',
    'UlkomaillaHankittuKokonaan',
    'UlkomaillaHankittuOsittain',
    'SuomessaJaUlkomaillaHankittuKokonaan',
    'SuomessaJaUlkomaillaHankittuOsittain',
    'EiHuomioida',
  ];

const TAYSI_AMMATTIKOKEMUS_OPTIONS: Array<AmmattikokemuksenHuomioiminen> = [
  'SuomessaHankittuKokonaan',
  'UlkomaillaHankittuKokonaan',
  'SuomessaJaUlkomaillaHankittuKokonaan',
];

const OSITTAINEN_AMMATTIKOKEMUS_OPTIONS: Array<AmmattikokemuksenHuomioiminen> =
  [
    'SuomessaHankittuOsittain',
    'UlkomaillaHankittuOsittain',
    'SuomessaJaUlkomaillaHankittuOsittain',
  ];

const SUOMESSASUORITETTUJEN_OPINTOJEN_HUOMIOIMINEN_OPTIONS: Array<SuomessaSuoritettujenOpintojenHuomioiminen> =
  ['KorvaavatKokonaan', 'KorvaavatOsittain', 'EiHuomioida'];

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
        KEYWORDS_BY_TUTKINTO_TAI_OPINTO.find((item) =>
          item.keywords.some((kw) => (tutkintoTaiOpinto ?? '').includes(kw)),
        )?.tutkintoTaiOpinto ?? ResolvedEntity.muu;
      const koulutusEroModel = EROT_KOULUTUKSESSA_BY_ENTITY[entity];
      const erotKoulutuksessa = koulutusEroModel
        ? initOrUpdateErotKoulutuksessa(
            koulutusEroModel,
            lisavaatimukset?.erotKoulutuksessa,
          )
        : undefined;

      return {
        selectedEntity: entity,
        sovellettuTilanneOptions: SOVELLETTU_TILANNE_BY_ENTITY[entity],
        erotKoulutuksessa: erotKoulutuksessa,
      };
    }, [tutkintoTaiOpinto, lisavaatimukset?.erotKoulutuksessa]);

  const showOsaamisenTaydentamisenTavat = useMemo(() => {
    const ammattikokemus = lisavaatimukset?.ammattikokemuksenHuomioiminen;
    const suomiOpinnot =
      lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen;
    return (
      ((ammattikokemus &&
        OSITTAINEN_AMMATTIKOKEMUS_OPTIONS.includes(ammattikokemus)) ||
        suomiOpinnot === 'KorvaavatOsittain') &&
      !(
        (ammattikokemus &&
          TAYSI_AMMATTIKOKEMUS_OPTIONS.includes(ammattikokemus)) ||
        suomiOpinnot === 'KorvaavatKokonaan'
      )
    );
  }, [
    lisavaatimukset?.ammattikokemuksenHuomioiminen,
    lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen,
  ]);

  const sovellettuTilanneSelection = (
    <SovellettuTilanneSelection
      t={t}
      sovellettuTilanne={lisavaatimukset?.sovellettuTilanne}
      sovellettuTilanneOptions={sovellettuTilanneOptions}
      updateCb={(st) =>
        updateLisavaatimukset({ ...lisavaatimukset, sovellettuTilanne: st })
      }
    />
  );

  if (selectedEntity === ResolvedEntity.oikeustieteenMaisteri) {
    return (
      <Stack gap={3}>
        {sovellettuTilanneSelection}
        {lisavaatimukset?.sovellettuTilanne && (
          <SovellettuTilanneOikeustieteenMaisteri
            t={t}
            lisavaatimukset={lisavaatimukset}
            updateLisavaatimukset={updateLisavaatimukset}
          />
        )}
      </Stack>
    );
  }

  return (
    <Stack gap={3}>
      {sovellettuTilanneSelection}
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
                      updateLisavaatimukset({
                        ...lisavaatimukset,
                        erotKoulutuksessa: {
                          ...erotKoulutuksessa,
                          erot: setKoulutusEroValues(
                            erotKoulutuksessa.erot!,
                            ero.name,
                            e.target.checked,
                          ),
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
                              label={t(
                                `hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.${ResolvedEntity[selectedEntity]}.${ero.name}.${tarkennus.name}`,
                              )}
                              checked={tarkennus.value}
                              onChange={(e) => {
                                updateLisavaatimukset({
                                  ...lisavaatimukset,
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
                ...lisavaatimukset,
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
            options={SUOMESSASUORITETTUJEN_OPINTOJEN_HUOMIOIMINEN_OPTIONS.map(
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
                ...lisavaatimukset,
                suomessaSuoritettujenOpintojenHuomioiminen: event.target
                  .value as SuomessaSuoritettujenOpintojenHuomioiminen,
              });
            }}
            data-testid={`uo-suomessaSuoritettujenOpintojenHuomioiminen-radio`}
          />
        )}
      />
      {showOsaamisenTaydentamisenTavat && (
        <KorvaavaToimenpideComponent
          korvaavaToimenpide={lisavaatimukset?.korvaavaToimenpide}
          label={t(
            'hakemus.paatos.myonteinenPaatos.uo.osaamisenTaydentamisenTavat',
          )}
          updateKorvaavaToimenpide={(
            korvaavaToimenpide: KorvaavaToimenpide,
          ) => {
            updateLisavaatimukset({
              ...lisavaatimukset,
              korvaavaToimenpide: korvaavaToimenpide,
            });
          }}
          t={t}
          kelpoisuuskoeTransKeyBase={
            'hakemus.paatos.myonteinenPaatos.uo.kelpoisuuskoe'
          }
          testIdPrefix={'osaamisenTaydentamisenTavat'}
          kelpoisuuskoeFieldLabelPrefix={ResolvedEntity[selectedEntity]}
          showTaydentavatOpinnot
        />
      )}
      {lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen ===
        'EiHuomioida' &&
        lisavaatimukset?.ammattikokemuksenHuomioiminen === 'EiHuomioida' && (
          <Paper
            square
            variant={'outlined'}
            sx={{
              padding: 2,
              display: 'flex',
              gap: 1,
              flexDirection: 'row',
              backgroundColor: `${ophColors.blue2}0A`,
              borderColor: `${ophColors.blue2}0A`,
            }}
          >
            <Info sx={{ color: ophColors.blue2 }} />
            <OphTypography>
              {t(
                'hakemus.paatos.myonteinenPaatos.uo.kaytetaanLahtokohtaisiaOsaamisenTaydentamisenTapoja',
              )}
            </OphTypography>
          </Paper>
        )}
    </Stack>
  );
};
