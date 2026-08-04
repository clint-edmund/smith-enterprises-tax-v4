import {
  ChevronRight,
} from "lucide-react"

import {
  Link,
} from "react-router-dom"

export interface ReviewBreadcrumbItem {
  label: string

  href?: string
}

interface ReviewBreadcrumbsProps {
  items:
    readonly ReviewBreadcrumbItem[]
}

export function ReviewBreadcrumbs({
  items,
}: ReviewBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="overflow-x-auto"
    >
      <ol className="flex min-w-max items-center gap-2 text-sm">
        {items.map(
          (
            item,
            index,
          ) => {
            const isLast =
              index ===
              items.length - 1

            return (
              <li
                key={`${item.label}-${index}`}
                className="flex items-center gap-2"
              >
                {index > 0 && (
                  <ChevronRight
                    className="h-4 w-4 text-slate-400"
                    aria-hidden="true"
                  />
                )}

                {item.href &&
                !isLast ? (
                  <Link
                    to={
                      item.href
                    }
                    className="font-medium text-blue-700 transition hover:text-blue-800"
                  >
                    {
                      item.label
                    }
                  </Link>
                ) : (
                  <span
                    className={
                      isLast
                        ? "font-semibold text-slate-900"
                        : "text-slate-600"
                    }
                    aria-current={
                      isLast
                        ? "page"
                        : undefined
                    }
                  >
                    {
                      item.label
                    }
                  </span>
                )}
              </li>
            )
          },
        )}
      </ol>
    </nav>
  )
}
