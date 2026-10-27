import {
  MAX_ANSWERS,
  MIN_ANSWERS,
  SCORING_MODES,
} from "@razzia/common/constants"
import type { QuestionRefinement } from "@razzia/common/validators/questions"
import { z } from "zod"

export const multiOptionsValidator = z.object({
  scoringMode: z.enum(SCORING_MODES),
})

export const refineChoiceQuestion: QuestionRefinement = (
  { answers, answerImages, solutions },
  addIssue,
) => {
  answers.forEach((answer, index) => {
    if (answer.trim() === "" && !answerImages?.[index]) {
      addIssue(["answers", index], "errors:quizz.answerEmpty")
    }
  })

  if (answerImages && answerImages.length > answers.length) {
    addIssue(["answerImages"], "errors:quizz.invalidMediaUrl")
  }

  if (answers.length < MIN_ANSWERS) {
    addIssue(["answers"], "errors:quizz.tooFewAnswers")
  }

  if (answers.length > MAX_ANSWERS) {
    addIssue(["answers"], "errors:quizz.tooManyAnswers")
  }

  const hasInvalidSolution = solutions?.some(
    (solution) => !Number.isInteger(solution) || solution < 0,
  )

  if (hasInvalidSolution) {
    addIssue(["solutions"], "errors:quizz.noSolution")
  }
}
