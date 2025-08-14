import { Fragment } from 'react';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { SisaltoItem } from '@/src/lib/types/hakemus';
import * as R from 'remeda';
import { styled } from '@mui/material';
import { HakemuspalveluSisaltoId } from '@/src/constants/hakemuspalveluSisalto';
import { sisaltoItemMatchesToAny } from '@/src/lib/hakemuspalveluUtils';

const Indented = styled((props) => (
  <div {...props} className={`${props.className} indented`} />
))({
  //backgroundColor: `#0033cc11`,
  '.indented .indented': {
    paddingLeft: `1em`,
  },
  '.indented:last-child': {
    paddingBottom: `24px`,
  },
});

const EntryLabel = styled((props) => (
  <OphTypography variant={'label'} {...props} />
))({
  display: 'block',
});

const EntryValue = styled((props) => (
  <OphTypography variant={'body1'} {...props} />
))({
  paddingLeft: `1em`,
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
  const label = R.pathOr(item, ['label', 'fi'], null);
  const renderedLabel =
    label != null ? <EntryLabel>{label}</EntryLabel> : <></>;

  const renderedValues = item.value.map((value) => (
    <Fragment key={`${value.value}--item`}>
      <EntryValue key={`${value.value}--value`}>
        {`- ${R.pathOr(value, ['label', 'fi'], null)}`}
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
      {renderedValues}
      {renderedChildren}
    </Indented>
  );
};
