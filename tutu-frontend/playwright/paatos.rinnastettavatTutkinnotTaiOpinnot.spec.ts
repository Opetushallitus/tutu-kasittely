import { test, expect } from '@playwright/test';

import {
  expectDataFromDropdownSelection,
  expectRequestData,
} from '@/playwright/helpers/testUtils';
import { mockAll, mockPaatos } from '@/playwright/mocks';

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
  await expect(ratkaisutyyppiInput).toHaveText(
    'hakemus.paatos.ratkaisutyyppi.paatos',
  );
  await expect(paatostyyppiInput).toBeVisible();

  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();

  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=4 hakemus.paatos.paatostyyppi.options.riittavatOpinnot');

  await tasoOption.click();

  await expect(page.locator('h3').last()).toHaveText(
    'hakemus.paatos.paatostyyppi.riittavatOpinnot.otsikko1',
  );

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

  await expect(page.locator('h3').last()).toHaveText(
    'hakemus.paatos.paatostyyppi.riittavatOpinnot.otsikko2',
  );
});

test('Rinnastettavien tutkintojen tai opintojen lisäys ja poisto toimii ja lähettää kutsun backendille', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await expect(ratkaisutyyppiInput).toHaveText(
    'hakemus.paatos.ratkaisutyyppi.paatos',
  );
  await expect(paatostyyppiInput).toBeVisible();

  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();

  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator(
      'text=3 hakemus.paatos.paatostyyppi.options.tiettyTutkintoTaiOpinnot',
    );

  await tasoOption.click();

  await expect(page.locator('h3').last()).toHaveText(
    'hakemus.paatos.paatostyyppi.tiettyTutkintoTaiOpinnot.otsikko1',
  );

  const tutkintoDropdown = page.getByTestId(
    'rinnastettava-tutkinto-tai-opinto-select',
  );
  await expect(tutkintoDropdown).toBeVisible();
  await expectDataFromDropdownSelection(
    page,
    tutkintoDropdown,
    'Rinnastaminen oikeustieteen maisterin tutkintoon',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'TiettyTutkintoTaiOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto:
                'Rinnastaminen oikeustieteen maisterin tutkintoon',
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
                'Rinnastaminen oikeustieteen maisterin tutkintoon',
              myonteinenPaatos: true,
            },
          ],
        },
      ],
    },
  );

  const sovellettuTilanneDropdown = page.getByTestId(
    'myonteinenPaatos-uo-sovellettuTilanne-select',
  );
  await expect(sovellettuTilanneDropdown).toBeVisible();
  await expectDataFromDropdownSelection(
    page,
    sovellettuTilanneDropdown,
    '3',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'TiettyTutkintoTaiOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto:
                'Rinnastaminen oikeustieteen maisterin tutkintoon',
              myonteinenPaatos: true,
              myonteisenPaatoksenLisavaatimukset: {
                sovellettuTilanne: '3',
              },
            },
          ],
        },
      ],
    },
  );
});

test('Tietty tutkinto tai opinnot, monialaiset opinnot ja varhaiskasvatuksen valmiusopinnot ovat valittavissa', async ({
  page,
}) => {
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await paatostyyppiInput.click();

  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator(
      'text=3 hakemus.paatos.paatostyyppi.options.tiettyTutkintoTaiOpinnot',
    );
  await tasoOption.click();

  const tutkintoDropdown = page.getByTestId(
    'rinnastettava-tutkinto-tai-opinto-select',
  );
  await expect(tutkintoDropdown).toBeVisible();

  await expectDataFromDropdownSelection(
    page,
    tutkintoDropdown,
    'hakemus.paatos.paatostyyppi.tiettyTutkintoTaiOpinnot.monialaisetOpinnot',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'TiettyTutkintoTaiOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto: 'Monialaiset opinnot',
            },
          ],
        },
      ],
    },
  );

  await expectDataFromDropdownSelection(
    page,
    tutkintoDropdown,
    'hakemus.paatos.paatostyyppi.tiettyTutkintoTaiOpinnot.varhaiskasvatusJaEsiopetusValmiusOpinnot',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'TiettyTutkintoTaiOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto:
                'Varhaiskasvatuksen tehtäviin ja esiopetukseen ammatillisia valmiuksia antavat opinnot',
            },
          ],
        },
      ],
    },
  );
});

