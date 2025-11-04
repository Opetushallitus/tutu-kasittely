import { Locator, Page } from '@playwright/test';
import { Serializable } from 'playwright-core/types/structs';

export const selectOptionFromDropdown = async (
  page: Page,
  menuButton: Locator,
  optionText: string,
  expectedUrl: string,
): Promise<Serializable> => {
  await menuButton.click();
  const option = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator(`text=${optionText}`)
    .last();
  return await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes(expectedUrl) && req.method() === 'POST',
    ),
    option.click(),
  ]).then((data) => data[0].postDataJSON());
};
