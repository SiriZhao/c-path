import { test, expect } from '@playwright/test'

test('learner can search and open a practice workspace', async ({ page }, testInfo) => {
  await page.goto('./')
  await expect(page).toHaveTitle(/C·Path/)
  await page.getByRole('link', { name: '题库' }).click()
  await expect(page.getByRole('heading', { name: '把知识点变成手感' })).toBeVisible()
  await page.getByPlaceholder('搜索题号、标题或知识点').fill('整数')
  await expect(page.getByText('整数四则运算')).toBeVisible()
  await page.getByRole('button', { name: /打开 整数四则运算/ }).click()
  await expect(page.getByRole('textbox', { name: 'C 代码编辑器' })).toBeVisible()
  await expect(page.getByText('来源已导入')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('practice-workspace.png'), fullPage: true })
})

test('practice draft survives reload', async ({ page }, testInfo) => {
  await page.goto('./#/practice/pat-2_0')
  const editor = page.getByRole('textbox', { name: 'C 代码编辑器' })
  await editor.fill('int main(void) { return 7; }')
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'C 代码编辑器' })).toHaveValue('int main(void) { return 7; }')
  await page.screenshot({ path: testInfo.outputPath('practice-reload.png'), fullPage: true })
})

test('original exercise exposes real statement and local test inventory', async ({ page }) => {
  await page.goto('./#/bank')
  await page.getByPlaceholder('搜索题号、标题或知识点').fill('两个整数求和')
  await page.getByRole('button', { name: /打开 两个整数求和/ }).click()
  await expect(page.getByText('C·Path 原创')).toBeVisible()
  await expect(page.getByText('本题配置 5 组本地测试')).toBeVisible()
  await expect(page.getByText('当前静态站点未配置 C 编译器')).toHaveCount(0)
})

test('browsercc executes C with stdin and runs local tests', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', '运行器编译验收只在桌面 Chromium 执行，移动端仍覆盖页面交互。')
  test.setTimeout(180_000)
  await page.goto('./#/practice/orig-sum-two-integers')
  await page.getByRole('textbox', { name: 'C 代码编辑器' }).fill('#include <stdio.h>\nint main(void) { int a, b; if (scanf("%d %d", &a, &b) != 2) return 1; printf("%d\\n", a + b); return 0; }')
  await page.locator('.input-label textarea').fill('3 5')
  await page.getByRole('button', { name: '运行', exact: true }).click()
  await expect(page.locator('.console-output pre').first()).toContainText('8', { timeout: 180_000 })
  await page.getByRole('button', { name: '运行样例' }).click()
  await expect(page.getByText('测试结果 2/2')).toBeVisible({ timeout: 120_000 })
  await page.getByRole('button', { name: '提交本地测试' }).click()
  await expect(page.getByText('测试结果 5/5')).toBeVisible({ timeout: 240_000 })
})
