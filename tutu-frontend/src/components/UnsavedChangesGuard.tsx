import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

import {
  ConfirmationModal,
  useGlobalConfirmationModal,
} from '@/src/components/ConfirmationModal';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { registerAuthRedirectConfirmHandler } from '@/src/lib/navigation/authRedirect';

export type UnsavedChangesGuardProps = {
  enabled: boolean;
  onDiscard?: () => void;
};

/**
 * Estää navigoinnin pois sivulta, jos lomakkeella on tallentamattomia muutoksia,
 * ja näyttää vahvistusmodaalin.
 *
 * Modaali renderöidään DEKLARATIIVISESTI blockerin tilasta (`open=blocker.state
 * === 'blocked'`). Aiemmin tämä oli hook, joka avasi globaalin modaalin
 * imperatiivisesti efektissä — mutta proceed()/reset()-kutsun jälkeen tuli vielä
 * ylimääräinen 'blocked'-renderi, joka avasi juuri suljetun modaalin uudelleen
 * eikä sulkenut sitä enää. Välitilat erosivat selaimittain, joten mikään
 * efektipohjainen vartija ei ollut vakaa. Deklaratiivinen renderöinti sitoo
 * näkyvyyden suoraan ajantasaiseen tilaan, joten jumiutumista ei tapahdu.
 */
export function UnsavedChangesGuard({
  enabled,
  onDiscard,
}: UnsavedChangesGuardProps) {
  const { t } = useTranslations();
  const { showConfirmation } = useGlobalConfirmationModal();

  // Näytä ConfirmationModal, jos tallennus epäonnistuu ja käyttäjä ohjataan
  // kirjautumaan uudelleen (auth redirect).
  useEffect(() => {
    registerAuthRedirectConfirmHandler(async () => {
      if (!enabled) {
        return true;
      }

      return new Promise<boolean>((resolve) => {
        showConfirmation({
          header: t('yleiset.tallentamattomiaMuutoksia'),
          content: t('virhe.tallennus'),
          confirmButtonText: t('yleiset.jatkaTallentamatta'),
          cancelButtonText: t('yleiset.palaaTallentamaan'),
          confirmPrimary: false,
          handleConfirmAction: () => {
            onDiscard?.();
            resolve(true);
          },
          handleCloseAction: () => resolve(false),
        });
      });
    });

    return () => {
      registerAuthRedirectConfirmHandler(null);
    };
  }, [enabled, onDiscard, t, showConfirmation]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      enabled && currentLocation.pathname !== nextLocation.pathname,
  );

  return (
    <ConfirmationModal
      open={blocker.state === 'blocked'}
      header={t('yleiset.tallentamattomiaMuutoksia')}
      content={t('yleiset.lomakkeellaOnMuutoksia')}
      confirmButtonText={t('yleiset.jatkaTallentamatta')}
      cancelButtonText={t('yleiset.palaaTallentamaan')}
      confirmPrimary={false}
      handleConfirmAction={() => {
        onDiscard?.();
        if (blocker.state === 'blocked') {
          blocker.proceed();
        }
      }}
      handleCloseAction={() => {
        if (blocker.state === 'blocked') {
          blocker.reset();
        }
      }}
    />
  );
}
