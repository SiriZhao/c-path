import type { CompilerAdapter, ExecutionLimits, ExecutionResult } from './types'

type WorkerReply = { requestId: string; type: 'phase' | 'result'; phase?: 'compiling' | 'running'; result?: ExecutionResult }

export class BrowserCompilerAdapter implements CompilerAdapter {
  readonly id = 'browsercc-wasi-worker'
  readonly available = typeof Worker !== 'undefined'

  execute(source: string, input: string, limits: ExecutionLimits, signal?: AbortSignal): Promise<ExecutionResult> {
    if (!this.available) return Promise.resolve({ status: 'UNAVAILABLE', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: 0, detail: '当前浏览器不支持 Web Worker。' })
    if (new TextEncoder().encode(source).byteLength > 256_000) return Promise.resolve({ status: 'RUNTIME_ERROR', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: 0, detail: '源代码超过 256 KB 限制。' })
    const requestId = crypto.randomUUID()
    const worker = new Worker(new URL('./browser-worker.ts', import.meta.url), { type: 'module' })
    const startedAt = performance.now()
    return new Promise(resolve => {
      let phase: 'compiling' | 'running' = 'compiling'
      let timer = window.setTimeout(() => finish({ status: 'TIME_LIMIT_EXCEEDED', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: performance.now() - startedAt, detail: `${phase === 'compiling' ? '编译' : '运行'}超时，Worker 已终止。` }), limits.compileTimeoutMs)
      const finish = (result: ExecutionResult) => { window.clearTimeout(timer); worker.terminate(); resolve(result) }
      const onAbort = () => finish({ status: 'CANCELLED', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: performance.now() - startedAt, detail: '用户取消了执行。' })
      signal?.addEventListener('abort', onAbort, { once: true })
      worker.onmessage = (event: MessageEvent<WorkerReply>) => {
        const message = event.data
        if (message.requestId !== requestId) return
        if (message.type === 'phase' && message.phase) {
          phase = message.phase
          window.clearTimeout(timer)
          timer = window.setTimeout(() => finish({ status: 'TIME_LIMIT_EXCEEDED', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: performance.now() - startedAt, detail: '程序超时，Worker 已终止。' }), phase === 'running' ? limits.timeoutMs : limits.compileTimeoutMs)
        }
        if (message.type === 'result' && message.result) finish({ ...message.result, durationMs: performance.now() - startedAt })
      }
      worker.onerror = event => finish({ status: 'RUNTIME_ERROR', stdout: '', stderr: event.message, exitCode: null, compileDiagnostics: '', durationMs: performance.now() - startedAt, detail: 'Worker 执行异常。' })
      worker.postMessage({ requestId, source, input, maxInputBytes: limits.maxInputBytes, maxOutputBytes: limits.maxOutputBytes })
    })
  }
}
