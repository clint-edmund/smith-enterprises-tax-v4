import type {
  ReactNode,
} from "react"

import type {
  ReviewStatus,
} from "./review-status-badge"

import {
  ReviewStatusBadge,
} from "./review-status-badge"

interface ReviewSectionHeaderProps {
  eyebrow?: string

  title: string

  description?: string

  status?:
    ReviewStatus

  statusLabel?: string

  icon?: ReactNode

  metadata?: ReactNode
}

export function ReviewSectionHeader({
  eyebrow,
  title,
  description,
  status,
  statusLabel,
  icon,
  metadata,
}: ReviewSectionHeaderProps) {
  return (
    <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {icon && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-100">
                {icon}
              </div>
            )}

            <div className="min-w-0">
              {eyebrow && (
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-200">
                  {eyebrow}
                </p>
              )}

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h1>

              {description && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  {description}
                </p>
              )}
            </div>
          </div>

          {status && (
            <ReviewStatusBadge
              status={
                status
              }
              label={
                statusLabel
              }
            />
          )}
        </div>
      </div>

      {metadata && (
        <div className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6">
          {metadata}
        </div>
      )}
    </header>
  )
}
