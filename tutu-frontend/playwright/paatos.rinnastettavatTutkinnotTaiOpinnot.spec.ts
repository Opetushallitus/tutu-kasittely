import { test, expect } from '@playwright/test';
import { mockAll, mockPaatos } from '@/playwright/mocks';
import {
  expectDataFromDropdownSelection,
  expectRequestData,
} from '@/playwright/helpers/testUtils';

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await mockPaatos(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot',
  );
});

test('Valittaessa 4 Riittävät opinnot, tulee opintojen lisäyksen jälkeen oikea otsikko ja opetuskieli-input näkyviin sekä backendille lähtee kutsu', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await expect(ratkaisutyyppiInput).toHaveText('Päätös');
  await expect(paatostyyppiInput).toBeVisible();

  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();

  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=4 Riittävät opinnot');

  await tasoOption.click();

  await expect(page.locator('h3').last()).toHaveText('Opinnot 1');

  const tutkintoDropdown = page.getByTestId(
    'rinnastettava-tutkinto-tai-opinto-select',
  );
  await expect(tutkintoDropdown).toBeVisible();

  const opetuskieliInput = page.getByTestId(
    'riittavat-opinnot-opetuskieli-input',
  );
  await expect(opetuskieliInput).toBeVisible();

  await opetuskieliInput.locator('input').fill('suomi');
  await expectDataFromDropdownSelection(
    page,
    tutkintoDropdown,
    'Luokanopettaja',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'RiittavatOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto: 'Luokanopettaja',
              opetuskieli: 'suomi',
            },
          ],
        },
      ],
    },
  );

  await expect(
    page.getByTestId('lisaa-tutkinto-tai-opinto-button'),
  ).toBeVisible();
  await page.getByTestId('lisaa-tutkinto-tai-opinto-button').click();

  await expect(page.locator('h3').last()).toHaveText('Opinnot 2');
});

test('Rinnastettavien tutkintojen tai opintojen lisäys ja poisto toimii ja lähettää kutsun backendille', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await expect(ratkaisutyyppiInput).toHaveText('Päätös');
  await expect(paatostyyppiInput).toBeVisible();

  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();

  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=3 Tietty tutkinto tai opinnot');

  await tasoOption.click();

  await expect(page.locator('h3').last()).toHaveText('Tutkinto tai opinnot 1');

  const tutkintoDropdown = page.getByTestId(
    'rinnastettava-tutkinto-tai-opinto-select',
  );
  await expect(tutkintoDropdown).toBeVisible();
  await expectDataFromDropdownSelection(
    page,
    tutkintoDropdown,
    'uskonto, ortodoksinen',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'TiettyTutkintoTaiOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto:
                'Opetettavan aineen opinnot_uskonto_uskonto, ortodoksinen',
            },
          ],
        },
      ],
    },
  );

  const myonteinenPaatosRadioGroup = page.getByTestId(
    'myonteinenPaatos-radio-group',
  );

  await expect(myonteinenPaatosRadioGroup).toBeVisible();
  await myonteinenPaatosRadioGroup.scrollIntoViewIfNeeded();

  await expectRequestData(
    page,
    '/paatos/',
    myonteinenPaatosRadioGroup
      .locator('input[type="radio"][value="true"]')
      .click(),
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'TiettyTutkintoTaiOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto:
                'Opetettavan aineen opinnot_uskonto_uskonto, ortodoksinen',
              myonteinenPaatos: true,
            },
          ],
        },
      ],
    },
  );

  await expect(
    page.getByTestId('myonteinenPaatos-taydentavatOpinnot'),
  ).toBeVisible();
  await expectRequestData(
    page,
    '/paatos/',
    page.getByTestId('myonteinenPaatos-taydentavatOpinnot').click(),
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'TiettyTutkintoTaiOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto:
                'Opetettavan aineen opinnot_uskonto_uskonto, ortodoksinen',
              myonteinenPaatos: true,
              myonteisenPaatoksenLisavaatimukset: {
                taydentavatOpinnot: true,
              },
            },
          ],
        },
      ],
    },
  );
});
