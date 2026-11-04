# C·Path

**Learn C by Doing.** C·Path 是一个面向 C 语言初学者的开源学习工作台：用课程地图组织概念，用本地题库记录练习，用浏览器本地存储保留自己的学习轨迹。

> 本项目是独立学习辅助工具，与翁恺老师、浙江大学、中国大学 MOOC 或 PAT 官方平台没有官方关联。当前导入的本地 C_PAT 仓库只包含 README 标题和个人 C 源文件；题面、样例和测试数据缺失的题目会保持“待补录”状态。

## 当前版本

已经可用：课程地图、题库搜索与过滤、练习工作区、代码自动保存、学习记录、主题切换、错题/完成状态基础记录、导出导入接口，以及真实题库审计报告。

明确边界：GitHub Pages 没有可信的编译器进程。当前练习页不会用关键词或预设输出伪造 Accepted；点击“运行”会如实显示 `UNAVAILABLE`。要启用真实执行，需要后续接入经审查的 WebAssembly C 编译器或自托管评测服务，并补齐每题的公开测试。

运行器评估记录见 [`docs/runtime-evaluation.md`](docs/runtime-evaluation.md)。当前题库数据会在应用启动时进行 Schema 校验，导入的学习记录会按版本和字段类型清洗。

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
- `src/lib/judge.ts`：判题适配器，当前 fail-closed
- `src/data/questions.json`：由审计脚本生成的 38 条来源记录
- `docs/question-bank-audit.md`：真实扫描结果与发布风险
- `tools/audit_question_bank.py`：题库只读审计和导入脚本

## 贡献题目

新增题目时请提供合法来源、完整题面、输入输出说明、公开样例、可复现测试和参考实现。第三方题目版权不因本项目的代码许可证自动转移；无法确认发布授权的内容只进入本地审计，不进入公开数据。

## 许可证

代码采用 MIT License。题目、源代码和其他第三方材料仍受其原始许可和版权约束。
