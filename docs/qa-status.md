# QA 状态

截至 2026-11-04：

- `npm run audit:bank`：通过，导入 38 条题目。
- `npm run typecheck`：通过。
- `npm run test`：通过，3 个测试文件、7 个测试。
- `npm run build`：通过。
- 本机 `npm run test:e2e`：当前环境最初缺少 Playwright 浏览器二进制，且 Windows 浏览器进程受限，因此本机结论保留为 `NOT_VERIFIED`。
- `.github/workflows/e2e.yml`：GitHub Actions 已在 Ubuntu 上安装 Chromium 并成功执行桌面与移动 Chromium 项目，共 4 个测试实例；最新运行号 `41847440370`，结论 `success`。
- 同一运行已上传 `c-path-browser-qa-screenshots` artifact（约 752 KB），包含练习工作区和刷新恢复截图。

E2E 覆盖首页 → 题库 → 搜索 → 打开练习，以及练习草稿刷新恢复。发布前应在具备 Chromium 的环境运行 `npx playwright install chromium` 后再次执行 `npm run test:e2e`。
