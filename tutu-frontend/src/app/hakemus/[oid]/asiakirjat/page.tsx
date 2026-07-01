'use client';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Divider, Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';

import { AlkuperaisetAsiakirjat } from '@/src/app/hakemus/[oid]/asiakirjat/components/AlkuperaisetAsiakirjat';
import { AllekirjoitustenTarkistus } from '@/src/app/hakemus/[oid]/asiakirjat/components/AllekirjoitustenTarkistus';
import { ApHakemus } from '@/src/app/hakemus/[oid]/asiakirjat/components/ApHakemus';
import { AsiakirjaPyynnot } from '@/src/app/hakemus/[oid]/asiakirjat/components/AsiakirjaPyynnot';
import {
  AsiakirjaTaulukko,
  AsiakirjaTaulukkoData,
} from '@/src/app/hakemus/[oid]/asiakirjat/components/AsiakirjaTaulukko';
import { ImiPyyntoComponent } from '@/src/app/hakemus/[oid]/asiakirjat/components/ImiPyynto';
import { KaikkiSelvityksetSaatu } from '@/src/app/hakemus/[oid]/asiakirjat/components/KaikkiSelvityksetSaatu';
import { AsiakirjaMallejaVastaavistaTutkinnoista } from '@/src/app/hakemus/[oid]/asiakirjat/components/MallitTutkinnoista';
import { SuostumusVahvistamiselle } from '@/src/app/hakemus/[oid]/asiakirjat/components/SuostumusVahvistamiselle';
import { ValmistumisenVahvistusComponent } from '@/src/app/hakemus/[oid]/asiakirjat/components/ValmistumisenVahvistus';
import { CenteredRow } from '@/src/components/CenteredRow';
import { FullSpinner } from '@/src/components/FullSpinner';
import { Muistio } from '@/src/components/Muistio';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { StyledLink } from '@/src/components/StyledLink';
import {
  alemmatTutkinnot,
  henkilotietojenLiitteet,
  muutTutkinnot,
  oikeellisuusJaAitous,
  lopullinenPaatosSuoritukset,
  todistusAitoustarkistusLupa,
  tutkintoTaiKoulutus,
  ylinTutkinto,
} from '@/src/constants/hakemuspalveluSisalto';
import { useHakemus } from '@/src/context/HakemusContext';
import { AsiakirjaState, useAsiakirjat } from '@/src/hooks/useAsiakirjat';
import { EditableState } from '@/src/hooks/useEditableState';
import { useLiitteet } from '@/src/hooks/useLiitteet';
import useToaster from '@/src/hooks/useToaster';
import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
import { getConfiguration } from '@/src/lib/configuration/clientConfiguration';
import {
  checkLiitteenTila,
  findSisaltoQuestionAndAnswer,
  findSisaltoValuesByItem,
  haeAsiakirjat,
  sisaltoItemMatchesToAny,
} from '@/src/lib/hakemuspalveluUtils';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import {
  AsiakirjaMetadata,
  AsiakirjaPyynto,
  AsiakirjaTieto,
  AsiakirjaTietoUpdateCallback,
  Hakemus,
  HakemusKoskee,
  SisaltoValue,
} from '@/src/lib/types/hakemus';
import { handleFetchError } from '@/src/lib/utils';

const sisallonSuoratYlatasonOsiot = [
  henkilotietojenLiitteet,
  lopullinenPaatosSuoritukset,
];
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
  } = useHakemus();

  const {
    asiakirjaState,
    poistaPyydettavaAsiakirja,
    isLoading: asiakirjatIsLoading,
    isSaving,
    isUpdateSuccess,
    updateError,
  } = useAsiakirjat(hakemusState.editedData!.hakemusOid);

  /* ----------------------------------------- */
  /* Käsitellään virheet ja puutteellinen data */
  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
    handleFetchError(addToast, updateError, 'virhe.tallennus', t);
  }, [hakemusError, updateError, addToast, t]);

  useEffect(() => {
    if (isUpdateSuccess) {
      addToast({
        key: 'yleiset.tallennusOnnistui',
        type: 'success',
        message: t('yleiset.tallennusOnnistui'),
        timeMs: 2500,
      });
    }
  }, [isUpdateSuccess, addToast, t]);

  if (hakemusError) {
    return null;
  }

  if (hakemusIsLoading || asiakirjatIsLoading || !hakemusState.editedData)
    return <FullSpinner></FullSpinner>;

  return (
    <AsiakirjaHookLayer
      hakemusState={hakemusState}
      asiakirjaState={asiakirjaState}
      poistaPyydettavaAsiakirja={poistaPyydettavaAsiakirja}
      isSaving={isSaving}
    />
  );
}

