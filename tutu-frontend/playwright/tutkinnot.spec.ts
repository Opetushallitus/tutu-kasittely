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

  await page.route(`**/muistio/**`, async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock_uuid_1',
          hakemus_id: 'mock_uuid_2',
          sisalto: 'HUOMIO!',
          luotu: '2025-08-21T12:52:00',
          luoja: 'Hakemuspalvelu',
          muokattu: undefined,
          muokkaaja: undefined,
          sisainenHuomio: false,
          hakemuksenOsa: 'tutkinnot_muu_tutkinto_huomio',
        }),
      });
    }
  });

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/tutkinnot',
  );

  // Tutkinto 1
  await expect(page.getByTestId('tutkinto-otsikko-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-otsikko-1')).toHaveText('Tutkinto 1');

  await expect(page.getByTestId('tutkinto-todistusotsikko-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-todistusotsikko-1')).toHaveText(
    'Tutkintotodistus',
  );

  await expect(page.getByTestId('tutkinto-tutkintonimi-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-tutkintonimi-1')).toHaveValue(
    'Päälikkö',
  );

  await expect(page.getByTestId('tutkinto-paaaine-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-paaaine-1')).toHaveText('');

  await expect(page.getByTestId('tutkinto-oppilaitos-1')).toBeVisible();
  await expect(page.getByTestId('tutkinto-oppilaitos-1')).toHaveValue(
    'Butan Amattikoulu',
  );

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
  await expect(page.getByTestId('tutkinto-koulutusala-1')).toHaveText(
    'Valitse...',
  );

  // Tutkinto 2
  await expect(page.getByTestId('tutkinto-otsikko-2')).toBeVisible();
  await expect(page.getByTestId('tutkinto-otsikko-2')).toHaveText('Tutkinto 2');

  await expect(page.getByTestId('tutkinto-todistusotsikko-2')).toBeVisible();
  await expect(page.getByTestId('tutkinto-todistusotsikko-2')).toHaveText(
    'Muu todistus',
  );

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
  await expect(page.getByTestId('tutkinto-koulutusala-2')).toHaveText(
    'Valitse...',
  );

  // Muu tutkinto
  await expect(page.getByTestId('tutkinto-otsikko-MUU')).toBeVisible();
  await expect(page.getByTestId('tutkinto-otsikko-MUU')).toHaveText(
    'Muut tutkinnot ja opinnot',
  );
  await expect(page.getByTestId('tutkinto-tieto-MUU')).toBeVisible();
  await expect(page.getByTestId('tutkinto-tieto-MUU')).toHaveText(
    'En olekaan suorittanutkoulutusta',
  );
  await expect(
    page.getByTestId('muistio-tutkinnot_muu_tutkinto_huomio-muistio'),
  ).toBeVisible();
  await expect(
    page.getByTestId('muistio-tutkinnot_muu_tutkinto_huomio-muistio'),
  ).toHaveText('HUOMIO!');
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

  await paattymisvuosi1.fill('2015');

  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();

  const [req] = await Promise.all([
    page.waitForRequest(
      (r) =>
        r.url().includes('/hakemus/1.2.246.562.10.00000000001') &&
        r.method() === 'PUT',
    ),
    page.getByRole('button', { name: 'Tallenna' }).click(),
  ]);

  const payload = req.postDataJSON();

  const updatedItem = (payload.tutkinnot || []).find(
    (t: Tutkinto) => t.jarjestys === '1',
  );

  expect(updatedItem.paattymisVuosi).toEqual(2015);
});

test('Tutkinnon poisto avaa modaalin ja lähettää oikean datan backendille', async ({
  page,
}) => {
  mockUser(page);
  mockHakemus(page);
  mockKoodistot(page);

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/tutkinnot',
  );

  const poistaTutkintoButton = page.getByTestId('poista-tutkinto-button-2');
  await poistaTutkintoButton.click();

  await expect(page.getByTestId('modal-component')).toBeVisible();

  await page.getByTestId('modal-confirm-button').click();

  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();

  const [req] = await Promise.all([
    page.waitForRequest(
      (r) =>
        r.url().includes('/hakemus/1.2.246.562.10.00000000001') &&
        r.method() === 'PUT',
    ),
    page.getByRole('button', { name: 'Tallenna' }).click(),
  ]);

  const payload = req.postDataJSON();

  const deletedItem = (payload.tutkinnot || []).find(
    (t: Tutkinto) => t.jarjestys === '2',
  );
  expect(payload.tutkinnot?.length).toEqual(2);
  expect(deletedItem).toEqual(undefined);
});

test('Tutkinnon muistion esittäminen ja tallennus', async ({ page }) => {
  mockUser(page);
  mockHakemus(page);
  mockKoodistot(page);

  await page.route(`**/muistio/**`, async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock_uuid_1',
          hakemus_id: 'mock_uuid_2',
          sisalto: 'HUOMIO!',
          luotu: '2025-08-21T12:52:00',
          luoja: 'Hakemuspalvelu',
          muokattu: undefined,
          muokkaaja: undefined,
          sisainenHuomio: false,
          hakemuksenOsa: 'tutkinnot_muu_tutkinto_huomio',
        }),
      });
    }
  });

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/tutkinnot',
  );

  const muistio = page.getByTestId(
    'muistio-tutkinnot_muu_tutkinto_huomio-muistio',
  );

  await expect(muistio).toBeVisible();
  await expect(muistio).toContainText('HUOMIO!');

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes(`/muistio/`) && req.method() === 'PUT',
    ),
    muistio.fill('EIKU!'),
  ]);

  expect(request.postDataJSON().sisalto).toEqual('EIKU!');
});

test('Hakijan ilmoittama tieto popover toimii', async ({ page }) => {
  mockUser(page);
  mockHakemus(page);
  mockKoodistot(page);

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/tutkinnot',
  );

  // Testaa nimi popover - data tulee sisalto-rakenteesta
  const nimiLink = page.getByTestId('tutkinto-nimi-hakijan-ilmoittama-link-1');
  await expect(nimiLink).toBeVisible();
  await nimiLink.click();
  await expect(page.locator('.MuiPopover-paper')).toBeVisible();
  await expect(page.locator('.MuiPopover-paper')).toContainText('Tut1');
  await page.locator('.MuiPopover-paper').getByRole('button').click();
  await expect(page.locator('.MuiPopover-paper')).not.toBeVisible();

  // Testaa oppilaitos popover
  const oppilaitosLink = page.getByTestId(
    'tutkinto-oppilaitos-hakijan-ilmoittama-link-1',
  );
  await expect(oppilaitosLink).toBeVisible();
  await oppilaitosLink.click();
  await expect(page.locator('.MuiPopover-paper')).toBeVisible();
  await expect(page.locator('.MuiPopover-paper')).toContainText('Tut 1');
  await page.locator('.MuiPopover-paper').getByRole('button').click();
  await expect(page.locator('.MuiPopover-paper')).not.toBeVisible();

  // Testaa maa popover - näyttää maan nimen sisällöstä
  const maaLink = page.getByTestId('tutkinto-maa-hakijan-ilmoittama-link-1');
  await expect(maaLink).toBeVisible();
  await maaLink.click();
  await expect(page.locator('.MuiPopover-paper')).toBeVisible();
  await expect(page.locator('.MuiPopover-paper')).toContainText('Barbados');
  await page.locator('.MuiPopover-paper').getByRole('button').click();
  await expect(page.locator('.MuiPopover-paper')).not.toBeVisible();
});
