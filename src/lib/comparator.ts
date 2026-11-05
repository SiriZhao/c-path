import type { TestCase } from '../types'

export type Comparison = { passed: boolean; expected: string; actual: string; diff?: string }

function normalize(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n$/, '')
}

export function compareOutput(expected: string, actual: string): Comparison {
  const left = normalize(expected)
  const right = normalize(actual)
  if (left === right) return { passed: true, expected, actual }
  const max = Math.max(left.length, right.length)
  let index = 0
  while (index < max && left[index] === right[index]) index += 1
  return { passed: false, expected, actual, diff: `第 ${index + 1} 个字符附近出现差异` }
}

export async function executeLocalTests(testCases: TestCase[], execute: (input: string) => Promise<{ status: string; stdout?: string; detail?: string }>) {
  const results = [] as Array<Comparison & { id: string; status: string; detail?: string }>
  for (const testCase of testCases) {
    const output = await execute(testCase.input)
    const comparison = compareOutput(testCase.expectedOutput, output.stdout ?? '')
    results.push({ id: testCase.id, status: output.status, detail: output.detail, ...comparison, passed: output.status === 'OK' && comparison.passed })
    if (output.status !== 'OK') break
  }
  return { results, passed: results.length === testCases.length && results.every(result => result.passed) }
}
