# C·Path 原创题验证

本阶段新增 10 道 `orig-*` 原创基础练习，共 50 组本地测试。它们与 `pat-*` 本地导入题分开存储，题面、约束、样例、提示和参考实现均由 C·Path 维护者编写。

每道原创题的 `contentStatus` 是 `tests-verified`，表示参考实现已经在独立 Ubuntu GCC CI 中编译并执行全部测试；它不等于浏览器端已经自动评测通过。

验证脚本：`python tools/validate_originals.py`。GitHub Actions 运行 `41963775111` 已使用 Ubuntu GCC 验证 10 个参考实现和 50 组测试，结论成功。本机检测到 GCC 16.2.0，但当前 Windows 沙箱仍阻止 GCC 生成临时汇编和可执行文件；这不影响 CI 证据，也不代表浏览器端已接入编译器。
