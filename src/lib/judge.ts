import type { CompilerAdapter, ExecutionLimits, ExecutionResult } from './runtime/types'

export type JudgeResult = ExecutionResult & { message: string }

export const DEFAULT_LIMITS: ExecutionLimits = { timeoutMs: 2000, maxInputBytes: 16_384, maxOutputBytes: 64_000 }

export class UnavailableCompilerAdapter implements CompilerAdapter {
  readonly id = 'unavailable'
  readonly available = false
  execute(_source: string, _input: string, _limits: ExecutionLimits): Promise<ExecutionResult> {
    return Promise.resolve({ status: 'UNAVAILABLE', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', durationMs: 0, detail: 'GitHub Pages 当前未配置浏览器端 C 编译器。' })
  }
}

export const compilerAdapter: CompilerAdapter = new UnavailableCompilerAdapter()

/**
 * GitHub Pages has no trusted compiler process. This adapter deliberately fails closed
 * until a reviewed WebAssembly compiler or server endpoint is configured.
 */
export function runCCode(source: string, input: string, limits = DEFAULT_LIMITS): Promise<JudgeResult> {
  return compilerAdapter.execute(source, input, limits).then(result => ({ ...result, message: result.status === 'UNAVAILABLE' ? '当前静态站点未配置 C 编译器。编辑器、保存和学习反馈可用；运行结果不会被伪造。' : result.status }))
}
