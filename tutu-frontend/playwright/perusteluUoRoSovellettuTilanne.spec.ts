import { expect, Page, test } from '@playwright/test';
import { mockAll } from '@/playwright/mocks';

import {
  sovellettuErityisOpetusOptions,
  sovellettuLuokanOpettajaOptions,
  sovellettuMonialaisetOpinnotOptions,
  sovellettuPedagogisetOpinnotOptions,
  sovellettuRinnastaminenKasvatustieteelliseenTutkintoonOptions,
  sovellettuRinnastaminenOikeustieteenMaisterinTutkintoonOptions,
  SovellettuTilanneOpetettavatAineetOptions,
  sovellettuVarhaiskasvatusOptions,
} from '@/src/app/hakemus/[oid]/perustelu/uoro/constants/SovellettuTilanneOptions';

test.beforeEach(mockAll);

const gotoUoro = async (page: Page) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/uoro/',
  );
  await expect(page.getByTestId('perustelu-layout-otsikko')).toBeVisible();
};

test('SovellettuTilanne: opettajan pedagogiset opinnot', async ({ page }) => {
  await gotoUoro(page);

  const toggle = page.getByTestId(
    'checkbox-sovellettuOpettajanPedagogisetOpinnot',
  );
  await toggle.scrollIntoViewIfNeeded();
  const checkbox = toggle.locator('input[type="checkbox"]');

  await checkbox.click();

  const radioGroup = page.getByTestId(
    'radio-group-sovellettuOpettajanPedagogisetOpinnot',
  );
  await expect(radioGroup).toBeVisible();

  await expect(radioGroup.locator('input[type="radio"]')).toHaveCount(
    sovellettuPedagogisetOpinnotOptions.length,
  );

  for (const opt of sovellettuPedagogisetOpinnotOptions) {
    await expect(
      radioGroup.getByText(opt.label, { exact: true }),
    ).toBeVisible();
  }
});

test('SovellettuTilanne: opetettavan aineen opinnot', async ({ page }) => {
  await gotoUoro(page);

  const toggle = page.getByTestId(
    'checkbox-sovellettuOpetettavanAineenOpinnot',
  );
  await toggle.scrollIntoViewIfNeeded();
  const checkbox = toggle.locator('input[type="checkbox"]');

  await checkbox.click();

  const kieliItems = page.locator(
    '[data-testid^="opetettavatAineetVieraatKielet-"][data-testid$="-checkBox"]',
  );
  await expect(kieliItems.first()).toBeVisible();

  for (const [subjectKey, options] of Object.entries(
    SovellettuTilanneOpetettavatAineetOptions,
  )) {
    const group = page.getByTestId(`radio-group-${subjectKey}`);
    await expect(group).toBeVisible();

    await expect(group.locator('input[type="radio"]')).toHaveCount(
      options.length,
    );

    for (const opt of options) {
      await expect(group.getByText(opt.label, { exact: true })).toBeVisible();
    }
  }
});

test('SovellettuTilanne: monialaiset opinnot', async ({ page }) => {
  await gotoUoro(page);

  const toggle = page.getByTestId('checkbox-sovellettuMonialaisetOpinnot');
  await toggle.scrollIntoViewIfNeeded();
  const checkbox = toggle.locator('input[type="checkbox"]');

  await checkbox.click();

  const radioGroup = page.getByTestId(
    'radio-group-sovellettuMonialaisetOpinnot',
  );
  await expect(radioGroup).toBeVisible();

  await expect(radioGroup.locator('input[type="radio"]')).toHaveCount(
    sovellettuMonialaisetOpinnotOptions.length,
  );

  for (const opt of sovellettuMonialaisetOpinnotOptions) {
    await expect(
      radioGroup.getByText(opt.label, { exact: true }),
    ).toBeVisible();
  }
});

test('SovellettuTilanne: erityisopetus', async ({ page }) => {
  await gotoUoro(page);

  const toggle = page.getByTestId('checkbox-sovellettuErityisopetus');
  await toggle.scrollIntoViewIfNeeded();
  const checkbox = toggle.locator('input[type="checkbox"]');

  await checkbox.click();

  const radioGroup = page.getByTestId('radio-group-sovellettuErityisopetus');
  await expect(radioGroup).toBeVisible();

  await expect(radioGroup.locator('input[type="radio"]')).toHaveCount(
    sovellettuErityisOpetusOptions.length,
  );

  for (const opt of sovellettuErityisOpetusOptions) {
    await expect(
      radioGroup.getByText(opt.label, { exact: true }),
    ).toBeVisible();
  }
});

