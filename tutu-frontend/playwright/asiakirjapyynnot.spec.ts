import { expect, Page, Route, test } from '@playwright/test';

import { getHakemus } from '@/playwright/fixtures/hakemus1';
import {
  mockBasicForHakemus,
  mockHakemus,
  mockLiitteet,
  mockUser,
} from '@/playwright/mocks';
import { HakemusKoskee } from '@/src/lib/types/hakemus.js';
import { translate } from './helpers/translate';

const mockHakemusWithType = (page: Page, hakemusKoskee?: HakemusKoskee) => {
  return page.route('**/tutu-backend/api/hakemus/*', async (route: Route) => {
    const hakemus = getHakemus(hakemusKoskee);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(hakemus),
    });
  });
};

test.describe('Asiakirjapyynnöt', () => {
  test.beforeEach(mockBasicForHakemus);
  test('Asiakirjapyyntöjen lisäys ja poisto', async ({ page }) => {
    let callCount = 0;

    await mockUser(page);
    await mockHakemus(page);
    await mockLiitteet(page);

    const hakemus = getHakemus();

    await page.route('**/tutu-backend/api/hakemus/*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(hakemus),
        });
        return;
      }

      if (route.request().method() === 'PUT') {
        callCount++;
        if (callCount == 1) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              ...hakemus,
              asiakirja: {
                ...hakemus.asiakirja,
                pyydettavatAsiakirjat: [
                  { id: 'test-id', asiakirjanTyyppi: 'nimenmuutos' },
                ],
              },
            }),
          });
        } else if (callCount == 2) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              ...hakemus,
              asiakirja: { ...hakemus.asiakirja, pyydettavatAsiakirjat: [] },
            }),
          });
        } else {
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });

    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
    );

    await expect(
      page.getByTestId('pyydettavat-asiakirjat-otsikko'),
    ).toBeVisible();

    await expect(page.getByTestId('pyyda-asiakirja-button')).toBeVisible();
    await page.getByTestId('pyyda-asiakirja-button').click();

    const pyydaSelect = page.getByTestId('pyyda-asiakirja-select').first();
    await expect(pyydaSelect).toBeVisible();

    const valitseText = await translate(page, 'yleiset.valitse');
    await expect(pyydaSelect).toHaveText(valitseText);
    await pyydaSelect.click();

    const menuItems = page.locator('[role="option"]');
    await menuItems.last().click();

    const nimenmuutosText = await translate(
      page,
      'hakemus.asiakirjat.asiakirjapyynnot.asiakirjat.nimenmuutos',
    );
    await expect(pyydaSelect).toHaveText(nimenmuutosText);

    const saveButton = page.getByTestId('save-ribbon-button');
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    await expect(saveButton).not.toBeVisible();

    await page.getByTestId('poista-asiakirja-button-0').click();

    await expect(saveButton).toBeVisible();

    await page.getByTestId('pyyda-asiakirja-button').click();
    await page.getByTestId('poista-asiakirja-button-undefined').click();

    await expect(page.getByTestId('pyyda-asiakirja-select')).not.toBeVisible();

    await expect(saveButton).toBeVisible();
    await saveButton.click();
  });

  test('Lopullisen päätöksen asiakirjapyyntöjen lisäys, disablointi ja keskimmäisen poisto', async ({
    page,
  }) => {
    await mockUser(page);
    await mockHakemusWithType(page, HakemusKoskee.LOPULLINEN_PAATOS);
    await mockLiitteet(page);

    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
    );

    const addButton = page.getByTestId('pyyda-asiakirja-button');

    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();

    let selects = page.getByTestId('pyyda-asiakirja-select');
    const valitseText = await translate(page, 'yleiset.valitse');
    await expect(selects.nth(0)).toHaveText(valitseText);
    await selects.nth(0).click();

    await page
      .getByRole('option', { name: 'Todistus sopeutumisajan suorittamisesta' })
      .click();

    // Toinen asiakirja pyyntö
    await addButton.click();
    selects = page.getByTestId('pyyda-asiakirja-select');
    await selects.nth(1).click();

    await page
      .getByRole('option', {
        name: 'Todistus kelpoisuuskokeen suorittamisesta',
      })
      .click();

    await addButton.click();
    selects = page.getByTestId('pyyda-asiakirja-select');
    await selects.nth(2).click();

    // Kolmas asiakirja pyyntö
    await page
      .getByRole('option', {
        name: 'Todistus täydentävien opintojen suorittamisesta',
      })
      .click();

    // Tarkista disabloidut vaihtoehdot neljännessä dropdownissa
    await addButton.click();
    selects = page.getByTestId('pyyda-asiakirja-select');
    await selects.nth(3).click();

    const allOptions = page.getByRole('option');
    const disabledCount = await allOptions.evaluateAll(
      (opts) =>
        opts.filter((opt) => opt.getAttribute('aria-disabled') === 'true')
          .length,
    );
    expect(disabledCount).toBeGreaterThanOrEqual(3);

    // Poista tyhjä
    await page.keyboard.press('Escape'); // Sulje dropdown
    await page.getByTestId('poista-asiakirja-button-undefined').click();
    await expect(selects).toHaveCount(3);

    await expect(selects.nth(1)).toContainText('kelpoisuuskokeen');

    // Poista keskimmäinen
    await page.getByTestId('poista-asiakirja-button-1').click();
    await expect(selects).toHaveCount(2);

    // Kelpoisuskoe on poistettu
    await expect(selects.nth(0)).toContainText('sopeutumisajan');
    await expect(selects.nth(1)).toContainText('täydentävien');
  });
});
