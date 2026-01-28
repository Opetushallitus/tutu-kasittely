import { Stack } from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { kelpoisuuskoeFields } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  KelpoisuuskoeSisalto,
  KorvaavaToimenpide,
} from '@/src/lib/types/paatos';

const IndentedStack: React.FC<{
  theme: Theme;
  children: React.ReactNode | React.ReactNode[];
}> = ({ theme, children }) => {
  return (
    <Stack
      paddingLeft={theme.spacing(3)}
      paddingBottom={theme.spacing(2)}
      gap={theme.spacing(2)}
    >
      {children}
    </Stack>
  );
};

const Kelpoisuuskoe = ({
  sisalto,
  field,
  updateKelpoisuuskoeAction,
  t,
  theme,
  testIdPrefix,
}: {
  field: keyof KorvaavaToimenpide;
  sisalto?: KelpoisuuskoeSisalto;
  updateKelpoisuuskoeAction: (
    field: keyof KorvaavaToimenpide,
    updatedKelpoisuuskoeSisalto: KelpoisuuskoeSisalto,
  ) => void;
  t: TFunction;
  theme: Theme;
  testIdPrefix: string;
}) => {
  return (
    <Stack gap={theme.spacing(1)}>
      <OphTypography variant="h5">
        {t(
          'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.kelpoisuusKoe.otsikko',
        )}
      </OphTypography>
      {kelpoisuuskoeFields.map((key) => (
        <OphCheckbox
          key={key}
          data-testid={`${testIdPrefix}-kelpoisuuskoe-sisalto-${key}`}
          label={t(
            `hakemus.paatos.paatostyyppi.kelpoisuus.paatos.kelpoisuusKoe.${key}`,
          )}
          checked={sisalto?.[key] || false}
          onChange={(e) => {
            updateKelpoisuuskoeAction(field, {
              ...sisalto,
              [key]: e.target.checked,
            });
          }}
        />
      ))}
    </Stack>
  );
};

export type KorvaavaToimenpideProps = {
  korvaavaToimenpide?: KorvaavaToimenpide;
  label: string;
  updateKorvaavaToimenpide: (
    updatedKorvaavaToimenpide: KorvaavaToimenpide,
  ) => void;
  t: TFunction;
  theme: Theme;
  testIdPrefix: string;
};

export const KorvaavaToimenpideComponent = ({
  korvaavaToimenpide,
  label,
  updateKorvaavaToimenpide,
  t,
  theme,
  testIdPrefix,
}: KorvaavaToimenpideProps) => {
  const kelpoisuuskoeElement = (
    field: keyof KorvaavaToimenpide,
    testIdPrefix: string,
    sisalto?: KelpoisuuskoeSisalto,
  ) => (
    <Kelpoisuuskoe
      key={field}
      field={field}
      sisalto={sisalto}
      updateKelpoisuuskoeAction={(
        sisaltoField,
        updatedKelpoisuuskoeSisalto,
      ) => {
        updateKorvaavaToimenpide({
          ...korvaavaToimenpide,
          [sisaltoField]: updatedKelpoisuuskoeSisalto,
        });
      }}
      t={t}
      theme={theme}
      testIdPrefix={testIdPrefix}
    />
  );

  const sopeutumisaikaElement = (
    field: keyof KorvaavaToimenpide,
    testIdPrefix: string,
    kesto?: string,
  ) => (
    <OphInputFormField
      key={field}
      label={t('hakemus.paatos.paatostyyppi.kelpoisuus.paatos.sopeutumisaika')}
      multiline={false}
      value={kesto || ''}
      onChange={(e) => {
        updateKorvaavaToimenpide({
          ...korvaavaToimenpide,
          [field]: e.target.value,
        });
      }}
      data-testid={`${testIdPrefix}-korvaavaToimenpide-sopeutumisaika-input`}
    />
  );

  return (
    <Stack gap={theme.spacing(1)}>
      <Stack gap={theme.spacing(1)}>
        <OphTypography variant="h5">{label}</OphTypography>
        <OphTypography variant="body1">
          {t(
            'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.toimenpideLisatieto',
          )}
        </OphTypography>
      </Stack>
      <OphCheckbox
        data-testid={`${testIdPrefix}-korvaavaToimenpide-kelpoisuuskoe`}
        label={t('hakemus.paatos.myonteinenPaatos.kelpoisuuskoe')}
        checked={korvaavaToimenpide?.kelpoisuuskoe}
        onChange={(e) => {
          updateKorvaavaToimenpide({
            ...korvaavaToimenpide,
            kelpoisuuskoe: e.target.checked,
          });
        }}
      />
      {korvaavaToimenpide?.kelpoisuuskoe && (
        <IndentedStack theme={theme}>
          {kelpoisuuskoeElement(
            'kelpoisuuskoeSisalto',
            `${testIdPrefix}-singleChoice`,
            korvaavaToimenpide.kelpoisuuskoeSisalto,
          )}
        </IndentedStack>
      )}
      <OphCheckbox
        data-testid={`${testIdPrefix}-korvaavaToimenpide-sopeutumisaika`}
        label={t('hakemus.paatos.myonteinenPaatos.sopeutumisaika')}
        checked={korvaavaToimenpide?.sopeutumisaika}
        onChange={(e) => {
          updateKorvaavaToimenpide({
            ...korvaavaToimenpide,
            sopeutumisaika: e.target.checked,
          });
        }}
      />
      {korvaavaToimenpide?.sopeutumisaika && (
        <IndentedStack theme={theme}>
          {sopeutumisaikaElement(
            'sopeutumiusaikaKestoKk',
            `${testIdPrefix}-singleChoice`,
            korvaavaToimenpide.sopeutumiusaikaKestoKk,
          )}
        </IndentedStack>
      )}
      <OphCheckbox
        data-testid={`${testIdPrefix}-korvaavaToimenpide-kelpoisuuskoeJaSopeutumisaika`}
        label={t(
          'hakemus.paatos.myonteinenPaatos.kelpoisuuskoeJaSopeutumisaika',
        )}
        checked={korvaavaToimenpide?.kelpoisuuskoeJaSopeutumisaika}
        onChange={(e) => {
          updateKorvaavaToimenpide({
            ...korvaavaToimenpide,
            kelpoisuuskoeJaSopeutumisaika: e.target.checked,
          });
        }}
      />
      {korvaavaToimenpide?.kelpoisuuskoeJaSopeutumisaika && (
        <IndentedStack theme={theme}>
          {[
            kelpoisuuskoeElement(
              'kelpoisuuskoeJaSopeutumisaikaSisalto',
              `${testIdPrefix}-dualChoice`,
              korvaavaToimenpide.kelpoisuuskoeJaSopeutumisaikaSisalto,
            ),
            sopeutumisaikaElement(
              'kelpoisuuskoeJaSopeutumisaikaKestoKk',
              `${testIdPrefix}-dualChoice`,
              korvaavaToimenpide.kelpoisuuskoeJaSopeutumisaikaKestoKk,
            ),
          ]}
        </IndentedStack>
      )}
    </Stack>
  );
};
