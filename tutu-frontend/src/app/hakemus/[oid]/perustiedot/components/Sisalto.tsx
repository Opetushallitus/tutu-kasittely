import React, { Fragment, ReactNode } from 'react';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { SisaltoItem, SisaltoValue } from '@/src/lib/types/hakemus';
import { styled } from '@mui/material';
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

interface IndentedProps {
  className?: string;
  children: ReactNode;
}

const Indented = styled((props: IndentedProps) => {
  const { children, ...rest } = props;
  return (
    <div {...rest} className={`${props.className} indented`}>
      {children}
    </div>
  );
})({
  '.indented .indented': {
    paddingLeft: `1em`,
  },
  '.indented:last-child': {
    paddingBottom: `24px`,
  },
});

const Subsection = styled('div')({
  paddingLeft: `1em`,
  display: 'block',
});

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

    const renderedValues = item.value.map((value) => (
      <Fragment key={`${value.value}--item`}>
        <OphTypography
          key={`${value.value}--value`}
          data-testid={`sisalto-item-${item.key}`}
          variant={'body1'}
          sx={{
            paddingLeft: `1em`,
          }}
        >
          {getValue(value, lomakkeenKieli)}
        </OphTypography>
        {isEuPatevyys ? undefined : (
          <Subsection key={`${value.value}--followups`}>
            {value.followups.map((v) => renderItem(v, lomakkeenKieli))}
          </Subsection>
        )}
      </Fragment>
    ));

    const renderedChildren =
      item.children.length > 0 ? (
        <Subsection>
          {item.children.map((child) => renderItem(child, lomakkeenKieli))}
        </Subsection>
      ) : undefined;

    return (
      <Indented key={`${item.key}`}>
        {renderedLabel}
        {renderedValues}
        {renderedChildren}
      </Indented>
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
          value: item?.children?.[0].value?.map((i) => ({ ...i, label: {} })),
        };
      }
      return item;
    });

  return <>{itemsToRender.map((item) => renderItem(item, lomakkeenKieli))}</>;
};
