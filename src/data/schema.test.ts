import { describe, expect, it } from 'vitest'
import { chapters, questions } from './index'
import { validateQuestions } from './schema'

describe('question bank schema', () => {
  it('loads all imported questions with unique stable ids', () => {
    expect(questions).toHaveLength(86)
    expect(questions.filter(question => question.sourceKind === 'original')).toHaveLength(48)
    expect(questions.filter(question => question.sourceKind === 'pat-import')).toHaveLength(38)
    expect(new Set(questions.map(question => question.id)).size).toBe(86)
    expect(chapters.length).toBeGreaterThan(0)
  })

  it('rejects duplicate or malformed records', () => {
    const sample = { ...questions[0], id: 'pat-2_0' }
    expect(() => validateQuestions([sample, sample])).toThrow('重复 id')
    expect(() => validateQuestions([{ ...sample, id: 'bad-id' }])).toThrow('格式无效')
  })
})
