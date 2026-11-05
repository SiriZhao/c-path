# 部署状态

截至 2026-11-05，项目已发布到 GitHub Pages，Phase 5 功能分支的构建和浏览器验收均已通过。

- `vite.config.ts` 已设置项目路径 `/c-path/`。
- `.github/workflows/pages.yml` 已提供类型检查、测试、构建和 Pages 部署工作流。
- 已在项目目录创建独立 `.git`，目标远程明确为 `https://github.com/SiriZhao/c-path.git`。
- 目标仓库为 `https://github.com/SiriZhao/c-path.git`，项目目录保持独立 Git 历史。
- GitHub Pages 已通过 API 配置为 `build_type=workflow`。
- 第二次 Actions 运行 `41838809277` 的 build 和 deploy 均成功。
- Pages deployment `7547327461` 状态为 `success`，环境 URL 为 `https://sirizhao.github.io/c-path/`。
- 最新提交 `86e98fb` 的 Pages 工作流 `41845936251` 和 Browser QA 工作流 `41845936087` 均成功。
- 合并提交 `af5b85d8b643ee1d3f5730896989680fc51129ce` 的 Pages 工作流 `41999871779`、Browser QA 工作流 `41999871766` 和原创题验证工作流 `41999871745` 均成功。
- 运行器浏览器验收真实覆盖 C scanf 求和、样例和本地测试，在线产物包含 `public/sandrun/` 静态运行时入口。
- 本机 PowerShell/curl 的 HTTPS 请求受 Windows Schannel 凭据错误影响，未将本机请求冒充线上浏览器验证；GitHub deployment 状态已由 API 复核。

## 后续发布

1. 将 Phase 5 分支通过 PR 合并到 `main`，等待新的 Pages 部署完成。
2. 合并后检查 `https://sirizhao.github.io/c-path/`、刷新深链接和首次运行器加载。
3. 若仓库发生并发变化，先比较远程历史，禁止强推覆盖。