test('Riittävät opinnot, luokanopettaja näyttää oikeat valinnat', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await expect(ratkaisutyyppiInput).toHaveText(
    'hakemus.paatos.ratkaisutyyppi.paatos',
  );
  await expect(paatostyyppiInput).toBeVisible();

  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();

  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=4 hakemus.paatos.paatostyyppi.options.riittavatOpinnot');

  await tasoOption.click();

  await expect(page.locator('h3').last()).toHaveText(
    'hakemus.paatos.paatostyyppi.riittavatOpinnot.otsikko1',
  );

  const tutkintoDropdown = page.getByTestId(
    'rinnastettava-tutkinto-tai-opinto-select',
  );
  await expect(tutkintoDropdown).toBeVisible();
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
          paatosTyyppi: 'RiittavatOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto: 'Luokanopettaja',
              myonteinenPaatos: true,
            },
          ],
        },
      ],
    },
  );

  await expect(
    page.getByTestId('myonteinenPaatos-kelpoisuuskoe'),
  ).toBeVisible();
  await expectRequestData(
    page,
    '/paatos/',
    page.getByTestId('myonteinenPaatos-kelpoisuuskoe').click(),
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'RiittavatOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto: 'Luokanopettaja',
              myonteinenPaatos: true,
              myonteisenPaatoksenLisavaatimukset: {
                kelpoisuuskoe: true,
              },
            },
          ],
        },
      ],
    },
  );
  await expect(
    page.getByTestId('myonteinenPaatos-opettajuutta-tutkimassa'),
  ).toBeVisible();
  await expect(
    page.getByTestId('myonteinenPaatos-suomalainen-koulu'),
  ).toBeVisible();
  await expect(page.getByTestId('myonteinenPaatos-opetusnayte')).toBeVisible();
});

test('Riittävät opinnot - aineopettaja näyttää oikeat valinnat', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await expect(ratkaisutyyppiInput).toHaveText(
    'hakemus.paatos.ratkaisutyyppi.paatos',
  );
  await expect(paatostyyppiInput).toBeVisible();

  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();

  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=4 hakemus.paatos.paatostyyppi.options.riittavatOpinnot');

  await tasoOption.click();

  await expect(page.locator('h3').last()).toHaveText(
    'hakemus.paatos.paatostyyppi.riittavatOpinnot.otsikko1',
  );

  const tutkintoDropdown = page.getByTestId(
    'rinnastettava-tutkinto-tai-opinto-select',
  );
  await expect(tutkintoDropdown).toBeVisible();
  await expectDataFromDropdownSelection(
    page,
    tutkintoDropdown,
    'suomi',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'RiittavatOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto:
                'Aineenopettaja lukiossa_toinen kotimainen kieli_suomi',
            },
          ],
        },
      ],
    },
    false,
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
          paatosTyyppi: 'RiittavatOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto:
                'Aineenopettaja lukiossa_toinen kotimainen kieli_suomi',
              myonteinenPaatos: true,
            },
          ],
        },
      ],
    },
  );

  await expect(
    page.getByTestId('myonteinenPaatos-kelpoisuuskoe'),
  ).toBeVisible();
  await expectRequestData(
    page,
    '/paatos/',
    page.getByTestId('myonteinenPaatos-kelpoisuuskoe').click(),
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'RiittavatOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto:
                'Aineenopettaja lukiossa_toinen kotimainen kieli_suomi',
              myonteinenPaatos: true,
              myonteisenPaatoksenLisavaatimukset: {
                kelpoisuuskoe: true,
              },
            },
          ],
        },
      ],
    },
  );
  await expect(
    page.getByTestId('myonteinenPaatos-opettajuutta-tutkimassa'),
  ).toBeVisible();
  await expect(
    page.getByTestId('myonteinenPaatos-suomalainen-koulu'),
  ).toBeVisible();
  await expect(page.getByTestId('myonteinenPaatos-opetusnayte')).toBeVisible();
});

test('Riittävät opinnot - steinerpedagogiikka näyttää oikeat valinnat', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await expect(ratkaisutyyppiInput).toHaveText(
    'hakemus.paatos.ratkaisutyyppi.paatos',
  );
  await expect(paatostyyppiInput).toBeVisible();

  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();

  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=4 hakemus.paatos.paatostyyppi.options.riittavatOpinnot');

  await tasoOption.click();

  await expect(page.locator('h3').last()).toHaveText(
    'hakemus.paatos.paatostyyppi.riittavatOpinnot.otsikko1',
  );

  const tutkintoDropdown = page.getByTestId(
    'rinnastettava-tutkinto-tai-opinto-select',
  );
  await expect(tutkintoDropdown).toBeVisible();
  await expectDataFromDropdownSelection(
    page,
    tutkintoDropdown,
    'Steinerpedagogiikkaan perustuva opetus (perusopetus, lukio)',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'RiittavatOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto:
                'Steinerpedagogiikkaan tai montessoripedagogiikkaan perustuva opetus_Steinerpedagogiikkaan perustuva opetus (perusopetus, lukio)',
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
          paatosTyyppi: 'RiittavatOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto:
                'Steinerpedagogiikkaan tai montessoripedagogiikkaan perustuva opetus_Steinerpedagogiikkaan perustuva opetus (perusopetus, lukio)',
              myonteinenPaatos: true,
            },
          ],
        },
      ],
    },
  );

  await expect(
    page.getByTestId('myonteinenPaatos-taydentavat-opinnot'),
  ).toBeVisible();
});
