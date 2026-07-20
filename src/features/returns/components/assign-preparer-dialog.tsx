import {
  useEffect,
  useState,
} from "react"

import {
  getReturnStaffOptions,
} from "@/features/returns/services/return-service"
import type {
  ReturnStaffOption,
} from "@/features/returns/types/return.types"

interface AssignPreparerDialogProps {
  isOpen: boolean
  clientName: string
  taxYear: number
  returnType: string
  currentPreparerId: string | null
  onCancel: () => void
  onAssign: (
    preparerId: string | null,
  ) => Promise<void>
}

export function AssignPreparerDialog({
  isOpen,
  clientName,
  taxYear,
  returnType,
  currentPreparerId,
  onCancel,
  onAssign,
}: AssignPreparerDialogProps) {
  const [
    staff,
    setStaff,
  ] = useState<ReturnStaffOption[]>([])

  const [
    selectedPreparerId,
    setSelectedPreparerId,
  ] = useState("")

  const [
    isLoading,
    setIsLoading,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("")

  useEffect(() => {
    if (!isOpen) {
      return
    }

    async function loadStaff() {
      try {
        const options =
          await getReturnStaffOptions()

        setStaff(options)

        setSelectedPreparerId(
          currentPreparerId ?? "",
        )
      } catch {
        setErrorMessage(
          "Unable to load staff members.",
        )
      }
    }

    loadStaff()
  }, [
    isOpen,
    currentPreparerId,
  ])

  if (!isOpen) {
    return null
  }

  async function handleAssign() {
    try {
      setIsLoading(true)

      setErrorMessage("")

      await onAssign(
        selectedPreparerId || null,
      )
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(
          error.message,
        )
      } else {
        setErrorMessage(
          "Unable to assign preparer.",
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-slate-900">

        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold">
            Assign Preparer
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose the preparer responsible
            for this return.
          </p>
        </div>

        <div className="space-y-5 p-6">

          <div>
            <p className="text-sm font-medium">
              Client
            </p>

            <p className="text-slate-600 dark:text-slate-300">
              {clientName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-sm font-medium">
                Tax Year
              </p>

              <p>
                {taxYear}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">
                Return Type
              </p>

              <p>
                {returnType}
              </p>
            </div>

          </div>

          <div>

            <label
              className="mb-2 block text-sm font-medium"
            >
              Assigned Preparer
            </label>

            <select
              value={selectedPreparerId}
              onChange={(event) =>
                setSelectedPreparerId(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">
                Unassigned
              </option>

              {staff.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                >
                  {member.displayName}
                </option>
              ))}

            </select>

          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 px-4 py-2"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAssign}
            disabled={isLoading}
            className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
          >
            {isLoading
              ? "Assigning..."
              : "Assign Preparer"}
          </button>

        </div>

      </div>
    </div>
  )
}