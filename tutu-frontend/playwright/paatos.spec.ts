import { test, expect } from '@playwright/test';
import { mockAll, mockPaatos } from '@/playwright/mocks';
import { getPaatos } from '@/playwright/fixtures/paatos1';

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await mockPaatos(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot',
  );
});

const matchUpdate = (url: string, method: string) =>
  url.includes('/paatos/1.2.246.562.10.00000000001') && method === 'POST';

test('Päätöskentät näkyvät oikein ja kenttien muutos lähettää POST-kutsun backendille', async ({
  page,
}) => {
  const seutCheckbox = page.getByTestId('paatos-seut');
  await expect(seutCheckbox).not.toBeChecked();
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  await expect(ratkaisutyyppiInput).toHaveText('Päätös');
  await expect(
    page.getByTestId('peruutuksenTaiRaukeamisenSyyComponent'),
  ).not.toBeVisible();

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    seutCheckbox.click(),
  ]).then((req) => expect(req[0].postDataJSON().seutArviointi).toEqual(true));

  await ratkaisutyyppiInput.first().click();
  await expect(ratkaisutyyppiInput).toBeVisible();
  const peruutusOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=Peruutus tai raukeaminen');
  await expect(peruutusOption).toBeVisible();
  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    peruutusOption.click(),
  ]).then((req) =>
    expect(req[0].postDataJSON().ratkaisutyyppi).toEqual(
      'PeruutusTaiRaukeaminen',
    ),
  );
  await expect(
    page.getByTestId('peruutuksenTaiRaukeamisenSyyComponent'),
  ).toBeVisible();

  const syyt = [
    'eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada',
    'muutenTyytymatonRatkaisuun',
    'eiApMukainenTutkintoTaiHaettuaPatevyytta',
    'eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa',
    'epavirallinenKorkeakouluTaiTutkinto',
    'eiEdellytyksiaRoEikaTasopaatokselle',
    'eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin',
    'hakijallaJoPaatosSamastaKoulutusKokonaisuudesta',
    'muuSyy',
  ];
  for (const syy of syyt) {
    const syyCheckbox = page.getByTestId(syy);
    await expect(syyCheckbox).not.toBeChecked();
    await Promise.all([
      page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
      syyCheckbox.click(),
    ]).then((req) =>
      expect(req[0].postDataJSON().peruutuksenTaiRaukeamisenSyy[syy]).toEqual(
        true,
      ),
    );
  }
});

test('Päätösten näkyminen, lisäys ja poisto toimii ja lähettää POST-kutsun backendille', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await expect(ratkaisutyyppiInput).toHaveText('Päätös');
  await expect(paatostyyppiInput).toBeVisible();

  //Lisätään ensimmäinen päätöstyyppi
  await paatostyyppiInput.first().click();
  await expect(paatostyyppiInput).toBeVisible();
  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=1 Taso');

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    tasoOption.click(),
  ]).then((req) =>
    expect(req[0].postDataJSON().paatosTiedot[0].paatosTyyppi).toEqual('Taso'),
  );

  //Lisätään toinen päätöstyyppi
  await page.getByTestId('lisaa-paatos-button').click();
  const secondDropdown = page
    .getByTestId('paatos-paatostyyppi-dropdown')
    .nth(1);
  await expect(secondDropdown).toBeVisible();
  await secondDropdown.click();

  const kelpoisuusOption = page
    .locator('ul[role="listbox"]:visible li[role="option"]')
    .filter({ hasText: 'Kelpoisuus' });

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    kelpoisuusOption.click(),
  ]).then((req) => {
    const postData = req[0].postDataJSON();
    expect(postData.paatosTiedot).toHaveLength(2);
    expect(postData.paatosTiedot[1].paatosTyyppi).toEqual('Kelpoisuus');
  });

  //Lisätään kolmas päätöstyyppi
  await page.getByTestId('lisaa-paatos-button').click();
  const thirdDropdown = page.getByTestId('paatos-paatostyyppi-dropdown').nth(2);
  await expect(thirdDropdown).toBeVisible();
  await thirdDropdown.click();

  const riittavatOpinnotOption = page
    .locator('ul[role="listbox"]:visible li[role="option"]')
    .filter({ hasText: 'Riittävät opinnot' })
    .last();

  await expect(riittavatOpinnotOption).toBeVisible();

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    riittavatOpinnotOption.click(),
  ]).then((req) => {
    const postData = req[0].postDataJSON();
    expect(postData.paatosTiedot).toHaveLength(3);
    expect(postData.paatosTiedot[2].paatosTyyppi).toEqual('RiittavatOpinnot');
  });

  //Poistetaan viimeisin päätöstyyppi

  const deleteButton = page.getByTestId('poista-paatos-button').last();

  deleteButton.click();
  await expect(page.getByTestId('modal-component')).toBeVisible();

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    page.getByTestId('modal-confirm-button').click(),
  ]).then((req) => {
    const postData = req[0].postDataJSON();

    expect(postData.paatosTiedot).toHaveLength(2);
    expect(postData.paatosTiedot[0].paatosTyyppi).toEqual('Taso');
    expect(postData.paatosTiedot[1].paatosTyyppi).toEqual('Kelpoisuus');
  });

  // Ratkaisutyypin vaihdon tulisi tyhjentää päätöstiedot:
  await ratkaisutyyppiInput.click();
  const peruutusOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=Peruutus tai raukeaminen');
  await expect(peruutusOption).toBeVisible();
  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    peruutusOption.click(),
  ]).then((req) => expect(req[0].postDataJSON().paatosTiedot).toEqual([]));
});

