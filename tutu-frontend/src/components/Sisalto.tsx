import React, { Fragment, ReactNode } from 'react';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { SisaltoItem, SisaltoValue } from '@/src/lib/types/hakemus';
import { styled } from '@mui/material';
import {
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

interface EntryLabelProps {
  children: ReactNode;
}

const EntryLabel = styled((props: EntryLabelProps) => {
  const { children, ...rest } = props;
  return (
    <OphTypography variant={'label'} {...rest}>
      {children}
    </OphTypography>
  );
})({
  display: 'block',
});

interface EntryValueProps {
  children: ReactNode;
  datatestid?: string;
}

const EntryValue = styled((props: EntryValueProps) => {
  const { children, ...rest } = props;
  return (
    <OphTypography variant={'body1'} {...rest} data-testid={props.datatestid}>
      {children}
    </OphTypography>
  );
})({
  paddingLeft: `1em`,
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
    const renderedLabel =
      label !== null ? <EntryLabel>{label}</EntryLabel> : <></>;

    const renderedValues = item.value.map((value) => (
      <Fragment key={`${value.value}--item`}>
        <EntryValue
          key={`${value.value}--value`}
          datatestid={`sisalto-item-${item.key}`}
        >
          {getValue(value, lomakkeenKieli)}
        </EntryValue>
        <Subsection key={`${value.value}--followups`}>
          {value.followups.map((v) => renderItem(v, lomakkeenKieli))}
        </Subsection>
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
  const isPerustiedot = osiot.some((osio) =>
    sisaltoItemMatches({ key: osio.generatedId } as SisaltoItem, perustiedot),
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
