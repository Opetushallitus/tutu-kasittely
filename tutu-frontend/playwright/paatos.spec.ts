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
