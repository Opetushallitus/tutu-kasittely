import { expect, test } from '@playwright/test';
import { mockUser, mockBasicForHakemus, mockHakemus } from '@/playwright/mocks';

test.beforeEach(mockBasicForHakemus);

test('Välilehden valinta toimii oikein, kun siirrytään suoraan eri hakemussivuille', async ({
  page,
}) => {
  mockUser(page);
  mockHakemus(page);

  const hakemusOid = '1.2.246.562.10.00000000001';
  const baseUrl = `/tutu-frontend/hakemus/${hakemusOid}`;

  await page.goto(`${baseUrl}/perustiedot`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Hakijan ja hakemuksen tiedot');

  await page.goto(`${baseUrl}/asiakirjat`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Asiakirjat');

  await page.goto(`${baseUrl}/tutkinnot`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Tutkinnot');

  await page.goto(`${baseUrl}/paatostiedot`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Päätöstiedot');

  await page.goto(`${baseUrl}/valitustiedot`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Valitustiedot');
});

test('Välilehden valinta toimii oikein sivun päivityksen jälkeen.', async ({
  page,
}) => {
  mockUser(page);
  mockHakemus(page);

  const hakemusOid = '1.2.246.562.10.00000000001';
  const baseUrl = `/tutu-frontend/hakemus/${hakemusOid}`;

  await page.goto(`${baseUrl}/tutkinnot`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Tutkinnot');

  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });

  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Tutkinnot');

  await page.goto(`${baseUrl}/asiakirjat`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Asiakirjat');

  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });

  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Asiakirjat');
});

test('Perustelu-alavälilehdet toimivat oikein sekä suoraan navigoitaessa että sivun päivityksen jälkeen', async ({
  page,
}) => {
  mockUser(page);
  mockHakemus(page);

  const hakemusOid = '1.2.246.562.10.00000000001';
  const baseUrl = `/tutu-frontend/hakemus/${hakemusOid}`;

  await page.goto(`${baseUrl}/perustelu/yleiset`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Yleiset perustelut / Lausuntotiedot');

  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Yleiset perustelut / Lausuntotiedot');

  await page.goto(`${baseUrl}/perustelu/uoro`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Tiettyä kelpoisuutta koskevan UO/RO -päätöksen perustelut');

  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Tiettyä kelpoisuutta koskevan UO/RO -päätöksen perustelut');

  await page.goto(`${baseUrl}/perustelu/ap`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('AP -päätöksen perustelut');

  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('AP -päätöksen perustelut');
});

test('Välilehden valinta toimii, kun siirrytään linkkien kautta ja sen jälkeen päivitetään sivu', async ({
  page,
}) => {
  mockUser(page);
  mockHakemus(page);

  const hakemusOid = '1.2.246.562.10.00000000001';

  await page.goto(`/tutu-frontend/hakemus/${hakemusOid}/perustiedot`);
  await page.waitForLoadState('networkidle');
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Hakijan ja hakemuksen tiedot');

  await page.getByRole('tab', { name: 'Tutkinnot' }).waitFor();
  await page.getByRole('tab', { name: 'Tutkinnot' }).click();
  await page.waitForLoadState('networkidle');
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Tutkinnot');

  await page.reload();
  await page.waitForLoadState('networkidle');

  // Wait for the component to fully render after reload
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await page.waitForTimeout(200); // Give component time to update state

  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Tutkinnot');

  // Wait for the tab to be stable before clicking
  await page
    .getByRole('tab', { name: 'Asiakirjat' })
    .waitFor({ state: 'visible' });
  await page.waitForTimeout(100); // Small delay to ensure component is fully rendered
  await page.getByRole('tab', { name: 'Asiakirjat' }).click();
  await page.waitForLoadState('networkidle');
  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Asiakirjat');

  await page.reload();
  await page.waitForLoadState('networkidle');

  // Wait for the component to fully render after reload
  await page.waitForSelector('[role="tab"][aria-selected="true"]', {
    state: 'visible',
  });
  await page.waitForTimeout(200); // Give component time to update state

  await expect(
    page.locator('[role="tab"][aria-selected="true"]'),
  ).toContainText('Asiakirjat');
});
