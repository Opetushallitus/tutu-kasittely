import { expect, test } from '@playwright/test';
import { mockAll } from '@/playwright/mocks';
import { getPaatosWithPaatosTiedot } from '@/playwright/fixtures/paatos1';

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot',
  );
  const paatosData = getPaatosWithPaatosTiedot();
  await page.route(`**/paatos/1.2.246.562.10.00000000001`, async (route) => {
    if (route.request().method() === 'POST') {
      const requestBody = route.request().postDataJSON();
      const body = {
        ...requestBody,
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...paatosData,
        }),
      });
    }
  });
  await page.route(
    `**/paatos/1.2.246.562.10.00000000001/paatosteksti`,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: JSON.stringify('<h4>Päätöstekstin esikatselu</h4>'),
      });
    },
  );
});

test('Päätöstekstin esikatselu avautuu oikein, näyttää tekstin ja sulkeutuu sulje-painiketta painettaessa', async ({
  page,
}) => {
  const openPreviewButton = page.getByTestId('paatos-avaa-esikatselu-button');
  await expect(openPreviewButton).toBeVisible();
  await openPreviewButton.click();

  const previewComponent = page.getByTestId('preview-content');
  await expect(previewComponent).toBeVisible();

  await expect(previewComponent.locator('h4')).toContainText(
    'Päätöstekstin esikatselu',
  );
  await expect(page.getByTestId('close-preview-button')).toBeVisible();
  await page.getByTestId('close-preview-button').click();
  await expect(previewComponent).not.toBeVisible();
  await expect(page.getByTestId('hakemus-sidebar')).toBeVisible();
});
