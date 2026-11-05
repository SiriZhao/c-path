import questionsJson from './questions.json'
import chaptersJson from './chapters.json'
import originalsJson from './originals.json'
import phase6OriginalsJson from './originals-phase6.json'
import { validateChapters, validateQuestions } from './schema'

export const sourceArchive = validateQuestions(questionsJson)
export const formalQuestions = validateQuestions([...originalsJson, ...phase6OriginalsJson])
export const questions = validateQuestions([...sourceArchive, ...formalQuestions])
export const chapters = validateChapters(chaptersJson)
