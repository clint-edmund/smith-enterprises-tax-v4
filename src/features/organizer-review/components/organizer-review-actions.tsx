import {
  FileText,
  FolderOpen,
  MessageSquare,
  User,
} from "lucide-react"

import { Link } from "react-router-dom"

interface Action {
  label: string
  description: string
  icon: React.ReactNode
  href: string
}

const actions: Action[] = [
  {
    label: "Open Client Profile",
    description:
      "View the complete client record.",
    icon: <User className="h-5 w-5" />,
    href: "#",
  },
  {
    label: "Open Current Return",
    description:
      "Jump directly to this year's return.",
    icon: <FileText className="h-5 w-5" />,
    href: "#",
  },
  {
    label: "View Documents",
    description:
      "Open uploaded organizer documents.",
    icon: <FolderOpen className="h-5 w-5" />,
    href: "#",
  },
  {
    label: "Send Client Message",
    description:
      "Request additional information.",
    icon: <MessageSquare className="h-5 w-5" />,
    href: "#",
  },
]

export function OrganizerReviewActions() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Quick Actions
      </h2>

      <div className="mt-6 grid gap-4">
        {actions.map(
          (action) => (
            <Link
              key={action.label}
              to={action.href}
              className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-slate-100 p-2">
                  {action.icon}
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    {action.label}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ),
        )}
      </div>
    </section>
  )
}