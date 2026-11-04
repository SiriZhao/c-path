export type ReviewStatus = 'source-imported-needs-statement-and-tests' | 'reviewed'

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
  testCases: Array<{ input: string; output: string }>
  provenance: { path: string; sha256: string; readmeScore: string; contentStatus: string }
  reviewStatus: ReviewStatus
}

export type Progress = {
  completed: string[]
  code: Record<string, string>
  attempts: Record<string, number>
  lastQuestion: string | null
  currentChapter: string
  theme: 'light' | 'dark'
  version: 1
}

export const EMPTY_PROGRESS: Progress = {
  completed: [], code: {}, attempts: {}, lastQuestion: null, currentChapter: 'chapter-2', theme: 'light', version: 1,
}
