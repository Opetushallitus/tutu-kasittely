'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { useLiitteet } from '@/src/hooks/useLiitteet';
import {
  AsiakirjaTaulukko,
  AsiakirjaTaulukkoData,
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
  checkLiitteenTila,
  findSisaltoQuestionAndAnswer,
  findSisaltoValuesByItem,
  haeAsiakirjat,
  sisaltoItemMatchesToAny,
} from '@/src/lib/hakemuspalveluUtils';
import { SuostumusVahvistamiselle } from '@/src/app/hakemus/[oid]/asiakirjat/components/SuostumusVahvistamiselle';
import { ValmistumisenVahvistusComponent } from '@/src/app/hakemus/[oid]/asiakirjat/components/ValmistumisenVahvistus';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { EditableState } from '@/src/hooks/useEditableState';

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
    hakemusState,
    error: hakemusError,
    isSaving,
  } = useHakemus();

  /* ----------------------------------------- */
  /* Käsitellään virheet ja puutteellinen data */
  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
  }, [hakemusError, addToast, t]);

  if (hakemusError) {
    return null;
  }

  if (hakemusIsLoading || !hakemusState.editedData)
    return <FullSpinner></FullSpinner>;

  return (
    <AsiakirjaHookLayer
      hakemusState={hakemusState}
      isSaving={isSaving || false}
    />
  );
}

const AsiakirjaHookLayer = ({
  hakemusState,
  isSaving,
}: {
  hakemusState: EditableState<Hakemus>;
  isSaving: boolean;
}) => {
  const { t } = useTranslations();
  const { addToast } = useToaster();

  const {
    editedData: hakemus,
    save: saveHakemus,
    hasChanges: hakemusHasChanges,
    updateLocal: updateLocalHakemus,
  } = hakemusState;

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
  } = useLiitteet(
    hakemus!.hakemusOid,
    asiakirjat.map((asiakirja) => asiakirja.label.fi).join(','),
  );
  const asiakirjaMetadataWithSaapumisaika = asiakirjaMetadata?.map((m) =>
    m.saapumisaika ? m : { ...m, saapumisaika: hakemus!.kirjausPvm },
  );

  /* ----------------------------------------- */
  /* Käsitellään virheet ja puutteellinen data */
  useEffect(() => {
    handleFetchError(addToast, asiakirjaError, 'virhe.liitteidenLataus', t);
  }, [asiakirjaError, addToast, t]);

  if (asiakirjaError) {
    return null;
  }

  if (asiakirjatIsLoading || !asiakirjaMetadataWithSaapumisaika || !hakemus)
    return <FullSpinner></FullSpinner>;

  const asiakirjaTietoUpdateAction = (asiakirja: Partial<AsiakirjaTieto>) => {
    updateLocalHakemus({ asiakirja: { ...hakemus.asiakirja, ...asiakirja } });
  };

  return (
    <AsiakirjaPagePure
      hakemus={hakemus!}
      asiakirjaTietoUpdateAction={asiakirjaTietoUpdateAction}
      asiakirjat={asiakirjat}
      asiakirjaMetadata={asiakirjaMetadataWithSaapumisaika}
      isSaving={isSaving}
      hasChanges={hakemusHasChanges}
      onSave={saveHakemus}
    />
  );
};

const AsiakirjaPagePure = ({
  hakemus,
  asiakirjaTietoUpdateAction,
  asiakirjat = [],
  asiakirjaMetadata = [],
  isSaving,
  hasChanges,
  onSave,
}: {
  hakemus: Hakemus;
  asiakirjaTietoUpdateAction: AsiakirjaTietoUpdateCallback;
  asiakirjat: SisaltoValue[];
  asiakirjaMetadata: AsiakirjaMetadata[];
  isSaving: boolean;
  hasChanges: boolean;
  onSave: () => void;
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
        metadata: metadata,
        liitteenTila: checkLiitteenTila(metadata, liitteenTila),
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
    <>
      <Stack
        gap={theme.spacing(3)}
        sx={{
          flexGrow: 1,
          marginRight: theme.spacing(3),
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
        <AsiakirjaPyynnot
          asiakirjaPyynnot={asiakirja.pyydettavatAsiakirjat}
          updateAsiakirjaTietoAction={asiakirjaTietoUpdateAction}
          hakemusKoskee={hakemus.hakemusKoskee}
        ></AsiakirjaPyynnot>
        <Divider orientation={'horizontal'} />
        <OphTypography variant={'h3'}>
          {t('hakemus.asiakirjat.asiakirjojenTarkistukset')}
        </OphTypography>
        <KaikkiSelvityksetSaatu
          asiakirjaTieto={asiakirja}
          updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
          kirjausPvm={hakemus.kirjausPvm}
        />
        <ApHakemus
          asiakirjaTieto={asiakirja}
          hakemusKoskee={hakemus.hakemusKoskee}
          updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
        />
        <Muistio
          label={t('hakemus.asiakirjat.muistio.sisainenOtsake')}
          helperText={t('hakemus.asiakirjat.muistio.sisainenOhjeteksti')}
          sisalto={asiakirja.esittelijanHuomioita}
          updateMuistio={(value: string) => {
            asiakirjaTietoUpdateAction({ esittelijanHuomioita: value });
          }}
          testId={'muistio-asiakirjat-sisainen'}
        />
        <Muistio
          label={t('hakemus.asiakirjat.muistio.muistioOtsake')}
          sisalto={asiakirja.huomiotMuistioon}
          updateMuistio={(value: string) => {
            asiakirjaTietoUpdateAction({ huomiotMuistioon: value });
          }}
        />

        {hakemus.hakemusKoskee === 1 && (
          <ImiPyyntoComponent
            imiPyynto={asiakirja.imiPyynto}
            updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
          ></ImiPyyntoComponent>
        )}
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
          updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
        />
        <AllekirjoitustenTarkistus
          asiakirjaTieto={asiakirja}
          updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
        />
        <AlkuperaisetAsiakirjat
          asiakirja={asiakirja}
          updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
        />
        <AsiakirjaMallejaVastaavistaTutkinnoista
          asiakirjaTieto={asiakirja}
          updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
        />
      </Stack>
      <SaveRibbon onSave={onSave} isSaving={isSaving} hasChanges={hasChanges} />
    </>
  );
};
