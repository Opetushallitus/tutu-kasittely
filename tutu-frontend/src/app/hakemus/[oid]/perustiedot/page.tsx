'use client';

import { useUnsavedChanges } from '@/src/hooks/useUnsavedChanges';
import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';

import { EhdollisenHakemuksenSisalto } from '@/src/app/hakemus/[oid]/perustiedot/components/EhdollisenHakemuksenSisalto';
import { Henkilotiedot } from '@/src/app/hakemus/[oid]/perustiedot/components/Henkilotiedot';
import { LopullisenHakemuksenSisalto } from '@/src/app/hakemus/[oid]/perustiedot/components/LopullisenHakemuksenSisalto';
import { FullSpinner } from '@/src/components/FullSpinner';
import { Muistio } from '@/src/components/Muistio';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import {
  asiointiKieli,
  paatosJaAsiointikieli,
  paatosKieli,
} from '@/src/constants/hakemuspalveluSisalto';
import { useHakemus } from '@/src/context/HakemusContext';
import useToaster from '@/src/hooks/useToaster';
import { findSisaltoQuestionAndAnswer } from '@/src/lib/hakemuspalveluUtils';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { TranslatedName } from '@/src/lib/localization/localizationTypes';
import { HakemusKoskee } from '@/src/lib/types/hakemus';
import { handleFetchError } from '@/src/lib/utils';

export default function PerustietoPage() {
  const theme = useTheme();
  const { t } = useTranslations();
  const { addToast } = useToaster();
  const {
    isLoading,
    isSaving,
    hakemusState: { editedData: hakemus, hasChanges, save, updateLocal },
    error,
  } = useHakemus();

  useUnsavedChanges(hasChanges);

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuksenLataus', t);
  }, [error, addToast, t]);

  if (error) {
    return <></>;
  }

  if (isLoading || !hakemus) return <FullSpinner></FullSpinner>;

  const [, paatosKieliVal] = findSisaltoQuestionAndAnswer(
    hakemus.sisalto,
    [paatosJaAsiointikieli, paatosKieli],
    hakemus.lomakkeenKieli as keyof TranslatedName,
  );

  const [, asiointiKieliVal] = findSisaltoQuestionAndAnswer(
    hakemus.sisalto,
    [paatosJaAsiointikieli, asiointiKieli],
    hakemus.lomakkeenKieli as keyof TranslatedName,
  );

  console.log('Hakemus: ', hakemus);

  return (
    <Stack gap={theme.spacing(2)} sx={{ marginRight: theme.spacing(3) }}>
      <OphTypography variant={'h2'}>
        {t('hakemus.perustiedot.otsikko')}
      </OphTypography>
      {hakemus.hakemusKoskee === HakemusKoskee.LOPULLINEN_PAATOS ? (
        <LopullisenHakemuksenSisalto
          hakemus={hakemus}
          t={t}
          theme={theme}
          updateHakemus={updateLocal}
        />
      ) : (
        <EhdollisenHakemuksenSisalto hakemus={hakemus} t={t} />
      )}
      <Muistio
        label={t('hakemus.perustiedot.esittelijanHuomioita')}
        sisalto={hakemus.esittelijanHuomioita}
        updateMuistio={(value) => {
          updateLocal({ esittelijanHuomioita: value });
        }}
      />
      <Stack gap={theme.spacing(3)} width={'60%'}>
        <Henkilotiedot
          hakija={hakemus.hakija}
          paatosKieli={paatosKieliVal ?? ''}
          asiointiKieli={asiointiKieliVal ?? ''}
        />
      </Stack>
      <SaveRibbon
        onSave={save}
        isSaving={isSaving ?? false}
        hasChanges={hasChanges}
        lastSaved={hakemus.muokattu}
        modifierFirstName={hakemus.muokkaajaKutsumanimi}
        modifierLastName={hakemus.muokkaajaSukunimi}
      />
    </Stack>
  );
}
