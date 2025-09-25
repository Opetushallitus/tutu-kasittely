import React, { Fragment, ReactNode, useEffect } from 'react';
import { OphTypography } from '@opetushallitus/oph-design-system';
import {
  AsiakirjaMetadata,
  SisaltoItem,
  SisaltoValue,
} from '@/src/lib/types/hakemus';
import * as R from 'remeda';
import { styled } from '@mui/material';
import { HakemuspalveluSisaltoId } from '@/src/constants/hakemuspalveluSisalto';
import {
  haeAsiakirjat,
  isAttachmentField,
  sisaltoItemMatchesToAny,
} from '@/src/lib/hakemuspalveluUtils';
import { useLiitteet } from '@/src/hooks/useLiitteet';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { handleFetchError } from '@/src/lib/utils';
import { FullSpinner } from '@/src/components/FullSpinner';

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
  const { t } = useTranslations();
  const { addToast } = useToaster();

  const rajattuSisalto = sisalto.filter((item) =>
    sisaltoItemMatchesToAny(item, osiot),
  );
  const liitteet = haeAsiakirjat(rajattuSisalto);
  const {
    isLoading,
    data: liiteMetadata = [],
    error,
  } = useLiitteet(liitteet.map((liite) => liite.label.fi).join(','));

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.liitteidenLataus', t);
  }, [error, addToast, t]);

  if (isLoading) return <FullSpinner></FullSpinner>;

  return (
    <div>{rajattuSisalto.map((item) => renderItem(item, liiteMetadata))}</div>
  );
};

const getValue = (
  sisaltoValue: SisaltoValue,
  sisaltoItem: SisaltoItem,
  liiteMetadata: AsiakirjaMetadata[],
) => {
  let val = R.pathOr(sisaltoValue, ['label', 'fi'], '');
  if (isAttachmentField(sisaltoItem)) {
    const metadata = liiteMetadata.find((meta) => meta.key === val);
    val = metadata ? metadata.filename : val;
  }
  return val;
};

export const renderItem = (
  item: SisaltoItem,
  liiteMetadata: AsiakirjaMetadata[],
) => {
  const label = item.label?.fi || null;
  const renderedLabel =
    label !== null ? <EntryLabel>{label}</EntryLabel> : <></>;

  const infoTextTranslations =
    item.infoText?.label ?? item.infoText?.value ?? null;
  const infoText = infoTextTranslations?.fi ?? null;

  const renderedInfoText = infoText && <EntryInfo>{infoText}</EntryInfo>;

  const renderedValues = item.value.map((value) => (
    <Fragment key={`${value.value}--item`}>
      <EntryValue
        key={`${value.value}--value`}
        datatestid={`sisalto-item-${item.key}`}
      >
        {`- ${getValue(value, item, liiteMetadata)}`}
      </EntryValue>
      <Subsection key={`${value.value}--followups`}>
        {value.followups.map((v) => renderItem(v, liiteMetadata))}
      </Subsection>
    </Fragment>
  ));
  const renderedChildren = (
    <Subsection>
      {item.children.map((child) => renderItem(child, liiteMetadata))}
    </Subsection>
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
