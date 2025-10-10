import { test, expect } from '@playwright/test';
import { mockAll, mockPaatos } from '@/playwright/mocks';

test.beforeEach(mockAll);

const matchUpdate = (url: string, method: string) =>
  url.includes('/paatos/1.2.246.562.10.00000000001') && method === 'POST';

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

test('Päätöskenttien näkyminen, lisäys ja poisto toimii ja lähettää POST-kutsun backendille', async ({
  page,
}) => {
  mockPaatos(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot',
  );
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

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    deleteButton.click(),
  ]).then((req) => {
    const postData = req[0].postDataJSON();
    console.log(postData);

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
