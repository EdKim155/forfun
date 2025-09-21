import { test, expect } from '@playwright/test';

test('onboarding, generate and save prompt flow', async ({ page }) => {
  await page.goto('/ru/auth/signin');
  await page.getByRole('button', { name: 'Войти как демо-пользователь' }).click();
  await page.waitForURL('**/ru/onboarding');

  await page.getByRole('button', { name: /ChatGPT/i }).click();
  await page.getByRole('button', { name: /Далее/i }).click();

  await page.getByRole('button', { name: /Маркетинг/i }).first().click();
  await page.getByRole('button', { name: /Далее/i }).click();

  await page.locator('textarea').fill('Создать лендинг для нового AI-продукта для дизайнеров.');
  await page.getByRole('button', { name: /Далее/i }).click();

  await page.getByRole('button', { name: /Готово/i }).click();
  await page.waitForURL('**/ru/builder');

  const briefTextarea = page.locator('textarea').first();
  await briefTextarea.fill('Лендинг для AI-продукта, цель — лиды дизайнеров, тон вдохновляющий.');
  await page.getByRole('button', { name: /Сгенерировать промпт/i }).click();

  await expect(page.getByText('Готовый промпт')).toBeVisible();
  await page.getByRole('button', { name: /Сохранить/i }).click();

  await page.getByPlaceholder('Например, лендинг для IT-продукта').fill('E2E промпт');
  await page.getByRole('button', { name: 'Сохранить промпт' }).click();

  await page.getByRole('link', { name: 'Библиотека' }).click();
  await page.waitForURL('**/ru/library');
  await expect(page.getByText('E2E промпт')).toBeVisible();
});