test('Päätöstiedon valinta näyttää oikeat arvot sovellettu laki-dropdownissa', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await expect(ratkaisutyyppiInput).toHaveText('Päätös');
  await expect(paatostyyppiInput).toBeVisible();

  //Kun valitaan 1 Taso, tulee olla vain Päätös UO -optio sovellettu laki-dropdownissa
  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();
  let tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=1 Taso');

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    tasoOption.click(),
  ]).then((req) => {
    const postData = req[0].postDataJSON();
    expect(postData.paatosTiedot[0].paatosTyyppi).toEqual('Taso');
    expect(postData.paatosTiedot[0].sovellettuLaki).toEqual('uo');
  });
  let sovellettuLakiDropdown = page.getByTestId(
    'paatos-sovellettulaki-dropdown',
  );

  await expect(sovellettuLakiDropdown).toBeVisible();
  await expect(sovellettuLakiDropdown).toHaveText('Päätös UO');

  await sovellettuLakiDropdown.click();

  let options = page.locator('ul[role="listbox"]:visible li[role="option"]');
  await expect(options).toHaveCount(2);

  await expect(options.last()).toHaveText('Päätös UO');
  await page.locator('body').click({ position: { x: 0, y: 0 } });

  //Kun valitaan 2 Kelpoisuus, tulee olla vain Päätös UO -optio sovellettu laki-dropdownissa
  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();
  tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=2 Kelpoisuus');

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    tasoOption.click(),
  ]).then((req) => {
    const postData = req[0].postDataJSON();
    expect(postData.paatosTiedot[0].paatosTyyppi).toEqual('Kelpoisuus');
    expect(postData.paatosTiedot[0].sovellettuLaki).toEqual(undefined);
  });

  sovellettuLakiDropdown = page.getByTestId('paatos-sovellettulaki-dropdown');

  await expect(sovellettuLakiDropdown).toBeVisible();
  await expect(sovellettuLakiDropdown).toHaveText('Valitse...');

  await sovellettuLakiDropdown.click();

  options = page.locator('ul[role="listbox"]:visible li[role="option"]');

  await expect(options).toHaveCount(4);

  await expect(options.first()).toHaveText('Valitse...');
  await expect(options.nth(1)).toHaveText('Päätös AP');
  await expect(options.nth(2)).toHaveText('Päätös AP/SEUT');
  await expect(options.last()).toHaveText('Päätös UO');
  await page.locator('body').click({ position: { x: 0, y: 0 } });

  //Kun valitaan 3 Tietty tutkinto tai opinnot, tulee olla vain Päätös UO -optio sovellettu laki-dropdownissa
  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();
  tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=3  Tietty tutkinto tai opinnot');

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    tasoOption.click(),
  ]).then((req) => {
    const postData = req[0].postDataJSON();
    expect(postData.paatosTiedot[0].paatosTyyppi).toEqual(
      'TiettyTutkintoTaiOpinnot',
    );
    expect(postData.paatosTiedot[0].sovellettuLaki).toEqual('uo');
  });

  sovellettuLakiDropdown = page.getByTestId('paatos-sovellettulaki-dropdown');

  await expect(sovellettuLakiDropdown).toBeVisible();
  await expect(sovellettuLakiDropdown).toHaveText('Päätös UO');

  await sovellettuLakiDropdown.click();

  options = page.locator('ul[role="listbox"]:visible li[role="option"]');

  await expect(options).toHaveCount(2);

  await expect(options.first()).toHaveText('Valitse...');
  await expect(options.last()).toHaveText('Päätös UO');
  await page.locator('body').click({ position: { x: 0, y: 0 } });

  //Kun valitaan 4 Riittävät opinnot tai opinnot, tulee olla vain Päätös RO -optio sovellettu laki-dropdownissa
  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();
  tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=4 Riittävät opinnot');

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    tasoOption.click(),
  ]).then((req) => {
    const postData = req[0].postDataJSON();
    expect(postData.paatosTiedot[0].paatosTyyppi).toEqual('RiittavatOpinnot');
    expect(postData.paatosTiedot[0].sovellettuLaki).toEqual('ro');
  });

  sovellettuLakiDropdown = page.getByTestId('paatos-sovellettulaki-dropdown');

  await expect(sovellettuLakiDropdown).toBeVisible();
  await expect(sovellettuLakiDropdown).toHaveText('Päätös RO');

  await sovellettuLakiDropdown.click();

  options = page.locator('ul[role="listbox"]:visible li[role="option"]');

  await expect(options).toHaveCount(2);

  await expect(options.first()).toHaveText('Valitse...');
  await expect(options.last()).toHaveText('Päätös RO');
  await page.locator('body').click({ position: { x: 0, y: 0 } });
});

