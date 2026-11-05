import { createRunner, type Runner } from '@browserrun/sandrun'
import type { CompilerAdapter, ExecutionLimits, ExecutionResult } from './types'

let runner: Runner | null = null
function getRunner(limits: ExecutionLimits): Runner { runner ??= createRunner({ timeoutMs: limits.timeoutMs, loadTimeoutMs: limits.compileTimeoutMs, maxOutputBytes: limits.maxOutputBytes, c: 'xcc' }); return runner }
function classify(stderr: string, exitCode: number, error?: string): ExecutionResult['status'] { if (error) return 'UNAVAILABLE'; if (stderr.includes('error:') && exitCode !== 0) return 'COMPILATION_ERROR'; return exitCode === 0 ? 'OK' : 'RUNTIME_ERROR' }

export class BrowserCompilerAdapter implements CompilerAdapter {
  readonly id = 'sandrun-xcc'
  readonly available = typeof Worker !== 'undefined' && typeof document !== 'undefined'
  execute(source: string, input: string, limits: ExecutionLimits, signal?: AbortSignal): Promise<ExecutionResult> {
    if (!this.available) return Promise.resolve({ status: 'UNAVAILABLE', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: 0, detail: '当前浏览器不支持 Sandrun 所需的 Worker/iframe。' })
    if (new TextEncoder().encode(source).byteLength > 256_000) return Promise.resolve({ status: 'RUNTIME_ERROR', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: 0, detail: '源代码超过 256 KB 限制。' })
    if (new TextEncoder().encode(input).byteLength > limits.maxInputBytes) return Promise.resolve({ status: 'RUNTIME_ERROR', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: 0, detail: '输入超过限制。' })
    const startedAt = performance.now()
    const run = getRunner(limits).run({ language: 'c', code: source, stdin: input })
    const cancelled = new Promise<never>((_, reject) => signal?.addEventListener('abort', () => reject(new Error('CANCELLED')), { once: true }))
    return Promise.race([run, cancelled]).then(result => { const status = result.timedOut ? 'TIME_LIMIT_EXCEEDED' : result.truncated ? 'OUTPUT_LIMIT_EXCEEDED' : classify(result.stderr, result.exitCode, result.error); return { status, stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode, compileDiagnostics: status === 'COMPILATION_ERROR' ? result.stderr : '', durationMs: result.durationMs ?? performance.now() - startedAt, detail: result.error ?? (result.timedOut ? '程序执行超时。' : result.truncated ? '输出超过限制。' : undefined) } }).catch(error => ({ status: 'CANCELLED' as const, stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: performance.now() - startedAt, detail: error instanceof Error ? error.message : '执行已取消。' }))
  }
}
