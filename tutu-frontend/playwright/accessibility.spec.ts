import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';

import { getPerustelu } from '@/playwright/fixtures/perustelu1';
import { mockAll } from '@/playwright/mocks';

const expectPageAccessibilityOk = async (page: Page) => {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
};

test.beforeEach(mockAll);

test('Saavutettavuus listanäkymä ok', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Tutkintojen tunnustaminen');
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus perustiedot ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/perustiedot');
  await expect(page.locator('h2')).toHaveText('Hakemuksen ja hakijan tiedot');
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus asiakirjat ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/asiakirjat');
  await expect(page.locator('h2')).toHaveText('Asiakirjat');
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus tutkinnot ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/tutkinnot');
  await expect(page.locator('h2')).toHaveText('Tutkinnot');
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus perustelut yleiset ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/perustelu/yleiset/perustelut');
  await expect(page.locator('h2')).toHaveText('Yleiset perustelut');
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus perustelut yleiset lausuntotiedot ok', async ({
  page,
}) => {
  test.skip();
  await page.route(`**/tutu-backend/api/perustelu/**`, async (route) => {
    const perustelu = getPerustelu();
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...perustelu,
        }),
      });
    }
  });
  await page.goto('/tutu-frontend/hakemus/oid/perustelu/yleiset/lausunto');
  await expect(page.locator('h2')).toHaveText('Lausuntopyynnöt');
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus perustelut uoro ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/perustelu/uoro');
  await expect(page.locator('h2')).toHaveText(
    'Tiettyä kelpoisuutta koskevan UO/RO -päätöksen perustelut',
  );
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus perustelut ap ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/perustelu/ap');
  await expect(page.locator('h2')).toHaveText('AP-päätöksen perustelut');
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus päätös ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/paatostiedot');
  await expect(page.locator('h1')).toHaveText('Hakemus');
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus valitustiedot ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/valitustiedot');
  await expect(page.locator('h1')).toHaveText('Hakemus');
  await expectPageAccessibilityOk(page);
});
