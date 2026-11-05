import type { LearningEvent, LearningEventKind, LearningState, Progress, RecentActivity } from '../types'
import { EMPTY_PROGRESS } from '../types'

const KEY = 'c-path.progress.v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function migrateProgress(value: Record<string, unknown>): Record<string, unknown> {
  if (value.version === 2) return value
  if (value.version === 1) {
    const completed = Array.isArray(value.completed) ? value.completed : []
    return { ...value, version: 2, events: {}, states: Object.fromEntries(completed.filter(item => typeof item === 'string').map(item => [item, 'self-completed'])), recent: [], favorites: [], review: [] }
  }
  throw new Error('只支持版本 1 或 2 的学习记录')
}

function normalizeProgress(input: unknown): Progress {
  if (!isRecord(input)) throw new Error('学习记录必须是对象')
  const value = migrateProgress(input)
  const completed = Array.isArray(value.completed) ? value.completed.filter((item): item is string => typeof item === 'string') : []
  const code = isRecord(value.code) ? Object.fromEntries(Object.entries(value.code).filter(([, item]) => typeof item === 'string')) as Record<string, string> : {}
  const attempts = isRecord(value.attempts) ? Object.fromEntries(Object.entries(value.attempts).filter(([, item]) => typeof item === 'number' && Number.isFinite(item) && item >= 0).map(([key, item]) => [key, Math.floor(item as number)])) as Record<string, number> : {}
  const events = isRecord(value.events) ? Object.fromEntries(Object.entries(value.events).map(([key, item]) => [key, Array.isArray(item) ? item.filter(isRecord).filter(event => typeof event.kind === 'string' && typeof event.at === 'string') as unknown as LearningEvent[] : []])) as Record<string, LearningEvent[]> : {}
  const stateValues: LearningState[] = ['not-started', 'in-progress', 'self-completed', 'sample-passed', 'local-tests-passed', 'needs-review']
  const states = isRecord(value.states) ? Object.fromEntries(Object.entries(value.states).filter(([, item]) => stateValues.includes(item as LearningState))) as Record<string, LearningState> : {}
  const recent = Array.isArray(value.recent) ? value.recent.filter(isRecord).filter(item => typeof item.questionId === 'string' && typeof item.kind === 'string' && typeof item.at === 'string').slice(0, 30) as unknown as RecentActivity[] : []
  const favorites = Array.isArray(value.favorites) ? value.favorites.filter((item): item is string => typeof item === 'string') : []
  const review = Array.isArray(value.review) ? value.review.filter((item): item is string => typeof item === 'string') : []
  const theme = value.theme === 'dark' ? 'dark' : 'light'
  const lastQuestion = typeof value.lastQuestion === 'string' ? value.lastQuestion : null
  const currentChapter = typeof value.currentChapter === 'string' ? value.currentChapter : EMPTY_PROGRESS.currentChapter
  return { ...EMPTY_PROGRESS, completed: [...new Set(completed)], code, attempts, events, states, recent, favorites: [...new Set(favorites)], review: [...new Set(review)], lastQuestion, currentChapter, theme }
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY_PROGRESS }
    return normalizeProgress(JSON.parse(raw))
  } catch { return { ...EMPTY_PROGRESS } }
}

export function saveProgress(progress: Progress) { localStorage.setItem(KEY, JSON.stringify(progress)) }

export function exportProgress(progress: Progress): string { return JSON.stringify({ ...progress, exportedAt: new Date().toISOString() }, null, 2) }

export function importProgress(raw: string): Progress {
  return normalizeProgress(JSON.parse(raw))
}

export function recordLearningEvent(progress: Progress, questionId: string, kind: LearningEventKind, detail?: string, at = new Date().toISOString()): Progress {
  const event: LearningEvent = { kind, at, ...(detail ? { detail } : {}) }
  const previous = progress.events[questionId] ?? []
  const nextState: LearningState = kind === 'local-tests-passed' ? 'local-tests-passed' : kind === 'sample-passed' ? 'sample-passed' : kind === 'self-completed' ? 'self-completed' : kind === 'needs-review' ? 'needs-review' : kind === 'opened' || kind === 'draft-saved' || kind === 'run-attempted' || kind === 'test-executed' ? 'in-progress' : (progress.states[questionId] ?? 'not-started')
  const recent = [{ questionId, kind, at }, ...progress.recent.filter(item => item.questionId !== questionId || item.kind !== kind)].slice(0, 30)
  const attempts = kind === 'run-attempted' ? { ...progress.attempts, [questionId]: (progress.attempts[questionId] ?? 0) + 1 } : progress.attempts
  return { ...progress, events: { ...progress.events, [questionId]: [...previous, event].slice(-100) }, states: { ...progress.states, [questionId]: nextState }, recent, attempts, lastQuestion: questionId }
}

export function stateLabel(state: LearningState | undefined): string {
  return ({ 'not-started': '未开始', 'in-progress': '练习中', 'self-completed': '自行完成', 'sample-passed': '样例测试通过', 'local-tests-passed': '本地测试通过', 'needs-review': '需要复习' } as Record<LearningState, string>)[state ?? 'not-started']
}
