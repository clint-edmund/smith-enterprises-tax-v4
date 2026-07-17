import { useCallback, useEffect, useMemo, useState } from "react"

const FAVORITES_STORAGE_KEY = "smith-enterprises.document-favorites"

function readFavoriteIds(): string[] {
  try {
    const storedValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY)

    if (!storedValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(storedValue)

    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === "string")
      : []
  } catch {
    return []
  }
}

export function useDocumentFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  useEffect(() => {
    setFavoriteIds(readFavoriteIds())
  }, [])

  useEffect(() => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favoriteIds),
    )
  }, [favoriteIds])

  const favoriteIdSet = useMemo(
    () => new Set(favoriteIds),
    [favoriteIds],
  )

  const toggleFavorite = useCallback((documentId: string) => {
    setFavoriteIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    )
  }, [])

  return {
    isFavorite: (documentId: string) => favoriteIdSet.has(documentId),
    toggleFavorite,
  }
}
