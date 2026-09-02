import { Stack } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { ValitusHOComponent } from '@/src/app/hakemus/valitustiedot/components/ValitusHOComponent';
import { ValitusKHOComponent } from '@/src/app/hakemus/valitustiedot/components/ValitusKHOComponent';
import { ValitusOPHComponent } from '@/src/app/hakemus/valitustiedot/components/ValitusOPHComponent';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { UnsavedChangesGuard } from '@/src/components/UnsavedChangesGuard';
import useToaster from '@/src/hooks/useToaster';
import { useValitustiedot } from '@/src/hooks/useValitustiedot';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ValitusOPH, ValitusKHO } from '@/src/lib/types/valitustiedot';
import { handleFetchError } from '@/src/lib/utils';

export default function ValitustietoPage() {
  const { t } = useTranslations();
  const { addToast } = useToaster();
  const { oid } = useParams<{ oid: string }>();

  const {
    valitustiedot,
    queryError,
    queryLoading,
    paivitaValitustiedot,
    tallennaValitustiedot,
    hasChanges,
    discard,
    isUpdateOngoing,
    updateError,
  } = useValitustiedot(oid);

  useEffect(() => {
    handleFetchError(addToast, queryError, 'virhe.valitustiedotLataus', t);
    handleFetchError(addToast, updateError, 'virhe.valitustiedotTallennus', t);
  }, [queryError, updateError, addToast, t]);

  if (isUpdateOngoing || queryLoading) {
    return <FullSpinner />;
  }

  return (
    <>
      <UnsavedChangesGuard enabled={hasChanges} onDiscard={discard} />
      <Stack gap={3} sx={{ flexGrow: 1, marginRight: 3 }}>
        <OphTypography variant={'h2'} data-testid="valitustiedot-otsikko">
          {t('hakemus.valitustiedot.otsikko')}
        </OphTypography>
        <ValitusOPHComponent
          valitusOPH={valitustiedot?.valitusOPH}
          updateValitusOPH={(newValitusOPH: Partial<ValitusOPH>) => {
            paivitaValitustiedot({
              valitusOPH: {
                ...valitustiedot?.valitusOPH,
                ...newValitusOPH,
              },
            });
          }}
        />
        <ValitusHOComponent />
        <ValitusKHOComponent
          valitusKHO={valitustiedot?.valitusKHO}
          updateValitusKHO={(newValitusKHO: Partial<ValitusKHO>) => {
            paivitaValitustiedot({
              valitusKHO: {
                ...valitustiedot?.valitusKHO,
                ...newValitusKHO,
              },
            });
          }}
        />
      </Stack>
      <SaveRibbon
        onSave={tallennaValitustiedot}
        isSaving={isUpdateOngoing}
        hasChanges={hasChanges}
        lastSaved={valitustiedot?.muokattu ?? valitustiedot?.luotu}
        modifier={valitustiedot?.muokkaaja ?? valitustiedot?.luoja}
      />
    </>
  );
}
