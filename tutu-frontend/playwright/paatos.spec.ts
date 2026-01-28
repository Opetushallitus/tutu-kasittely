import { test, expect } from '@playwright/test';

import { getPaatos } from '@/playwright/fixtures/paatos1';
import {
  expectDataFromDropdownSelection,
  expectRequestData,
} from '@/playwright/helpers/testUtils';
import { mockAll, mockPaatos } from '@/playwright/mocks';

import { translate } from './helpers/translate';

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await mockPaatos(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot',
  );
});

test('Päätöskentät näkyvät oikein ja kenttien muutos lähettää POST-kutsun backendille', async ({
  page,
}) => {
  const seutCheckbox = page.getByTestId('paatos-seut');
  await expect(seutCheckbox).not.toBeChecked();
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatosText = await translate(
    page,
    'hakemus.paatos.ratkaisutyyppi.paatos',
  );
  const peruutusTaiRaukeaminenText = await translate(
    page,
    'hakemus.paatos.ratkaisutyyppi.peruutusTaiRaukeaminen',
  );
  await expect(ratkaisutyyppiInput).toHaveText(paatosText);
  await expect(
    page.getByTestId('peruutuksenTaiRaukeamisenSyyComponent'),
  ).toBeHidden();

  await expectRequestData(page, '/paatos/', seutCheckbox.click(), {
    seutArviointi: true,
  });

  await expectDataFromDropdownSelection(
    page,
    ratkaisutyyppiInput.first(),
    peruutusTaiRaukeaminenText,
    '/paatos/',
    { ratkaisutyyppi: 'PeruutusTaiRaukeaminen' },
  );
  await expect(
    page.getByTestId('peruutuksenTaiRaukeamisenSyyComponent'),
  ).toBeVisible();
  await page
    .getByTestId('peruutuksenTaiRaukeamisenSyyComponent')
    .scrollIntoViewIfNeeded();

  const syyt = [
    'eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada',
    'muutenTyytymatonRatkaisuun',
    'eiApMukainenTutkintoTaiHaettuaPatevyytta',
  ];
  for (const syy of syyt) {
    const syyCheckbox = page.getByTestId(syy);
    await expect(syyCheckbox).not.toBeChecked();
    await expectRequestData(page, '/paatos/', syyCheckbox.click(), {
      peruutuksenTaiRaukeamisenSyy: {
        [syy]: true,
      },
    });
  }
});

test('Päätösten näkyminen, lisäys ja poisto toimii ja lähettää POST-kutsun backendille', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  const paatosText = await translate(
    page,
    'hakemus.paatos.ratkaisutyyppi.paatos',
  );
  const tasoText = await translate(
    page,
    'hakemus.paatos.paatostyyppi.options.taso',
  );
  const kelpoisuusText = await translate(
    page,
    'hakemus.paatos.paatostyyppi.options.kelpoisuus',
  );
  const riittavatOpinnotText = await translate(
    page,
    'hakemus.paatos.paatostyyppi.options.riittavatOpinnot',
  );
  const peruutusTaiRaukeaminenText = await translate(
    page,
    'hakemus.paatos.ratkaisutyyppi.peruutusTaiRaukeaminen',
  );
  await expect(ratkaisutyyppiInput).toHaveText(paatosText);
  await expect(paatostyyppiInput).toBeVisible();

  await expectDataFromDropdownSelection(
    page,
    paatostyyppiInput.first(),
    tasoText,
    '/paatos/',
    { paatosTiedot: [{ paatosTyyppi: 'Taso' }] },
  );

  await page.getByTestId('lisaa-paatos-button').click();
  const secondDropdown = page
    .getByTestId('paatos-paatostyyppi-dropdown')
    .nth(1);
  await expectDataFromDropdownSelection(
    page,
    secondDropdown,
    kelpoisuusText,
    '/paatos/',
    {
      paatosTiedot: [{ paatosTyyppi: 'Taso' }, { paatosTyyppi: 'Kelpoisuus' }],
    },
  );

  await page.getByTestId('lisaa-paatos-button').click();
  const thirdDropdown = page.getByTestId('paatos-paatostyyppi-dropdown').nth(2);
  await expectDataFromDropdownSelection(
    page,
    thirdDropdown,
    riittavatOpinnotText,
    '/paatos/',
    {
      paatosTiedot: [
        { paatosTyyppi: 'Taso' },
        { paatosTyyppi: 'Kelpoisuus' },
        { paatosTyyppi: 'RiittavatOpinnot' },
      ],
    },
  );

  await page.getByTestId('poista-paatos-button').last().click();
  await expect(page.getByTestId('modal-component')).toBeVisible();

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes('/paatos/') && req.method() === 'PUT',
    ),
    await page.getByTestId('modal-confirm-button').click(),
  ]);
  expect(request.postDataJSON()).toMatchObject({
    paatosTiedot: [{ paatosTyyppi: 'Taso' }, { paatosTyyppi: 'Kelpoisuus' }],
  });

  await expectDataFromDropdownSelection(
    page,
    ratkaisutyyppiInput,
    peruutusTaiRaukeaminenText,
    '/paatos/',
    {
      paatosTiedot: [],
    },
  );
});

