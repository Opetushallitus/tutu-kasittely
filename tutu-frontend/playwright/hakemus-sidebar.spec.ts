import { expect, test } from '@playwright/test';

import { mockAll } from '@/playwright/mocks';
import { translate } from './helpers/translate';

test.beforeEach(mockAll);

test('Sivupalkki näkyvissä oletussivulla', async ({ page }) => {
  await page.goto(
    'tutu-frontend/hakemus/1.2.246.562.11.00000000001/perustiedot',
  );

  await expect(page.getByTestId('hakemus-sidebar')).toBeVisible();

  const ataruHakemuksenTila = page.getByTestId(
    'hakemus-sidebar-ataruhakemus-tila',
  );

  await expect(ataruHakemuksenTila).toHaveText('Käsittely maksamatta');

  const kasittelyVaihe = page.getByTestId('hakemus-sidebar-kasittelyvaihe');

  await expect(kasittelyVaihe).toHaveText('Hakemusta täydennetty 28.07.2025');
});

test('HakemusKoskee näyttää oikean labelin ja AP-hakemus-badgen', async ({
  page,
}) => {
  await page.goto(
    'tutu-frontend/hakemus/1.2.246.562.11.00000000004/perustiedot',
  );

  const kelpoisuusAmmattiin = await translate(
    page,
    'valinnat.hakemusKoskeeValinta.kelpoisuusAmmattiin',
  );

  const hakemusKoskee = page.getByTestId('hakemus-sidebar-hakemus-koskee');
  await expect(hakemusKoskee).toHaveText(kelpoisuusAmmattiin);

  const apHakemusText = await translate(page, 'hakemus.apHakemus');

  const apHakemusBadge = page.getByTestId('hakemus-sidebar-ap-hakemus-badge');

  await expect(apHakemusBadge).toBeVisible();
  await expect(apHakemusBadge).toHaveText(apHakemusText);
});

test('HakemusKoskee ei näytä AP-hakemus-badgea kun apHakemus on false', async ({
  page,
}) => {
  await page.goto(
    'tutu-frontend/hakemus/1.2.246.562.11.00000000001/perustiedot',
  );

  const kelpoisuusAmmattiin = await translate(
    page,
    'valinnat.hakemusKoskeeValinta.kelpoisuusAmmattiin',
  );

  const hakemusKoskee = page.getByTestId('hakemus-sidebar-hakemus-koskee');
  await expect(hakemusKoskee).toHaveText(kelpoisuusAmmattiin);

  const apHakemusBadge = page.getByTestId('hakemus-sidebar-ap-hakemus-badge');

  await expect(apHakemusBadge).not.toBeVisible();
});
