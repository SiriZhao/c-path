import { describe, expect, it } from 'vitest'
import { withTimeout } from './timeout'

describe('runtime timeout boundary', () => {
  it('rejects and aborts work after the configured limit', async () => {
    await expect(withTimeout(signal => new Promise<void>((resolve, reject) => { signal.addEventListener('abort', () => reject(new Error('aborted'))); setTimeout(resolve, 50) }), 5)).rejects.toThrow()
  })
})
