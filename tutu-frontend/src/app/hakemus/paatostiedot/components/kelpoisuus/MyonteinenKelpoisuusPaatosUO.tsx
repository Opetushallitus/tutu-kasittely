import { Stack } from '@mui/material';
import React, { useMemo } from 'react';

import { InFoTeksti } from '@/src/app/hakemus/paatostiedot/components/Info';
import { AmmattikokemusJaOpinnotYhdessaComponent } from '@/src/app/hakemus/paatostiedot/components/kelpoisuus/uo/AmmattikokemusJaOpinnotYhdessaComponent';
import { ErotKoulutuksessaComponent } from '@/src/app/hakemus/paatostiedot/components/kelpoisuus/uo/ErotKoulutuksessaComponent';
import { HuomioiminenRadioGroup } from '@/src/app/hakemus/paatostiedot/components/kelpoisuus/uo/HuomioiminenRadioGroup';
import {
  getSovellettuTilanneOptions,
  initOrUpdateMyonteinenKelpoisuusPaatosUO,
  shouldShowEiEdellytetaOsaamisenTaydentamista,
  shouldShowKaytetaanLahtokohtaisiaOsaamisenTaydentamisenTapoja,
  shouldShowKelpoisuusKorvaavaToimenpide,
} from '@/src/app/hakemus/paatostiedot/components/kelpoisuus/uo/kelpoisuusUOUtils';
import { KorvaavaToimenpideComponent } from '@/src/app/hakemus/paatostiedot/components/KorvaavaToimenpide';
import {
  AMMATTIKOKEMUKSEN_HUOMIOIMINEN_OPTIONS,
  SUOMESSA_SUORITETTUJEN_OPINTOJEN_HUOMIOIMINEN_OPTIONS,
} from '@/src/app/hakemus/paatostiedot/constants';
import {
  emptyErotKoulutuksessa,
  initOrUpdateErotKoulutuksessa,
  koulutusEroModel,
} from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { OphSelectFormFieldPatched } from '@/src/components/OphSelectFormFieldPatched';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import {
  KelpoisuudenLisavaatimukset,
  MyonteisenPaatoksenLisavaatimusUpdateCallback,
} from '@/src/lib/types/paatos';

type MyonteinenKelpoisuusPaatosUOProps = {
  lisavaatimukset?: KelpoisuudenLisavaatimukset | null;
  updateLisavaatimukset: MyonteisenPaatoksenLisavaatimusUpdateCallback;
  kelpoisuusKey?: string;
};

export const MyonteinenKelpoisuusPaatosUO: React.FC<
  MyonteinenKelpoisuusPaatosUOProps
