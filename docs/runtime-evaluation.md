# C 运行器技术评估

评估日期：2026-11-04

## 结论

当前版本继续保持 `UNAVAILABLE`，没有把第三方公共执行服务接入生产页面。`src/lib/judge.ts` 已保留适配器边界，页面会明确告诉学习者没有可信编译器，不会伪造输出或 Accepted。

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

## 后续接入路线

1. 在独立实验分支固定 Emscripten 或 Wasmer 版本，并核对许可证与包体积。
2. 用 Worker + 可终止执行实例实现 `compile`、`run`、`timeout`、`stderr` 和退出码协议。
3. 用最小 C 程序覆盖 `printf`、`scanf`、循环、数组、函数和字符串，保存真实输出证据。
4. 在 GitHub Pages 预览环境验证 COOP/COEP、service worker 首次加载和移动浏览器行为。
5. 只有通过这些检查后，才将 `UNAVAILABLE` 替换成真实状态，并为具备测试数据的题目启用比较器。
