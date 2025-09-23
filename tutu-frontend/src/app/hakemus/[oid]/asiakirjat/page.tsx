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
import React, { useEffect } from 'react';
import { getConfiguration } from '@/src/lib/configuration/clientConfiguration';
import { AsiakirjaPyynnot } from '@/src/app/hakemus/[oid]/asiakirjat/components/AsiakirjaPyynnot';
import { AsiakirjaMallejaVastaavistaTutkinnoista } from '@/src/app/hakemus/[oid]/asiakirjat/components/MallitTutkinnoista';
import {
  AsiakirjaMetadata,
  AsiakirjaTieto,
  AsiakirjaTietoUpdateCallback,
  Hakemus,
  HakemusUpdateCallback,
  SisaltoValue,
} from '@/src/lib/types/hakemus';
import { ImiPyyntoComponent } from '@/src/app/hakemus/[oid]/asiakirjat/components/ImiPyynto';
import {
  alemmatTutkinnot,
  henkilotietojenLiitteet,
  muutTutkinnot,
  oikeellisuusJaAitous,
  todistusAitoustarkistusLupa,
  tutkintoTaiKoulutus,
  ylinTutkinto,
} from '@/src/constants/hakemuspalveluSisalto';
import {
  findSisaltoQuestionAndAnswer,
  findSisaltoValuesByItem,
  sisaltoItemMatchesToAny,
} from '@/src/lib/hakemuspalveluUtils';
import { SuostumusVahvistamiselle } from '@/src/app/hakemus/[oid]/asiakirjat/components/SuostumusVahvistamiselle';
import { useDebounce } from '@/src/hooks/useDebounce';
import { ValmistumisenVahvistusComponent } from '@/src/app/hakemus/[oid]/asiakirjat/components/ValmistumisenVahvistus';

const sisallonSuoratYlatasonOsiot = [henkilotietojenLiitteet];
const tutkintojenYlatasonOsio = tutkintoTaiKoulutus;
const tutkintojenAliOsiot = [ylinTutkinto, alemmatTutkinnot, muutTutkinnot];

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
    updateOngoing,
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

  return (
    <AsiakirjaHookLayer
      hakemus={hakemus}
      updateHakemus={updateHakemus}
      updateOngoing={updateOngoing || false}
    />
  );
}

const AsiakirjaHookLayer = ({
  hakemus,
  updateHakemus,
  updateOngoing,
}: {
  hakemus: Hakemus;
  updateHakemus: HakemusUpdateCallback;
  updateOngoing: boolean;
}) => {
  const { t } = useTranslations();
  const { addToast } = useToaster();

  /* -------------------------- */
  /* Haetaan liitteiden  tiedot */
  const sisalto = hakemus?.sisalto || [];
  const tutkintojenYlaOsio = sisalto.find((item) =>
    sisaltoItemMatchesToAny(item, [tutkintojenYlatasonOsio]),
  )!;
  const tutkintoSisalto = tutkintojenAliOsiot.flatMap((osio) =>
    findSisaltoValuesByItem(osio, tutkintojenYlaOsio),
  );
  const rajattuSisalto = sisalto.filter((item) =>
    sisaltoItemMatchesToAny(item, sisallonSuoratYlatasonOsiot),
  );
  const asiakirjat = haeAsiakirjat([...rajattuSisalto, ...tutkintoSisalto]);

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

  const debouncedAsiakirjaTietoUpdateAction: AsiakirjaTietoUpdateCallback =
    useDebounce(
      (next: Partial<AsiakirjaTieto>) => updateHakemus({ asiakirja: next }),
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
      asiakirjaTietoUpdateAction={(next: Partial<AsiakirjaTieto>) =>
        updateHakemus({ asiakirja: next })
      }
      debouncedAsiakirjaTietoUpdateAction={debouncedAsiakirjaTietoUpdateAction}
      asiakirjat={asiakirjat}
      asiakirjaMetadata={asiakirjaMetadata}
      updateOngoing={updateOngoing}
    />
  );
};

