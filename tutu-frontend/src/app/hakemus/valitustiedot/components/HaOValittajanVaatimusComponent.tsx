import { Stack } from '@mui/material';
import {
  OphCheckbox,
  OphFormFieldWrapper,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ValitusHaOValittajanVaatimus } from '@/src/lib/types/valitustiedot';

export const HaOValittajanVaatimusComponent = ({
  valittajanVaatimus,
  updateValittajanVaatimus,
}: {
  valittajanVaatimus?: ValitusHaOValittajanVaatimus;
  updateValittajanVaatimus: (
    valittajanVaatimus: Partial<ValitusHaOValittajanVaatimus>,
  ) => void;
}) => {
  const { t } = useTranslations();
  return (
    <>
      <OphFormFieldWrapper
        label={t('hakemus.valitustiedot.valitushao.valittajanVaatimus')}
        renderInput={() => (
          <Stack spacing={1}>
            <OphCheckbox
              label={t(
                'hakemus.valitustiedot.valitushao.valittajanVaatimus.taso',
              )}
              checked={!!valittajanVaatimus?.taso}
              onChange={() => {
                updateValittajanVaatimus({ taso: !valittajanVaatimus?.taso });
              }}
            ></OphCheckbox>
            <OphCheckbox
              label={t(
                'hakemus.valitustiedot.valitushao.valittajanVaatimus.suuntautuminen',
              )}
              checked={!!valittajanVaatimus?.suuntautuminen}
              onChange={() => {
                updateValittajanVaatimus({
                  suuntautuminen: !valittajanVaatimus?.suuntautuminen,
                });
              }}
            ></OphCheckbox>
            <OphCheckbox
              label={t(
                'hakemus.valitustiedot.valitushao.valittajanVaatimus.virallisuus',
              )}
              checked={!!valittajanVaatimus?.virallisuus}
              onChange={() => {
                updateValittajanVaatimus({
                  virallisuus: !valittajanVaatimus?.virallisuus,
                });
              }}
            ></OphCheckbox>
            <OphCheckbox
              label={t(
                'hakemus.valitustiedot.valitushao.valittajanVaatimus.tiettyKelpoisuus',
              )}
              checked={!!valittajanVaatimus?.tiettyKelpoisuus}
              onChange={() => {
                updateValittajanVaatimus({
                  tiettyKelpoisuus: !valittajanVaatimus?.tiettyKelpoisuus,
                });
              }}
            ></OphCheckbox>
            <OphCheckbox
              label={t(
                'hakemus.valitustiedot.valitushao.valittajanVaatimus.kompensaationPoistoTaiVahennysAP',
              )}
              checked={!!valittajanVaatimus?.kompensaationPoistoTaiVahennysAP}
              onChange={() => {
                updateValittajanVaatimus({
                  kompensaationPoistoTaiVahennysAP:
                    !valittajanVaatimus?.kompensaationPoistoTaiVahennysAP,
                });
              }}
            ></OphCheckbox>
            <OphCheckbox
              label={t(
                'hakemus.valitustiedot.valitushao.valittajanVaatimus.kompensaationPoistoTaiVahennysUO',
              )}
              checked={!!valittajanVaatimus?.kompensaationPoistoTaiVahennysUO}
              onChange={() => {
                updateValittajanVaatimus({
                  kompensaationPoistoTaiVahennysUO:
                    !valittajanVaatimus?.kompensaationPoistoTaiVahennysUO,
                });
              }}
            ></OphCheckbox>
            <OphCheckbox
              label={t(
                'hakemus.valitustiedot.valitushao.valittajanVaatimus.muu',
              )}
              checked={!!valittajanVaatimus?.muu}
              onChange={() => {
                updateValittajanVaatimus({
                  muu: !valittajanVaatimus?.muu,
                });
              }}
            ></OphCheckbox>
          </Stack>
        )}
      />
      <OphInputFormField
        multiline
        rows={5}
        label={t(
          'hakemus.valitustiedot.valitushao.valittajanVaatimus.tasmennys',
        )}
        value={valittajanVaatimus?.tasmennys ?? ''}
        onChange={(event) => {
          updateValittajanVaatimus({ tasmennys: event.target.value });
        }}
      />
    </>
  );
};
