import { describe, expect, it } from 'vitest'
import { runCCode } from './judge'

describe('judge boundary', () => {
  it('fails closed when no trusted compiler is configured', async () => {
    const result = await runCCode('int main(void) { return 0; }', '')
    expect(result.status).toBe('UNAVAILABLE')
    expect(result.message).toContain('未配置')
    expect(result.exitCode).toBeNull()
  })
})
