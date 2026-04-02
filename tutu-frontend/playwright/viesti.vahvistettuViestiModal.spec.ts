import { expect, Page, Route, test } from '@playwright/test';

import {
  mockEsittelijat,
  mockHakemus,
  mockInit,
  mockUser,
  mockViestiLista,
  mockViestiTyoversio,
  uusiViesti,
  VIESTILISTAN_ENSIMMAINEN_AIKALEIMA,
  viestiTyoversio,
} from '@/playwright/mocks';
import { Viesti } from '@/src/lib/types/viesti';

const defaultViesti: Viesti = {
  id: '3f50c9c2-7d2e-4c8c-9c8e-6c7b3b2c8f5a',
  kieli: 'fi',
  tyyppi: 'taydennyspyynto',
  otsikko: 'otsikko',
  viesti: '<p>viestin sisältö</p>',
  vahvistettu: '2024-06-01T12:00:00.000Z',
  vahvistaja: 'Rauno Kinnula',
};

const defaultViestiResponse = {
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(defaultViesti),
};

test.beforeEach(async ({ page }) => {
  await mockInit(page);
  await mockEsittelijat(page);
  await mockUser(page);
  await mockHakemus(page);
  await mockViestiTyoversio(page, uusiViesti);
  await mockViestiLista(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.11.00000000001/editori/viesti',
  );
});

const mockVahvistettuViesti = (page: Page) => {
  return page.route('**/tutu-backend/api/viesti/*', async (route: Route) => {
    await route.fulfill(defaultViestiResponse);
  });
};

const openModal = async (page: Page) => {
  mockVahvistettuViesti(page);
  await page
    .getByTestId('vahvistettu-viesti-table')
    .locator('tbody tr', { hasText: VIESTILISTAN_ENSIMMAINEN_AIKALEIMA })
    .locator('button')
    .click();
};

test('Vahvistettu viesti näkyy oikein modaalissa', async ({ page }) => {
  openModal(page);
  const modal = page.getByTestId('vahvistettu-viesti-modal');
  await expect(modal).toBeVisible();
  await expect(modal.getByTestId('viesti-otsikko')).toHaveText('otsikko');
  await expect(modal.locator('#viestiContent')).toHaveText('viestin sisältö');
});

test('Modaalin sulkeminen toimii ok', async ({ page }) => {
  openModal(page);
  const modal = page.getByTestId('vahvistettu-viesti-modal');
  await expect(modal).toBeVisible();
  await modal.getByTestId(`viesti-modal-sulje-button`).click();
  await expect(modal).toBeHidden();
});

test('Viestin poistosta lähetetäään DELETE -kutsu backendille ja modaali suljetaan', async ({
  page,
}) => {
  openModal(page);
  const modal = page.getByTestId('vahvistettu-viesti-modal');
  await expect(modal).toBeVisible();
  await modal.getByTestId(`viesti-modal-poista-button`).click();
  await Promise.all([
    page.waitForRequest((req) => req.method() === 'DELETE'),
    page.getByTestId('modal-confirm-button').click(),
  ]);
  await expect(modal).toBeHidden();
  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'success',
  );
});

test('Kopioitaessa editoriin, sisältö lisätään editorissa näytettävän tekstin loppuun', async ({
  page,
}) => {
  await mockViestiTyoversio(page, viestiTyoversio);
  openModal(page);
  const modal = page.getByTestId('vahvistettu-viesti-modal');
  await expect(modal).toBeVisible();
  await modal.getByTestId(`viesti-modal-kopioi-editoriin-button`).click();
  await expect(page.getByTestId('editor-content-editable')).toHaveText(
    'Tämä on työversioviestin sisältö',
  );
  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'success',
  );
});

test('Viestin latauksen epäonnistuessa näytetään virheteksti ja modaali suljetaan', async ({
  page,
}) => {
  await page.route('**/tutu-backend/api/viesti/*', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'latausvirhe',
      }),
    });
  });
  await page
    .getByTestId('vahvistettu-viesti-table')
    .locator('tbody tr', { hasText: VIESTILISTAN_ENSIMMAINEN_AIKALEIMA })
    .locator('button')
    .click();

  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
  await expect(page.getByTestId('vahvistettu-viesti-modal')).toBeHidden();
});

test('Viestin poiston epäonnistuessa näytetään virheteksti ja modaali suljetaan', async ({
  page,
}) => {
  openModal(page);
  await page.route('**/tutu-backend/api/viesti/*', async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'poistovirhe',
        }),
      });
    } else {
      await route.fulfill(defaultViestiResponse);
    }
  });
  const modal = page.getByTestId('vahvistettu-viesti-modal');
  await expect(modal).toBeVisible();
  await modal.getByTestId(`viesti-modal-poista-button`).click();
  await page.getByTestId('modal-confirm-button').click();

  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
  await expect(modal).toBeHidden();
});
