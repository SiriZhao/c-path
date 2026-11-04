# QA 状态

截至 2026-11-04：

- `npm run audit:bank`：通过，导入 38 条题目。
- `npm run typecheck`：通过。
- `npm run test`：通过，3 个测试文件、7 个测试。
- `npm run build`：通过。
- `npm run test:e2e`：已加入 2 条工作流测试，并配置桌面 Chromium 与移动 Chromium 视口；当前执行环境最初缺少 Playwright 浏览器二进制，安装过程未能产生可复核的完整结果，因此 E2E 结论为 `NOT_VERIFIED`。
- `.github/workflows/e2e.yml`：已加入 GitHub Actions Chromium 验收工作流，后续 push 会在 Ubuntu CI 中安装浏览器并执行同一组测试。

E2E 覆盖首页 → 题库 → 搜索 → 打开练习，以及练习草稿刷新恢复。发布前应在具备 Chromium 的环境运行 `npx playwright install chromium` 后再次执行 `npm run test:e2e`。
