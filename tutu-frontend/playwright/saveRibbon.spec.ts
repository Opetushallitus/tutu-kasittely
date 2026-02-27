import { expect, test, type Page } from '@playwright/test';

import { mockAll } from '@/playwright/mocks';

const HAKEMUS_OID = '1.2.246.562.10.00000000001';
const YLEISET_URL = `/tutu-frontend/hakemus/${HAKEMUS_OID}/perustelu/yleiset/perustelut`;
const TUTKINNOT_URL = `/tutu-frontend/hakemus/${HAKEMUS_OID}/tutkinnot`;

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await mockAll({ page });
});

test('Tallennuspalkkia ei näytetä ennen muutoksia', async () => {
  await page.goto(YLEISET_URL);

  // Tarkista että sivu näkyy
  await page
    .locator(
      '[data-testid="jatko-opintokelpoisuus-radio-group"] input[type="radio"][value="muu"]',
    )
    .waitFor();

  await expect(page.getByTestId('save-ribbon-button')).toBeHidden();
  await expect(page.getByTestId('save-ribbon-last-saved')).toBeHidden();
});

test('Muutos yleiset-sivulla: tallennuspalkki ilmestyy', async () => {
  await page.getByTestId('lahde__lahtomaan-kansallinen-lahde').click();
  await expect(page.getByTestId('save-ribbon-button')).toBeVisible();
});

test('Navigointi välilehdelle tallentamattomilla muutoksilla: vahvistusdialogi -> hyväksy -> siirrytään tutkinnoille', async () => {
  await page.getByRole('tab', { name: 'Tutkinnot' }).click();
  await expect(page.getByTestId('unsaved-dialog')).toBeVisible();

  await page.getByTestId('unsaved-dialog-continue-button').click();
  await page.waitForURL(TUTKINNOT_URL);
});

test('Muutos tutkinnot-sivulla: tallennuspalkki ilmestyy', async () => {
  await page.getByTestId('tutkinto-paattymisvuosi-1').fill('2030');
  await expect(page.getByTestId('save-ribbon-button')).toBeVisible();
});

test('Takaisin-nappi tallentamattomilla muutoksilla: vahvistusdialogi -> peruuta -> jäädään sivulle', async ({
  browserName,
}) => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(
    browserName === 'webkit' || browserName === 'firefox',
    'Tarvitsee FF 147 ja webkit 26.2 versiot, voi myöhemmin päivittää playwrightin',
  );

  await page.evaluate(() => history.back());
  await expect(page.getByTestId('unsaved-dialog')).toBeVisible();

  await page.getByTestId('unsaved-dialog-cancel-button').click();
  await expect(page.getByTestId('unsaved-dialog')).toBeHidden();
  await expect(page).toHaveURL(TUTKINNOT_URL);
});

test('Takaisin-nappi uudelleen: vahvistusdialogi -> jatka -> palataan yleiset-sivulle ilman tallennuspalkkia', async ({
  browserName,
}) => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(
    browserName === 'webkit' || browserName === 'firefox',
    'Tarvitsee FF 147 ja webkit 26.2 versiot, voi myöhemmin päivittää playwrightin',
  );

  // Painetaan takaisin uudelleen → vahvistusdialogi aukeaa → jatketaan tallentamatta
  await page.evaluate(() => history.back());
  await expect(page.getByTestId('unsaved-dialog')).toBeVisible();
  await page.getByTestId('unsaved-dialog-continue-button').click();

  await page.waitForURL(YLEISET_URL);

  // Tarkista että sivu näkyy
  await page
    .locator(
      '[data-testid="jatko-opintokelpoisuus-radio-group"] input[type="radio"][value="muu"]',
    )
    .waitFor();

  await expect(page.getByTestId('save-ribbon-button')).toBeHidden();
});
