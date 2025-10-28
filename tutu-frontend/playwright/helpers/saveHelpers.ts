import { Page, expect, Request } from '@playwright/test';

/**
 * Waits for the save button to appear, clicks it, and waits for the PUT request
 *
 * @param page - Playwright page object
 * @param urlPattern - Pattern to match the API endpoint (e.g., '/hakemus/', '/perustelu/')
 * @returns The intercepted request object
 */
export const clickSaveAndWaitForPUT = async (
  page: Page,
  urlPattern: string,
): Promise<Request> => {
  // Wait for save button to be visible
  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();

  // Click save and wait for PUT request
  const [request] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes(urlPattern) && req.method() === 'PUT',
    ),
    page.getByRole('button', { name: 'Tallenna' }).click(),
  ]);

  return request;
};

/**
 * Waits for the save button to disappear (indicating save completed)
 *
 * @param page - Playwright page object
 */
export const waitForSaveComplete = async (page: Page) => {
  await expect(
    page.getByRole('button', { name: 'Tallenna' }),
  ).not.toBeVisible();
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