test('Päätöstiedon valinta näyttää oikeat arvot tutkinto-dropdownissa ja päivitys lähettää kutsun backendille', async ({
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
    .locator('text=1 Taso');

  await tasoOption.click();

  const tutkintonimiDropdown = page.getByTestId('paatos-tutkintonimi-dropdown');
  await expect(tutkintonimiDropdown).toBeVisible();
  await tutkintonimiDropdown.click();

  const tutkintoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=Päälikkö');

  await expect(tutkintoOption).toBeVisible();

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    tutkintoOption.first().click(),
  ]).then((req) => {
    const postData = req[0].postDataJSON();
    expect(postData.paatosTiedot[0].tutkintoId).toEqual(
      '18732268-07ca-4898-a21f-e49b9dd68275',
    );
  });

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    page.getByTestId('paatos-lisaa-tutkinto-paatostekstiin-checkbox').click(),
  ]).then((req) => {
    const postData = req[0].postDataJSON();
    expect(postData.paatosTiedot[0].tutkintoId).toEqual(
      '18732268-07ca-4898-a21f-e49b9dd68275',
    );
    expect(postData.paatosTiedot[0].lisaaTutkintoPaatostekstiin).toEqual(true);
  });
});

test('Myönteinen päätös tulee näkyviin oikeilla arvoilla, näyttää tutkintotaso-dropdownin ja päivitys lähettää kutsun backendille', async ({
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
    .locator('text=1 Taso');

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    tasoOption.click(),
  ]);

  const tutkintonimiDropdown = page.getByTestId('paatos-tutkintonimi-dropdown');
  await expect(tutkintonimiDropdown).toBeVisible();
  await tutkintonimiDropdown.click();

  const tutkintoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=Päälikkö');

  await expect(tutkintoOption).toBeVisible();

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    tutkintoOption.first().click(),
  ]);

  const myonteinenPaatosRadioGroup = page.getByTestId(
    'paatos-myonteinenPaatos-radio-group',
  );

  await expect(myonteinenPaatosRadioGroup).toBeVisible();
  await myonteinenPaatosRadioGroup.scrollIntoViewIfNeeded();

  const [req] = await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    myonteinenPaatosRadioGroup
      .locator('input[type="radio"][value="true"]')
      .click(),
  ]);

  const myonteinenPaatosPostData = req.postDataJSON();
  expect(myonteinenPaatosPostData.paatosTiedot[0].myonteinenPaatos).toEqual(
    true,
  );

  const tutkintoTasoDropdown = page.getByTestId('paatos-tutkintotaso-dropdown');
  await expect(tutkintoTasoDropdown).toBeVisible();
  await tutkintoTasoDropdown.click();

  const tutkintoTasoOption = page
    .locator('ul[role="listbox"]:visible li[role="option"]')
    .filter({ hasText: 'Alempi korkeakoulututkinto' });

  await expect(tutkintoTasoOption).toBeVisible();

  const [req1] = await Promise.all([
    page.waitForRequest((req1) => matchUpdate(req1.url(), req1.method())),
    tutkintoTasoOption.click(),
  ]);

  const tutkintoTasoPostData = req1.postDataJSON();
  expect(tutkintoTasoPostData.paatosTiedot[0].tutkintoTaso).toEqual(
    'AlempiKorkeakoulu',
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
        const body = {
          ...paatos,
          hyvaksymispaiva: '2023-02-02',
          lahetyspaiva: '2023-02-02',
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
