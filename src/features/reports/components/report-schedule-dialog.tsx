import { useEffect, useState } from "react"

import type {
  ReportDefinition,
  ReportScheduleCadence,
  SavedReportPreference,
} from "@/features/reports/types/report.types"

interface ReportScheduleDialogProps {
  report: ReportDefinition | null
  preference?: SavedReportPreference
  onClose: () => void
  onSave: (
    reportId: string,
    schedule: {
      cadence: ReportScheduleCadence
      dayOfWeek?: number
      dayOfMonth?: number
      hour: number
    },
  ) => void
  onRemove: (reportId: string) => void
}

export function ReportScheduleDialog({
  report,
  preference,
  onClose,
  onSave,
  onRemove,
}: ReportScheduleDialogProps) {
  const [cadence, setCadence] =
    useState<ReportScheduleCadence>("weekly")
  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [dayOfMonth, setDayOfMonth] = useState(1)
  const [hour, setHour] = useState(8)

  useEffect(() => {
    const schedule = preference?.schedule

    setCadence(schedule?.cadence ?? "weekly")
    setDayOfWeek(schedule?.dayOfWeek ?? 1)
    setDayOfMonth(schedule?.dayOfMonth ?? 1)
    setHour(schedule?.hour ?? 8)
  }, [preference, report])

  if (!report) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-schedule-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2
          id="report-schedule-title"
          className="text-xl font-bold text-slate-950"
        >
          Schedule {report.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Save a local schedule preference for this report. Automated email delivery will be connected in a later server-side release.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Frequency
            <select
              value={cadence}
              onChange={(event) => {
                setCadence(
                  event.target.value as ReportScheduleCadence,
                )
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal text-slate-950"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Time
            <select
              value={hour}
              onChange={(event) => {
                setHour(Number(event.target.value))
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal text-slate-950"
            >
              {Array.from({ length: 24 }, (_, value) => (
                <option key={value} value={value}>
                  {new Date(2026, 0, 1, value).toLocaleTimeString([], {
                    hour: "numeric",
                  })}
                </option>
              ))}
            </select>
          </label>

          {cadence === "weekly" ? (
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
              Day of week
              <select
                value={dayOfWeek}
                onChange={(event) => {
                  setDayOfWeek(Number(event.target.value))
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal text-slate-950"
              >
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {cadence === "monthly" ? (
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
              Day of month
              <input
                type="number"
                min={1}
                max={28}
                value={dayOfMonth}
                onChange={(event) => {
                  setDayOfMonth(Number(event.target.value))
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal text-slate-950"
              />
            </label>
          ) : null}
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <div>
            {preference?.schedule ? (
              <button
                type="button"
                onClick={() => {
                  onRemove(report.id)
                  onClose()
                }}
                className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Remove Schedule
              </button>
            ) : null}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                onSave(report.id, {
                  cadence,
                  dayOfWeek:
                    cadence === "weekly" ? dayOfWeek : undefined,
                  dayOfMonth:
                    cadence === "monthly" ? dayOfMonth : undefined,
                  hour,
                })
                onClose()
              }}
              className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