test('Päätöstiedon valinta näyttää oikeat arvot sovellettu laki-dropdownissa', async ({
  page,
}) => {
  const paatosText = await translate(
    page,
    'hakemus.paatos.ratkaisutyyppi.paatos',
  );
  const valitseText = await translate(page, 'yleiset.valitse');
  const paatosUOText = await translate(
    page,
    'hakemus.paatos.sovellettuLaki.uo',
  );
  const paatosAPText = await translate(
    page,
    'hakemus.paatos.sovellettuLaki.ap',
  );
  const paatosAPSEUTText = await translate(
    page,
    'hakemus.paatos.sovellettuLaki.ap_seut',
  );
  const paatosROText = await translate(
    page,
    'hakemus.paatos.sovellettuLaki.ro',
  );
  const tasoText = await translate(
    page,
    'hakemus.paatos.paatostyyppi.options.taso',
  );
  const kelpoisuusText = await translate(
    page,
    'hakemus.paatos.paatostyyppi.options.kelpoisuus',
  );
  const tiettyTutkintoTaiOpinnotText = await translate(
    page,
    'hakemus.paatos.paatostyyppi.options.tiettyTutkintoTaiOpinnot',
  );
  const riittavatOpinnotText = await translate(
    page,
    'hakemus.paatos.paatostyyppi.options.riittavatOpinnot',
  );

  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await expect(ratkaisutyyppiInput).toHaveText(paatosText);
  await expect(paatostyyppiInput).toBeVisible();

  //Kun valitaan 1 Taso, tulee olla vain Päätös UO -optio sovellettu laki-dropdownissa
  await expectDataFromDropdownSelection(
    page,
    paatostyyppiInput,
    tasoText,
    '/paatos/',
    {
      paatosTiedot: [{ paatosTyyppi: 'Taso', sovellettuLaki: 'uo' }],
    },
  );
  let sovellettuLakiDropdown = page.getByTestId(
    'paatos-sovellettulaki-dropdown',
  );

  await expect(sovellettuLakiDropdown).toBeVisible();
  await expect(sovellettuLakiDropdown).toHaveText(paatosUOText);

  await sovellettuLakiDropdown.click();

  let options = page.locator('ul[role="listbox"]:visible li[role="option"]');
  await expect(options).toHaveCount(2);

  await expect(options.last()).toHaveText(paatosUOText);
  await page.locator('body').click({ position: { x: 0, y: 0 } });

  //Kun valitaan 2 Kelpoisuus, tulee olla kolme eri optiota sovellettu laki-dropdownissa
  await expectDataFromDropdownSelection(
    page,
    paatostyyppiInput,
    kelpoisuusText,
    '/paatos/',
    {
      paatosTiedot: [{ paatosTyyppi: 'Kelpoisuus' }],
    },
  );

  sovellettuLakiDropdown = page.getByTestId('paatos-sovellettulaki-dropdown');

  await expect(sovellettuLakiDropdown).toBeVisible();
  await expect(sovellettuLakiDropdown).toHaveText(valitseText);

  await sovellettuLakiDropdown.click();

  options = page.locator('ul[role="listbox"]:visible li[role="option"]');

  await expect(options).toHaveCount(4);

  await expect(options.first()).toHaveText(valitseText);
  await expect(options.nth(1)).toHaveText(paatosAPText);
  await expect(options.nth(2)).toHaveText(paatosAPSEUTText);
  await expect(options.last()).toHaveText(paatosUOText);
  await page.locator('body').click({ position: { x: 0, y: 0 } });

  //Kun valitaan 3 Tietty tutkinto tai opinnot, tulee olla vain Päätös UO -optio sovellettu laki-dropdownissa
  await expectDataFromDropdownSelection(
    page,
    paatostyyppiInput,
    tiettyTutkintoTaiOpinnotText,
    '/paatos/',
    {
      paatosTiedot: [
        { paatosTyyppi: 'TiettyTutkintoTaiOpinnot', sovellettuLaki: 'uo' },
      ],
    },
  );

  sovellettuLakiDropdown = page.getByTestId('paatos-sovellettulaki-dropdown');

  await expect(sovellettuLakiDropdown).toBeVisible();
  await expect(sovellettuLakiDropdown).toHaveText(paatosUOText);

  await sovellettuLakiDropdown.click();

  options = page.locator('ul[role="listbox"]:visible li[role="option"]');

  await expect(options).toHaveCount(2);

  await expect(options.first()).toHaveText(valitseText);
  await expect(options.last()).toHaveText(paatosUOText);
  await page.locator('body').click({ position: { x: 0, y: 0 } });

  //Kun valitaan 4 Riittävät opinnot tai opinnot, tulee olla vain Päätös RO -optio sovellettu laki-dropdownissa
  await expectDataFromDropdownSelection(
    page,
    paatostyyppiInput,
    riittavatOpinnotText,
    '/paatos/',
    {
      paatosTiedot: [
        { paatosTyyppi: 'RiittavatOpinnot', sovellettuLaki: 'ro' },
      ],
    },
  );

  sovellettuLakiDropdown = page.getByTestId('paatos-sovellettulaki-dropdown');

  await expect(sovellettuLakiDropdown).toBeVisible();
  await expect(sovellettuLakiDropdown).toHaveText(paatosROText);

  await sovellettuLakiDropdown.click();

  options = page.locator('ul[role="listbox"]:visible li[role="option"]');

  await expect(options).toHaveCount(2);

  await expect(options.first()).toHaveText(valitseText);
  await expect(options.last()).toHaveText(paatosROText);
  await page.locator('body').click({ position: { x: 0, y: 0 } });
});

