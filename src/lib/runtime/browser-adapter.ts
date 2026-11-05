import type { CompilerAdapter, ExecutionLimits, ExecutionResult } from './types'

type SandrunResult = {
  stdout: string
  stderr: string
  exitCode: number
  timedOut: boolean
  truncated: boolean
  durationMs: number
  error?: string
}

type SandrunRunner = {
  run(request: { language: 'c'; code: string; stdin: string }): Promise<SandrunResult>
  dispose?: () => void
}

type SandrunModule = {
  createRunner(options: {
    timeoutMs: number
    loadTimeoutMs: number
    maxOutputBytes: number
    c: 'xcc'
  }): SandrunRunner
}

let runnerPromise: Promise<SandrunRunner> | null = null

function runtimeUrl(): string {
  return new URL('sandrun/runner.js', document.baseURI).href
}

function getRunner(limits: ExecutionLimits): Promise<SandrunRunner> {
  runnerPromise ??= import(/* @vite-ignore */ runtimeUrl()).then(module => {
    const { createRunner } = module as SandrunModule
    return createRunner({
      timeoutMs: limits.timeoutMs,
      loadTimeoutMs: limits.compileTimeoutMs,
      maxOutputBytes: limits.maxOutputBytes,
      c: 'xcc',
    })
  })
  return runnerPromise
}

function classify(stderr: string, exitCode: number, error?: string): ExecutionResult['status'] {
  if (error) return 'UNAVAILABLE'
  if (stderr.includes('error:') && exitCode !== 0) return 'COMPILATION_ERROR'
  return exitCode === 0 ? 'OK' : 'RUNTIME_ERROR'
}

export class BrowserCompilerAdapter implements CompilerAdapter {
  readonly id = 'sandrun-xcc'
  readonly available = typeof Worker !== 'undefined' && typeof document !== 'undefined'
  async execute(source: string, input: string, limits: ExecutionLimits, signal?: AbortSignal): Promise<ExecutionResult> {
    if (!this.available) return Promise.resolve({ status: 'UNAVAILABLE', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: 0, detail: '当前浏览器不支持 Sandrun 所需的 Worker/iframe。' })
    if (new TextEncoder().encode(source).byteLength > 256_000) return Promise.resolve({ status: 'RUNTIME_ERROR', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: 0, detail: '源代码超过 256 KB 限制。' })
    if (new TextEncoder().encode(input).byteLength > limits.maxInputBytes) return Promise.resolve({ status: 'RUNTIME_ERROR', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: 0, detail: '输入超过限制。' })
    const startedAt = performance.now()
    const cancelled = new Promise<never>((_, reject) => signal?.addEventListener('abort', () => reject(new Error('CANCELLED')), { once: true }))
    const loading = getRunner(limits).then(activeRunner => activeRunner.run({ language: 'c', code: source, stdin: input }))
    const run = Promise.race([loading, cancelled])
    return run.then(result => {
      const status = result.timedOut ? 'TIME_LIMIT_EXCEEDED' : result.truncated ? 'OUTPUT_LIMIT_EXCEEDED' : classify(result.stderr, result.exitCode, result.error)
      return {
        status,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        compileDiagnostics: status === 'COMPILATION_ERROR' ? result.stderr : '',
        durationMs: result.durationMs ?? performance.now() - startedAt,
        detail: result.error ?? (result.timedOut ? '程序执行超时。' : result.truncated ? '输出超过限制。' : undefined),
      }
    }).catch(error => ({
      status: error instanceof Error && error.message !== 'CANCELLED' ? 'UNAVAILABLE' as const : 'CANCELLED' as const,
      stdout: '',
      stderr: '',
      exitCode: null,
      compileDiagnostics: '',
      durationMs: performance.now() - startedAt,
      detail: error instanceof Error ? error.message : '执行已取消。',
    }))
  }
}
