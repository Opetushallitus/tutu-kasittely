import { Stack, useTheme } from '@mui/material';
import { OphInputFormField } from '@opetushallitus/oph-design-system';

import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Perustelu } from '@/src/lib/types/perustelu';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Partial<Perustelu>) => void;
}

export const JatkoOpintoKelpoisuus = ({
  perustelu,
  updatePerustelu,
}: Props) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const currentValue = perustelu?.jatkoOpintoKelpoisuus;
  const currentLisatieto = perustelu?.jatkoOpintoKelpoisuusLisatieto;

  const updateKelpoisuus = (val: string | null | undefined) => {
    updatePerustelu({
      jatkoOpintoKelpoisuus: val,
    });
  };

  const updateLisatieto = (val: string | undefined) => {
    updatePerustelu({
      jatkoOpintoKelpoisuusLisatieto: val,
    });
  };

  const kelpoisuudet = [
    'toisen_vaiheen_korkeakouluopintoihin',
    'tieteellisiin_jatko-opintoihin',
    'muu',
  ];
  const naytaLisatietoKentta = (kelpoisuus: string | null | undefined) =>
    kelpoisuus === 'muu';

  return (
    <Stack direction="column" gap={theme.spacing(1)}>
      <OphRadioGroupWithClear
        label={t(
          'hakemus.perustelu.yleiset.muutPerustelut.jatkoOpintoKelpoisuus.otsikko',
        )}
        labelId="jatko-opinto-kelpoisuus-radio-group-label"
        data-testid="jatko-opintokelpoisuus-radio-group"
        options={kelpoisuudet.map((kelpoisuus) => ({
          value: kelpoisuus,
          label: t(
            `hakemus.perustelu.yleiset.muutPerustelut.jatkoOpintoKelpoisuus.${kelpoisuus}`,
          ),
        }))}
        row={false}
        value={currentValue ?? ''}
        onChange={(e) => updateKelpoisuus(e.target.value)}
        onClear={() => updateKelpoisuus(null)}
      />
      {naytaLisatietoKentta(currentValue) ? (
        <OphInputFormField
          multiline={false}
          data-testid={`jatko-opintokelpoisuus--lisatiedot`}
          label={t(
            'hakemus.perustelu.yleiset.muutPerustelut.jatkoOpintoKelpoisuus.lisatieto',
          )}
          value={currentLisatieto ?? ''}
          onChange={(event) => updateLisatieto(event.target.value)}
        />
      ) : null}
    </Stack>
  );
};
