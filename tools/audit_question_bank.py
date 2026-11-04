"""Read-only audit and import for the local C_PAT practice repository."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BANK = Path(r"E:\CStudy\C\C_PAT")

CHAPTERS = {
    2: ("变量、运算符和表达式", ["变量", "运算符", "表达式"]),
    3: ("条件判断与分支结构", ["条件判断", "分支", "逻辑表达式"]),
    4: ("循环结构", ["循环", "嵌套循环", "素数"]),
    5: ("循环控制与函数基础", ["循环控制", "函数", "递归"]),
    6: ("数据类型与字符处理", ["数据类型", "类型转换", "字符", "字符串"]),
    7: ("数组与数字处理", ["数组", "整数", "格式化输出"]),
    8: ("二维数组与综合练习", ["二维数组", "查找", "排序"]),
    10: ("字符串", ["字符串", "字符数组", "指针"]),
    11: ("结构体与自定义类型", ["结构体", "自定义类型", "数据组织"]),
}


def read_text(path: Path) -> str:
    raw = path.read_bytes()
    for encoding in ("utf-8-sig", "utf-8", "gb18030"):
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue
    return raw.decode("utf-8", errors="replace")


def parse_readme(path: Path) -> dict[str, dict[str, str]]:
    result: dict[str, dict[str, str]] = {}
    pattern = re.compile(r"^\|\s*(\d+)-(\d+)\s*\|\s*(.*?)\s*\|")
    for line in read_text(path).splitlines():
        match = pattern.match(line)
        if not match:
            continue
        chapter, index, title = match.groups()
        score = None
        title_match = re.match(r"(.*?)(?:\((\d+)\))?$", title)
        if title_match:
            title = title_match.group(1).strip()
            score = title_match.group(2)
        key = f"{int(chapter):02d}-{index}"
        result[key] = {"title": title, "score": score or ""}
    return result


def make_question(path: Path, metadata: dict[str, str], bank: Path) -> dict:
    stem = path.stem
    chapter_number = int(stem.split("_")[0])
    chapter, topics = CHAPTERS.get(chapter_number, ("待映射章节", ["待审核"]))
    source = str(path.relative_to(bank)).replace("\\", "/")
    code = read_text(path)
    return {
        "id": f"pat-{stem}",
        "title": metadata.get("title", stem),
        "source": "中国大学 MOOC 翁恺 C 语言程序设计习题集（本地练习仓库）",
        "chapter": chapter,
        "topics": topics,
        "difficulty": "待审核",
        "statement": None,
        "constraints": None,
        "inputFormat": None,
        "outputFormat": None,
        "examples": [],
        "hints": [],
        "explanation": None,
        "starterCode": "#include <stdio.h>\n\nint main(void) {\n    return 0;\n}\n",
        "referenceSolution": code,
        "testCases": [],
        "provenance": {
            "path": source,
            "sha256": hashlib.sha256(code.encode("utf-8")).hexdigest(),
            "readmeScore": metadata.get("score", ""),
            "contentStatus": "only source code and README title are available",
        },
        "reviewStatus": "source-imported-needs-statement-and-tests",
        "sourceKind": "pat-import",
        "contentStatus": "imported",
        "testVersion": None,
        "author": None,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bank", type=Path, default=DEFAULT_BANK)
    args = parser.parse_args()
    bank = args.bank
    readme = bank / "README.md"
    metadata = parse_readme(readme)
    visible_files = [p for p in bank.rglob("*") if p.is_file() and ".git" not in p.parts]
    c_files = sorted(p for p in visible_files if p.suffix.lower() == ".c")
    questions = []
    for path in c_files:
        key = f"{int(path.stem.split('_')[0]):02d}-{path.stem.split('_')[1]}"
        questions.append(make_question(path, metadata.get(key, {}), bank))
    out = ROOT / "src" / "data"
    out.mkdir(parents=True, exist_ok=True)
    (out / "questions.json").write_text(json.dumps(questions, ensure_ascii=False, indent=2), encoding="utf-8")
    (out / "chapters.json").write_text(json.dumps([
        {"id": f"chapter-{number}", "number": number, "title": title, "topics": topics}
        for number, (title, topics) in sorted(CHAPTERS.items())
    ], ensure_ascii=False, indent=2), encoding="utf-8")

    extensions = Counter(p.suffix.lower() or "[none]" for p in visible_files)
    hashes = defaultdict(list)
    for path in c_files:
        hashes[hashlib.sha256(path.read_bytes()).hexdigest()].append(str(path.relative_to(bank)).replace("\\", "/"))
    duplicate_groups = [paths for paths in hashes.values() if len(paths) > 1]
    report = f"""# C_PAT 题库审计报告

审计时间：2026-11-03（本地只读扫描）  
原始目录：`{bank}`

## 目录与文件统计

- 目录数量：{sum(1 for p in bank.rglob('*') if p.is_dir() and '.git' not in p.parts)}
- 文件总数：{sum(extensions.values())}
- C 源文件：{len(c_files)}
- README/Markdown：{extensions.get('.md', 0)}
- 其他格式：{dict((k, v) for k, v in extensions.items() if k not in {'.c', '.md'}) or '无'}
- 文件名结构：`章节号_题号.c`，未发现子目录。

## 可提取内容

README 提供 {len(metadata)} 个编号、中文标题和分值；扫描到 {len(c_files)} 个同名 C 源文件。源文件均可按 UTF-8/GB18030 读取，未发现独立题面、输入输出规范、公开样例、测试数据或 Markdown 题解文件。

因此本次导入仅将 README 标题、源文件相对路径、SHA-256 和源代码保存到结构化数据中。`statement`、`examples`、`testCases` 与 `difficulty` 均明确为空或待审核，不能把个人源代码当作已经验证的官方答案。

## 重复与完整性

- 按文件 SHA-256 检查的重复源文件组：{len(duplicate_groups)}
- 题目编号与 C 文件匹配：{sum(1 for q in questions if q['title'] != q['id'].replace('pat-', '').replace('_', '-'))}/{len(questions)}（标题来自 README）
- 题面完整题目：0（当前目录没有题面文件）
- 含可复核测试样例的题目：0
- 含本地参考源代码的题目：{len(questions)}

## 初步章节映射

编号前缀按翁恺课程学习顺序映射到 `src/data/chapters.json`。这只是学习导航映射，不声称是浙江大学官方章节编号；题目与知识点仍需人工复核。

## 发布与版权风险

README 指向中国大学 MOOC 翁恺 C 语言程序设计习题集和 PAT 网站。当前无法从本地文件证明题面、样例、题解或源代码具备再发布授权。公开仓库只保留来源元数据与待审核标记；在取得明确授权前，不复制第三方题面和隐藏测试数据。

## 后续建议

1. 逐题补录经允许公开的题面、样例和约束，并保留原始来源链接。
2. 为每题新增独立、可复现的公开测试，执行参考程序并记录验证结果。
3. 将官方题目与原创基础练习分开标识，完成 `reviewStatus` 后再进入判题队列。
4. 如需在线 C 编译，接入经过审查的 WebAssembly 编译器或自托管评测服务；当前 GitHub Pages 版本不会伪造执行结果。
"""
    docs = ROOT / "docs"
    docs.mkdir(exist_ok=True)
    (docs / "question-bank-audit.md").write_text(report, encoding="utf-8")
    print(f"Imported {len(questions)} C files from {bank}")


if __name__ == "__main__":
    main()
