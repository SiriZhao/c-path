# QA 状态

截至 2026-11-05 Phase 6：

- `npm run audit:bank`：通过，导入 38 条题目。
- `npm run typecheck`：通过。
- `npm run test`：通过，5 个测试文件、13 个测试。
- `npm run build`：通过。
- 本机已安装 Chromium，但本地沙箱进程权限不稳定；本机完整结论保留为 `NOT_VERIFIED`，以 Ubuntu CI 为准。
- `.github/workflows/e2e.yml`：GitHub Actions 在 Ubuntu 上安装 Chromium 并成功执行桌面与移动 Chromium 项目。main main Browser QA `42041164440`，16 个浏览器测试实例中 13 个执行、3 个移动端运行器测试按设计跳过，全部通过。，结论 `success`。
- 同一运行已上传 `c-path-browser-qa-screenshots` artifact，包含练习工作区、刷新恢复和运行器错误状态截图。
- 运行器测试真实覆盖：scanf 求和输出 `8`、公开样例 `2/2`、本地测试 `5/5`、编译错误、无限循环超时，以及 10 道原创题参考实现逐题本地测试通过。Firefox、WebKit 和真实移动 Safari/Chrome 仍为 `NOT_VERIFIED`。

E2E 覆盖首页 → 题库 → 搜索 → 打开练习、练习草稿刷新恢复，以及原创题真实 C 编译执行和失败状态。发布前仍应在具备 Chromium 的环境运行 `npx playwright install chromium` 后再次执行 `npm run test:e2e`。

Phase 6 视觉证据位于 `assets/screenshots/v0.3.0-phase6/`：亮色/暗色首页、390px 移动首页、题库、学习路线、练习工作台、运行成功和编译错误。截图由本地 Vite 应用和真实 Chromium 生成；Firefox、WebKit 和真实移动 Safari/Chrome 仍为 `NOT_VERIFIED`。

- Phase 6 本地截图：`assets/screenshots/v0.2.0-phase6/`，包含亮色首页、暗色首页、题库、练习工作台和移动端首页。
- Phase 6 新增正式题库审计：48 道原创题、240 组测试；C_PAT 38 条来源档案与正式练习分离。