const AsiakirjaHookLayer = ({
  hakemusState,
  asiakirjaState,
  poistaPyydettavaAsiakirja,
  isSaving = false,
}: {
  hakemusState: EditableState<Hakemus>;
  asiakirjaState: AsiakirjaState;
  poistaPyydettavaAsiakirja: (poistettava: AsiakirjaPyynto) => void;
  isSaving: boolean;
}) => {
  const { t } = useTranslations();
  const { addToast } = useToaster();

  const { editedData: hakemus } = hakemusState;

  const {
    editedData: asiakirjaData,
    hasChanges,
    updateLocal,
    save,
    discard,
  } = asiakirjaState;

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
  const asiakirjaSisalto = haeAsiakirjat([
    ...rajattuSisalto,
    ...tutkintoSisalto,
  ]);

  const {
    isLoading: asiakirjaMetadataIsLoading,
    data: asiakirjaMetadata,
    error: asiakirjaError,
  } = useLiitteet(
    hakemus!.hakemusOid,
    asiakirjaSisalto.map((asiakirja) => asiakirja.label.fi).join(','),
  );
  const asiakirjaMetadataWithSaapumisaika = asiakirjaMetadata?.map((m) =>
    m.saapumisaika ? m : { ...m, saapumisaika: hakemus!.saapumisPvm },
  );

  /* ----------------------------------------- */
  /* Käsitellään virheet ja puutteellinen data */
  useEffect(() => {
    handleFetchError(addToast, asiakirjaError, 'virhe.liitteidenLataus', t);
  }, [asiakirjaError, addToast, t]);

  useUnsavedChanges(hasChanges, discard);

  if (asiakirjaError) {
    return null;
  }

  if (
    asiakirjaMetadataIsLoading ||
    !asiakirjaMetadataWithSaapumisaika ||
    !hakemus
  )
    return <FullSpinner></FullSpinner>;

  const asiakirjaTietoUpdateAction = (asiakirja: Partial<AsiakirjaTieto>) => {
    updateLocal({ ...asiakirjaData, ...asiakirja });
  };

  return (
    <>
      <AsiakirjaPagePure
        hakemus={hakemus}
        asiakirjat={asiakirjaData!}
        asiakirjaTietoUpdateAction={asiakirjaTietoUpdateAction}
        asiakirjaSisalto={asiakirjaSisalto}
        asiakirjaMetadata={asiakirjaMetadataWithSaapumisaika}
        poistaPyydettavaAsiakirja={poistaPyydettavaAsiakirja}
      />
      <SaveRibbon onSave={save} isSaving={isSaving} hasChanges={hasChanges} />
    </>
  );
};

const AsiakirjaPagePure = ({
  hakemus,
  asiakirjat,
  asiakirjaTietoUpdateAction,
  asiakirjaSisalto = [],
  asiakirjaMetadata = [],
  poistaPyydettavaAsiakirja,
}: {
  hakemus: Hakemus;
  asiakirjat: AsiakirjaTieto;
  asiakirjaTietoUpdateAction: AsiakirjaTietoUpdateCallback;
  asiakirjaSisalto: SisaltoValue[];
  asiakirjaMetadata: AsiakirjaMetadata[];
  poistaPyydettavaAsiakirja: (pyydettava: AsiakirjaPyynto) => void;
}) => {
  const theme = useTheme();
  const { t, getLanguage } = useTranslations();
  const VIRKAILIJA_URL = getConfiguration().VIRKAILIJA_URL;

  /* ------------------------------- */
  /* Yhdistetään asiakirjojen tiedot */
  const completeAsiakirjaData: AsiakirjaTaulukkoData[] = asiakirjaSisalto.map(
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

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{
        flexGrow: 1,
        marginRight: theme.spacing(3),
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <OphTypography variant={'h2'} data-testid="asiakirjat-otsikko">
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
        asiakirjaPyynnot={asiakirjat.pyydettavatAsiakirjat}
        updateAsiakirjaTietoAction={asiakirjaTietoUpdateAction}
        poistaPyydettavaAsiakirja={poistaPyydettavaAsiakirja}
        hakemusKoskee={hakemus.hakemusKoskee}
      ></AsiakirjaPyynnot>
      <Divider orientation={'horizontal'} />
      <OphTypography variant={'h3'}>
        {t('hakemus.asiakirjat.asiakirjojenTarkistukset')}
      </OphTypography>
      <KaikkiSelvityksetSaatu
        asiakirjaTieto={asiakirjat}
        hakemusKoskee={hakemus.hakemusKoskee}
        updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
        saapumisPvm={hakemus.saapumisPvm}
      />
      <ApHakemus
        asiakirjaTieto={asiakirjat}
        hakemusKoskee={hakemus.hakemusKoskee}
        updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
      />
      <Muistio
        label={t('hakemus.asiakirjat.muistio.sisainenOtsake')}
        helperText={t('hakemus.asiakirjat.muistio.sisainenOhjeteksti')}
        sisalto={asiakirjat.esittelijanHuomioita}
        updateMuistio={(value: string) => {
          asiakirjaTietoUpdateAction({ esittelijanHuomioita: value });
        }}
        testId={'muistio-asiakirjat-sisainen'}
      />
      {hakemus.hakemusKoskee !== HakemusKoskee.LOPULLINEN_PAATOS && (
        <Muistio
          label={t('hakemus.asiakirjat.muistio.muistioOtsake')}
          sisalto={asiakirjat.huomiotMuistioon}
          updateMuistio={(value: string) => {
            asiakirjaTietoUpdateAction({ huomiotMuistioon: value });
          }}
        />
      )}

      {hakemus.hakemusKoskee === HakemusKoskee.KELPOISUUS_AMMATTIIN && (
        <ImiPyyntoComponent
          imiPyynto={asiakirjat.imiPyynto}
          updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
        ></ImiPyyntoComponent>
      )}
      <Divider orientation={'horizontal'} />

      {hakemus.hakemusKoskee !== HakemusKoskee.LOPULLINEN_PAATOS && (
        <>
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
            asiakirjaTieto={asiakirjat}
            updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
          />
          <ValmistumisenVahvistusComponent
            asiakirjaTieto={asiakirjat}
            updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
          />
          <AllekirjoitustenTarkistus
            asiakirjaTieto={asiakirjat}
            updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
          />
          <AlkuperaisetAsiakirjat
            asiakirja={asiakirjat}
            updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
          />
          <AsiakirjaMallejaVastaavistaTutkinnoista
            asiakirjaTieto={asiakirjat}
            updateAsiakirjaTieto={asiakirjaTietoUpdateAction}
          />
        </>
      )}
    </Stack>
  );
};
