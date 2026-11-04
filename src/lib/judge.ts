export type JudgeResult = { status: 'UNAVAILABLE' | 'COMPILATION_ERROR'; message: string; detail?: string }

/**
 * GitHub Pages has no trusted compiler process. This adapter deliberately fails closed
 * until a reviewed WebAssembly compiler or server endpoint is configured.
 */
export function runCCode(_source: string, _input: string): Promise<JudgeResult> {
  return Promise.resolve({
    status: 'UNAVAILABLE',
    message: '当前静态站点未配置 C 编译器。编辑器、保存和学习反馈可用；运行结果不会被伪造。',
    detail: '要启用真实执行，需要接入经过审查的 WebAssembly 编译器或自托管评测服务。',
  })
}
