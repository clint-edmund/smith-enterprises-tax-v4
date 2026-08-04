import type {
  ReactNode,
} from "react"

import {
  Link,
} from "react-router-dom"

export interface ReviewAction {
  key: string

  label: string

  icon?: ReactNode

  href?: string

  onClick?: () => void

  disabled?: boolean

  tone?:
    | "primary"
    | "secondary"
    | "danger"
}

interface ReviewActionBarProps {
  actions:
    readonly ReviewAction[]
}

const toneClasses = {
  primary:
    "bg-blue-700 text-white hover:bg-blue-800",

  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",

  danger:
    "border border-red-200 bg-white text-red-700 hover:bg-red-50",
} as const

export function ReviewActionBar({
  actions,
}: ReviewActionBarProps) {
  return (
    <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {actions.map(
        (action) => {
          const className = [
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
            toneClasses[
              action.tone ??
                "secondary"
            ],
          ].join(" ")

          if (
            action.href &&
            !action.disabled
          ) {
            return (
              <Link
                key={
                  action.key
                }
                to={
                  action.href
                }
                className={
                  className
                }
              >
                {
                  action.icon
                }

                {
                  action.label
                }
              </Link>
            )
          }

          return (
            <button
              key={
                action.key
              }
              type="button"
              disabled={
                action.disabled
              }
              onClick={
                action.onClick
              }
              className={
                className
              }
            >
              {
                action.icon
              }

              {
                action.label
              }
            </button>
          )
        },
      )}
    </div>
  )
}
