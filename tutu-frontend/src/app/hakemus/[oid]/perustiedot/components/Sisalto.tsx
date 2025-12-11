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

const TOP_LEVEL_ITEMS_ONLY_CHILDEN_SHOWN = [perustiedot];

const getValue = (sisaltoValue: SisaltoValue, lomakkeenKieli: Language) => {
  return (
    sisaltoValue.label?.[lomakkeenKieli as keyof typeof sisaltoValue.label] ??
    ''
  );
};

const renderItem = (
  item: SisaltoItem,
  lomakkeenKieli: Language,
  filterEmpty: boolean,
) => {
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

    const renderedValues = item.value.map((val: SisaltoValue) => ({
      value: val.value,
      valueLabel: getValue(val, lomakkeenKieli),
      followups: isEuPatevyys ? [] : val.followups,
    }));

    const anyRenderedValues = renderedValues.find(
      (val) => val.valueLabel !== '' || val.followups.length > 0,
    );

    const renderedValueElements =
      filterEmpty && !anyRenderedValues
        ? []
        : renderedValues.map((val) => {
            return (
              <Stack key={`${val.value}--item`}>
                {val.valueLabel !== '' ? (
                  <OphTypography
                    key={`${val.value}--value`}
                    data-testid={`sisalto-item-${item.key}`}
                    variant={'body1'}
                  >
                    {val.valueLabel}
                  </OphTypography>
                ) : undefined}
                {val.followups.length === 0 ? undefined : (
                  <Stack
                    gap={2}
                    key={`${val.value}--followups`}
                    sx={{ paddingLeft: 2 }}
                  >
                    {val.followups.map((v) =>
                      renderItem(v, lomakkeenKieli, filterEmpty),
                    )}
                  </Stack>
                )}
              </Stack>
            );
          });
    const renderedChildren =
      item.children.length > 0 ? (
        <Stack gap={2} sx={{ paddingLeft: 2 }} key={`${item.key}-children`}>
          {item.children.map((child) =>
            renderItem(child, lomakkeenKieli, filterEmpty),
          )}
        </Stack>
      ) : undefined;

    return renderedValueElements.length > 0 || renderedChildren ? (
      <Stack key={`${item.key}`}>
        {renderedLabel}
        {renderedValueElements}
        {renderedChildren}
      </Stack>
    ) : null;
  }
};

export const Sisalto = ({
  sisalto = [],
  osiot = [],
  lomakkeenKieli = 'fi',
  filterEmpty = false,
}: {
  sisalto: SisaltoItem[];
  osiot: HakemuspalveluSisaltoId[];
  lomakkeenKieli: Language;
  filterEmpty: boolean;
}) => {
  const itemsToRender = sisalto
    .filter(
      (item) => osiot.length === 0 || sisaltoItemMatchesToAny(item, osiot),
    )
    .map((item) => {
      // Näistä ei haluta näyttää päätason kysymyksiä
      if (sisaltoItemMatchesToAny(item, TOP_LEVEL_ITEMS_ONLY_CHILDEN_SHOWN)) {
        return {
          ...item?.children?.[0],
          label: {},
          value:
            item?.children?.[0].value?.map((i) => ({ ...i, label: {} })) ?? [],
        };
      }
      return item;
    });

  console.log('!!!!!!!!!!!!!!!', itemsToRender);
  return (
    <>
      {itemsToRender.map((item) =>
        renderItem(item, lomakkeenKieli, filterEmpty),
      )}
    </>
  );
};
