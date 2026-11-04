import type { Question } from '../types'

export type Chapter = { id: string; number: number; title: string; topics: string[] }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function requireString(value: unknown, field: string, index: number): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`题库第 ${index + 1} 项的 ${field} 无效`)
}

export function validateQuestions(value: unknown): Question[] {
  if (!Array.isArray(value)) throw new Error('题库数据必须是数组')
  const ids = new Set<string>()
  value.forEach((item, index) => {
    if (!isRecord(item)) throw new Error(`题库第 ${index + 1} 项不是对象`)
    requireString(item.id, 'id', index)
    requireString(item.title, 'title', index)
    requireString(item.chapter, 'chapter', index)
    if (!/^pat-[0-9]+_[0-9]+$/.test(item.id)) throw new Error(`题库第 ${index + 1} 项的 id 格式无效`)
    if (ids.has(item.id)) throw new Error(`题库存在重复 id：${item.id}`)
    ids.add(item.id)
    if (!Array.isArray(item.topics) || item.topics.some(topic => typeof topic !== 'string')) throw new Error(`题库 ${item.id} 的 topics 无效`)
    if (!isRecord(item.provenance) || typeof item.provenance.path !== 'string' || typeof item.provenance.sha256 !== 'string') throw new Error(`题库 ${item.id} 缺少可追溯来源`)
    if (!['source-imported-needs-statement-and-tests', 'reviewed'].includes(item.reviewStatus as string)) throw new Error(`题库 ${item.id} 的 reviewStatus 无效`)
  })
  return value as Question[]
}

export function validateChapters(value: unknown): Chapter[] {
  if (!Array.isArray(value)) throw new Error('章节数据必须是数组')
  value.forEach((item, index) => {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.number !== 'number' || typeof item.title !== 'string' || !Array.isArray(item.topics)) throw new Error(`章节第 ${index + 1} 项无效`)
  })
  return value as Chapter[]
}