test('Päätöstiedon valinta näyttää oikeat arvot tutkinto-dropdownissa ja päivitys lähettää kutsun backendille', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  const paatosText = await translate(
    page,
    'hakemus.paatos.ratkaisutyyppi.paatos',
  );
  const tasoText = await translate(
    page,
    'hakemus.paatos.paatostyyppi.options.taso',
  );
  await expect(ratkaisutyyppiInput).toHaveText(paatosText);
  await expect(paatostyyppiInput).toBeVisible();

  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();
  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator(`text=${tasoText}`);

  await tasoOption.click();

  const tutkintonimiDropdown = page.getByTestId('paatos-tutkintonimi-dropdown');
  await expect(tutkintonimiDropdown).toBeVisible();

  await expectDataFromDropdownSelection(
    page,
    tutkintonimiDropdown,
    'Päälikkö',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Taso',
          tutkintoId: '18732268-07ca-4898-a21f-e49b9dd68275',
        },
      ],
    },
  );

  await expectRequestData(
    page,
    '/paatos/',
    page.getByTestId('paatos-lisaa-tutkinto-paatostekstiin-checkbox').click(),
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Taso',
          tutkintoId: '18732268-07ca-4898-a21f-e49b9dd68275',
          lisaaTutkintoPaatostekstiin: true,
        },
      ],
    },
  );
});

test('Myönteinen päätös tulee näkyviin oikeilla arvoilla, näyttää tutkintotaso-dropdownin ja päivitys lähettää kutsun backendille', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  const paatosText = await translate(
    page,
    'hakemus.paatos.ratkaisutyyppi.paatos',
  );
  const tasoText = await translate(
    page,
    'hakemus.paatos.paatostyyppi.options.taso',
  );
  const alempiKorkeakouluText = await translate(
    page,
    'hakemus.paatos.tutkinto.alempiKorkeakoulu',
  );
  await expect(ratkaisutyyppiInput).toHaveText(paatosText);
  await expect(paatostyyppiInput).toBeVisible();

  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();
  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator(`text=${tasoText}`);

  await tasoOption.click();

  const tutkintonimiDropdown = page.getByTestId('paatos-tutkintonimi-dropdown');
  await expect(tutkintonimiDropdown).toBeVisible();
  await tutkintonimiDropdown.click();

  const tutkintoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=Päälikkö');

  await expect(tutkintoOption).toBeVisible();

  await tutkintoOption.first().click();

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
          paatosTyyppi: 'Taso',
          myonteinenPaatos: true,
        },
      ],
    },
  );

  const tutkintoTasoDropdown = page.getByTestId('paatos-tutkintotaso-dropdown');
  await expect(tutkintoTasoDropdown).toBeVisible();

  await expectDataFromDropdownSelection(
    page,
    tutkintoTasoDropdown,
    alempiKorkeakouluText,
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Taso',
          tutkintoTaso: 'AlempiKorkeakoulu',
        },
      ],
    },
  );
});

