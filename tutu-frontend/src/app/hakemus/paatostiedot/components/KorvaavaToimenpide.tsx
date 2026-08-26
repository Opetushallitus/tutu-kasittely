import { Stack } from '@mui/material';
import {
  OphCheckbox,
  OphFormFieldWrapper,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { kelpoisuuskoeFields } from '@/src/app/hakemus/paatostiedot/constants';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  KelpoisuuskoeSisalto,
  KorvaavaToimenpide,
} from '@/src/lib/types/paatos';

const IndentedStack: React.FC<{
  children: React.ReactNode | React.ReactNode[];
}> = ({ children }) => {
  return (
    <Stack paddingLeft={3} paddingBottom={2} gap={2}>
      {children}
    </Stack>
  );
};

const Kelpoisuuskoe = ({
  sisalto,
  field,
  kelpoisuuskoeTransKeyBase,
  updateKelpoisuuskoeAction,
  t,
  kelpoisuuskoeFieldLabelPrefix,
  testIdPrefix,
}: {
  field: keyof KorvaavaToimenpide;
  sisalto?: KelpoisuuskoeSisalto;
  updateKelpoisuuskoeAction: (
    field: keyof KorvaavaToimenpide,
    updatedKelpoisuuskoeSisalto: KelpoisuuskoeSisalto,
  ) => void;
  kelpoisuuskoeTransKeyBase: string;
  t: TFunction;
  kelpoisuuskoeFieldLabelPrefix?: string;
  testIdPrefix: string;
}) => {
  return (
    <Stack gap={1}>
      <OphTypography variant="h5">
        {t('hakemus.paatos.myonteinenPaatos.kelpoisuuskoeSisalto')}
      </OphTypography>
      {kelpoisuuskoeFields.map((key) => (
        <OphCheckbox
          key={key}
          data-testid={`${testIdPrefix}-kelpoisuuskoe-sisalto-${key}`}
          label={t(
            `${kelpoisuuskoeTransKeyBase}.${kelpoisuuskoeFieldLabelPrefix ? `${kelpoisuuskoeFieldLabelPrefix}.` : ''}${key}`,
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
  testIdPrefix: string;
  kelpoisuuskoeTransKeyBase: string;
  showTaydentavatOpinnot?: boolean;
  showKelpoisuuskoeJaSopeutumisaika?: boolean;
  showLisatieto?: boolean;
  kelpoisuuskoeFieldLabelPrefix?: string;
};

export const KorvaavaToimenpideComponent = ({
  korvaavaToimenpide,
  label,
  kelpoisuuskoeTransKeyBase,
  updateKorvaavaToimenpide,
  showKelpoisuuskoeJaSopeutumisaika,
  showTaydentavatOpinnot,
  showLisatieto,
  kelpoisuuskoeFieldLabelPrefix,
  t,
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
      kelpoisuuskoeTransKeyBase={kelpoisuuskoeTransKeyBase}
      testIdPrefix={testIdPrefix}
      kelpoisuuskoeFieldLabelPrefix={kelpoisuuskoeFieldLabelPrefix}
    />
  );

  const sopeutumisaikaElement = (
    field: keyof KorvaavaToimenpide,
    testIdPrefix: string,
    kesto?: string,
  ) => (
    <OphInputFormField
      key={field}
      label={t('hakemus.paatos.myonteinenPaatos.sopeutumisaikaKesto')}
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
    <Stack gap={1}>
      <OphFormFieldWrapper
        sx={{ gap: 1 }}
        label={label}
        renderInput={
          showLisatieto
            ? () => (
                <OphTypography variant="body1">
                  {t('hakemus.paatos.myonteinenPaatos.toimenpideLisatieto')}
                </OphTypography>
              )
            : () => undefined
        }
      />
      {showTaydentavatOpinnot && (
        <OphCheckbox
          data-testid={`${testIdPrefix}-korvaavaToimenpide-taydentavatOpinnot`}
          label={t('hakemus.paatos.myonteinenPaatos.taydentavatOpinnot')}
          checked={!!korvaavaToimenpide?.taydentavatOpinnot}
          onChange={(e) => {
            updateKorvaavaToimenpide({
              ...korvaavaToimenpide,
              taydentavatOpinnot: e.target.checked,
            });
          }}
        />
      )}
      <OphCheckbox
        data-testid={`${testIdPrefix}-korvaavaToimenpide-kelpoisuuskoe`}
        label={t('hakemus.paatos.myonteinenPaatos.kelpoisuuskoe')}
        checked={!!korvaavaToimenpide?.kelpoisuuskoe}
        onChange={(e) => {
          updateKorvaavaToimenpide({
            ...korvaavaToimenpide,
            kelpoisuuskoe: e.target.checked,
          });
        }}
      />
      {korvaavaToimenpide?.kelpoisuuskoe && (
        <IndentedStack>
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
        checked={!!korvaavaToimenpide?.sopeutumisaika}
        onChange={(e) => {
          updateKorvaavaToimenpide({
            ...korvaavaToimenpide,
            sopeutumisaika: e.target.checked,
          });
        }}
      />
      {korvaavaToimenpide?.sopeutumisaika && (
        <IndentedStack>
          {sopeutumisaikaElement(
            'sopeutumiusaikaKestoKk',
            `${testIdPrefix}-singleChoice`,
            korvaavaToimenpide.sopeutumiusaikaKestoKk,
          )}
        </IndentedStack>
      )}
      {showKelpoisuuskoeJaSopeutumisaika && (
        <>
          <OphCheckbox
            data-testid={`${testIdPrefix}-korvaavaToimenpide-kelpoisuuskoeJaSopeutumisaika`}
            label={t(
              'hakemus.paatos.myonteinenPaatos.kelpoisuuskoeJaSopeutumisaika',
            )}
            checked={!!korvaavaToimenpide?.kelpoisuuskoeJaSopeutumisaika}
            onChange={(e) => {
              updateKorvaavaToimenpide({
                ...korvaavaToimenpide,
                kelpoisuuskoeJaSopeutumisaika: e.target.checked,
              });
            }}
          />
          {korvaavaToimenpide?.kelpoisuuskoeJaSopeutumisaika && (
            <IndentedStack>
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
        </>
      )}
    </Stack>
  );
};
