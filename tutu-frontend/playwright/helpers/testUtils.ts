import { expect, Locator, Page } from '@playwright/test';

import { waitForSaveComplete } from '@/playwright/helpers/saveHelpers';

// Webkit ongelmiin hyödylliset helperit
export const expectHiddenOrDetached = async (locator: Locator) => {
  await expect
    .poll(async () => {
      const count = await locator.count();
      if (count === 0) {
        return true;
      }
      return !(await locator.first().isVisible());
    })
    .toBe(true);
};

export const expectVisibleAndAttached = async (locator: Locator) => {
  await expect
    .poll(async () => {
      const count = await locator.count();
      if (count === 0) {
        return false;
      }
      return await locator.first().isVisible();
    })
    .toBe(true);
};

export const expectRequestData = async (
  page: Page,
  expectedUrl: string,
  action: Promise<void>,
  data: Record<string, unknown>,
) => {
  await action;

  const saveButton = page.getByTestId('save-ribbon-button');
  await expectVisibleAndAttached(saveButton);

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes(expectedUrl) && req.method() === 'PUT',
    ),
    saveButton.click(),
  ]);

  await waitForSaveComplete(page);

  return expect(request.postDataJSON()).toMatchObject(data);
};

export const expectDataFromDropdownSelection = async (
  page: Page,
  menuButton: Locator,
  optionText: string,
  expectedUrl: string,
  data: Record<string, unknown>,
  exactText: boolean = true,
) => {
  await menuButton.click();
  await expect(menuButton).toBeVisible();
  let option = page.locator('ul[role="listbox"] li[role="option"]');
  option = exactText
    ? option.getByText(optionText, { exact: true })
    : option.locator(`text=${optionText}`).last();
  await expectRequestData(page, expectedUrl, option.click(), data);
};
export const selectOption = async (
  page: Page,
  menuButton: Locator,
  optionText: string,
) => {
  await menuButton.click();
  await expect(menuButton).toBeVisible();
  const option = page
    .locator('ul[role="listbox"] li[role="option"]')
    .getByText(optionText, { exact: true });
  await option.last().click();
};

export const selectOptionByValue = async (
  page: Page,
  menuButton: Locator,
  dataValue: string,
) => {
  await menuButton.click({ position: { x: 20, y: 10 } });
  await expect(menuButton).toBeVisible();
  const option = page.locator(
    `ul[role="listbox"] li[data-value="${dataValue}"]`,
  );
  await option.first().click();
};

export const clickSaveButton = async (page: Page) => {
  const saveButton = page.getByTestId('save-ribbon-button');
  await expect(saveButton).toBeVisible();
  await saveButton.click();
};

export async function navigateToSovellettuTilanneOfMyonteinenTutkintoTaiOpinto(
  page: Page,
  tutkintoTaiOpinto: string,
  sovellettuTilanne?: string,
): Promise<void> {
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();

  await page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator(
      'text=3 hakemus.paatos.paatostyyppi.options.tiettyTutkintoTaiOpinnot',
    )
    .click();

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
    tutkintoTaiOpinto,
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'TiettyTutkintoTaiOpinnot',
          rinnastettavatTutkinnotTaiOpinnot: [
            { tutkintoTaiOpinto: tutkintoTaiOpinto },
          ],
        },
      ],
    },
  );

  const myonteinenPaatosRadioGroup = page.getByTestId(
    'myonteinenPaatos-radio-group',
  );
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
          rinnastettavatTutkinnotTaiOpinnot: [
            {
              tutkintoTaiOpinto: tutkintoTaiOpinto,
              myonteinenPaatos: true,
            },
          ],
        },
      ],
    },
  );

  if (sovellettuTilanne) {
    const sovellettuTilanneDropdown = page.getByTestId(
      'myonteinenPaatos-uo-sovellettuTilanne-select',
    );
    await expect(sovellettuTilanneDropdown).toBeVisible();

    const optionLabel =
      sovellettuTilanne === 'muu'
        ? 'hakemus.paatos.myonteinenPaatos.uo.sovellettuTilanne.muuOikeustieteenMaisteri'
        : sovellettuTilanne;

    await expectDataFromDropdownSelection(
      page,
      sovellettuTilanneDropdown,
      optionLabel,
      '/paatos/',
      {
        paatosTiedot: [
          {
            rinnastettavatTutkinnotTaiOpinnot: [
              {
                myonteisenPaatoksenLisavaatimukset: {
                  sovellettuTilanne,
                },
              },
            ],
          },
        ],
      },
    );
  }
}
