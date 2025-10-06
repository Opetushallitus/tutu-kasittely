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
    const label =
      item.label?.[lomakkeenKieli as keyof typeof item.label] || null;
    const renderedLabel = label && (
      <OphTypography variant={'label'}>{label}</OphTypography>
    );
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
        {isEuPatevyys ? null : (
          <Subsection key={`${value.value}--followups`}>
            {value.followups.map((v) => renderItem(v, lomakkeenKieli))}
          </Subsection>
        )}
      </Fragment>
    ));
    const renderedChildren = (
      <Subsection>
        {item.children.map((child) => renderItem(child, lomakkeenKieli))}
      </Subsection>
    );

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
  const isPerustiedot = osiot.some(
    (osio) =>
      sisaltoItemMatches(
        { key: osio.generatedId } as SisaltoItem,
        perustiedot,
      ) ||
      sisaltoItemMatches({ key: osio.definedId } as SisaltoItem, perustiedot),
  );

  let itemsToRender: SisaltoItem[] = [];

  if (isPerustiedot) {
    // Perustiedoissa ei haluta näyttää päätason kysymyksiä
    const perustiedotItem = sisalto.find((item) =>
      sisaltoItemMatches(item, perustiedot),
    );
    const perustiedotFollowups =
      perustiedotItem?.children?.[0]?.value?.[0]?.followups ?? [];
    itemsToRender = [...perustiedotFollowups];
  }

  // Muut osiot
  const otherOsiot = osiot.filter(
    (osio) =>
      !sisaltoItemMatches(
        { key: osio.generatedId } as SisaltoItem,
        perustiedot,
      ),
  );

  if (otherOsiot.length > 0) {
    const otherItems = sisalto.filter((item) =>
      sisaltoItemMatchesToAny(item, otherOsiot),
    );
    itemsToRender = [...itemsToRender, ...otherItems];
  }

  return <>{itemsToRender.map((item) => renderItem(item, lomakkeenKieli))}</>;
};
