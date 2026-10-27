import { withBase } from "@razzia/web/lib/base"
import clsx from "clsx"
import { Check, X } from "lucide-react"
import type { ButtonHTMLAttributes, PropsWithChildren } from "react"

type Props = PropsWithChildren &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string
    image?: string
    correct?: boolean
    selected?: boolean
    large?: boolean
  }

const AnswerButton = ({
  className,
  label,
  image,
  children,
  correct,
  selected,
  large,
  ...otherProps
}: Props) => {
  const CorrectIcon = correct ? Check : X

  return (
    <button
      className={clsx(
        "relative flex rounded-2xl p-4 text-left sm:py-6",
        image && "flex-col gap-3",
        className,
      )}
      {...otherProps}
    >
      {image && (
        <img
          src={withBase(image)}
          alt={typeof children === "string" ? children : ""}
          draggable={false}
          className={clsx(
            "pointer-events-none mx-auto w-full rounded-lg bg-black/10 object-contain select-none",
            large ? "min-h-0 flex-1" : "h-24 sm:h-32 md:h-40",
          )}
        />
      )}
      <div className="grid w-full grid-cols-[auto_1fr_auto] content-start items-center gap-x-3 gap-y-2 sm:content-center">
        <span
          className={clsx(
            "col-start-1 row-start-1 flex shrink-0 items-center justify-center bg-black/20 font-bold",
            large
              ? "size-7 rounded-md text-base md:size-9 md:text-lg"
              : "size-5 rounded text-sm sm:size-7 sm:rounded-md md:size-8 md:text-base",
          )}
        >
          {label}
        </span>
        <p
          className={clsx(
            "col-span-3 row-start-2 wrap-break-word drop-shadow-md sm:col-span-1 sm:col-start-2 sm:row-start-1",
            large ? "text-lg md:text-2xl" : "text-sm md:text-lg",
          )}
        >
          {children}
        </p>
        {correct !== undefined && (
          <CorrectIcon className="col-start-3 row-start-1 size-4 stroke-6 md:size-6" />
        )}
        {selected !== undefined && correct === undefined && (
          <span
            className={clsx(
              "text-foreground col-start-3 row-start-1 flex shrink-0 items-center justify-center rounded-md",
              large ? "size-6 md:size-8" : "size-5 md:size-6",
              selected ? "bg-white" : "bg-white/20",
            )}
          >
            {selected && (
              <Check
                className={clsx(
                  "stroke-5",
                  large ? "size-4 md:size-5" : "size-3 md:size-4",
                )}
              />
            )}
          </span>
        )}
      </div>
    </button>
  )
}

export default AnswerButton
