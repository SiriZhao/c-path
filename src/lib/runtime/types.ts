export type ExecutionStatus = 'OK' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'OUTPUT_LIMIT_EXCEEDED' | 'CANCELLED' | 'UNAVAILABLE'

export type ExecutionLimits = { timeoutMs: number; compileTimeoutMs: number; maxOutputBytes: number; maxInputBytes: number }
export type ExecutionResult = { status: ExecutionStatus; stdout: string; stderr: string; exitCode: number | null; compileDiagnostics: string; durationMs: number; detail?: string }

export interface CompilerAdapter {
  readonly id: string
  readonly available: boolean
  execute(source: string, input: string, limits: ExecutionLimits, signal?: AbortSignal): Promise<ExecutionResult>
}
