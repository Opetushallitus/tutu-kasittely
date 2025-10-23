import React from 'react';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { SisaltoItem, SisaltoValue } from '@/src/lib/types/hakemus';
import { Stack } from '@mui/material';
import {
  eupatevyys,
  HakemuspalveluSisaltoId,
  perustiedot,
} from '@/src/constants/hakemuspalveluSisalto';
import {
  isAttachmentField,
  sisaltoItemMatches,
  sisaltoItemMatchesToAny,
} from '@/src/lib/hakemuspalveluUtils';
import { Language } from '@/src/lib/localization/localizationTypes';

const getValue = (sisaltoValue: SisaltoValue, lomakkeenKieli: Language) => {
  return (
    sisaltoValue.label?.[lomakkeenKieli as keyof typeof sisaltoValue.label] ??
    ''
  );
};

const renderItem = (item: SisaltoItem, lomakkeenKieli: Language) => {
  if (!isAttachmentField(item)) {
    let label = item.label?.[lomakkeenKieli as keyof typeof item.label];

    // väliaikainen purkkaratkaisu, muuttuu turhaksi jos lomakkeeseen lisätään kysymykset eikä niitä tarvitse kaivaa infotekstistä
    if (!label || label === '') {
      label = item.infoText?.label?.[
        lomakkeenKieli as keyof typeof item.infoText.label
      ]
        ?.split('\n')[0]
        .replaceAll('#', '')
        .replaceAll('*', '');
    }

    const renderedLabel = label ? (
      <OphTypography variant={'label'}>{label}</OphTypography>
    ) : undefined;
    const isEuPatevyys = sisaltoItemMatches(item, eupatevyys);

    const renderedValues = item.value.map((val) => {
      const value = val.value;
      const valueLabel = getValue(val, lomakkeenKieli);
      return (
        <Stack key={`${value}--item`}>
          {valueLabel && valueLabel !== '' ? (
            <OphTypography
              key={`${value}--value`}
              data-testid={`sisalto-item-${item.key}`}
              variant={'body1'}
            >
              {valueLabel}
            </OphTypography>
          ) : undefined}
          {isEuPatevyys || val.followups.length === 0 ? undefined : (
            <Stack gap={2} key={`${value}--followups`} sx={{ paddingLeft: 2 }}>
              {val.followups.map((v) => renderItem(v, lomakkeenKieli))}
            </Stack>
          )}
        </Stack>
      );
    });

    const renderedChildren =
      item.children.length > 0 ? (
        <Stack gap={2} sx={{ paddingLeft: 2 }} key={`${item.key}-children`}>
          {item.children.map((child) => renderItem(child, lomakkeenKieli))}
        </Stack>
      ) : undefined;

    return (
      <Stack key={`${item.key}`}>
        {renderedLabel}
        {renderedValues}
        {renderedChildren}
      </Stack>
    );
  }
};

export const Sisalto = ({
  sisalto = [],
  osiot = [],
  lomakkeenKieli = 'fi',
}: {
  sisalto: SisaltoItem[];
  osiot: HakemuspalveluSisaltoId[];
  lomakkeenKieli: Language;
}) => {
  const itemsToRender = sisalto
    .filter((item) => sisaltoItemMatchesToAny(item, osiot))
    .map((item) => {
      // Perustiedoissa ei haluta näyttää päätason kysymyksiä
      if (sisaltoItemMatches(item, perustiedot)) {
        return {
          ...item?.children?.[0],
          label: {},
          value:
            item?.children?.[0].value?.map((i) => ({ ...i, label: {} })) ?? [],
        };
      }
      return item;
    });

  return <>{itemsToRender.map((item) => renderItem(item, lomakkeenKieli))}</>;
};
