import { Info } from '@mui/icons-material';
import { FormGroup, Paper, Stack, useTheme } from '@mui/material';
import {
  OphCheckbox,
  ophColors,
  OphFormFieldWrapper,
  OphRadioGroup,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useMemo } from 'react';

import { KorvaavaToimenpideComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/kelpoisuus/KorvaavaToimenpide';
import {
  emptyErotKoulutuksessa,
  initOrUpdateMyonteinenKelpoisuusPaatosUO,
  koulutusEroModel,
  setKoulutusEroValues,
} from '@/src/app/hakemus/[oid]/paatostiedot/paatostietoUtils';
import { OphSelectFormFieldPatched } from '@/src/components/OphSelectFormFieldPatched';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { NamedBoolean } from '@/src/lib/types/common';
import {
  AmmattikokemuksenHuomioiminen,
  KelpoisuudenLisavaatimukset,
  KorvaavaToimenpide,
  MyonteisenPaatoksenLisavaatimusUpdateCallback,
  SuomessaSuoritettujenOpintojenHuomioiminen,
} from '@/src/lib/types/paatos';

type MyonteinenKelpoisuusPaatosUOProps = {
  lisavaatimukset?: KelpoisuudenLisavaatimukset | null;
  updateLisavaatimukset: MyonteisenPaatoksenLisavaatimusUpdateCallback;
  kelpoisuusKey?: string;
};

const getSovellettuTilanneOptions = (
  kelpoisuusKey?: string,
): Array<string> | undefined => {
  switch (kelpoisuusKey) {
    case 'Opetusalan ammatit_Luokanopettaja_uo':
      return [
        'pedagogiset1_ja_monialaiset1',
        'pedagogiset1_ja_monialaiset2',
        'pedagogiset1_ja_monialaiset3',
        'pedagogiset2_ja_monialaiset1',
        'pedagogiset2_ja_monialaiset2',
        'pedagogiset2_ja_monialaiset3',
        'pedagogiset3_ja_monialaiset1',
        'pedagogiset3_ja_monialaiset2',
        'pedagogiset3_ja_monialaiset3',
      ];
    case 'Opetusalan ammatit_Aineenopettaja perusopetuksessa_uo':
      return [
        'pedagogiset1_ja_aine1',
        'pedagogiset1_ja_aine2',
        'pedagogiset1_ja_aine3',
        'pedagogiset2_ja_aine1',
        'pedagogiset2_ja_aine2',
        'pedagogiset2_ja_aine3',
        'pedagogiset3_ja_aine1',
        'pedagogiset3_ja_aine2',
        'pedagogiset3_ja_aine3',
      ];
    case 'Opetusalan ammatit_Aineenopettaja lukiossa_uo':
      return [
        'pedagogiset1_ja_aine1/aine4',
        'pedagogiset1_ja_aine2',
        'pedagogiset1_ja_aine3',
        'pedagogiset1_ja_aine5',
        'pedagogiset1_ja_aine6',
        'pedagogiset2_ja_aine1/aine4',
        'pedagogiset2_ja_aine2',
        'pedagogiset2_ja_aine3',
        'pedagogiset2_ja_aine5',
        'pedagogiset2_ja_aine6',
        'pedagogiset3_ja_aine1/aine4',
        'pedagogiset3_ja_aine2',
        'pedagogiset3_ja_aine3',
        'pedagogiset3_ja_aine5',
        'pedagogiset3_ja_aine6',
      ];
    default:
      return undefined;
  }
};

const getAmmattikokemuksenHuomioiminenOptions = (
  kelpoisuusKey?: string,
): Array<AmmattikokemuksenHuomioiminen> => {
  switch (kelpoisuusKey) {
    case 'Opetusalan ammatit_Luokanopettaja_uo':
      return [
        'SuomessaHankittuKokonaan',
        'SuomessaHankittuOsittain',
        'UlkomaillaHankittuOsittain',
        'EiHuomioida',
      ];
    case 'Opetusalan ammatit_Esiopetusta antava opettaja_uo':
    case 'Opetusalan ammatit_Aineenopettaja perusopetuksessa_uo':
    case 'Opetusalan ammatit_Aineenopettaja lukiossa_uo':
    case 'Opetusalan ammatit_Erityisluokanopettaja_uo':
    case 'Opetusalan ammatit_Erityisopettaja perusopetuksessa_uo':
    case 'Opetusalan ammatit_Erityisopettaja lukiossa_uo':
    case 'Opetusalan ammatit_Muu erityisopettaja_uo':
    case 'Opetusalan ammatit_Oppilaanohjaaja perusopetuksessa_uo':
    case 'Opetusalan ammatit_Oppilaanohjaaja lukiossa_uo':
      return [
        'SuomessaHankittuKokonaan',
        'SuomessaHankittuOsittain',
        'UlkomaillaHankittuKokonaan',
        'UlkomaillaHankittuOsittain',
        'SuomessaJaUlkomaillaHankittuKokonaan',
        'SuomessaJaUlkomaillaHankittuOsittain',
        'EiHuomioida',
      ];
    default:
      return [];
  }
};

const suomessaSuoritettujenOpintojenHuomioiminenOptions: Array<SuomessaSuoritettujenOpintojenHuomioiminen> =
  ['KorvaavatKokonaan', 'KorvaavatOsittain', 'EiHuomioida'];

export const MyonteinenKelpoisuusPaatosUO: React.FC<
  MyonteinenKelpoisuusPaatosUOProps
> = ({
  kelpoisuusKey,
  updateLisavaatimukset,
  lisavaatimukset,
}: MyonteinenKelpoisuusPaatosUOProps) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const sovellettuTilanneOptions = useMemo(
    () => getSovellettuTilanneOptions(kelpoisuusKey),
    [kelpoisuusKey],
  );
  const ammattikokemuksenHuomioiminenOptions = useMemo(
    () => getAmmattikokemuksenHuomioiminenOptions(kelpoisuusKey),
    [kelpoisuusKey],
  );
  const showOsaamisenTaydentamisenTavat = useMemo(() => {
    return (
      lisavaatimukset?.ammattikokemuksenHuomioiminen ===
        'SuomessaHankittuOsittain' ||
      lisavaatimukset?.ammattikokemuksenHuomioiminen ===
        'UlkomaillaHankittuOsittain' ||
      lisavaatimukset?.ammattikokemuksenHuomioiminen ===
        'SuomessaJaUlkomaillaHankittuOsittain' ||
      lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen ===
        'KorvaavatOsittain'
    );
  }, [
    lisavaatimukset?.ammattikokemuksenHuomioiminen,
    lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen,
  ]);

  const updateKelpoisuudenLisavaatimukset = (
    updatedLisavaatimukset: Partial<KelpoisuudenLisavaatimukset>,
  ) => {
    const tobeVaatimukset = initOrUpdateMyonteinenKelpoisuusPaatosUO(
      lisavaatimukset ?? {},
      updatedLisavaatimukset,
      showOsaamisenTaydentamisenTavat,
      kelpoisuusKey,
    );
    updateLisavaatimukset(tobeVaatimukset);
  };

  const eroModel = useMemo(
    () => koulutusEroModel(kelpoisuusKey),
    [kelpoisuusKey],
  );

  const erotKoulutuksessa = useMemo(() => {
    const erotKoulutuksessa = emptyErotKoulutuksessa(kelpoisuusKey);
    if (lisavaatimukset?.erotKoulutuksessa) {
      const currentlySelectedErot =
        lisavaatimukset.erotKoulutuksessa.erot ?? [];
      const erot = (erotKoulutuksessa.erot ?? []).map((ero) => ({
        name: ero.name,
        value:
          currentlySelectedErot.find((eroObj) => eroObj.name === ero.name)
            ?.value ?? false,
      }));
      const eroTarkennukset =
        lisavaatimukset.erotKoulutuksessa.eroTarkennukset ??
        erotKoulutuksessa.eroTarkennukset;
      return { ...erotKoulutuksessa, erot, eroTarkennukset };
    }
    return erotKoulutuksessa;
  }, [lisavaatimukset?.erotKoulutuksessa, kelpoisuusKey]);

  return (
    <Stack direction="column" gap={3}>
      {sovellettuTilanneOptions && (
        <OphSelectFormFieldPatched
          options={sovellettuTilanneOptions.map((option) => ({
            label: t(
              `hakemus.paatos.paatostyyppi.kelpoisuus.uo.sovellettuTilanne.${option}`,
            ),
            value: option,
          }))}
          label={t(
            `hakemus.paatos.paatostyyppi.kelpoisuus.uo.sovellettuTilanne`,
          )}
          value={lisavaatimukset?.sovellettuTilanne || ''}
          onChange={(event) => {
            updateKelpoisuudenLisavaatimukset({
              sovellettuTilanne: event.target.value,
            });
          }}
          data-testid={`uo-sovellettuTilanne-select`}
        />
      )}
      {erotKoulutuksessa && (
        <OphFormFieldWrapper
          renderInput={({ labelId }) => (
            <FormGroup aria-labelledby={labelId}>
              {erotKoulutuksessa.erot!.map((ero: NamedBoolean) => (
                <React.Fragment key={ero.name}>
                  <OphCheckbox
                    data-testid={`erotKoulutuksessa-${ero.name}`}
                    label={t(
                      `hakemus.paatos.paatostyyppi.kelpoisuus.paatos.uo.erotKoulutuksessa.${eroModel.id}.${ero.name}`,
                    )}
                    checked={ero.value}
                    onChange={(e) => {
                      updateKelpoisuudenLisavaatimukset({
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
                                `hakemus.paatos.paatostyyppi.kelpoisuus.paatos.uo.erotKoulutuksessa.${eroModel.id}.${ero.name}.${tarkennus.name}`,
                              )}
                              checked={tarkennus.value}
                              onChange={(e) => {
                                updateKelpoisuudenLisavaatimukset({
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
            `hakemus.paatos.paatostyyppi.kelpoisuus.uo.erotKoulutuksessa`,
          )}
        />
      )}
      <KorvaavaToimenpideComponent
        korvaavaToimenpide={
          lisavaatimukset?.lahtokohtaisetOsaamisenTaydentamisenTavat
        }
        label={t(
          'hakemus.paatos.paatostyyppi.kelpoisuus.uo.lahtokohtaisetOsaamisenTaydentamisenTavat',
        )}
        updateKorvaavaToimenpide={(korvaavaToimenpide: KorvaavaToimenpide) => {
          updateKelpoisuudenLisavaatimukset({
            lahtokohtaisetOsaamisenTaydentamisenTavat: korvaavaToimenpide,
          });
        }}
        t={t}
        theme={theme}
        testIdPrefix={'lahtokohtaisetOsaamisenTaydentamisenTavat'}
        showTaydentavatOpinnot
        kelpoisuuskoeFieldLabelPrefix={eroModel.id}
      />
      <OphFormFieldWrapper
        label={t(
          `hakemus.paatos.paatostyyppi.kelpoisuus.uo.ammattikokemuksenHuomioiminen`,
        )}
        renderInput={({ labelId }) => (
          <OphRadioGroup
            sx={{ marginTop: 1 }}
            options={ammattikokemuksenHuomioiminenOptions.map((option) => ({
              label: t(
                `hakemus.paatos.paatostyyppi.kelpoisuus.uo.ammattikokemuksenHuomioiminen.${option}`,
              ),
              value: option,
            }))}
            labelId={labelId}
            value={lisavaatimukset?.ammattikokemuksenHuomioiminen || ''}
            onChange={(event) => {
              updateKelpoisuudenLisavaatimukset({
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
          `hakemus.paatos.paatostyyppi.kelpoisuus.uo.suomessaSuoritettujenOpintojenHuomioiminen`,
        )}
        renderInput={({ labelId }) => (
          <OphRadioGroup
            options={suomessaSuoritettujenOpintojenHuomioiminenOptions.map(
              (option) => ({
                label: t(
                  `hakemus.paatos.paatostyyppi.kelpoisuus.uo.suomessaSuoritettujenOpintojenHuomioiminen.${option}`,
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
              updateKelpoisuudenLisavaatimukset({
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
            'hakemus.paatos.paatostyyppi.kelpoisuus.uo.osaamisenTaydentamisenTavat',
          )}
          updateKorvaavaToimenpide={(
            korvaavaToimenpide: KorvaavaToimenpide,
          ) => {
            updateKelpoisuudenLisavaatimukset({
              korvaavaToimenpide: korvaavaToimenpide,
            });
          }}
          t={t}
          theme={theme}
          testIdPrefix={'osaamisenTaydentamisenTavat'}
          kelpoisuuskoeFieldLabelPrefix={eroModel.id}
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
                'hakemus.paatos.paatostyyppi.kelpoisuus.uo.kaytetaanLahtokohtaisiaOsaamisenTaydentamisenTapoja',
              )}
            </OphTypography>
          </Paper>
        )}
    </Stack>
  );
};
