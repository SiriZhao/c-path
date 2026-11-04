import type { Progress } from '../types'
import { EMPTY_PROGRESS } from '../types'

const KEY = 'c-path.progress.v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeProgress(value: unknown): Progress {
  if (!isRecord(value) || value.version !== 1) throw new Error('只支持版本 1 的学习记录')
  const completed = Array.isArray(value.completed) ? value.completed.filter((item): item is string => typeof item === 'string') : []
  const code = isRecord(value.code) ? Object.fromEntries(Object.entries(value.code).filter(([, item]) => typeof item === 'string')) as Record<string, string> : {}
  const attempts = isRecord(value.attempts) ? Object.fromEntries(Object.entries(value.attempts).filter(([, item]) => typeof item === 'number' && Number.isFinite(item) && item >= 0).map(([key, item]) => [key, Math.floor(item as number)])) as Record<string, number> : {}
  const theme = value.theme === 'dark' ? 'dark' : 'light'
  const lastQuestion = typeof value.lastQuestion === 'string' ? value.lastQuestion : null
  const currentChapter = typeof value.currentChapter === 'string' ? value.currentChapter : EMPTY_PROGRESS.currentChapter
  return { ...EMPTY_PROGRESS, completed: [...new Set(completed)], code, attempts, lastQuestion, currentChapter, theme }
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
