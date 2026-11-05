export type SourceKind = 'pat-import' | 'original'
export type ReviewStatus = 'source-imported-needs-statement-and-tests' | 'reviewed'
export type ContentStatus = 'imported' | 'statement-verified' | 'tests-verified' | 'ready-for-local-judge'
export type LearningState = 'not-started' | 'in-progress' | 'self-completed' | 'sample-passed' | 'local-tests-passed' | 'needs-review'
export type LearningEventKind = 'opened' | 'draft-saved' | 'run-attempted' | 'test-executed' | 'sample-passed' | 'local-tests-passed' | 'self-completed' | 'needs-review'

export type TestCase = { id: string; input: string; expectedOutput: string; label?: string }
export type LearningEvent = { kind: LearningEventKind; at: string; detail?: string }
export type RecentActivity = { questionId: string; kind: LearningEventKind; at: string }

export type Question = {
  id: string
  title: string
  source: string
  chapter: string
  topics: string[]
  difficulty: string
  statement: string | null
  constraints: string | null
  inputFormat: string | null
  outputFormat: string | null
  examples: Array<{ input: string; output: string }>
  hints: string[]
  explanation: string | null
  starterCode: string
  referenceSolution: string
  testCases: TestCase[]
  provenance: { path: string; sha256: string; readmeScore: string; contentStatus: string }
  reviewStatus: ReviewStatus
  sourceKind: SourceKind
  contentStatus: ContentStatus
  testVersion: string | null
  author: string | null
}

export type Progress = {
  completed: string[]
  code: Record<string, string>
  attempts: Record<string, number>
  events: Record<string, LearningEvent[]>
  states: Record<string, LearningState>
  recent: RecentActivity[]
  favorites: string[]
  review: string[]
  lastQuestion: string | null
  currentChapter: string
  theme: 'light' | 'dark'
  version: 2
}

export const EMPTY_PROGRESS: Progress = {
  completed: [], code: {}, attempts: {}, events: {}, states: {}, recent: [], favorites: [], review: [], lastQuestion: null, currentChapter: 'chapter-2', theme: 'light', version: 2,
}
