# C 运行器技术评估

评估日期：2026-11-05

## 结论

当前版本已接入经过实际 Chromium CI 验证的浏览器端 C 运行器：`@browserrun/sandrun@0.4.0` 的 xcc 引擎。代码在沙箱 iframe 内的 Worker 中编译和执行，练习页会显示真实 stdout、stderr、退出码、耗时、编译错误、超时和输出上限状态。它仍然是本地测试，不提供服务器隐藏测试或防作弊 Accepted。

## 调研结果

本阶段对指定候选进行了源码和项目说明核查：

- [TraceCC](https://github.com/tracecodeapp/tracecc) 确实把 Clang/LLVM 编译为浏览器内 WASM，支持 C17/C++23 到 WASI 模块，但项目明确说明它只负责编译，不负责执行生成的模块；需要应用自行提供 Worker、WASI host 和沙箱。仓库当前标注 AGPL-3.0，且 API/工具链仍为 pre-release。
- [Derle](https://github.com/senolgulgonul/derle) 是最接近 C·Path 目标的完整参考实现：Clang 18、lld、wasi-libc 在浏览器内运行，使用 Worker 和 WASI shim 桥接 stdin/stdout/stderr，并有 10 秒 runaway guard；项目说明首次工具链下载约 23 MB 压缩包，并公开记录 LLVM/wasi-libc 许可证。
- [browsercc](https://github.com/BertalanD/browsercc) 提供 MIT 许可的浏览器 Clang/LLVM 编译接口，产出 WASI 模块，通常需要配合 `@bjorn3/browser_wasi_shim` 执行；仓库说明 npm 包包含预编译工具链，LLVM 体积仍然是主要成本。

- Emscripten 官方文档确认 C/C++ 可以通过 LLVM 编译为 WebAssembly，但需要把编译工具链和运行时资源作为产品的一部分交付。[Emscripten WebAssembly 文档](https://emscripten.org/docs/compiling/WebAssembly.html)
- Wasmer JavaScript SDK 提供浏览器入口、WASI 沙箱、stdin/stdout 和 Web Worker 支持，但浏览器入口要求 HTTPS、`SharedArrayBuffer` 和跨源隔离响应头（COOP/COEP）。[Wasmer JavaScript SDK 文档](https://docs.wasmer.io/runtime/js/)
- GitHub Pages 项目站点不能由仓库工作流直接设置这些响应头；可以依赖 service worker 进行跨源隔离，但这会增加首次加载、缓存、兼容性和故障恢复的工程面，且需要验证 SDK 包下载与许可证。

## 当前不接入的原因

本仓库尚未锁定第三方工具链版本、分发许可证文件、WASM 资源哈希、Worker 协议、超时终止测试或移动端兼容性证据。当前环境的 GCC 验证也因 Windows 沙箱阻止编译器生成临时/可执行文件而未完成。现在接入会让页面看似可运行，却无法证明 C11、scanf、stderr、无限循环终止和移动端兼容性。保留 fail-closed 状态更符合证据边界。

Phase 5 先验证了 `browsercc@0.1.1`：真实 Chromium 能加载页面，但 180 秒内没有回传 C 编译结果，因此没有继续使用。随后切换到 `@browserrun/sandrun@0.4.0` 的 xcc C 引擎：默认运行时约 0.4 MB，使用 opaque-origin iframe + Worker，提供 stdin/stdout、超时、输出上限和运行时缓存。为避免 Vite 改写沙箱 Worker 内的动态导入，sandrun 的 MIT 许可运行时模块以静态资产复制到 `public/sandrun/`，主应用只按需加载入口。CI 运行号 `41983805318` 已真实验证 scanf 求和、公开样例 2/2、本地测试 5/5、编译错误和无限循环超时。

## 后续接入路线

1. 继续补充 xcc 与 GCC 的差异测试，特别是 `string.h`、`math.h` 和未定义行为提示。
2. 在独立实验分支评估 sandrun 的 clang 引擎，只有在包体积和移动端兼容性可接受时才启用。
3. 在 GitHub Pages 真站验证首次下载、缓存失效和慢网恢复，并增加 Firefox/WebKit 证据。
4. 对真实运行器增加取消任务和连续运行的浏览器测试，避免旧结果覆盖新结果。
