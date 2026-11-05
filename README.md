# C·Path

**Learn C by Doing.** C·Path 是一个面向 C 语言初学者的开源学习工作台：用课程地图组织概念，用本地题库记录练习，用浏览器本地存储保留自己的学习轨迹。

> 本项目是独立学习辅助工具，与翁恺老师、浙江大学、中国大学 MOOC 或 PAT 官方平台没有官方关联。当前导入的本地 C_PAT 仓库只包含 README 标题和个人 C 源文件；题面、样例和测试数据缺失的题目会保持“待补录”状态。

## 当前版本

已经可用：课程地图、题库搜索与过滤、练习工作区、代码自动保存、版本化学习记录、最近练习、原创基础题、题目状态筛选、主题切换、导出导入接口，以及真实题库审计报告。原创题还支持浏览器内真实 C 编译、stdin、stdout/stderr、公开样例和本地测试比较。

在线地址：<https://sirizhao.github.io/c-path/>。部署由 GitHub Actions 完成，浏览器验收由独立的 Chromium 工作流执行。

明确边界：运行器使用 `@browserrun/sandrun@0.4.0` 的 xcc WebAssembly C 引擎，在浏览器沙箱 iframe + Worker 中执行。它支持常见 C99/C11 语法、stdio 输入输出、超时和输出上限；结果是本地执行和本地测试通过，不等同于服务器隐藏测试或防作弊 Accepted。38 道 C_PAT 来源记录仍没有被补写成官方题面，也不会因为有源码就自动判题。

运行器评估记录见 [`docs/runtime-evaluation.md`](docs/runtime-evaluation.md)。当前题库数据会在应用启动时进行 Schema 校验，导入的学习记录会按版本和字段类型清洗。

原创题验证边界见 [`docs/originals-validation.md`](docs/originals-validation.md)。C_PAT 导入题仍然保持题面待补录状态，不会因为存在源代码就被标记为可评测。

## 本地开发

```bash
npm install
npm run audit:bank
npm run typecheck
npm run test
npm run dev
```

题库导入脚本默认读取 `E:\CStudy\C\C_PAT`，也可传入 `python tools/audit_question_bank.py --bank <path>`。它只读原始目录，将结构化数据写入 `src/data/`，同时更新 `docs/question-bank-audit.md`。

## 目录

- `src/main.tsx`：页面路由、工作台、课程、题库和练习页
- `src/styles.css`：响应式设计系统与深浅主题
- `src/lib/storage.ts`：版本化 LocalStorage 学习记录
- `src/lib/judge.ts`：运行和本地测试适配器
- `public/sandrun/`：按需加载的 sandrun MIT 运行时模块
- `src/data/questions.json`：由审计脚本生成的 38 条来源记录
- `docs/question-bank-audit.md`：真实扫描结果与发布风险
- `tools/audit_question_bank.py`：题库只读审计和导入脚本

## 贡献题目

新增题目时请提供合法来源、完整题面、输入输出说明、公开样例、可复现测试和参考实现。第三方题目版权不因本项目的代码许可证自动转移；无法确认发布授权的内容只进入本地审计，不进入公开数据。

## 许可证

代码采用 MIT License。题目、源代码和其他第三方材料仍受其原始许可和版权约束。
