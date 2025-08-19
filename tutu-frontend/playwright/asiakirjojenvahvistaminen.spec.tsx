import { expect, Page, Route, test } from '@playwright/test';
import {
  mockBasicForHakemus,
  mockLiitteet,
  mockUser,
} from '@/playwright/mocks';
import { getHakemus } from '@/playwright/fixtures/hakemus1';

test.beforeEach(mockBasicForHakemus);

export const mockHakemus = (page: Page) => {
  return page.route('**/tutu-backend/api/hakemus/*', async (route: Route) => {
    const hakemus = getHakemus();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(hakemus),
    });
  });
};

test('Todistusten aitoustarkistuksen lupa-vastaus näkyy sivulla', async ({
  page,
}) => {
  await mockUser(page);
  await mockHakemus(page);
  await mockLiitteet(page);

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );
  await expect(
    page.getByTestId('todistus-tarkistus-lupa-label'),
  ).not.toBeEmpty();
  await expect(page.getByTestId('todistus-tarkistus-lupa-value')).toHaveText(
    /kyllä/i,
  );
});

test('Suostumus asiakirjojen vahvistamiselle -valinta näkyy sivulla', async ({
  page,
}) => {
  await mockUser(page);
  await mockHakemus(page);
  await mockLiitteet(page);

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );
  await expect(
    page.getByTestId('suostumus-vahvistamiselle-saatu-checkbox'),
  ).toBeVisible();
});
