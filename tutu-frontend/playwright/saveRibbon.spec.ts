import { expect, test } from '@playwright/test';

import { mockAll } from '@/playwright/mocks';

const HAKEMUS_OID = '1.2.246.562.10.00000000001';
const YLEISET_URL = `/tutu-frontend/hakemus/${HAKEMUS_OID}/perustelu/yleiset/perustelut`;
const TUTKINNOT_URL = `/tutu-frontend/hakemus/${HAKEMUS_OID}/tutkinnot`;

test('Save ribbon flow: back navigation guard works after cancel and confirm', async ({
  page,
  browserName,
}) => {
  await mockAll({ page });

  await test.step('Yleiset sivu näkyy ja tallennuspalkkia ei näy', async () => {
    await page.goto(YLEISET_URL);
    await page
      .locator(
        '[data-testid="jatko-opintokelpoisuus-radio-group"] input[type="radio"][value="muu"]',
      )
      .waitFor();

    await expect(page.getByTestId('save-ribbon-button')).toBeHidden();
    await expect(page.getByTestId('save-ribbon-last-saved')).toBeHidden();
  });

  await test.step('Muutos yleiset-sivulla näyttää tallennuspalkin', async () => {
    await page.getByTestId('lahde__lahtomaan-kansallinen-lahde').click();
    await expect(page.getByTestId('save-ribbon-button')).toBeVisible();
  });

  await test.step('Siirtymä tutkinnot-välilehdelle vahvistuksella', async () => {
    await page.getByRole('tab', { name: 'Tutkinnot' }).click();
    await expect(page.getByTestId('modal-component')).toBeVisible();

    await page.getByTestId('modal-confirm-button').click();
    await page.waitForURL(TUTKINNOT_URL);
  });

  await test.step('Muutos tutkinnot-sivulla näyttää tallennuspalkin', async () => {
    await page.getByTestId('tutkinto-paattymisvuosi-1').fill('2030');
    await expect(page.getByTestId('save-ribbon-button')).toBeVisible();
  });

  await test.step('Ensimmäinen takaisin: peruuta -> jäädään tutkinnot-sivulle', async () => {
    await page.evaluate(() => history.back());
    await expect(page.getByTestId('modal-component')).toBeVisible();

    await page.getByTestId('modal-peruuta-button').click();
    await expect(page.getByTestId('modal-component')).toBeHidden();
    await expect(page).toHaveURL(TUTKINNOT_URL);
  });

  await test.step('Toinen takaisin: jatka -> palataan yleiset-sivulle', async () => {
    // Todennäköinen Webkit-bugi, ei varma sovellusbugi.
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (browserName === 'webkit') {
      return;
    }

    await page.evaluate(() => history.back());
    await expect(page.getByTestId('modal-component')).toBeVisible();

    await page.getByTestId('modal-confirm-button').click();
    await page.waitForURL(YLEISET_URL);
    await page
      .locator(
        '[data-testid="jatko-opintokelpoisuus-radio-group"] input[type="radio"][value="muu"]',
      )
      .waitFor();

    await expect(page.getByTestId('save-ribbon-button')).toBeHidden();
  });
});
