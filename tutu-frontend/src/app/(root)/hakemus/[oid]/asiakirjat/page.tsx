'use client';

import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { useLiitteet } from '@/src/hooks/useLiitteet';
import {
  AsiakirjaTaulukko,
  haeAsiakirjat,
} from '@/src/app/(root)/hakemus/[oid]/components/AsiakirjaTaulukko';
import { FullSpinner } from '@/src/components/FullSpinner';
import { StyledLink } from '@/src/app/(root)/hakemus/[oid]/components/StyledLink';
import { CenteredRow } from '@/src/app/(root)/hakemus/[oid]/components/CenteredRow';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { handleFetchError } from '@/src/lib/utils';
import useToaster from '@/src/hooks/useToaster';
import { useEffect } from 'react';
import { VIRKAILIJA_URL } from '@/src/lib/configuration';
import { AsiakirjaPyynnot } from '@/src/app/(root)/hakemus/[oid]/components/AsiakirjaPyynnot';

const sisallonOsiot = [
  '89e89dff-25b2-4177-b078-fcaf0c9d2589', // Tutkinto tai koulutus
];

const ExternalLink = ({ href, label, gap }) => {
  return (
    <StyledLink href={href} target="_black" rel="noopener">
      <CenteredRow gap={gap}>
        <OpenInNewIcon />
        {label}
      </CenteredRow>
    </StyledLink>
  );
};

export default function AsiakirjaPage() {
  const { t } = useTranslations();
  const { addToast } = useToaster();

  /* -------------------------- */
  /* Haetaan hakemuksen  tiedot */
  const {
    isLoading: hakemusIsLoading,
    hakemus,
    error: hakemusError,
  } = useHakemus();

  /* ----------------------------------------- */
  /* Käsitellään virheet ja puutteellinen data */
  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksen-lataus', t);
  }, [hakemusError, addToast, t]);

  if (hakemusError) {
    return null;
  }

  if (hakemusIsLoading || !hakemus) return <FullSpinner></FullSpinner>;

  return <AsiakirjaHookLayer hakemus={hakemus} />;
}

const AsiakirjaHookLayer = ({ hakemus }) => {
  const { t } = useTranslations();
  const { addToast } = useToaster();

  /* -------------------------- */
  /* Haetaan liitteiden  tiedot */
  const sisalto = hakemus?.sisalto || [];
  const rajattuSisalto = sisalto.filter((item) =>
    sisallonOsiot.includes(item.key),
  );
  const asiakirjat = haeAsiakirjat(rajattuSisalto);

  const {
    isLoading: asiakirjatIsLoading,
    data: asiakirjaMetadata,
    error: asiakirjaError,
  } = useLiitteet(asiakirjat.map((asiakirja) => asiakirja.label.fi).join(','));

  /* ----------------------------------------- */
  /* Käsitellään virheet ja puutteellinen data */
  useEffect(() => {
    handleFetchError(addToast, asiakirjaError, 'virhe.liitteiden-lataus', t);
  }, [asiakirjaError, addToast, t]);

  if (asiakirjaError) {
    return null;
  }

  if (asiakirjatIsLoading || !asiakirjaMetadata)
    return <FullSpinner></FullSpinner>;

  return (
    <AsiakirjaPagePure
      hakemus={hakemus}
      asiakirjat={asiakirjat}
      asiakirjaMetadata={asiakirjaMetadata}
    />
  );
};

const AsiakirjaPagePure = ({
  hakemus = {},
  asiakirjat = [],
  asiakirjaMetadata = [],
}) => {
  const theme = useTheme();
  const { t } = useTranslations();

  /* ------------------------------- */
  /* Yhdistetään asiakirjojen tiedot */
  const completeAsiakirjaData = asiakirjat.map((asiakirja) => {
    const metadata = asiakirjaMetadata.find(
      (dataItem) => dataItem.key === asiakirja.label.fi,
    );
    const liitteenTila = hakemus.liitteidenTilat?.find(
      (state) => state.attachment === asiakirja.formId,
    );
    return { asiakirja, metadata, liitteenTila, key: asiakirja.label.fi };
  });

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <OphTypography variant={'h2'}>
          {t('hakemus.asiakirjat.otsikko')}
        </OphTypography>
        <ExternalLink
          gap={theme.spacing(1)}
          label={t('hakemus.asiakirjat.avaa_hakemuspalvelussa')}
          href={`${VIRKAILIJA_URL}/lomake-editori/applications/${hakemus.lomakeOid}?application-key=${hakemus.hakemusOid}&ensisijaisesti=false`}
        />
      </Stack>
      <AsiakirjaTaulukko asiakirjat={completeAsiakirjaData} />
      <AsiakirjaPyynnot
        asiakirjaPyynnot={hakemus.pyydettavatAsiakirjat}
      ></AsiakirjaPyynnot>
    </Stack>
  );
};