const AsiakirjaPagePure = ({
  hakemus,
  asiakirjaTietoUpdateAction,
  debouncedAsiakirjaTietoUpdateAction,
  asiakirjat = [],
  asiakirjaMetadata = [],
  updateOngoing,
}: {
  hakemus: Hakemus;
  asiakirjaTietoUpdateAction: AsiakirjaTietoUpdateCallback;
  debouncedAsiakirjaTietoUpdateAction: AsiakirjaTietoUpdateCallback;
  asiakirjat: SisaltoValue[];
  asiakirjaMetadata: AsiakirjaMetadata[];
  updateOngoing: boolean;
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
        saapumisaika: hakemus.kirjausPvm,
        metadata,
        liitteenTila,
        key: asiakirja.label.fi!,
      };
    },
  );

  const [todistusTarkistusLupaLabel, todistusAitoustarkistusLupaValue] =
    findSisaltoQuestionAndAnswer(
      hakemus.sisalto,
      [oikeellisuusJaAitous, todistusAitoustarkistusLupa],
      getLanguage(),
    );

  const asiakirja = hakemus.asiakirja;

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{
        flexGrow: 1,
        marginRight: theme.spacing(3),
        pointerEvents: updateOngoing ? 'none' : 'auto',
      }}
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
      {updateOngoing && <FullSpinner float={true}></FullSpinner>}
      <AsiakirjaPyynnot
        asiakirjaPyynnot={asiakirja.pyydettavatAsiakirjat}
        updateAsiakirjaTietoAction={asiakirjaTietoUpdateAction}
      ></AsiakirjaPyynnot>
      <Divider orientation={'horizontal'} />
      <OphTypography variant={'h3'}>
        {t('hakemus.asiakirjat.asiakirjojenTarkistukset')}
      </OphTypography>
      <KaikkiSelvityksetSaatu
        asiakirjaTieto={asiakirja}
        updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
      />
      <ApHakemus
        asiakirjaTieto={asiakirja}
        hakemusKoskee={hakemus.hakemusKoskee}
        updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
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

      <ImiPyyntoComponent
        imiPyynto={asiakirja.imiPyynto}
        instantUpdateAsiakirjaTietoAction={asiakirjaTietoUpdateAction}
        debouncedUpdateAsiakirjaTietoAction={
          debouncedAsiakirjaTietoUpdateAction
        }
      ></ImiPyyntoComponent>
      <Divider orientation={'horizontal'} />

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
      <SuostumusVahvistamiselle
        asiakirjaTieto={asiakirja}
        updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
      />
      <ValmistumisenVahvistusComponent
        asiakirjaTieto={asiakirja}
        instantUpdateAsiakirjaTietoAction={asiakirjaTietoUpdateAction}
        debouncedUpdateAsiakirjaTietoAction={
          debouncedAsiakirjaTietoUpdateAction
        }
      />
      <AllekirjoitustenTarkistus
        asiakirjaTieto={asiakirja}
        instantUpdateAsiakirjaTietoAction={asiakirjaTietoUpdateAction}
        debouncedUpdateAsiakirjaTietoAction={
          debouncedAsiakirjaTietoUpdateAction
        }
      />
      <AlkuperaisetAsiakirjat
        asiakirja={asiakirja}
        instantUpdateAsiakirjaTietoAction={asiakirjaTietoUpdateAction}
        debouncedUpdateAsiakirjaTietoAction={
          debouncedAsiakirjaTietoUpdateAction
        }
      />
      <AsiakirjaMallejaVastaavistaTutkinnoista
        asiakirjaTieto={asiakirja}
        instantUpdateAsiakirjaTietoAction={asiakirjaTietoUpdateAction}
        debouncedUpdateAsiakirjaTietoAction={
          debouncedAsiakirjaTietoUpdateAction
        }
      />
    </Stack>
  );
};
