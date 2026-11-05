import { frameMain } from "./frame.js";
import { normalizeLanguage, selectEngine } from "./languages.js";
import { VERSION } from "./version.js";
import { workerMain } from "./worker.js";
export const DEFAULT_RUNTIMES = {
    sucrase: `https://cdn.jsdelivr.net/npm/@browserrun/sandrun@${VERSION}/dist/runtimes/sucrase.js`,
    micropython: "https://cdn.jsdelivr.net/npm/@micropython/micropython-webassembly-pyscript@1.29.0-6/",
    pyodide: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/",
    sqljs: "https://cdn.jsdelivr.net/npm/sql.js@1.15.2/dist/",
    pglitejs: `https://cdn.jsdelivr.net/npm/@browserrun/sandrun@${VERSION}/dist/runtimes/pglite.js`,
    pglite: "https://cdn.jsdelivr.net/npm/@electric-sql/pglite@0.5.13/",
    wasi: `https://cdn.jsdelivr.net/npm/@browserrun/sandrun@${VERSION}/dist/runtimes/wasi.js`,
    xccjs: `https://cdn.jsdelivr.net/npm/@browserrun/sandrun@${VERSION}/dist/runtimes/xcc.js`,
    xcc: "https://cdn.jsdelivr.net/npm/@basthon/xcc-wasm@0.1.0/",
    clang: "https://cdn.jsdelivr.net/npm/@browserrun/clang@0.1.1/",
    go: "https://cdn.jsdelivr.net/npm/@browserrun/go@0.1.0/",
    java: "https://cdn.jsdelivr.net/npm/@browserrun/java@0.1.0/",
    mrubyjs: `https://cdn.jsdelivr.net/npm/@browserrun/sandrun@${VERSION}/dist/runtimes/mruby.js`,
    mruby: "https://cdn.jsdelivr.net/npm/@takahashim/mruby-wasm-js@0.2.0/",
    rubyjs: "https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@2.10.1/",
    ruby: "https://cdn.jsdelivr.net/npm/@ruby/3.4-wasm-wasi@2.10.1/",
};
function originOf(url) {
    return new URL(url).origin;
}
function buildFrameDocument(runtimes) {
    const origins = [...new Set(Object.values(runtimes).map(originOf))].join(" ");
    // 'unsafe-eval' covers user JavaScript and WebAssembly compilation; network
    // access is limited to the runtime hosts.
    const csp = [
        "default-src 'none'",
        `script-src 'unsafe-inline' 'unsafe-eval' blob: ${origins}`,
        "worker-src blob:",
        `connect-src ${origins}`,
    ].join("; ");
    const workerSource = `(${workerMain.toString()})()`;
    const script = `(${frameMain.toString()})(${JSON.stringify(workerSource).replace(/</g, "\\u003c")})`;
    return `<!doctype html><meta http-equiv="Content-Security-Policy" content="${csp}"><script>${script}</script>`;
}
/** Create a runner. The sandbox iframe is created lazily on the first run. */
export function createRunner(options = {}) {
    const runtimes = { ...DEFAULT_RUNTIMES, ...options.runtimes };
    const pending = new Map();
    let frame = null;
    let ready = null;
    let nextId = 0;
    const downloads = new Map();
    const onMessage = (event) => {
        if (!frame || event.source !== frame.contentWindow)
            return;
        const msg = event.data;
        if (msg?.type === "progress") {
            const files = downloads.get(msg.engine) ?? new Map();
            downloads.set(msg.engine, files);
            files.set(msg.url, { loaded: msg.loaded, total: msg.total });
            let loaded = 0;
            let total = 0;
            for (const f of files.values()) {
                loaded += f.loaded;
                total += f.total;
            }
            options.onProgress?.({ engine: msg.engine, loaded, total });
            return;
        }
        const run = pending.get(msg?.id);
        if (!run)
            return;
        if (msg.type === "output") {
            run[msg.stream] += msg.text;
            run.onOutput?.(msg.stream, msg.text);
        }
        else if (msg.type === "done") {
            pending.delete(msg.id);
            run.resolve({
                stdout: run.stdout,
                stderr: run.stderr,
                exitCode: msg.exitCode,
                timedOut: msg.timedOut,
                truncated: msg.truncated,
                durationMs: msg.durationMs,
                engine: run.engine,
                ...(msg.error ? { error: msg.error } : {}),
            });
        }
    };
    const ensureFrame = () => {
        if (ready)
            return ready;
        ready = new Promise((resolve) => {
            const el = document.createElement("iframe");
            el.setAttribute("sandbox", "allow-scripts");
            el.setAttribute("aria-hidden", "true");
            el.tabIndex = -1;
            el.style.display = "none";
            const onReady = (event) => {
                if (event.source === el.contentWindow && event.data?.type === "frame-ready") {
                    window.removeEventListener("message", onReady);
                    resolve();
                }
            };
            window.addEventListener("message", onReady);
            window.addEventListener("message", onMessage);
            el.srcdoc = buildFrameDocument(runtimes);
            (options.container ?? document.body).appendChild(el);
            frame = el;
        });
        return ready;
    };
    return {
        async run(request) {
            const language = normalizeLanguage(request.language);
            if (!language)
                throw new Error(`Unsupported language: ${request.language}`);
            const files = request.files?.length
                ? request.files
                : [{ name: "", content: request.code ?? "" }];
            const names = files.map((f) => f.name);
            const engine = selectEngine(language, files.map((f) => f.content).join("\n"), options, names);
            await ensureFrame();
            const id = String(nextId++);
            return new Promise((resolve) => {
                pending.set(id, { engine, stdout: "", stderr: "", onOutput: request.onOutput, resolve });
                frame.contentWindow.postMessage({
                    type: "run",
                    id,
                    engine,
                    code: files[0].content,
                    files,
                    stdin: request.stdin ?? "",
                    runtimes,
                    timeoutMs: options.timeoutMs ?? 10_000,
                    loadTimeoutMs: options.loadTimeoutMs ?? 120_000,
                    maxOutputBytes: options.maxOutputBytes ?? 65_536,
                }, "*");
            });
        },
        preload(language, code = "") {
            const lang = normalizeLanguage(language);
            if (!lang)
                return;
            const engine = selectEngine(lang, code, options);
            ensureFrame().then(() => frame?.contentWindow?.postMessage({ type: "preload", engine, runtimes }, "*"));
        },
        dispose() {
            window.removeEventListener("message", onMessage);
            frame?.remove();
            frame = null;
            ready = null;
            for (const [id, run] of pending) {
                pending.delete(id);
                run.resolve({
                    stdout: run.stdout,
                    stderr: run.stderr,
                    exitCode: 1,
                    timedOut: false,
                    truncated: false,
                    durationMs: 0,
                    engine: run.engine,
                    error: "Runner disposed",
                });
            }
        },
    };
}
//# sourceMappingURL=runner.js.map