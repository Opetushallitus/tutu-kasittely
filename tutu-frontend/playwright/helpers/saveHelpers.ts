import { Page, expect, Request } from '@playwright/test';

/**
 * Waits for the save button to appear, clicks it, and waits for the PUT request
 *
 * Uses data-testid for more reliable selection than getByRole.
 *
 * @param page - Playwright page object
 * @param urlPattern - Pattern to match the API endpoint (e.g., '/hakemus/', '/perustelu/')
 * @returns The intercepted request object
 *
 * @example
 * const request = await clickSaveAndWaitForPUT(page, '/perustelu/');
 * expect(request.postDataJSON()).toMatchObject({ field: 'value' });
 */
export const clickSaveAndWaitForPUT = async (
  page: Page,
  urlPattern: string,
): Promise<Request> => {
  const saveButton = page.getByTestId('save-ribbon-button');

  // Wait for save button to be visible and enabled
  await expect(saveButton).toBeVisible();
  await expect(saveButton).toBeEnabled();

  // Click save and wait for PUT request
  const [request] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes(urlPattern) && req.method() === 'PUT',
    ),
    saveButton.click(),
  ]);

  return request;
};

/**
 * Waits for the save button to disappear (indicating save completed)
 *
 * @param page - Playwright page object
 * @param timeout - Optional timeout in ms (default: 5000)
 *
 * @example
 * await clickSaveAndWaitForPUT(page, '/hakemus/');
 * await waitForSaveComplete(page); // Ensures save finished
 */
export const waitForSaveComplete = async (
  page: Page,
  timeout: number = 5000,
) => {
  await expect(page.getByTestId('save-ribbon-button')).not.toBeVisible({
    timeout,
  });
};

/**
 * Clicks save button, waits for PUT request, and verifies the request payload
 *
 * @param page - Playwright page object
 * @param urlPattern - Pattern to match the API endpoint
 * @param expectedPayload - Expected data in the request payload
 */
export const clickSaveAndVerifyPayload = async (
  page: Page,
  urlPattern: string,
  expectedPayload: Record<string, unknown>,
) => {
  const request = await clickSaveAndWaitForPUT(page, urlPattern);
  expect(request.postDataJSON()).toMatchObject(expectedPayload);
};
