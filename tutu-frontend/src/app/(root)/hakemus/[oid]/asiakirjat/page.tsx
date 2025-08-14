'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { useLiitteet } from '@/src/hooks/useLiitteet';
import {
  AsiakirjaTaulukko,
  haeAsiakirjat,
} from '@/src/app/(root)/hakemus/[oid]/components/asiakirjat/AsiakirjaTaulukko';
import { AllekirjoitustenTarkistus } from '@/src/app/(root)/hakemus/[oid]/components/asiakirjat/AllekirjoitustenTarkistus';
import { AlkuperaisetAsiakirjat } from '@/src/app/(root)/hakemus/[oid]/components/asiakirjat/AlkuperaisetAsiakirjat';
import { KaikkiSelvityksetSaatu } from '@/src/app/(root)/hakemus/[oid]/components/asiakirjat/KaikkiSelvityksetSaatu';
import { ApHakemus } from '@/src/app/(root)/hakemus/[oid]/components/asiakirjat/ApHakemus';
import { FullSpinner } from '@/src/components/FullSpinner';
import { StyledLink } from '@/src/app/(root)/hakemus/[oid]/components/StyledLink';
import { CenteredRow } from '@/src/app/(root)/hakemus/[oid]/components/CenteredRow';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { handleFetchError } from '@/src/lib/utils';
import useToaster from '@/src/hooks/useToaster';
import { useEffect } from 'react';
import { VIRKAILIJA_URL } from '@/src/lib/configuration';
import { AsiakirjaPyynnot } from '@/src/app/(root)/hakemus/[oid]/components/asiakirjat/AsiakirjaPyynnot';
import { AsiakirjaMallejaVastaavistaTutkinnoista } from '@/src/app/(root)/hakemus/[oid]/components/asiakirjat/MallitTutkinnoista';
import { Hakemus } from '@/src/lib/types/hakemus';
import { ImiPyyntoComponent } from '@/src/app/(root)/hakemus/[oid]/components/asiakirjat/ImiPyynto';
import {
  oikeellisuusJaAitous,
  todistusAitoustarkistusLupa,
} from '@/src/constants/hakemuspalveluSisalto';
import { findSisaltoQuestionAndAnswer } from '@/src/lib/hakemuspalveluUtils';

const sisallonOsiot = [
  '89e89dff-25b2-4177-b078-fcaf0c9d2589', // Tutkinto tai koulutus
];

const ExternalLink = ({
  href,
  label,
  gap,
}: {
  href: string;
  label: string;
  gap: string;
}) => {
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
    updateHakemus,
    error: hakemusError,
  } = useHakemus();

  /* ----------------------------------------- */
  /* Käsitellään virheet ja puutteellinen data */
  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
  }, [hakemusError, addToast, t]);

  if (hakemusError) {
    return null;
  }

  if (hakemusIsLoading || !hakemus) return <FullSpinner></FullSpinner>;

  return <AsiakirjaHookLayer hakemus={hakemus} updateHakemus={updateHakemus} />;
}

const AsiakirjaHookLayer = ({ hakemus, updateHakemus }) => {
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
      updateHakemus={updateHakemus}
      asiakirjat={asiakirjat}
      asiakirjaMetadata={asiakirjaMetadata}
    />
  );
};

const AsiakirjaPagePure = ({
  hakemus = {},
  updateHakemus,
  asiakirjat = [],
  asiakirjaMetadata = [],
}) => {
  const theme = useTheme();
  const { t, getLanguage } = useTranslations();

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

  const [todistusTarkistusLupaLabel, todistusAitoustarkistusLupaValue] =
    findSisaltoQuestionAndAnswer(
      hakemus.sisalto,
      [oikeellisuusJaAitous, todistusAitoustarkistusLupa],
      getLanguage(),
    );

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
          label={t('hakemus.asiakirjat.avaaHakemuspalvelussa')}
          href={`${VIRKAILIJA_URL}/lomake-editori/applications/${hakemus.lomakeOid}?application-key=${hakemus.hakemusOid}&ensisijaisesti=false`}
        />
      </Stack>
      <AsiakirjaTaulukko asiakirjat={completeAsiakirjaData} />
      <AsiakirjaPyynnot
        asiakirjaPyynnot={hakemus.pyydettavatAsiakirjat}
        updateHakemusAction={updateHakemus}
      ></AsiakirjaPyynnot>
      <Divider orientation={'horizontal'} />
      <ImiPyyntoComponent
        imiPyynto={hakemus.imiPyynto}
        updateHakemusAction={updateHakemus}
      ></ImiPyyntoComponent>
      <Divider orientation={'horizontal'} />
      <OphTypography variant={'h3'}>
        {t('hakemus.asiakirjat.asiakirjojenTarkistukset')}
      </OphTypography>
      <KaikkiSelvityksetSaatu hakemus={hakemus} updateHakemus={updateHakemus} />
      {hakemus.hakemusKoskee === 1 && (
        <ApHakemus hakemus={hakemus} updateHakemus={updateHakemus} />
      )}
      <OphTypography variant={'h3'}>
        {t('hakemus.asiakirjat.asiakirjojenVahvistaminen')}
      </OphTypography>
      <Stack>
        <OphTypography
          variant={'label'}
          data-testid="todistus-tarkistus-lupa-label"
        >
          {todistusTarkistusLupaLabel}
        </OphTypography>
        <OphTypography
          variant={'body1'}
          data-testid="todistus-tarkistus-lupa-value"
        >
          {todistusAitoustarkistusLupaValue}
        </OphTypography>
      </Stack>
      <OphTypography variant={'h4'}>
        {t('hakemus.asiakirjat.asiakirjojenVahvistaminen')}
      </OphTypography>
      <AllekirjoitustenTarkistus
        hakemus={hakemus}
        updateHakemus={updateHakemus}
      />
      <AlkuperaisetAsiakirjat hakemus={hakemus} updateHakemus={updateHakemus} />
      <AsiakirjaMallejaVastaavistaTutkinnoista
        hakemus={hakemus as Hakemus}
        updateHakemus={updateHakemus}
      />
    </Stack>
  );
};
