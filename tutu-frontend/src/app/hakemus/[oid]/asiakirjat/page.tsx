'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { useLiitteet } from '@/src/hooks/useLiitteet';
import {
  AsiakirjaTaulukko,
  AsiakirjaTaulukkoData,
  haeAsiakirjat,
} from '@/src/app/hakemus/[oid]/asiakirjat/components/AsiakirjaTaulukko';
import { AllekirjoitustenTarkistus } from '@/src/app/hakemus/[oid]/asiakirjat/components/AllekirjoitustenTarkistus';
import { AlkuperaisetAsiakirjat } from '@/src/app/hakemus/[oid]/asiakirjat/components/AlkuperaisetAsiakirjat';
import { KaikkiSelvityksetSaatu } from '@/src/app/hakemus/[oid]/asiakirjat/components/KaikkiSelvityksetSaatu';
import { ApHakemus } from '@/src/app/hakemus/[oid]/asiakirjat/components/ApHakemus';
import { Muistio } from '@/src/components/Muistio';
import { FullSpinner } from '@/src/components/FullSpinner';
import { StyledLink } from '@/src/components/StyledLink';
import { CenteredRow } from '@/src/components/CenteredRow';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { handleFetchError } from '@/src/lib/utils';
import useToaster from '@/src/hooks/useToaster';
import { useEffect } from 'react';
import { getConfiguration } from '@/src/lib/configuration/clientConfiguration';
import { AsiakirjaPyynnot } from '@/src/app/hakemus/[oid]/asiakirjat/components/AsiakirjaPyynnot';
import { AsiakirjaMallejaVastaavistaTutkinnoista } from '@/src/app/hakemus/[oid]/asiakirjat/components/MallitTutkinnoista';
import {
  AsiakirjaMetadata,
  Hakemus,
  HakemusUpdateCallback,
  SisaltoValue,
} from '@/src/lib/types/hakemus';
import { ImiPyyntoComponent } from '@/src/app/hakemus/[oid]/asiakirjat/components/ImiPyynto';
import {
  oikeellisuusJaAitous,
  todistusAitoustarkistusLupa,
  tutkintoTaiKoulutus,
} from '@/src/constants/hakemuspalveluSisalto';
import {
  findSisaltoQuestionAndAnswer,
  sisaltoItemMatchesToAny,
} from '@/src/lib/hakemuspalveluUtils';
import { SuostumusVahvistamiselle } from '@/src/app/hakemus/[oid]/asiakirjat/components/SuostumusVahvistamiselle';
import { useDebounce } from '@/src/hooks/useDebounce';

const sisallonOsiot = [
  tutkintoTaiKoulutus, // Tutkinto tai koulutus
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

const AsiakirjaHookLayer = ({
  hakemus,
  updateHakemus,
}: {
  hakemus: Hakemus;
  updateHakemus: HakemusUpdateCallback;
}) => {
  const { t } = useTranslations();
  const { addToast } = useToaster();

  /* -------------------------- */
  /* Haetaan liitteiden  tiedot */
  const sisalto = hakemus?.sisalto || [];
  const rajattuSisalto = sisalto.filter((item) =>
    sisaltoItemMatchesToAny(item, sisallonOsiot),
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

  const debouncedHakemusUpdateAction: HakemusUpdateCallback = useDebounce(
    (next: Partial<Hakemus>) => updateHakemus(next),
    1000,
  );

  if (asiakirjaError) {
    return null;
  }

  if (asiakirjatIsLoading || !asiakirjaMetadata)
    return <FullSpinner></FullSpinner>;

  return (
    <AsiakirjaPagePure
      hakemus={hakemus}
      debouncedHakemusUpdateAction={debouncedHakemusUpdateAction}
      asiakirjat={asiakirjat}
      asiakirjaMetadata={asiakirjaMetadata}
    />
  );
};

const AsiakirjaPagePure = ({
  hakemus,
  debouncedHakemusUpdateAction,
  asiakirjat = [],
  asiakirjaMetadata = [],
}: {
  hakemus: Hakemus;
  debouncedHakemusUpdateAction: HakemusUpdateCallback;
  asiakirjat: SisaltoValue[];
  asiakirjaMetadata: AsiakirjaMetadata[];
}) => {
  const theme = useTheme();
  const { t, getLanguage } = useTranslations();
  const VIRKAILIJA_URL = getConfiguration().VIRKAILIJA_URL;

  /* ------------------------------- */
  /* Yhdistetään asiakirjojen tiedot */
  const completeAsiakirjaData: AsiakirjaTaulukkoData[] = asiakirjat.map(
    (asiakirja) => {
      const metadata = asiakirjaMetadata.find(
        (dataItem) => dataItem.key === asiakirja.label.fi,
      );
      const liitteenTila = hakemus.liitteidenTilat?.find(
        (state) => state.attachment === asiakirja.formId,
      );
      return {
        asiakirja,
        metadata,
        liitteenTila,
        key: asiakirja.label.fi || crypto.randomUUID(),
      };
    },
  );

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
        updateHakemusAction={debouncedHakemusUpdateAction}
      ></AsiakirjaPyynnot>
      <Divider orientation={'horizontal'} />
      <ImiPyyntoComponent
        imiPyynto={hakemus.imiPyynto}
        updateHakemusAction={debouncedHakemusUpdateAction}
      ></ImiPyyntoComponent>
      <Divider orientation={'horizontal'} />
      <OphTypography variant={'h3'}>
        {t('hakemus.asiakirjat.asiakirjojenTarkistukset')}
      </OphTypography>
      <KaikkiSelvityksetSaatu
        hakemus={hakemus}
        updateHakemus={debouncedHakemusUpdateAction}
      />
      <ApHakemus
        hakemus={hakemus}
        updateHakemus={debouncedHakemusUpdateAction}
      />

      <Muistio
        label={t('hakemus.asiakirjat.muistio.sisainenOtsake')}
        helperText={t('hakemus.asiakirjat.muistio.sisainenOhjeteksti')}
        hakemus={hakemus}
        sisainen={true}
        hakemuksenOsa={'asiakirjat'}
      />
      <Muistio
        label={t('hakemus.asiakirjat.muistio.muistioOtsake')}
        hakemus={hakemus}
        sisainen={false}
        hakemuksenOsa={'asiakirjat'}
      />

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
      <SuostumusVahvistamiselle
        hakemus={hakemus}
        updateHakemus={debouncedHakemusUpdateAction}
      />
      <AllekirjoitustenTarkistus
        hakemus={hakemus}
        updateHakemus={debouncedHakemusUpdateAction}
      />
      <AlkuperaisetAsiakirjat
        hakemus={hakemus}
        updateHakemus={debouncedHakemusUpdateAction}
      />
      <AsiakirjaMallejaVastaavistaTutkinnoista
        hakemus={hakemus}
        updateHakemus={debouncedHakemusUpdateAction}
      />
    </Stack>
  );
};
