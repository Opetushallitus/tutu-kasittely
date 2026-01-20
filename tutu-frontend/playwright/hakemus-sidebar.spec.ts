import { expect, test } from '@playwright/test';
import { mockAll } from '@/playwright/mocks';

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
