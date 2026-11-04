import questionsJson from './questions.json'
import chaptersJson from './chapters.json'
import { validateChapters, validateQuestions } from './schema'

export const questions = validateQuestions(questionsJson)
export const chapters = validateChapters(chaptersJson)
