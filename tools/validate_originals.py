"""Compile and execute every C·Path original with a local GCC toolchain."""
from __future__ import annotations
import json, shutil, subprocess
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main() -> None:
    compiler = shutil.which("gcc") or shutil.which("clang")
    if not compiler:
        raise SystemExit("No gcc or clang found; originals are NOT_VERIFIED")
    originals = json.loads((ROOT / "src/data/originals.json").read_text(encoding="utf-8")) + json.loads((ROOT / "src/data/originals-phase6.json").read_text(encoding="utf-8"))
    failures = []
    work = ROOT / ".validation-tmp"
    if work.exists():
        shutil.rmtree(work, ignore_errors=True)
    work.mkdir(parents=True, exist_ok=True)
    try:
        env = {**os.environ, "TMP": str(work), "TEMP": str(work), "TMPDIR": str(work)}
        for item in originals:
            source = work / f"{item['id']}.c"
            binary = work / f"{item['id']}.exe"
            source.write_text(item["referenceSolution"], encoding="utf-8")
            compile_result = subprocess.run([compiler, str(source), "-std=c11", "-O0", "-Wall", "-Wextra", "-o", str(binary)], capture_output=True, text=True, timeout=20, env=env)
            if compile_result.returncode != 0:
                failures.append((item["id"], "compile", f"returncode={compile_result.returncode} stdout={compile_result.stdout!r} stderr={compile_result.stderr!r}"))
                continue
            for case in item["testCases"]:
                run = subprocess.run([str(binary)], input=case["input"], capture_output=True, text=True, timeout=2, env=env)
                if run.returncode != 0 or run.stdout.replace("\r\n", "\n") != case["expectedOutput"].replace("\r\n", "\n"):
                    failures.append((item["id"], case["id"], f"exit={run.returncode} stdout={run.stdout!r} stderr={run.stderr!r} expected={case['expectedOutput']!r}"))
    finally:
        shutil.rmtree(work, ignore_errors=True)
    if failures:
        for failure in failures:
            print("FAIL", failure)
        raise SystemExit(1)
    print(f"Validated {len(originals)} original solutions and {sum(len(item['testCases']) for item in originals)} test cases with {compiler}")

if __name__ == "__main__":
    main()
