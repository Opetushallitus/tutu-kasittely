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

  await page.route(`**/muistio/**`, async (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock_uuid_1',
          hakemus_id: 'mock_uuid_2',
          sisalto: 'Muistion alkuperäinen sisältö',
          luotu: '2025-08-21T12:52:00',
          luoja: 'Hakemuspalvelu',
          muokattu: undefined,
          muokkaaja: undefined,
          sisainenHuomio: true,
          hakemuksenOsa: 'asiakirjat',
        }),
      });
    }
  });

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );
  const muistio = page.getByTestId('muistio-asiakirjat-sisainen');

  await expect(muistio).toBeVisible();
  await expect(muistio).toContainText('Muistion alkuperäinen sisältö');

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes(`/muistio/`) && req.method() === 'PUT',
    ),
    muistio.fill('Parempaa sisältöä!'),
  ]);

  expect(request.postDataJSON().sisalto).toEqual('Parempaa sisältöä!');
});
