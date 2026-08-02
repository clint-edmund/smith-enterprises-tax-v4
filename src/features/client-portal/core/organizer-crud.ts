import type {
  OrganizerCrudResult,
  OrganizerDeleteResult,
} from "./organizer-types"

export async function organizerCreate<T>(
  action: () => Promise<T>,
): Promise<OrganizerCrudResult<T>> {
  try {
    const record =
      await action()

    return {
      success: true,
      record,
    }
  } catch (error) {
    return {
      success: false,
      errorMessage:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    }
  }
}

export async function organizerUpdate<T>(
  action: () => Promise<T>,
): Promise<OrganizerCrudResult<T>> {
  return organizerCreate(
    action,
  )
}

export async function organizerDelete(
  action: () => Promise<void>,
): Promise<OrganizerDeleteResult> {
  try {
    await action()

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      errorMessage:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    }
  }
}