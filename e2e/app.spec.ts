import { test, expect } from '@playwright/test'

test('learner can search and open a practice workspace', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveTitle(/C·Path/)
  await page.getByRole('link', { name: '题库' }).click()
  await expect(page.getByRole('heading', { name: '把知识点变成手感' })).toBeVisible()
  await page.getByPlaceholder('搜索题号、标题或知识点').fill('整数')
  await expect(page.getByText('整数四则运算')).toBeVisible()
  await page.getByRole('button', { name: /打开 整数四则运算/ }).click()
  await expect(page.getByRole('textbox', { name: 'C 代码编辑器' })).toBeVisible()
  await expect(page.getByText('来源已导入 · 待审核')).toBeVisible()
})

test('practice draft survives reload', async ({ page }) => {
  await page.goto('./#/practice/pat-2_0')
  const editor = page.getByRole('textbox', { name: 'C 代码编辑器' })
  await editor.fill('int main(void) { return 7; }')
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'C 代码编辑器' })).toHaveValue('int main(void) { return 7; }')
})
