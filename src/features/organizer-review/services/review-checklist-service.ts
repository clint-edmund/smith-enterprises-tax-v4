import {
  supabase,
} from "@/services/supabase"

import type {
  GetReviewChecklistRequest,
  ReviewChecklist,
  ReviewChecklistItem,
  SetReviewChecklistItemRequest,
} from "@/features/organizer-review/types/review-checklist.types"

interface ReviewChecklistRow {
  definition_id: string
  definition_name: string
  checklist_version: number
  item_id: string
  item_key: string
  item_label: string
  item_description:
    string | null
  is_required: boolean
  display_order: number
  is_completed: boolean
  completed_by:
    string | null
  completed_by_name:
    string | null
  completed_at:
    string | null
  updated_at: string
}

function requireValue(
  value: string,
  label: string,
): string {
  const normalized =
    value.trim()

  if (!normalized) {
    throw new Error(
      `${label} is required.`,
    )
  }

  return normalized
}

function mapItem(
  row:
    ReviewChecklistRow,
): ReviewChecklistItem {
  return {
    itemId:
      row.item_id,

    itemKey:
      row.item_key,

    label:
      row.item_label,

    description:
      row.item_description,

    isRequired:
      row.is_required,

    displayOrder:
      row.display_order,

    isCompleted:
      row.is_completed,

    completedBy:
      row.completed_by,

    completedByName:
      row.completed_by_name,

    completedAt:
      row.completed_at,

    updatedAt:
      row.updated_at,
  }
}

function createChecklist(
  rows:
    ReviewChecklistRow[],
): ReviewChecklist {
  if (
    rows.length ===
    0
  ) {
    throw new Error(
      "No active review checklist is configured for this item.",
    )
  }

  const items =
    rows
      .map(
        mapItem,
      )
      .sort(
        (
          left,
          right,
        ) =>
          left.displayOrder -
          right.displayOrder,
      )

  const completedItems =
    items.filter(
      (item) =>
        item.isCompleted,
    ).length

  const requiredItems =
    items.filter(
      (item) =>
        item.isRequired,
    ).length

  const completedRequiredItems =
    items.filter(
      (item) =>
        item.isRequired &&
        item.isCompleted,
    ).length

  const totalItems =
    items.length

  return {
    definitionId:
      rows[0].definition_id,

    definitionName:
      rows[0].definition_name,

    version:
      rows[0].checklist_version,

    items,

    completedItems,

    completedRequiredItems,

    requiredItems,

    totalItems,

    completionPercentage:
      totalItems ===
        0
        ? 0
        : Math.round(
            (
              completedItems /
              totalItems
            ) * 100,
          ),

    areRequiredItemsComplete:
      requiredItems >
        0 &&
      completedRequiredItems ===
        requiredItems,
  }
}

export async function getReviewChecklist(
  request:
    GetReviewChecklistRequest,
): Promise<ReviewChecklist> {
  const organizerId =
    requireValue(
      request.organizerId,
      "An organizer identifier",
    )

  const subjectId =
    requireValue(
      request.subjectId,
      "A review subject identifier",
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_organizer_review_checklist",
    {
      requested_organizer_id:
        organizerId,

      requested_section_key:
        request.sectionKey,

      requested_subject_type:
        request.subjectType,

      requested_subject_id:
        subjectId,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  return createChecklist(
    (
      data as
        | ReviewChecklistRow[]
        | null
    ) ?? [],
  )
}

export async function setReviewChecklistItem(
  request:
    SetReviewChecklistItemRequest,
): Promise<void> {
  const organizerId =
    requireValue(
      request.organizerId,
      "An organizer identifier",
    )

  const subjectId =
    requireValue(
      request.subjectId,
      "A review subject identifier",
    )

  const itemId =
    requireValue(
      request.itemId,
      "A checklist item identifier",
    )

  const {
    error,
  } = await supabase.rpc(
    "set_organizer_review_checklist_item",
    {
      requested_organizer_id:
        organizerId,

      requested_section_key:
        request.sectionKey,

      requested_subject_type:
        request.subjectType,

      requested_subject_id:
        subjectId,

      requested_item_id:
        itemId,

      requested_is_completed:
        request.isCompleted,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }
}
