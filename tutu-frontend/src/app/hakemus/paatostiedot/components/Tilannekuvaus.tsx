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
  kuvailuTransKeys?: string[];
};

const DEFAULT_KUVAILU_TRANSLATION_KEYS = [
  'hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.erot',
  'hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.lahtokohtaisetTaydennysTavat',
  'hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.opintojenHuomioiminen',
  'hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.taydennysTavatPaatokseen',
];

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
  kuvailuTransKeys = DEFAULT_KUVAILU_TRANSLATION_KEYS,
}: TilannekuvausProps) => (
  <Stack padding={1}>
    <OphTypography sx={{ fontWeight: 600 }} variant={'h5'}>
      {t('hakemus.paatos.paatostyyppi.kelpoisuus.uo.muu.kuvaile.otsikko')}
    </OphTypography>
    <List sx={{ listStyleType: 'disc', pl: 3, py: 0 }}>
      {kuvailuTransKeys.map((transKey) => (
        <KuvailuListItem key={transKey} transKey={transKey} t={t} />
      ))}
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
