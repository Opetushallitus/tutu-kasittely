import { expect, test } from '@playwright/test';
import {
  mockBasicForHakemus,
  mockHakemus,
  mockLiitteet,
  mockUser,
} from '@/playwright/mocks';

test.beforeEach(mockBasicForHakemus);

test('Asiakirjan sisäisen muistion esittäminen ja tallennus', async ({
  page,
}) => {
  await mockUser(page);
  await mockHakemus(page);
  await mockLiitteet(page);

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );
  const muistio = page.getByTestId('muistio-asiakirjat-sisainen');

  await expect(muistio).toBeVisible();
  await expect(muistio).toContainText('Muistion alkuperäinen sisältö');

  await muistio.fill('Parempaa sisältöä!');

  const saveButton = page.getByTestId('save-ribbon-button');
  await expect(saveButton).toBeVisible();

  const [req] = await Promise.all([
    page.waitForRequest(
      (r) =>
        r.url().includes('/tutu-backend/api/hakemus') && r.method() === 'PUT',
    ),
    saveButton.click(),
  ]);

  expect(req.postDataJSON().asiakirja.esittelijanHuomioita).toEqual(
    'Parempaa sisältöä!',
  );
});
