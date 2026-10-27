import {
  ACCEPTED_MEDIA_TYPES,
  MAX_ANSWERS,
  MEDIA_TYPES,
  MIN_ANSWERS,
  QUIZZ_MODES,
} from "@razzia/common/constants"
import FieldError from "@razzia/web/components/forms/FieldError"
import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
} from "@razzia/web/features/game/utils/constants"
import { QUESTION_REGISTRY } from "@razzia/web/features/questions"
import {
  useQuizzEditor,
  type QuizzFormValues,
} from "@razzia/web/features/quizz/contexts/quizz-editor-context"
import { useUploadMedia } from "@razzia/web/features/quizz/hooks/useUploadMedia"
import { withBase } from "@razzia/web/lib/base"
import clsx from "clsx"
import { ImagePlus, Loader2, Minus, Plus, X } from "lucide-react"
import { useRef, type ChangeEvent } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

const IMAGE_ACCEPT = Object.entries(ACCEPTED_MEDIA_TYPES)
  .filter(([, { type }]) => type === MEDIA_TYPES.IMAGE)
  .flatMap(([mime, { ext }]) => [mime, ext])
  .join(",")

const QuestionEditorAnswers = () => {
  const {
    questions,
    currentQuestion,
    currentIndex,
    gameMode,
    updateQuestion,
    questionPath,
  } = useQuizzEditor()
  const { control } = useFormContext<QuizzFormValues>()
  const { t } = useTranslation()

  const fileInputRef = useRef<HTMLInputElement>(null)
  // Question and answer the running upload belongs to; the editor may have
  // moved on to another question by the time it finishes.
  const uploadTarget = useRef<{ question: number; answer: number } | null>(null)

  const setAnswerImage = (
    questionIndex: number,
    answerIndex: number,
    url: string,
  ) => {
    const question = questions[questionIndex]

    if (!question) {
      return
    }

    const images = Array.from(
      { length: question.answers.length },
      (_, i) => question.answerImages?.[i] ?? "",
    )
    images[answerIndex] = url

    updateQuestion(questionIndex, {
      answerImages: images.some(Boolean) ? images : undefined,
    })
  }

  const { upload, pendingCount } = useUploadMedia(({ type, url }) => {
    const target = uploadTarget.current

    if (!target || type !== MEDIA_TYPES.IMAGE) {
      return
    }

    setAnswerImage(target.question, target.answer, url)
  })

  const handlePickImage = (answerIndex: number) => () => {
    uploadTarget.current = { question: currentIndex, answer: answerIndex }
    fileInputRef.current?.click()
  }

  const handleUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    upload(Array.from(e.target.files ?? []).slice(0, 1))
    e.target.value = ""
  }

  const questionType = currentQuestion.type
  const { SolutionPicker } = QUESTION_REGISTRY[questionType]

  const addAnswer = () => {
    if (currentQuestion.answers.length >= MAX_ANSWERS) {
      return
    }

    updateQuestion(currentIndex, { answers: [...currentQuestion.answers, ""] })
  }

  const removeAnswer = () => {
    if (currentQuestion.answers.length <= MIN_ANSWERS) {
      return
    }

    const next = currentQuestion.answers.slice(0, -1)
    const maxIndex = next.length - 1
    const nextSolution = (currentQuestion.solutions ?? []).filter(
      (s) => s <= maxIndex,
    )

    const nextImages = currentQuestion.answerImages?.slice(0, next.length)

    updateQuestion(currentIndex, {
      answers: next,
      answerImages: nextImages?.some(Boolean) ? nextImages : undefined,
      solutions: nextSolution.length > 0 ? nextSolution : [0],
    })
  }

  return (
    <div className="z-10 flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={handleUploadImage}
      />
      <div className="flex items-center justify-between px-1">
        <div className="text-muted-foreground bg-background rounded-lg px-2 py-1 text-sm font-semibold">
          {currentQuestion.answers.length}
          {t("quizz:answersCountSuffix")}
        </div>
        <div className="flex gap-2">
          <button
            onClick={removeAnswer}
            aria-label={t("quizz:removeAnswer")}
            disabled={currentQuestion.answers.length <= MIN_ANSWERS}
            className="bg-accent text-accent-foreground hover:bg-accent flex size-7 items-center justify-center rounded-lg disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <button
            onClick={addAnswer}
            aria-label={t("quizz:addAnswer")}
            disabled={currentQuestion.answers.length >= MAX_ANSWERS}
            className="bg-accent text-accent-foreground hover:bg-accent flex size-7 items-center justify-center rounded-lg disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {currentQuestion.answers.map((_, i) => {
          const isSelected = currentQuestion.solutions?.includes(i) ?? false
          const image = currentQuestion.answerImages?.[i]
          const isUploading =
            pendingCount > 0 &&
            uploadTarget.current?.question === currentIndex &&
            uploadTarget.current.answer === i

          return (
            <Controller
              key={i}
              control={control}
              name={questionPath(`answers.${i}`)}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1">
                  <div
                    className={clsx(
                      "flex flex-col gap-3 rounded-2xl px-4 py-6",
                      ANSWERS_COLORS[i],
                      fieldState.invalid && "ring-2 ring-red-500",
                    )}
                  >
                    {image && (
                      <div className="relative">
                        <img
                          src={withBase(image)}
                          alt=""
                          className="mx-auto h-28 w-full rounded-lg bg-black/10 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setAnswerImage(currentIndex, i, "")}
                          aria-label={t("quizz:answerImage.remove")}
                          className="text-foreground absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-white/90 hover:bg-white"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-black/20 text-sm font-bold text-white md:size-8 md:text-base">
                        {ANSWERS_LABELS[i]}
                      </span>
                      <div className="flex flex-1 items-center justify-between gap-1.5 drop-shadow-md">
                        <input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          aria-describedby={
                            fieldState.invalid
                              ? `${field.name}-error`
                              : undefined
                          }
                          className="w-full bg-transparent font-semibold text-white placeholder-white/70 outline-none"
                          placeholder={t(
                            image
                              ? "quizz:answerImage.textPlaceholder"
                              : "quizz:addAnswerPlaceholder",
                          )}
                        />
                        <button
                          type="button"
                          onClick={handlePickImage(i)}
                          disabled={isUploading}
                          aria-label={t(
                            image
                              ? "quizz:answerImage.replace"
                              : "quizz:answerImage.add",
                          )}
                          title={t(
                            image
                              ? "quizz:answerImage.replace"
                              : "quizz:answerImage.add",
                          )}
                          className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white/20 text-white transition-colors hover:bg-white/35"
                        >
                          {isUploading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <ImagePlus className="size-4" />
                          )}
                        </button>
                        {gameMode !== QUIZZ_MODES.SURVEY && SolutionPicker && (
                          <SolutionPicker index={i} isSelected={isSelected} />
                        )}
                      </div>
                    </div>
                  </div>
                  <FieldError
                    id={`${field.name}-error`}
                    errors={[fieldState.error]}
                    pill
                  />
                </div>
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

export default QuestionEditorAnswers