test('Kielteisen päätöksen perustelut tulevat näkyviin oikeilla arvoilla ja päivitys lähettää kutsun backendille', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  const paatosText = await translate(
    page,
    'hakemus.paatos.ratkaisutyyppi.paatos',
  );
  const tasoText = await translate(
    page,
    'hakemus.paatos.paatostyyppi.options.taso',
  );
  await expect(ratkaisutyyppiInput).toHaveText(paatosText);
  await expect(paatostyyppiInput).toBeVisible();

  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();
  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator(`text=${tasoText}`);
  await tasoOption.click();

  const tutkintonimiDropdown = page.getByTestId('paatos-tutkintonimi-dropdown');
  await expect(tutkintonimiDropdown).toBeVisible();
  await tutkintonimiDropdown.click();
  const tutkintoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=Päälikkö');

  await expect(tutkintoOption).toBeVisible();

  await tutkintoOption.first().click();

  const myonteinenPaatosRadioGroup = page.getByTestId(
    'myonteinenPaatos-radio-group',
  );

  await expect(myonteinenPaatosRadioGroup).toBeVisible();
  await myonteinenPaatosRadioGroup.scrollIntoViewIfNeeded();

  await expectRequestData(
    page,
    '/paatos/',
    myonteinenPaatosRadioGroup
      .locator('input[type="radio"][value="false"]')
      .click(),
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Taso',
          myonteinenPaatos: false,
        },
      ],
    },
  );

  const eiVastaaSuomessaSuoritettavaaTutkintojaCheckbox = page.getByTestId(
    'kielteinenPaatos-eiVastaaSuomessaSuoritettavaaTutkintoa',
  );
  await expect(eiVastaaSuomessaSuoritettavaaTutkintojaCheckbox).toBeVisible();

  await expectRequestData(
    page,
    '/paatos/',
    eiVastaaSuomessaSuoritettavaaTutkintojaCheckbox.click(),
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Taso',
          myonteinenPaatos: false,
          kielteisenPaatoksenPerustelut: {
            eiVastaaSuomessaSuoritettavaaTutkintoa: true,
          },
        },
      ],
    },
  );
});

test('Päätöksen otsikon päivämääräkentät toimivat oikein', async ({ page }) => {
  const paatos = getPaatos();
  await page.route(
    '**/paatos/1.2.246.562.10.00000000001/12345',
    async (route) => {
      if (route.request().method() === 'GET') {
        const body = {
          ...paatos,
          hyvaksymispaiva: '2025-10-26',
          lahetyspaiva: '2025-10-26',
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
        return;
      }

      if (route.request().method() === 'POST') {
        const requestBody = route.request().postDataJSON();
        const body = {
          ...paatos,
          ...requestBody,
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      } else {
        await route.continue();
      }
    },
  );

  const hyvaksymispaivaCalendar = page
    .getByTestId('paatos-hyvaksymispaiva-calendar')
    .locator('input');

  const lahetyspaivaCalendar = page
    .getByTestId('paatos-lahetyspaiva-calendar')
    .locator('input');

  await expect(hyvaksymispaivaCalendar).toBeVisible();
  await expect(lahetyspaivaCalendar).toBeVisible();

  await hyvaksymispaivaCalendar.click();
  await page.locator('.react-datepicker__day--026').click();

  await page.locator('body').click({ position: { x: 1, y: 1 } });
  await expect(hyvaksymispaivaCalendar).toHaveValue(/^26\.\d{2}\.\d{4}$/);

  await lahetyspaivaCalendar.click();
  await page.locator('.react-datepicker__day--026').click();
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  await expect(lahetyspaivaCalendar).toHaveValue(/^26\.\d{2}\.\d{4}$/);
});