test('SovellettuTilanne: varhaiskasvatus', async ({ page }) => {
  await gotoUoro(page);

  const toggle = page.getByTestId('checkbox-sovellettuVarhaiskasvatus');
  await toggle.scrollIntoViewIfNeeded();
  const checkbox = toggle.locator('input[type="checkbox"]');

  await checkbox.click();

  const radioGroup = page.getByTestId('radio-group-sovellettuVarhaiskasvatus');
  await expect(radioGroup).toBeVisible();

  await expect(radioGroup.locator('input[type="radio"]')).toHaveCount(
    sovellettuVarhaiskasvatusOptions.length,
  );

  for (const opt of sovellettuVarhaiskasvatusOptions) {
    await expect(
      radioGroup.getByText(opt.label, { exact: true }),
    ).toBeVisible();
  }
});

test('SovellettuTilanne: rinnastaminen kasvatustieteelliseen tutkintoon', async ({
  page,
}) => {
  await gotoUoro(page);

  const toggle = page.getByTestId(
    'checkbox-sovellettuRinnastaminenKasvatustieteelliseenTutkintoon',
  );
  await toggle.scrollIntoViewIfNeeded();
  const checkbox = toggle.locator('input[type="checkbox"]');

  await checkbox.click();

  const flat =
    sovellettuRinnastaminenKasvatustieteelliseenTutkintoonOptions.flat();
  for (const opt of flat) {
    const item = page.getByTestId(
      `sovellettuTilanneKasvatustieteellinen-${opt.value}-checkBox`,
    );
    await expect(item).toBeVisible();

    await expect(item.locator('input[type="checkbox"]')).toBeVisible();
  }
});

test('SovellettuTilanne: riittävät opinnot', async ({ page }) => {
  await gotoUoro(page);

  const riittavatToggle = page.getByTestId(
    'checkbox-sovellettuRiittavatOpinnot',
  );
  await expect(riittavatToggle).toBeVisible();
  await expect(riittavatToggle.locator('input[type="checkbox"]')).toBeVisible();
});

test('SovellettuTilanne: rinnastaminen oikeustieteen maisterin tutkintoon', async ({
  page,
}) => {
  await gotoUoro(page);

  const toggle = page.getByTestId(
    'checkbox-sovellettuRinnastaminenOtmTutkintoon',
  );
  await toggle.scrollIntoViewIfNeeded();
  const checkbox = toggle.locator('input[type="checkbox"]');

  await checkbox.click();

  const radioGroup = page.getByTestId(
    'radio-group-sovellettuRinnastaminenOtmTutkintoon',
  );
  await expect(radioGroup).toBeVisible();

  await expect(radioGroup.locator('input[type="radio"]')).toHaveCount(
    sovellettuRinnastaminenOikeustieteenMaisterinTutkintoonOptions.length,
  );

  for (const opt of sovellettuRinnastaminenOikeustieteenMaisterinTutkintoonOptions) {
    await expect(
      radioGroup.getByText(opt.label, { exact: true }),
    ).toBeVisible();
  }
});

test('SovellettuTilanne: luokanopettaja', async ({ page }) => {
  await gotoUoro(page);

  const toggle = page.getByTestId('checkbox-sovellettuLuokanopettaja');
  await toggle.scrollIntoViewIfNeeded();
  const checkbox = toggle.locator('input[type="checkbox"]');

  await checkbox.click();

  const radioGroup = page.getByTestId('radio-group-sovellettuLuokanopettaja');
  await expect(radioGroup).toBeVisible();

  await expect(radioGroup.locator('input[type="radio"]')).toHaveCount(
    sovellettuLuokanOpettajaOptions.length,
  );

  for (const opt of sovellettuLuokanOpettajaOptions) {
    await expect(
      radioGroup.getByText(opt.label, { exact: true }),
    ).toBeVisible();
  }
});

test('Sovellettu tilanne: Muu ero', async ({ page }) => {
  await gotoUoro(page);
  const toggle = page.getByTestId('checkbox-sovellettuMuuTilanne');
  await expect(toggle).toBeVisible();

  await expect(page.getByTestId('sovellettuMuuEroSelite')).toHaveCount(0);

  const checkbox = toggle.locator('input[type="checkbox"]');
  await checkbox.click();
  await expect(page.getByTestId('sovellettuMuuEroSelite')).toBeVisible();
});
