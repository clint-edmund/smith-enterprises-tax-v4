import {
  useMemo,
  useState,
} from "react"

interface OrganizerListFilter<
  Item,
> {
  key: string

  matches: (
    item: Item,
  ) => boolean
}

interface OrganizerListSort<
  Item,
> {
  key: string

  compare: (
    firstItem: Item,
    secondItem: Item,
  ) => number
}

interface UseOrganizerListStateOptions<
  Item,
> {
  items: readonly Item[]

  searchText: (
    item: Item,
  ) => string

  filters:
    readonly OrganizerListFilter<Item>[]

  sorts:
    readonly OrganizerListSort<Item>[]

  defaultFilterKey: string

  defaultSortKey: string
}

interface UseOrganizerListStateResult<
  Item,
> {
  searchValue: string

  filterKey: string

  sortKey: string

  visibleItems:
    Item[]

  resultCount: number

  totalCount: number

  setSearchValue: (
    value: string,
  ) => void

  setFilterKey: (
    key: string,
  ) => void

  setSortKey: (
    key: string,
  ) => void

  clearSearch:
    () => void

  getFilterCount:
    (
      key: string,
    ) => number
}

export function useOrganizerListState<
  Item,
>({
  items,
  searchText,
  filters,
  sorts,
  defaultFilterKey,
  defaultSortKey,
}: UseOrganizerListStateOptions<Item>):
  UseOrganizerListStateResult<Item> {
  const [
    searchValue,
    setSearchValue,
  ] = useState("")

  const [
    filterKey,
    setFilterKey,
  ] =
    useState(
      defaultFilterKey,
    )

  const [
    sortKey,
    setSortKey,
  ] =
    useState(
      defaultSortKey,
    )

  const normalizedSearch =
    searchValue
      .trim()
      .toLowerCase()

  const selectedFilter =
    filters.find(
      (filter) =>
        filter.key ===
        filterKey,
    )

  const selectedSort =
    sorts.find(
      (sort) =>
        sort.key ===
        sortKey,
    )

  const searchedItems =
    useMemo(
      () => {
        if (
          !normalizedSearch
        ) {
          return [
            ...items,
          ]
        }

        return items.filter(
          (item) =>
            searchText(
              item,
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              ),
        )
      },
      [
        items,
        normalizedSearch,
        searchText,
      ],
    )

  const visibleItems =
    useMemo(
      () => {
        const filteredItems =
          selectedFilter
            ? searchedItems.filter(
                selectedFilter.matches,
              )
            : [
                ...searchedItems,
              ]

        if (
          !selectedSort
        ) {
          return filteredItems
        }

        return [
          ...filteredItems,
        ].sort(
          selectedSort.compare,
        )
      },
      [
        searchedItems,
        selectedFilter,
        selectedSort,
      ],
    )

  function getFilterCount(
    key: string,
  ): number {
    const filter =
      filters.find(
        (item) =>
          item.key === key,
      )

    if (!filter) {
      return 0
    }

    return items.filter(
      filter.matches,
    ).length
  }

  return {
    searchValue,
    filterKey,
    sortKey,
    visibleItems,
    resultCount:
      visibleItems.length,
    totalCount:
      items.length,
    setSearchValue,
    setFilterKey,
    setSortKey,
    clearSearch: () => {
      setSearchValue("")
    },
    getFilterCount,
  }
}