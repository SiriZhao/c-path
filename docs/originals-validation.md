# C·Path 原创题验证

本阶段新增 10 道 `orig-*` 原创基础练习，共 50 组本地测试。它们与 `pat-*` 本地导入题分开存储，题面、约束、样例、提示和参考实现均由 C·Path 维护者编写。

每道原创题的 `contentStatus` 是 `ready-for-local-judge`，表示数据结构和测试集合已准备好；它不等于浏览器端已经自动评测通过。

验证脚本：`python tools/validate_originals.py`。本机检测到 GCC 16.2.0，但当前 Windows 沙箱阻止 GCC 生成临时汇编和可执行文件，脚本实际返回编译失败且没有诊断。因此本轮没有宣称参考实现已通过独立编译验证；应在普通本机终端或 CI 编译环境重新运行脚本后再升级为 `tests-verified`。
