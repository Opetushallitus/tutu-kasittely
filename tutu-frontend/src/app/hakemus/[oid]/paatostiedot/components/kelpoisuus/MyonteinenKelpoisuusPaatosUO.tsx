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

const getSovellettuTilanneOptions = (kelpoisuusKey?: string): Array<string> => {
  switch (kelpoisuusKey) {
    case 'Opetusalan ammatit_Luokanopettaja':
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
    default:
      return [];
  }
};

const getAmmattikokemuksenHuomioiminenOptions = (
  kelpoisuusKey?: string,
): Array<AmmattikokemuksenHuomioiminen> => {
  switch (kelpoisuusKey) {
    case 'Opetusalan ammatit_Luokanopettaja':
      return [
        'SuomessaHankittuKokonaan',
        'SuomessaHankittuOsittain',
        'UlkomaillaHankittuOsittain',
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
      lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen ===
        'KorvaavatOsittain'
    );
  }, [
    lisavaatimukset?.ammattikokemuksenHuomioiminen,
    lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen,
  ]);
  const kelpoisuuskoeFieldLabelPrefix = useMemo(() => {
    switch (kelpoisuusKey) {
      case 'Opetusalan ammatit_Luokanopettaja':
        return 'luokanopettaja';
      default:
        return undefined;
    }
  }, [kelpoisuusKey]);

  const updateKelpoisuudenLisavaatimukset = (
    updatedLisavaatimukset: Partial<KelpoisuudenLisavaatimukset>,
  ) => {
    const tobeVaatimukset = initOrUpdateMyonteinenKelpoisuusPaatosUO(
      { ...lisavaatimukset },
      { ...updatedLisavaatimukset },
      kelpoisuusKey,
    );
    updateLisavaatimukset(tobeVaatimukset);
  };

  const eroModel = useMemo(
    () => koulutusEroModel(kelpoisuusKey, 'uo'),
    [kelpoisuusKey],
  );

  const erotKoulutuksessa = useMemo(() => {
    const erotKoulutuksessa = emptyErotKoulutuksessa(kelpoisuusKey);
    if (lisavaatimukset?.erotKoulutuksessa) {
      const currentlySelectedErot =
        lisavaatimukset.erotKoulutuksessa.erot || [];
      const erot = (erotKoulutuksessa.erot || []).map((ero) => ({
        name: ero.name,
        value:
          currentlySelectedErot.find((eroObj) => eroObj.name === ero.name)
            ?.value ?? false,
      }));
      return { ...erotKoulutuksessa, erot };
    }
    return erotKoulutuksessa;
  }, [lisavaatimukset?.erotKoulutuksessa, kelpoisuusKey]);

  return (
    <Stack direction="column" gap={3}>
      <OphSelectFormFieldPatched
        options={sovellettuTilanneOptions.map((option) => ({
          label: t(
            `hakemus.paatos.paatostyyppi.kelpoisuus.uo.sovellettuTilanne.${option}`,
          ),
          value: option,
        }))}
        label={t(`hakemus.paatos.paatostyyppi.kelpoisuus.uo.sovellettuTilanne`)}
        value={lisavaatimukset?.sovellettuTilanne || ''}
        onChange={(event) => {
          updateLisavaatimukset({ sovellettuTilanne: event.target.value });
        }}
        data-testid={`uo-sovellettuTilanne-select`}
      />
      {erotKoulutuksessa && lisavaatimukset?.erotKoulutuksessa && (
        <OphFormFieldWrapper
          renderInput={({ labelId }) => (
            <FormGroup aria-labelledby={labelId}>
              {erotKoulutuksessa.erot!.map((ero: NamedBoolean) => (
                <OphCheckbox
                  key={ero.name}
                  data-testid={`erotKoulutuksessa-${ero.name}`}
                  label={t(
                    `hakemus.paatos.paatostyyppi.kelpoisuus.paatos.uo.erotKoulutuksessa.${eroModel.id}.${ero.name}`,
                  )}
                  checked={ero.value}
                  onChange={(e) => {
                    updateKelpoisuudenLisavaatimukset({
                      erotKoulutuksessa: {
                        ...lisavaatimukset.erotKoulutuksessa,
                        erot: setKoulutusEroValues(
                          lisavaatimukset?.erotKoulutuksessa?.erot || [],
                          ero.name,
                          e.target.checked,
                        ),
                      },
                    });
                  }}
                />
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
        kelpoisuuskoeFieldLabelPrefix={kelpoisuuskoeFieldLabelPrefix}
      />
      <OphFormFieldWrapper
        label={t(
          `hakemus.paatos.paatostyyppi.kelpoisuus.uo.ammattikokemuksenHuomioiminen`,
        )}
        renderInput={({ labelId }) => (
          <OphRadioGroup
            sx={{ marginTop: 1 }}
            options={ammattikokemuksenHuomioiminenOptions.map((option) => ({
              label: t(option),
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
              (option) => ({ label: t(option), value: option }),
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
          kelpoisuuskoeFieldLabelPrefix={kelpoisuuskoeFieldLabelPrefix}
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
