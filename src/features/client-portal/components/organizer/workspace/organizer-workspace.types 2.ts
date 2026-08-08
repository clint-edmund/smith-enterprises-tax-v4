import type {
  ReactNode,
} from "react"

export interface OrganizerWorkspaceProps {
  title: string

  description: string

  children: ReactNode
}

export interface OrganizerNavigationItem {
  key: string

  title: string

  route: string

  completed: boolean

  current: boolean

  locked: boolean
}