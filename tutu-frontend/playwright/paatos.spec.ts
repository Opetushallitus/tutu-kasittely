import { test, expect, Page } from '@playwright/test';
import { mockAll } from '@/playwright/mocks';
import { getPaatos } from '@/playwright/fixtures/paatos1';

test.beforeEach(mockAll);

const matchUpdate = (url: string, method: string) =>
  url.includes('/paatos/1.2.246.562.10.00000000001') && method === 'POST';

const mockPaatos = (page: Page) => {
  return page.route(`**/paatos/1.2.246.562.10.00000000001`, async (route) => {
    const paatos = getPaatos();
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...paatos,
        }),
      });
    }
  });
};

test('Päätöskentät näkyvät oikein ja kenttien muutos lähettää POST-kutsun backendille', async ({
  page,
}) => {
  mockPaatos(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot',
  );
  const seutCheckbox = page.getByTestId('paatos-seut');
  await expect(seutCheckbox).not.toBeChecked();
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  await expect(ratkaisutyyppiInput).toHaveText('Päätös');

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    seutCheckbox.click(),
  ]).then((req) => expect(req[0].postDataJSON().seutArviointi).toEqual(true));

  // TODO: Fixaa!!!!!!
  /*
  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    ratkaisutyyppiInput.first().click(),
    page
      .locator('ul[role="listbox"] li[role="option"]')
      .locator('text=Oikaisu')
      .click(),
  ]).then((req) =>
    expect(req[0].postDataJSON().ratkaisutyyppi).toEqual('Siirto'),
  );

   */
});
