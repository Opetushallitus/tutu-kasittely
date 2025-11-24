import React from 'react';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Stack, useTheme } from '@mui/material';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';
import { myonteinenPaatosOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import {
  MyonteisenPaatoksenLisavaatimusUpdateCallback,
  MyonteisenPaatoksenLisavaatimukset,
  MyonteinenTaiKielteinenPaatos,
  KielteisenPaatoksenPerustelut,
} from '@/src/lib/types/paatos';
import { KielteisenPaatoksenPerusteluComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/KielteisenPaatoksenPerusteluComponent';

export type MyonteinenTaiKielteinenPaatosProps<
  T extends {
    updateLisavaatimukset: MyonteisenPaatoksenLisavaatimusUpdateCallback;
  },
> = {
  MyonteisenPaatoksenLisavaatimusComponent?: React.ComponentType<T>;
  lisavaatimusComponentProps?: Omit<T, 'updateLisavaatimukset'>;
  updatePaatosAction: (
    myonteinenTaiKielteinenPaatos: Partial<MyonteinenTaiKielteinenPaatos>,
  ) => void;
  t: TFunction;
} & MyonteinenTaiKielteinenPaatos;

export const MyonteinenTaiKielteinenPaatosComponent = <
  T extends {
    updateLisavaatimukset: MyonteisenPaatoksenLisavaatimusUpdateCallback;
  },
>({
  MyonteisenPaatoksenLisavaatimusComponent,
  lisavaatimusComponentProps,
  myonteinenPaatos,
  kielteisenPaatoksenPerustelut,
  updatePaatosAction,
  t,
}: MyonteinenTaiKielteinenPaatosProps<T>) => {
  const theme = useTheme();
  const updateMyonteisenPaatoksenLisavaatimukset = (
    lisavaatimukset: MyonteisenPaatoksenLisavaatimukset,
  ) => {
    updatePaatosAction({ myonteisenPaatoksenLisavaatimukset: lisavaatimukset });
  };
  const propsForLisavaatimusComponent: T = {
    ...(lisavaatimusComponentProps as T),
    updateLisavaatimukset: updateMyonteisenPaatoksenLisavaatimukset,
  };
  return (
    <Stack gap={theme.spacing(3)}>
      <OphRadioGroupWithClear
        labelId="myonteinenPaatos-radio-group-label"
        label={t('hakemus.paatos.myonteinenTaiKielteinenPaatos')}
        data-testid="myonteinenPaatos-radio-group"
        sx={{ width: '100%' }}
        options={myonteinenPaatosOptions(t)}
        row
        value={myonteinenPaatos?.toString() || ''}
        onChange={(e) =>
          updatePaatosAction({
            myonteinenPaatos: e.target.value === 'true',
            myonteisenPaatoksenLisavaatimukset: undefined,
            kielteisenPaatoksenPerustelut: undefined,
          })
        }
        onClear={() =>
          updatePaatosAction({
            myonteinenPaatos: null,
            myonteisenPaatoksenLisavaatimukset: undefined,
            kielteisenPaatoksenPerustelut: undefined,
          })
        }
      />
      {myonteinenPaatos && MyonteisenPaatoksenLisavaatimusComponent && (
        <MyonteisenPaatoksenLisavaatimusComponent
          {...propsForLisavaatimusComponent}
        ></MyonteisenPaatoksenLisavaatimusComponent>
      )}
      {myonteinenPaatos === false && (
        <KielteisenPaatoksenPerusteluComponent
          perustelut={kielteisenPaatoksenPerustelut || undefined}
          updatePerustelutAction={(
            perustelut: Partial<KielteisenPaatoksenPerustelut>,
          ) => {
            updatePaatosAction({
              kielteisenPaatoksenPerustelut: {
                ...kielteisenPaatoksenPerustelut,
                ...perustelut,
              },
            });
          }}
          t={t}
        />
      )}
    </Stack>
  );
};
