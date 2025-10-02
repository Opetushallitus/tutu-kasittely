import { useEffect, useState } from 'react';

import { Stack, useTheme } from '@mui/material';
import {
  OphRadio,
  OphTypography,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Perustelu } from '@/src/lib/types/perustelu';

interface Props {
  perustelu: Perustelu | undefined;
  updatePerustelu: (perustelu: Partial<Perustelu>) => void;
}

export const JatkoOpintoKelpoisuus = ({
  perustelu: maybePerustelu,
  updatePerustelu,
}: Props) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const [selectedKelpoisuus, setKelpoisuus] = useState<string | undefined>();
  const [lisatieto, setLisatieto] = useState<string | undefined>('');

  const updateKelpoisuus = (val: string | undefined) => {
    if (val !== selectedKelpoisuus) {
      setKelpoisuus(val);
      updatePerustelu({
        jatkoOpintoKelpoisuus: val,
      });
    }
  };

  const updateLisatieto = (val: string | undefined) => {
    setLisatieto(val);
    updatePerustelu({
      jatkoOpintoKelpoisuusLisatieto: val,
    });
  };

  useEffect(() => {
    setKelpoisuus(maybePerustelu?.jatkoOpintoKelpoisuus);
    setLisatieto(maybePerustelu?.jatkoOpintoKelpoisuusLisatieto);
  }, [
    maybePerustelu?.jatkoOpintoKelpoisuus,
    maybePerustelu?.jatkoOpintoKelpoisuusLisatieto,
  ]);

  const kelpoisuudet = [
    'toisen_vaiheen_korkeakouluopintoihin',
    'tieteellisiin_jatko-opintoihin',
    'muu', // Tälle valinnalle esitetään lisätieto-tekstikenttä
  ];
  const naytaLisatietoKentta = (kelpoisuus: string | undefined) =>
    kelpoisuus === 'muu';

  return (
    <Stack direction="column" gap={theme.spacing(1)}>
      <OphTypography variant="h4">
        {t(
          'hakemus.perustelu.yleiset.muutPerustelut.jatkoOpintoKelpoisuus.otsikko',
        )}
      </OphTypography>
      {kelpoisuudet.map((kelpoisuus) => {
        return (
          <OphRadio
            key={`radioJatkoOpintokelpoisuus.${kelpoisuus}`}
            data-testid={`jatko-opintokelpoisuus--${kelpoisuus}`}
            value={kelpoisuus}
            checked={selectedKelpoisuus === kelpoisuus}
            label={t(
              `hakemus.perustelu.yleiset.muutPerustelut.jatkoOpintoKelpoisuus.${kelpoisuus}`,
            )}
            name="kelpoisuus"
            onChange={() => updateKelpoisuus(kelpoisuus)}
          />
        );
      })}
      {naytaLisatietoKentta(selectedKelpoisuus) ? (
        <OphInputFormField
          multiline={false}
          data-testid={`jatko-opintokelpoisuus--lisatiedot`}
          label={t(
            'hakemus.perustelu.yleiset.muutPerustelut.jatkoOpintoKelpoisuus.lisatieto',
          )}
          value={lisatieto}
          onChange={(event) => updateLisatieto(event.target.value)}
        />
      ) : null}
    </Stack>
  );
};
