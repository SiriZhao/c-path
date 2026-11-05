import { compile } from 'browsercc'
import { ConsoleStdout, File, OpenFile, WASI, WASIProcExit } from '@bjorn3/browser_wasi_shim'

type WorkerRequest = { requestId: string; source: string; input: string; maxInputBytes: number; maxOutputBytes: number }
type WorkerMessage = { requestId: string; type: 'phase' | 'result'; phase?: 'compiling' | 'running'; result?: { status: string; stdout: string; stderr: string; exitCode: number | null; compileDiagnostics: string; detail?: string } }

const workerSelf = self as unknown as { onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null; postMessage: (message: WorkerMessage) => void }
const encoder = new TextEncoder()

workerSelf.onmessage = async (event) => {
  const request = event.data
  const sendPhase = (phase: 'compiling' | 'running') => workerSelf.postMessage({ requestId: request.requestId, type: 'phase', phase })
  const sendResult = (result: WorkerMessage['result']) => workerSelf.postMessage({ requestId: request.requestId, type: 'result', result })
  if (encoder.encode(request.input).byteLength > request.maxInputBytes) {
    sendResult({ status: 'RUNTIME_ERROR', stdout: '', stderr: '', exitCode: null, compileDiagnostics: '', detail: '输入超过限制。' })
    return
  }
  sendPhase('compiling')
  const compiled = await compile({ source: request.source, fileName: 'main.c', flags: ['-std=c11'] })
  if (!compiled.module) {
    sendResult({ status: 'COMPILATION_ERROR', stdout: '', stderr: '', exitCode: null, compileDiagnostics: compiled.compileOutput, detail: 'C 编译器返回了诊断信息。' })
    return
  }
  sendPhase('running')
  let stdout = ''
  let stderr = ''
  let outputLimit = false
  const append = (target: 'stdout' | 'stderr', data: Uint8Array) => {
    const text = new TextDecoder().decode(data)
    const next = target === 'stdout' ? stdout + text : stderr + text
    if (new TextEncoder().encode(next).byteLength > request.maxOutputBytes) {
      outputLimit = true
      return
    }
    if (target === 'stdout') stdout = next
    else stderr = next
  }
  const fds = [new OpenFile(new File(encoder.encode(request.input))), new ConsoleStdout(data => append('stdout', data)), new ConsoleStdout(data => append('stderr', data))]
  const wasi = new WASI([], [], fds)
  let exitCode = 0
  try {
    const instance = await WebAssembly.instantiate(compiled.module, { wasi_snapshot_preview1: wasi.wasiImport })
    wasi.start(instance as unknown as { exports: { memory: WebAssembly.Memory; _start: () => unknown } })
  } catch (error) {
    if (error instanceof WASIProcExit) exitCode = error.code
    else sendResult({ status: 'RUNTIME_ERROR', stdout, stderr, exitCode: null, compileDiagnostics: '', detail: error instanceof Error ? error.message : '程序运行异常。' })
  }
  if (outputLimit) sendResult({ status: 'OUTPUT_LIMIT_EXCEEDED', stdout, stderr, exitCode, compileDiagnostics: '', detail: '程序输出超过限制，已停止收集。' })
  else sendResult({ status: exitCode === 0 ? 'OK' : 'RUNTIME_ERROR', stdout, stderr, exitCode, compileDiagnostics: '', detail: exitCode === 0 ? undefined : `程序退出码：${exitCode}` })
}
