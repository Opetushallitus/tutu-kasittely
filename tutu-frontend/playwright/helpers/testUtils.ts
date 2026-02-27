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
) => {
  await menuButton.click();
  await expect(menuButton).toBeVisible();
  const option = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator(`text=${optionText}`)
    .last();
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
    .locator(`text=${optionText}`);
  await option.last().click();
};
