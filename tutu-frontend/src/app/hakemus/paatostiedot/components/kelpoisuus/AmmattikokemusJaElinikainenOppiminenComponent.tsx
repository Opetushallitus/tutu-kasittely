import { Stack } from '@mui/material';
import {
  OphCheckbox,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';

import { InFoTeksti } from '../tutkintotaiopinto/Info';

import { KorvaavaToimenpideComponent } from '@/src/app/hakemus/paatostiedot/components/KorvaavaToimenpide';
import {
  ammattikokemusKorvaavuusOptions,
  elinikainenOppiminenKorvaavuusOptions,
} from '@/src/app/hakemus/paatostiedot/constants';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  AmmattikokemusJaElinikainenOppiminen,
  AmmattikokemusJaElinikainenOppiminenKorvaavuus,
  KorvaavaToimenpide,
} from '@/src/lib/types/paatos';

const taysiKorvaavuus = (
  data: AmmattikokemusJaElinikainenOppiminen,
): boolean => {
  return (
    data.korvaavuusAmmattikokemus === 'Taysi' ||
    data.korvaavuusElinikainenOppiminen === 'Taysi' ||
    !!data.korvaavuusAmmattikokemusJaElinikainenOppiminenYhdessa
  );
};

export type AmmattikokemusJaElinikainenOppiminenProps = {
  data: AmmattikokemusJaElinikainenOppiminen;
  updateDataAction: (updatedData: AmmattikokemusJaElinikainenOppiminen) => void;
  kelpoisuuskoeFieldLabelPrefix?: string;
  t: TFunction;
};

export const AmmattikokemusJaElinikainenOppiminenComponent = ({
  data,
  updateDataAction,
  kelpoisuuskoeFieldLabelPrefix,
  t,
}: AmmattikokemusJaElinikainenOppiminenProps) => {
  return (
    <>
      <Stack spacing={2}>
        <OphRadioGroupWithClear
          row={false}
          label={t(
            'perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.ammattikokemus.title',
          )}
          labelId={
            'kelpoisuus-myonteinenPaatos-ammattikokemus-korvaavuus-radio-group-label'
          }
          data-testid={'ammattikokemus-korvaavuus-radio-group'}
          options={ammattikokemusKorvaavuusOptions(t)}
          value={data.korvaavuusAmmattikokemus?.toString() ?? ''}
          onChange={(e) =>
            updateDataAction({
              ...data,
              korvaavuusAmmattikokemus: e.target
                .value as AmmattikokemusJaElinikainenOppiminenKorvaavuus,
              korvaavuusAmmattikokemusJaElinikainenOppiminenYhdessa: false,
            })
          }
          onClear={() =>
            updateDataAction({
              ...data,
              korvaavuusAmmattikokemus: null,
            })
          }
        />

        <OphRadioGroupWithClear
          row={false}
          label={t(
            'perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.elinikainenOppiminen.title',
          )}
          labelId={
            'kelpoisuus-myonteinenPaatos-elinikainenOppiminen-korvaavuus-radio-group-label'
          }
          data-testid={'elinikainenOppiminen-korvaavuus-radio-group'}
          options={elinikainenOppiminenKorvaavuusOptions(t)}
          value={data.korvaavuusElinikainenOppiminen?.toString() ?? ''}
          onChange={(e) =>
            updateDataAction({
              ...data,
              korvaavuusElinikainenOppiminen: e.target
                .value as AmmattikokemusJaElinikainenOppiminenKorvaavuus,
              korvaavuusAmmattikokemusJaElinikainenOppiminenYhdessa: false,
            })
          }
          onClear={() =>
            updateDataAction({
              ...data,
              korvaavuusElinikainenOppiminen: null,
            })
          }
        />
        <Stack spacing={2}>
          <OphCheckbox
            data-testid={`ammattikokemusJalinikainenOppiminenYhdessa-checkbox`}
            label={t(
              'perustelumuistio.kelpoisuudenLisavaatimukset.ammattikokemusJaElinikainenOppiminen.korvaavuus.ammattikokemusJaElinikainenOppiminenYhdessa.title',
            )}
            checked={
              data['korvaavuusAmmattikokemusJaElinikainenOppiminenYhdessa']
            }
            onChange={(e) =>
              updateDataAction({
                ...data,
                korvaavuusAmmattikokemusJaElinikainenOppiminenYhdessa:
                  e.target.checked,
                korvaavuusAmmattikokemus: e.target.checked
                  ? null
                  : data['korvaavuusAmmattikokemus'],
                korvaavuusElinikainenOppiminen: e.target.checked
                  ? null
                  : data['korvaavuusElinikainenOppiminen'],
              })
            }
          />
        </Stack>

        {data['korvaavuusAmmattikokemusJaElinikainenOppiminenYhdessa'] && (
          <OphInputFormField
            label={t(
              'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.ammattikokemusElinikainenOppiminen.ohje',
            )}
            multiline={true}
            minRows={3}
            value={data.lisatieto ?? ''}
            onChange={(e) =>
              updateDataAction({
                ...data,
                lisatieto: e.target.value,
              })
            }
            data-testid={`ammattikokemusElinikainenOppiminen-lisatieto-input`}
          />
        )}
      </Stack>

      {data.korvaavaToimenpide && (
        <Stack spacing={2} paddingLeft={3}>
          <KorvaavaToimenpideComponent
            korvaavaToimenpide={data.korvaavaToimenpide}
            label={t(
              'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.ammattikokemusElinikainenOppiminen.korvaavuus.korvaavaToimenpide',
            )}
            updateKorvaavaToimenpide={(
              korvaavaToimenpide: KorvaavaToimenpide,
            ) =>
              updateDataAction({
                ...data,
                korvaavaToimenpide: korvaavaToimenpide,
              })
            }
            t={t}
            testIdPrefix={'ammattikokemusElinikainenOppiminen'}
            kelpoisuuskoeFieldLabelPrefix={kelpoisuuskoeFieldLabelPrefix}
            showKelpoisuuskoeJaSopeutumisaika
            showLisatieto
            kelpoisuuskoeTransKeyBase={
              'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.kelpoisuusKoe'
            }
          />
        </Stack>
      )}
      {taysiKorvaavuus(data) && (
        <InFoTeksti
          infoTeksti={t(
            'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.ammattikokemusElinikainenOppiminen.eiEdellytetaKorvaavaaToimenpidetta',
          )}
        />
      )}
    </>
  );
};
