import { List, ListItem, ListItemText, Stack } from '@mui/material';
import {
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';

type TilannekuvausProps = {
  t: TFunction;
  value?: string | null;
  onChange: (value: string) => void;
  testId: string;
};

const KuvailuListItem = ({
  transKey,
  t,
}: {
  transKey: string;
  t: TFunction;
}) => (
  <ListItem key={transKey} sx={{ display: 'list-item', py: 0, pl: 0.5 }}>
    <ListItemText primary={t(transKey)} />
  </ListItem>
);

export const Tilannekuvaus = ({
  t,
  value,
  onChange,
  testId,
}: TilannekuvausProps) => (
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
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testId}
    />
  </Stack>
);
