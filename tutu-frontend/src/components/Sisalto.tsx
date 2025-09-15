import { Fragment, ReactNode } from 'react';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { SisaltoItem } from '@/src/lib/types/hakemus';
import * as R from 'remeda';
import { styled } from '@mui/material';
import { HakemuspalveluSisaltoId } from '@/src/constants/hakemuspalveluSisalto';
import { sisaltoItemMatchesToAny } from '@/src/lib/hakemuspalveluUtils';

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
  //backgroundColor: `#0033cc11`,
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

interface EntryInfoProps {
  children: ReactNode;
}

const EntryInfo = styled((props: EntryInfoProps) => {
  const { children, ...rest } = props;
  return (
    <OphTypography variant={'body2'} {...rest}>
      {children}
    </OphTypography>
  );
})({
  paddingLeft: `1em`,
  paddingBottom: `0.5em`,
  display: 'block',
});

interface EntryValueProps {
  children: ReactNode;
}

const EntryValue = styled((props: EntryValueProps) => {
  const { children, ...rest } = props;
  return (
    <OphTypography variant={'body1'} {...rest}>
      {children}
    </OphTypography>
  );
})({
  paddingLeft: `1em`,
  paddingBottom: `1em`,
  display: 'block',
});

const Subsection = styled('div')({
  paddingLeft: `1em`,
  display: 'block',
});

export const Sisalto = ({
  sisalto = [],
  osiot = [],
}: {
  sisalto: SisaltoItem[];
  osiot: HakemuspalveluSisaltoId[];
}) => {
  return (
    <div>
      {sisalto
        .filter((item) => sisaltoItemMatchesToAny(item, osiot))
        .map((item) => renderItem(item))}
    </div>
  );
};

export const renderItem = (item: SisaltoItem) => {
  const label = item.label?.fi || null;
  const renderedLabel =
    label !== null ? <EntryLabel>{label}</EntryLabel> : <></>;

  const infoTextTranslations =
    item.infoText?.label ?? item.infoText?.value ?? null;
  const infoText = infoTextTranslations?.fi ?? null;

  const renderedInfoText = infoText && <EntryInfo>{infoText}</EntryInfo>;

  const renderedValues = item.value.map((value) => (
    <Fragment key={`${value.value}--item`}>
      <EntryValue key={`${value.value}--value`}>
        {`- ${R.pathOr(value, ['label', 'fi'], '')}`}
      </EntryValue>
      <Subsection key={`${value.value}--followups`}>
        {value.followups.map(renderItem)}
      </Subsection>
    </Fragment>
  ));

  const renderedChildren = (
    <Subsection>{item.children.map((child) => renderItem(child))}</Subsection>
  );

  return (
    <Indented key={`${item.key}`}>
      {renderedLabel}
      {renderedInfoText}
      {renderedValues}
      {renderedChildren}
    </Indented>
  );
};
