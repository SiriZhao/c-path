export const LANGUAGES = ["javascript", "typescript", "python", "sql", "postgres", "c", "cpp", "go", "java", "ruby"];
const ALIASES = {
    js: "javascript",
    mjs: "javascript",
    node: "javascript",
    ts: "typescript",
    py: "python",
    python3: "python",
    sqlite: "sql",
    sqlite3: "sql",
    postgresql: "postgres",
    pg: "postgres",
    pgsql: "postgres",
    psql: "postgres",
    plpgsql: "postgres",
    h: "c",
    "c++": "cpp",
    cc: "cpp",
    cxx: "cpp",
    hpp: "cpp",
    golang: "go",
    rb: "ruby",
};
/** Map a language name or file extension to a supported language, or null. */
export function normalizeLanguage(name) {
    const key = name.trim().toLowerCase();
    const lang = ALIASES[key] ?? key;
    return LANGUAGES.includes(lang) ? lang : null;
}
// Modules the MicroPython build ships with. Anything else (numpy, pandas,
// requests, ...) needs CPython, so the run goes to Pyodide instead.
const MICROPYTHON_MODULES = new Set([
    "array",
    "asyncio",
    "binascii",
    "builtins",
    "collections",
    "errno",
    "gc",
    "hashlib",
    "heapq",
    "io",
    "json",
    "math",
    "micropython",
    "os",
    "random",
    "re",
    "select",
    "struct",
    "sys",
    "time",
]);
/** Top-level module names imported by a Python snippet. */
export function pythonImports(code) {
    const names = new Set();
    for (const line of code.split("\n")) {
        const from = /^\s*from\s+([\w.]+)\s+import\b/.exec(line);
        if (from) {
            names.add(from[1].split(".")[0]);
            continue;
        }
        const imp = /^\s*import\s+(.+)$/.exec(line);
        if (!imp)
            continue;
        for (const part of imp[1].split(",")) {
            const mod = part.trim().split(/\s+/)[0];
            if (mod)
                names.add(mod.split(".")[0]);
        }
    }
    return [...names];
}
/**
 * Pick the engine for a language, preferring the smallest one that can run the
 * code. `fileNames` are the files of a multi-file run; imports of those files
 * don't count as library imports.
 */
export function selectEngine(language, code, options = {}, fileNames = []) {
    switch (language) {
        case "python": {
            const mode = options.python ?? "auto";
            if (mode !== "auto")
                return mode;
            const local = new Set(fileNames.map((n) => n.replace(/\.py$/, "")));
            return pythonImports(code).some((m) => !MICROPYTHON_MODULES.has(m) && !local.has(m)) ? "pyodide" : "micropython";
        }
        case "c":
            // xcc compiles a single file.
            return options.c === "clang" || fileNames.length > 1 ? "c" : "xcc";
        case "ruby": {
            const mode = options.ruby ?? "auto";
            if (mode === "mruby")
                return "mruby";
            if (mode === "cruby")
                return "ruby";
            // Loading a library needs CRuby; require_relative of another file in the
            // run works in both.
            return /^\s*require\b/m.test(code) ? "ruby" : "mruby";
        }
        default:
            return language;
    }
}
//# sourceMappingURL=languages.js.map