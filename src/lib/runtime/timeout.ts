export function withTimeout<T>(task: (signal: AbortSignal) => Promise<T>, timeoutMs: number): Promise<T> {
  const controller = new AbortController()
  return new Promise<T>((resolve, reject) => {
    const timer = globalThis.setTimeout(() => { controller.abort(); reject(new Error('TIME_LIMIT_EXCEEDED')) }, timeoutMs)
    task(controller.signal).then(resolve, reject).finally(() => globalThis.clearTimeout(timer))
  })
}
