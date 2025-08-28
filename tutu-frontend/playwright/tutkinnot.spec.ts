import { expect, test } from '@playwright/test';
import {
  mockBasicForHakemus,
  mockHakemus,
  mockKoodistot,
  mockUser,
} from '@/playwright/mocks';
import { Tutkinto } from '@/src/lib/types/hakemus';

test.beforeEach(mockBasicForHakemus);

test('Yhteistutkinto-checkbox näkyy', async ({ page }) => {
  mockUser(page);
  mockHakemus(page);
  mockKoodistot(page);

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/tutkinnot',
  );
  await expect(page.getByTestId('yhteistutkinto-checkbox')).not.toBeChecked();
  await page.getByTestId('yhteistutkinto-checkbox').click();
  await expect(page.getByTestId('yhteistutkinto-checkbox')).toBeChecked();
});

test('Tutkinnot näkyvät oikein', async ({ page }) => {
  mockUser(page);
  mockHakemus(page);
  mockKoodistot(page);

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/tutkinnot',
  );

  // Tutkinto 1
  await expect(page.getByTestId('tutkinto-otsikko-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-otsikko-1')).toHaveText('Tutkinto 1');

  await expect(page.getByTestId('tutkinto-todistusotsikko-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-todistusotsikko-1')).toHaveText('');

  await expect(page.getByTestId('tutkinto-tutkintonimi-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-tutkintonimi-1')).toHaveValue(
    'Päälikkö',
  );

  await expect(page.getByTestId('tutkinto-paaaine-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-paaaine-1')).toHaveText('');

  await expect(page.getByTestId('tutkinto-maa-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-maa-1')).toHaveText('Tadžikistan');

  await expect(page.getByTestId('tutkinto-aloitusvuosi-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-aloitusvuosi-1')).toHaveValue('1999');

  await expect(page.getByTestId('tutkinto-paattymisvuosi-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-paattymisvuosi-1')).toHaveValue(
    '2000',
  );

  await expect(page.getByTestId('tutkinto-todistuksenpvm-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-todistuksenpvm-1')).toHaveValue('');

  await expect(page.getByTestId('tutkinto-koulutusala-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-koulutusala-1')).toHaveText('');

  // Tutkinto 2
  await expect(page.getByTestId('tutkinto-otsikko-2')).toBeVisible();
  await expect(page.getByTestId('tutkinto-otsikko-2')).toHaveText('Tutkinto 2');

  await expect(page.getByTestId('tutkinto-todistusotsikko-2')).toBeVisible();
  await expect(page.getByTestId('tutkinto-todistusotsikko-2')).toHaveText('');

  await expect(page.getByTestId('tutkinto-tutkintonimi-2')).toBeVisible();
  await expect(page.getByTestId('tutkinto-tutkintonimi-2')).toHaveValue(
    'Apu poika',
  );

  await expect(page.getByTestId('tutkinto-paaaine-2')).toBeVisible();
  await expect(page.getByTestId('tutkinto-paaaine-2')).toHaveText('');

  await expect(page.getByTestId('tutkinto-maa-2')).toBeVisible();
  await expect(page.getByTestId('tutkinto-maa-2')).toHaveText('Tadžikistan');

  await expect(page.getByTestId('tutkinto-aloitusvuosi-2')).toBeVisible();
  await expect(page.getByTestId('tutkinto-aloitusvuosi-2')).toHaveValue('2010');

  await expect(page.getByTestId('tutkinto-paattymisvuosi-2')).toBeVisible();
  await expect(page.getByTestId('tutkinto-paattymisvuosi-2')).toHaveValue(
    '2011',
  );
  await expect(page.getByTestId('tutkinto-todistuksenpvm-2')).toBeVisible();
  await expect(page.getByTestId('tutkinto-todistuksenpvm-2')).toHaveValue('');

  await expect(page.getByTestId('tutkinto-koulutusala-2')).toBeVisible();
  await expect(page.getByTestId('tutkinto-koulutusala-2')).toHaveText('');

  // Muu tutkinto
  await expect(page.getByTestId('tutkinto-otsikko-MUU')).toBeVisible();
  await expect(page.getByTestId('tutkinto-otsikko-MUU')).toHaveText(
    'Muut tutkinnot ja opinnot',
  );
  await expect(page.getByTestId('tutkinto-tieto-MUU')).toBeVisible();
  await expect(page.getByTestId('tutkinto-tieto-MUU')).toHaveText(
    'En olekaan suorittanutkoulutusta',
  );
  await expect(page.getByTestId('tutkinto-huomio-MUU')).toBeVisible();
  await expect(page.getByTestId('tutkinto-huomio-MUU')).toHaveText(
    'TODO muu tutkintohuomio',
  );
});

test('Tutkintojen lisäys- ja poistopainikkeet näkyvät oikein', async ({
  page,
}) => {
  mockUser(page);
  mockHakemus(page);
  mockKoodistot(page);

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/tutkinnot',
  );
  await expect(page.getByTestId('lisaa-tutkinto-button')).toBeVisible();
  await expect(page.getByTestId('poista-tutkinto-button-1')).not.toBeVisible();
  await expect(page.getByTestId('poista-tutkinto-button-2')).toBeVisible();
});

test('Tutkinnon muokkaaminen lähettää oikean datan backendille', async ({
  page,
}) => {
  mockUser(page);
  mockHakemus(page);
  mockKoodistot(page);

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/tutkinnot',
  );

  const paattymisvuosi1 = page.getByTestId('tutkinto-paattymisvuosi-1');
  await expect(paattymisvuosi1).toBeEditable();

  const [req] = await Promise.all([
    page.waitForRequest(
      (r) =>
        r.url().includes('/hakemus/1.2.246.562.10.00000000001') &&
        r.method() === 'PATCH',
    ),
    (async () => {
      await paattymisvuosi1.fill('2015');
    })(),
  ]);

  const payload = req.postDataJSON();

  const updatedItem = (payload.tutkinnot || []).find(
    (t: Tutkinto) => t.jarjestys === '1',
  );

  expect(updatedItem.paattymisVuosi).toEqual(2015);
});
