import type {
  ReactNode,
} from "react"

interface OrganizerCrudPageProps {
  isLoading: boolean

  isEditing: boolean

  hasItems: boolean

  loading: ReactNode

  empty: ReactNode

  list: ReactNode

  form: ReactNode
}

export function OrganizerCrudPage({
  isLoading,
  isEditing,
  hasItems,
  loading,
  empty,
  list,
  form,
}: OrganizerCrudPageProps) {
  if (isLoading) {
    return <>{loading}</>
  }

  if (isEditing) {
    return <>{form}</>
  }

  if (!hasItems) {
    return <>{empty}</>
  }

  return <>{list}</>
}