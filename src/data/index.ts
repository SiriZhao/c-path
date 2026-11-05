import questionsJson from './questions.json'
import chaptersJson from './chapters.json'
import originalsJson from './originals.json'
import { validateChapters, validateQuestions } from './schema'

export const questions = validateQuestions([...questionsJson, ...originalsJson])
export const chapters = validateChapters(chaptersJson)
