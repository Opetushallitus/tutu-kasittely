import { expect, Route, test } from '@playwright/test';
import { mockAll } from '@/playwright/mocks';
import { apSisalto } from '@/playwright/fixtures/perustelu1/_perusteluApSisalto';

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await page.route(
    '**/tutu-backend/api/perustelu/ap-perustelu-oid',
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-perustelu-id',
          hakemusId: 'mock-hakemus-id',
          lahdeLahtomaanKansallinenLahde: false,
          lahdeLahtomaanVirallinenVastaus: false,
          lahdeKansainvalinenHakuteosTaiVerkkosivusto: false,
          selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: '',
          selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: '',
          luotu: '2025-09-02T16:08:42.083643',
          luoja: 'Hakemuspalvelu',
          uoRoSisalto: {},
          apSisalto: apSisalto,
        }),
      });
    },
  );
  await page.goto('/tutu-frontend/hakemus/ap-perustelu-oid/perustelu/ap/');
  await expect(page.getByTestId('perustelu-layout-otsikko')).toHaveText(
    'AP-päätöksen perustelut',
  );
});

test('AP-päätöksen selvityksetAikaisemmanTapauksenAsiaTunnus kenttä näkyy vain jos selvityksetAikaisempiHakemus valittu', async ({
  page,
}) => {
  const selvityksetAikaisempiHakemus = page.getByTestId(
    'selvityksetAikaisempiTapaus',
  );
  const selvityksetAikaisemmanTapauksenAsiaTunnus = page.getByTestId(
    'selvityksetAikaisemmanTapauksenAsiaTunnus',
  );
  await expect(selvityksetAikaisemmanTapauksenAsiaTunnus).toBeVisible();
  await selvityksetAikaisempiHakemus.click();
  await expect(selvityksetAikaisemmanTapauksenAsiaTunnus).toBeHidden();
});

test('AP-perustelun kentät näkyvät oikein ja kenttien muutos lähettää POST-kutsun backendille', async ({
  page,
}) => {
  const lakiperusteToisessaJasenmaassaSaannelty = page.getByTestId(
    'lakiperusteToisessaJasenmaassaSaannelty',
  );
  await expect(lakiperusteToisessaJasenmaassaSaannelty).toBeChecked();

  const lakiperustePatevyysLahtomaanOikeuksilla = page.getByTestId(
    'lakiperustePatevyysLahtomaanOikeuksilla',
  );
  await expect(lakiperustePatevyysLahtomaanOikeuksilla).toBeChecked();

  const lakiperusteToinenEUmaaTunnustanut = page.getByTestId(
    'lakiperusteToinenEUmaaTunnustanut',
  );
  await expect(lakiperusteToinenEUmaaTunnustanut).toBeChecked();

  const lakiperusteLahtomaassaSaantelematon = page.getByTestId(
    'lakiperusteLahtomaassaSaantelematon',
  );
  await expect(lakiperusteLahtomaassaSaantelematon).toBeChecked();

  const kansalaisuus = page.getByTestId('kansalaisuus');
  await expect(kansalaisuus).toHaveText('Suomi, Ruotsi');

  const todistusEUKansalaisuuteenRinnasteisestaAsemasta = page
    .getByTestId('todistusEUKansalaisuuteenRinnasteisestaAsemasta')
    .locator('textarea')
    .first();
  await expect(todistusEUKansalaisuuteenRinnasteisestaAsemasta).toHaveValue(
    'todistusEUKansalaisuuteenRinnasteisestaAsemasta',
  );

  const ammattiJohonPatevoitynyt = page
    .getByTestId('ammattiJohonPatevoitynyt')
    .locator('textarea')
    .first();
  await expect(ammattiJohonPatevoitynyt).toHaveText('ammattiJohonPatevoitynyt');

  const ammattitoiminnanPaaAsiallinenSisalto = page
    .getByTestId('ammattitoiminnanPaaAsiallinenSisalto')
    .locator('textarea')
    .first();
  await expect(ammattitoiminnanPaaAsiallinenSisalto).toHaveText(
    'ammattitoiminnanPaaAsiallinenSisalto',
  );

  const koulutuksenKestoJaSisalto = page
    .getByTestId('koulutuksenKestoJaSisalto')
    .locator('textarea')
    .first();
  await expect(koulutuksenKestoJaSisalto).toHaveText(
    'koulutuksenKestoJaSisalto',
  );

  const selvityksetLahtomaanViranomaiselta = page.getByTestId(
    'selvityksetLahtomaanViranomaiselta',
  );
  await expect(selvityksetLahtomaanViranomaiselta).toBeChecked();

  const selvityksetLahtomaanLainsaadannosta = page.getByTestId(
    'selvityksetLahtomaanLainsaadannosta',
  );
  await expect(selvityksetLahtomaanLainsaadannosta).toBeChecked();

  const selvityksetAikaisempiTapaus = page.getByTestId(
    'selvityksetAikaisempiTapaus',
  );
  await expect(selvityksetAikaisempiTapaus).toBeChecked();

  const selvityksetAikaisemmanTapauksenAsiaTunnus = page
    .getByTestId('selvityksetAikaisemmanTapauksenAsiaTunnus')
    .locator('input');
  await expect(selvityksetAikaisemmanTapauksenAsiaTunnus).toHaveValue(
    'selvityksetAikaisemmanTapauksenAsiaTunnus',
  );

  const selvityksetIlmeneeAsiakirjoista = page.getByTestId(
    'selvityksetIlmeneeAsiakirjoista',
  );
  await expect(selvityksetIlmeneeAsiakirjoista).toBeChecked();

  const lisatietoja = page
    .getByTestId('lisatietoja')
    .locator('textarea')
    .first();
  await expect(lisatietoja).toHaveText('lisatietoja');

  const IMIHalytysTarkastettu = page.getByTestId('IMIHalytysTarkastettu');
  await expect(IMIHalytysTarkastettu).toBeChecked();

  const syntymaaika = page.getByTestId('syntymaaika');
  await expect(syntymaaika).toHaveText('1980-01-01');

  const muutAPPerustelut = page
    .getByTestId('muutAPPerustelut')
    .locator('textarea')
    .first();
  await expect(muutAPPerustelut).toHaveText('muutAPPerustelut');

  const SEUTArviointi = page
    .getByTestId('SEUTArviointi')
    .locator('textarea')
    .first();
  await expect(SEUTArviointi).toHaveText('SEUTArviointi');

  // Make change
  await SEUTArviointi.fill('SEUTArviointi uusi arvo');

  // Wait for save button and click it
  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();

  const [req] = await Promise.all([
    page.waitForRequest(
      (r) =>
        r.url().includes('/tutu-backend/api/perustelu') && r.method() === 'PUT',
    ),
    page.getByRole('button', { name: 'Tallenna' }).click(),
  ]);
  const payload = req.postDataJSON();

  const updatedItem = payload.apSisalto;

  expect(updatedItem).toEqual({
    ...apSisalto,
    SEUTArviointi: 'SEUTArviointi uusi arvo',
  });
});
