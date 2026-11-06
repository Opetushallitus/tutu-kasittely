import { List, ListItem, ListItemText, Stack } from '@mui/material';
import {
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import {
  KelpoisuudenLisavaatimukset,
  KelpoisuudenLisavaatimusUpdateCallback,
} from '@/src/lib/types/paatos';

type MyonteinenPaatosUOMuuAmmattiProps = {
  lisavaatimukset?: KelpoisuudenLisavaatimukset | null;
  updateLisavaatimukset: KelpoisuudenLisavaatimusUpdateCallback;
};

const KuvailuListItem = ({
  transKey,
  t,
}: {
  transKey: string;
  t: TFunction;
}) => (
  <ListItem key={transKey} sx={{ display: 'list-item', py: 0 }}>
    <ListItemText primary={t(transKey)} />
  </ListItem>
);

export const MyonteinenPaatosUOMuuAmmatti: React.FC<
  MyonteinenPaatosUOMuuAmmattiProps
> = ({
  updateLisavaatimukset,
  lisavaatimukset,
}: MyonteinenPaatosUOMuuAmmattiProps) => {
  const { t } = useTranslations();

  return (
    <Stack padding={1}>
      <OphTypography sx={{ fontWeight: 600 }} variant={'h5'}>
        {t('hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.otsikko')}
      </OphTypography>
      <List sx={{ listStyleType: 'disc', pl: 3, py: 0 }}>
        <KuvailuListItem
          transKey="hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.erot"
          t={t}
        />
        <KuvailuListItem
          transKey="hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.lahtokohtaisetTaydennysTavat"
          t={t}
        />
        <KuvailuListItem
          transKey="hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.opintojenHuomioiminen"
          t={t}
        />
        <KuvailuListItem
          transKey="hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.taydennysTavatPaatokseen"
          t={t}
        />
      </List>
      <OphInputFormField
        multiline={true}
        minRows={4}
        value={lisavaatimukset?.muuAmmattiTilannekuvaus || ''}
        onChange={(e) =>
          updateLisavaatimukset({
            muuAmmattiTilannekuvaus: e.target.value,
          })
        }
        data-testid={`muuAmmattiTilannekuvaus-input`}
      />
    </Stack>
  );
};
