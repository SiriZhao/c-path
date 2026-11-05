import { beforeEach, describe, expect, it } from 'vitest'
import { exportProgress, importProgress, loadProgress, recordLearningEvent, saveProgress } from './storage'
import { EMPTY_PROGRESS } from '../types'

const memory = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', { value: {
  clear: () => memory.clear(),
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => memory.set(key, value),
} })

describe('learning progress storage', () => {
  beforeEach(() => localStorage.clear())
  it('round trips progress through localStorage', () => {
    const value = { ...EMPTY_PROGRESS, completed: ['pat-2_0'], code: { 'pat-2_0': 'int main(){}' } }
    saveProgress(value)
    expect(loadProgress().completed).toEqual(['pat-2_0'])
    expect(loadProgress().code['pat-2_0']).toContain('main')
  })
  it('exports and imports versioned data', () => {
    const value = { ...EMPTY_PROGRESS, lastQuestion: 'pat-3_0' }
    expect(importProgress(exportProgress(value)).lastQuestion).toBe('pat-3_0')
  })
  it('rejects unsupported versions', () => {
    expect(() => importProgress(JSON.stringify({ version: 9 }))).toThrow()
  })
  it('sanitizes malformed collections and deduplicates completion records', () => {
    const value = importProgress(JSON.stringify({ version: 1, completed: ['pat-2_0', 'pat-2_0', 42], code: { 'pat-2_0': 3, ok: 'int main(){}' }, attempts: { 'pat-2_0': 2.8, bad: -1 } }))
    expect(value.completed).toEqual(['pat-2_0'])
    expect(value.code).toEqual({ ok: 'int main(){}' })
    expect(value.attempts).toEqual({ 'pat-2_0': 2 })
  })
  it('migrates v1 records without losing code or completion', () => {
    const migrated = importProgress(JSON.stringify({ version: 1, completed: ['pat-2_0'], code: { 'pat-2_0': 'draft' }, attempts: { 'pat-2_0': 3 }, theme: 'dark' }))
    expect(migrated.version).toBe(2)
    expect(migrated.code['pat-2_0']).toBe('draft')
    expect(migrated.states['pat-2_0']).toBe('self-completed')
  })
  it('counts run events rather than draft keystrokes', () => {
    let progress = { ...EMPTY_PROGRESS }
    progress = recordLearningEvent(progress, 'orig-sum-two-integers', 'draft-saved')
    progress = recordLearningEvent(progress, 'orig-sum-two-integers', 'run-attempted')
    expect(progress.attempts['orig-sum-two-integers']).toBe(1)
    expect(progress.events['orig-sum-two-integers']).toHaveLength(2)
  })
  it('preserves a local test pass when a learner saves or marks the exercise', () => {
    let progress = recordLearningEvent({ ...EMPTY_PROGRESS }, 'orig-sum-two-integers', 'local-tests-passed')
    progress = recordLearningEvent(progress, 'orig-sum-two-integers', 'draft-saved')
    progress = recordLearningEvent(progress, 'orig-sum-two-integers', 'self-completed')
    expect(progress.states['orig-sum-two-integers']).toBe('local-tests-passed')
  })
})
