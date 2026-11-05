import { describe, expect, it } from 'vitest'
import { compareOutput, executeLocalTests } from './comparator'

describe('local output comparator', () => {
  it('normalizes platform line endings but preserves meaningful spaces', () => {
    expect(compareOutput('8\r\n', '8\n').passed).toBe(true)
    expect(compareOutput('8', ' 8').passed).toBe(false)
  })
  it('stops and reports runtime failures without claiming all tests passed', async () => {
    const result = await executeLocalTests([{ id: 'a', input: '', expectedOutput: 'ok\n' }, { id: 'b', input: '', expectedOutput: 'later\n' }], async (_, index = 0) => index === 0 ? { status: 'OK', stdout: 'ok\n' } : { status: 'RUNTIME_ERROR', detail: 'crashed' })
    expect(result.passed).toBe(false)
    expect(result.results).toHaveLength(2)
  })
})
