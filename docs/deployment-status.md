# 部署状态

截至 2026-11-06，项目已发布到 GitHub Pages，Phase 6 产品体验和正式题库升级已合并。

- `vite.config.ts` 已设置项目路径 `/c-path/`。
- `.github/workflows/pages.yml` 已提供类型检查、测试、构建和 Pages 部署工作流。
- 已在项目目录创建独立 `.git`，目标远程明确为 `https://github.com/SiriZhao/c-path.git`。
- 目标仓库为 `https://github.com/SiriZhao/c-path.git`，项目目录保持独立 Git 历史。
- GitHub Pages 已通过 API 配置为 `build_type=workflow`。
- 第二次 Actions 运行 `41838809277` 的 build 和 deploy 均成功。
- Pages deployment `7547327461` 状态为 `success`，环境 URL 为 `https://sirizhao.github.io/c-path/`。
- 当前 main 提交 `84c166b54ed5b924bcb775a635122f346661c38b` 的 Pages 工作流 `42132387957`、Browser QA 工作流 `42132388288` 和原创题验证工作流 `42132387902` 均成功。
- 运行器浏览器验收真实覆盖 C scanf 求和、样例和本地测试，在线产物包含 `public/sandrun/` 静态运行时入口。
- 本机 PowerShell/curl 的 HTTPS 请求受 Windows Schannel 凭据错误影响，未将本机请求冒充线上浏览器验证；GitHub deployment 状态已由 API 复核。

## 后续发布

1. 继续通过 PR 维护 `main`，保持题库、运行器和截图证据同步。
2. 每次发布后检查 `https://sirizhao.github.io/c-path/`、刷新深链接和首次运行器加载。
3. 若仓库发生并发变化，先比较远程历史，禁止强推覆盖。

- Phase 6 正式题库：48 道 C·Path 原创题、240 组本地测试；C_PAT 38 条来源档案单独保留。
- 最新公开 smoke test：线上练习页真实运行 `3 5`，返回 stdout `8`，状态 `OK`。