> = ({
  kelpoisuusKey,
  updateLisavaatimukset,
  lisavaatimukset,
}: MyonteinenKelpoisuusPaatosUOProps) => {
  const { t } = useTranslations();

  const sovellettuTilanneOptions = useMemo(
    () => getSovellettuTilanneOptions(kelpoisuusKey),
    [kelpoisuusKey],
  );
  const eroModel = useMemo(
    () => koulutusEroModel(kelpoisuusKey),
    [kelpoisuusKey],
  );
  const erotKoulutuksessa = useMemo(
    () =>
      initOrUpdateErotKoulutuksessa(
        emptyErotKoulutuksessa(kelpoisuusKey),
        lisavaatimukset?.erotKoulutuksessa,
      ),
    [lisavaatimukset?.erotKoulutuksessa, kelpoisuusKey],
  );

  const updateKelpoisuudenLisavaatimukset = (
    updatedLisavaatimukset: Partial<KelpoisuudenLisavaatimukset>,
  ) => {
    updateLisavaatimukset(
      initOrUpdateMyonteinenKelpoisuusPaatosUO(
        lisavaatimukset ?? {},
        updatedLisavaatimukset,
        kelpoisuusKey,
      ),
    );
  };

  return (
    <Stack direction="column" spacing={3}>
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
          onChange={(event) =>
            updateKelpoisuudenLisavaatimukset({
              sovellettuTilanne: event.target.value,
            })
          }
          data-testid={`uo-sovellettuTilanne-select`}
        />
      )}
      {erotKoulutuksessa && (
        <ErotKoulutuksessaComponent
          erotKoulutuksessa={erotKoulutuksessa}
          eroModelId={eroModel.id}
          updateErotKoulutuksessa={(erotKoulutuksessa) =>
            updateKelpoisuudenLisavaatimukset({ erotKoulutuksessa })
          }
          t={t}
        />
      )}
      <KorvaavaToimenpideComponent
        korvaavaToimenpide={
          lisavaatimukset?.lahtokohtaisetOsaamisenTaydentamisenTavat
        }
        label={t(
          'hakemus.paatos.paatostyyppi.kelpoisuus.uo.lahtokohtaisetOsaamisenTaydentamisenTavat',
        )}
        updateKorvaavaToimenpide={(korvaavaToimenpide) =>
          updateKelpoisuudenLisavaatimukset({
            lahtokohtaisetOsaamisenTaydentamisenTavat: korvaavaToimenpide,
          })
        }
        t={t}
        kelpoisuuskoeTransKeyBase={
          'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.kelpoisuusKoe'
        }
        testIdPrefix={'lahtokohtaisetOsaamisenTaydentamisenTavat'}
        showTaydentavatOpinnot
        kelpoisuuskoeFieldLabelPrefix={eroModel.id}
      />
      <HuomioiminenRadioGroup
        field="ammattikokemuksenHuomioiminen"
        options={AMMATTIKOKEMUKSEN_HUOMIOIMINEN_OPTIONS}
        value={lisavaatimukset?.ammattikokemuksenHuomioiminen}
        updateValue={(ammattikokemuksenHuomioiminen) =>
          updateKelpoisuudenLisavaatimukset({ ammattikokemuksenHuomioiminen })
        }
        t={t}
      />
      <HuomioiminenRadioGroup
        field="suomessaSuoritettujenOpintojenHuomioiminen"
        options={SUOMESSA_SUORITETTUJEN_OPINTOJEN_HUOMIOIMINEN_OPTIONS}
        value={lisavaatimukset?.suomessaSuoritettujenOpintojenHuomioiminen}
        updateValue={(suomessaSuoritettujenOpintojenHuomioiminen) =>
          updateKelpoisuudenLisavaatimukset({
            suomessaSuoritettujenOpintojenHuomioiminen,
          })
        }
        t={t}
      />
      <AmmattikokemusJaOpinnotYhdessaComponent
        korvaavatKokonaan={
          lisavaatimukset?.ammattikokemusJaOpinnotYhdessaKorvaavatKokonaan
        }
        tasmennys={lisavaatimukset?.ammattikokemusJaOpinnotYhdessaTasmennys}
        updateLisavaatimukset={updateKelpoisuudenLisavaatimukset}
        t={t}
      />
      {shouldShowKelpoisuusKorvaavaToimenpide(lisavaatimukset) && (
        <KorvaavaToimenpideComponent
          korvaavaToimenpide={lisavaatimukset?.korvaavaToimenpide}
          label={t(
            'hakemus.paatos.paatostyyppi.kelpoisuus.uo.osaamisenTaydentamisenTavat',
          )}
          updateKorvaavaToimenpide={(korvaavaToimenpide) =>
            updateKelpoisuudenLisavaatimukset({ korvaavaToimenpide })
          }
          t={t}
          kelpoisuuskoeTransKeyBase={
            'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.kelpoisuusKoe'
          }
          testIdPrefix={'osaamisenTaydentamisenTavat'}
          kelpoisuuskoeFieldLabelPrefix={eroModel.id}
          showTaydentavatOpinnot
        />
      )}
      {shouldShowEiEdellytetaOsaamisenTaydentamista(lisavaatimukset) && (
        <InFoTeksti
          infoTeksti={t(
            'hakemus.paatos.paatostyyppi.kelpoisuus.uo.eiEdellytetaOsaamisenTaydentamista',
          )}
        />
      )}
      {shouldShowKaytetaanLahtokohtaisiaOsaamisenTaydentamisenTapoja(
        lisavaatimukset,
      ) && (
        <InFoTeksti
          infoTeksti={t(
            'hakemus.paatos.paatostyyppi.kelpoisuus.uo.kaytetaanLahtokohtaisiaOsaamisenTaydentamisenTapoja',
          )}
        />
      )}
    </Stack>
  );
};
