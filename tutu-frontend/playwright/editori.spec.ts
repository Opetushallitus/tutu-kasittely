import { expect, test } from '@playwright/test';

import {
  mockEsittelijat,
  mockHakemus,
  mockInit,
  mockPaatos,
  mockPaatosteksti,
  mockUser,
} from '@/playwright/mocks';

test.beforeEach(async ({ page }) => {
  await mockInit(page);
  await mockEsittelijat(page);
  await mockUser(page);
  await mockHakemus(page);
  await mockPaatos(page);
  await mockPaatosteksti(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.11.00000000001/editori/paatos',
  );
});

test('Autolink luo linkin automaattisesti kirjoitetusta URL-tekstistä', async ({
  page,
}) => {
  const editor = page.getByTestId('editor-content-editable');
  await editor.click();
  await page.keyboard.press('Control+End');
  await page.keyboard.press('Enter');
  await page.keyboard.type('https://www.example.com ');

  await expect(
    editor.locator('a[href="https://www.example.com"]'),
  ).toBeVisible();
});

test('Add link -painike lisää linkin valittuun tekstiin', async ({ page }) => {
  const editor = page.getByTestId('editor-content-editable');
  await editor.click();
  await page.keyboard.press('Control+End');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Klikkaa tästä');

  // Select the typed text with triple-click
  await editor.locator('p').last().click({ clickCount: 3 });

  // Click Add link button (onMouseDown prevents focus steal so editor keeps selection)
  await page.getByRole('button', { name: 'Add link' }).click();

  // Floating link editor input should appear
  const linkInput = page.locator('.link-input input');
  await expect(linkInput).toBeVisible();

  // Enter URL and confirm with Enter
  await linkInput.fill('https://www.example.com');
  await linkInput.press('Enter');

  // The selected text should now be wrapped in a link
  const link = editor.locator('a[href="https://www.example.com"]');
  await expect(link).toBeVisible();
  await expect(link).toContainText('Klikkaa tästä');
});

test('Linkin poistaminen floating link editorin avulla', async ({ page }) => {
  await mockPaatosteksti(page, {
    sisalto:
      '<p><a href="https://www.example.com"><span style="white-space: pre-wrap;">Klikkaa tästä</span></a></p>',
  });

  const editor = page.getByTestId('editor-content-editable');
  const link = editor.locator('a[href="https://www.example.com"]');
  await expect(link).toBeVisible();

  // Click the link to position cursor inside it
  await link.click();
  // Floating link editor should show the view mode with delete button
  const deleteButton = page.getByTestId('DeleteIcon');
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();

  // Link should be removed
  await expect(link).toBeHidden();
  await expect(editor).toContainText('Klikkaa tästä');
});
