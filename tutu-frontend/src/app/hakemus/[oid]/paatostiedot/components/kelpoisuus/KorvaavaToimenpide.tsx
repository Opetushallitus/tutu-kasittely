import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Theme } from '@mui/material/styles';
import {
  KelpoisuuskoeSisalto,
  KorvaavaToimenpide,
} from '@/src/lib/types/paatos';
import { Stack } from '@mui/material';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import {
  emptyKelpoisuuskoeSisalto,
  kelpoisuuskoeFields,
} from '@/src/app/hakemus/[oid]/paatostiedot/constants';

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
  updateKelpoisuuskoeAction,
  t,
  theme,
}: {
  sisalto?: KelpoisuuskoeSisalto;
  updateKelpoisuuskoeAction: (
    updatedKelpoisuuskoeSisalto: KelpoisuuskoeSisalto,
  ) => void;
  t: TFunction;
  theme: Theme;
}) => {
  const kelpoisuuskoeObj = sisalto || emptyKelpoisuuskoeSisalto();
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
          data-testid={`kelpoisuuskoe-sisalto-${key}`}
          label={t(
            `hakemus.paatos.paatostyyppi.kelpoisuus.paatos.kelpoisuusKoe.${key}`,
          )}
          checked={kelpoisuuskoeObj[key]}
          onChange={(e) => {
            updateKelpoisuuskoeAction({
              ...kelpoisuuskoeObj,
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
};

export const KorvaavaToimenpideComponent = ({
  korvaavaToimenpide,
  label,
  updateKorvaavaToimenpide,
  t,
  theme,
}: KorvaavaToimenpideProps) => {
  const kelpoisuuskoeElement = (
    <Kelpoisuuskoe
      sisalto={korvaavaToimenpide?.kelpoisuuskoeSisalto}
      updateKelpoisuuskoeAction={(updatedKelpoisuuskoeSisalto) => {
        updateKorvaavaToimenpide({
          ...korvaavaToimenpide,
          kelpoisuuskoeSisalto: updatedKelpoisuuskoeSisalto,
        });
      }}
      t={t}
      theme={theme}
    />
  );

  const sopeutumisaikaElement = (
    <OphInputFormField
      label={t('hakemus.paatos.paatostyyppi.kelpoisuus.paatos.sopeutumisaika')}
      multiline={false}
      value={korvaavaToimenpide?.sopeutumiusaikaKestoKk || ''}
      onChange={(e) => {
        updateKorvaavaToimenpide({
          ...korvaavaToimenpide,
          sopeutumiusaikaKestoKk: e.target.value,
        });
      }}
      data-testid={`korvaavaToimenpode-sopeutumisaika-input`}
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
        data-testid="korvaavaToimenpide-kelpoisuuskoe"
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
        <IndentedStack theme={theme}>{kelpoisuuskoeElement}</IndentedStack>
      )}
      <OphCheckbox
        data-testid="korvaavaToimenpide-sopeutumisaika"
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
        <IndentedStack theme={theme}>{sopeutumisaikaElement}</IndentedStack>
      )}
      <OphCheckbox
        data-testid="korvaavaToimenpide-kelpoisuuskoeJaSopeutumisaika"
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
          {[kelpoisuuskoeElement, sopeutumisaikaElement]}
        </IndentedStack>
      )}
    </Stack>
  );
};
