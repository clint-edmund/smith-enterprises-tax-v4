import type {
  ReportScheduleCadence,
  SavedReportPreference,
} from "@/features/reports/types/report.types"

const STORAGE_KEY = "smith-enterprises-report-preferences-v1"

function readPreferences(): SavedReportPreference[] {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsedValue: unknown = JSON.parse(rawValue)

    return Array.isArray(parsedValue)
      ? (parsedValue as SavedReportPreference[])
      : []
  } catch {
    return []
  }
}

function writePreferences(preferences: SavedReportPreference[]) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(preferences),
  )
}

export function getReportPreferences() {
  return readPreferences()
}

export function getFavoriteReportIds() {
  return readPreferences()
    .filter((preference) => preference.isFavorite)
    .map((preference) => preference.reportId)
}

export function toggleFavoriteReport(reportId: string) {
  const preferences = readPreferences()
  const existing = preferences.find(
    (preference) => preference.reportId === reportId,
  )

  if (existing) {
    existing.isFavorite = !existing.isFavorite
  } else {
    preferences.push({
      reportId,
      isFavorite: true,
    })
  }

  writePreferences(preferences)

  return preferences
}

export function saveReportSchedule(
  reportId: string,
  schedule: {
    cadence: ReportScheduleCadence
    dayOfWeek?: number
    dayOfMonth?: number
    hour: number
  },
) {
  const preferences = readPreferences()
  const existing = preferences.find(
    (preference) => preference.reportId === reportId,
  )

  if (existing) {
    existing.schedule = schedule
  } else {
    preferences.push({
      reportId,
      isFavorite: false,
      schedule,
    })
  }

  writePreferences(preferences)

  return preferences
}

export function removeReportSchedule(reportId: string) {
  const preferences = readPreferences()
  const existing = preferences.find(
    (preference) => preference.reportId === reportId,
  )

  if (existing) {
    delete existing.schedule
  }

  writePreferences(preferences)

  return preferences
}
