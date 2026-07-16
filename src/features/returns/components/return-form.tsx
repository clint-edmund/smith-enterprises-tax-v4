import { zodResolver } from "@hookform/resolvers/zod"
import {
  Calculator,
  CalendarDays,
  FileText,
  Save,
  UserRound,
  X,
} from "lucide-react"
import {
  useEffect,
  useMemo,
} from "react"
import {
  useForm,
  useWatch,
} from "react-hook-form"

import {
  returnSchema,
  type ReturnSchemaValues,
} from "@/features/returns/schemas/return-schema"
import type {
  ReturnClientOption,
  ReturnFormMode,
  ReturnStaffOption,
  ReturnStatus,
  TaxReturnFormValues,
} from "@/features/returns/types/return.types"
import {
  filingStatusOptions,
  getTaxYearOptions,
  returnTypeOptions,
  taxFormOptions,
} from "@/features/returns/utils/return-options"
import {
  formatClientNumber,
} from "@/features/clients/utils/client-formatters"
import {
  getAllowedReturnStatuses,
} from "@/features/returns/utils/return-workflow"


interface ReturnFormProps {
  mode: ReturnFormMode
  clients: ReturnClientOption[]
  staffOptions: ReturnStaffOption[]
  defaultValues: TaxReturnFormValues
  currentStatus?: ReturnStatus
  submitLabel?: string
  isSubmitting: boolean
  errorMessage: string | null
  onSubmit: (
    values: TaxReturnFormValues,
  ) => Promise<void>
  onCancel: () => void
}

export function ReturnForm({
  mode,
  clients,
  staffOptions,
  defaultValues,
  currentStatus,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: ReturnFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: {
      errors,
    },
  } = useForm<ReturnSchemaValues>({
    resolver: zodResolver(returnSchema),
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const preparationFee =
    useWatch({
      control,
      name: "preparationFee",
    }) || 0

  const discountAmount =
    useWatch({
      control,
      name: "discountAmount",
    }) || 0

  const extensionFiled =
    useWatch({
      control,
      name: "extensionFiled",
    }) || false

  const selectedStatus =
    useWatch({
      control,
      name: "status",
    })

  const assignedPreparerId =
    useWatch({
      control,
      name: "assignedPreparerId",
    }) || ""

  const assignedReviewerId =
    useWatch({
      control,
      name: "assignedReviewerId",
    }) || ""

  const netFee = Math.max(
    preparationFee -
      discountAmount,
    0,
  )

  const taxYearOptions =
    getTaxYearOptions()

  const statusOptions =
    useMemo(
      () =>
        getAllowedReturnStatuses(
          mode === "edit"
            ? currentStatus
            : undefined,
        ),
      [
        currentStatus,
        mode,
      ],
    )

  const preparerOptions =
    staffOptions.filter(
      (staff) =>
        staff.role === "administrator" ||
        staff.role === "manager" ||
        staff.role === "preparer",
    )

  const reviewerOptions =
    staffOptions.filter(
      (staff) =>
        staff.role === "administrator" ||
        staff.role === "manager" ||
        staff.role === "reviewer",
    )

  const preparerRequiredStatuses =
    new Set<ReturnStatus>([
      "in_progress",
      "ready_for_review",
      "under_review",
      "ready_to_file",
      "filed",
      "accepted",
      "completed",
    ])

  const reviewerRequiredStatuses =
    new Set<ReturnStatus>([
      "under_review",
      "ready_to_file",
    ])

  const requiresPreparer =
    preparerRequiredStatuses.has(
      selectedStatus,
    )

  const requiresReviewer =
    reviewerRequiredStatuses.has(
      selectedStatus,
    )

  const hasSameStaffAssignment =
    assignedPreparerId !== "" &&
    assignedReviewerId !== "" &&
    assignedPreparerId ===
      assignedReviewerId

  const buttonLabel =
    submitLabel ??
    (mode === "edit"
      ? "Save Changes"
      : "Create Return")

  const submittingLabel =
    mode === "edit"
      ? "Saving Changes..."
      : "Creating Return..."

  function fieldClasses(
    hasError: boolean,
  ): string {
    const baseClasses =
      "w-full rounded-lg border bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:ring-4 disabled:bg-slate-100"

    return hasError
      ? `${baseClasses} border-red-400 focus:border-red-600 focus:ring-red-100`
      : `${baseClasses} border-slate-300 focus:border-blue-600 focus:ring-blue-100`
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {errorMessage && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <FileText className="size-5 text-blue-700" />

          <h2 className="text-lg font-bold text-slate-950">
            Return information
          </h2>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-3">
            <label
              htmlFor="clientId"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Client
            </label>

            <select
              id="clientId"
              {...register("clientId")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.clientId),
              )}
            >
              <option value="">
                Select a client
              </option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.lastName},{" "}
                  {client.firstName} —{" "}
                  {formatClientNumber(
                    client.clientNumber,
                  )}
                </option>
              ))}
            </select>

            {errors.clientId && (
              <p className="mt-1 text-sm text-red-700">
                {errors.clientId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="taxYear"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Tax year
            </label>

            <select
              id="taxYear"
              {...register(
                "taxYear",
                {
                  valueAsNumber: true,
                },
              )}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.taxYear),
              )}
            >
              {taxYearOptions.map(
                (year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ),
              )}
            </select>

            {errors.taxYear && (
              <p className="mt-1 text-sm text-red-700">
                {errors.taxYear.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="returnType"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Return category
            </label>

            <select
              id="returnType"
              {...register("returnType")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.returnType),
              )}
            >
              {returnTypeOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="taxForm"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Tax form
            </label>

            <select
              id="taxForm"
              {...register("taxForm")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.taxForm),
              )}
            >
              {taxFormOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="filingStatus"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Filing status
            </label>

            <select
              id="filingStatus"
              {...register("filingStatus")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(
                  errors.filingStatus,
                ),
              )}
            >
              {filingStatusOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Workflow status
            </label>

            <select
              id="status"
              {...register("status")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.status),
              )}
            >
              {statusOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>

            {mode === "edit" &&
              currentStatus && (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Only workflow transitions permitted
                  from the current status are shown.
                </p>
              )}
          </div>

          <div className="md:col-span-2 xl:col-span-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-950">
              Workflow requirements
            </p>

            <ul className="mt-2 space-y-1 text-sm leading-6 text-blue-900">
              {requiresPreparer && (
                <li>
                  An active authorized preparer is required
                  for the selected status.
                </li>
              )}

              {requiresReviewer && (
                <li>
                  An active authorized reviewer is required
                  for the selected status.
                </li>
              )}

              {selectedStatus === "filed" && (
                <li>
                  The filed date will default to today when
                  left blank.
                </li>
              )}

              {(selectedStatus === "accepted" ||
                selectedStatus === "completed") && (
                <li>
                  Filed and accepted dates will default to
                  today when left blank.
                </li>
              )}

              {selectedStatus === "rejected" && (
                <li>
                  Saving a rejected return clears its
                  accepted date while preserving the filed
                  date.
                </li>
              )}

              {!requiresPreparer &&
                !requiresReviewer &&
                selectedStatus !== "filed" &&
                selectedStatus !== "accepted" &&
                selectedStatus !== "completed" &&
                selectedStatus !== "rejected" && (
                  <li>
                    No additional staff or automatic-date
                    requirements apply to this status.
                  </li>
                )}
            </ul>

            {hasSameStaffAssignment && (
              <p className="mt-3 text-sm font-semibold text-red-700">
                The preparer and reviewer must be different
                staff members.
              </p>
            )}
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Description
            </label>

            <input
              id="description"
              {...register("description")}
              disabled={isSubmitting}
              placeholder="Optional return description"
              className={fieldClasses(
                Boolean(errors.description),
              )}
            />

            {errors.description && (
              <p className="mt-1 text-sm text-red-700">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <UserRound className="size-5 text-blue-700" />

          <h2 className="text-lg font-bold text-slate-950">
            Staff assignments
          </h2>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="assignedPreparerId"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Assigned preparer
            </label>

            <select
              id="assignedPreparerId"
              {...register(
                "assignedPreparerId",
              )}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(
                  errors.assignedPreparerId,
                ),
              )}
            >
              <option value="">
                Unassigned
              </option>

              {preparerOptions.map(
                (staff) => (
                  <option
                    key={staff.id}
                    value={staff.id}
                  >
                    {staff.displayName}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="assignedReviewerId"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Assigned reviewer
            </label>

            <select
              id="assignedReviewerId"
              {...register(
                "assignedReviewerId",
              )}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(
                  errors.assignedReviewerId,
                ),
              )}
            >
              <option value="">
                Unassigned
              </option>

              {reviewerOptions.map(
                (staff) => (
                  <option
                    key={staff.id}
                    value={staff.id}
                  >
                    {staff.displayName}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-5 text-blue-700" />

          <h2 className="text-lg font-bold text-slate-950">
            Important dates
          </h2>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label
              htmlFor="dateReceived"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Date received
            </label>

            <input
              id="dateReceived"
              type="date"
              {...register("dateReceived")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(
                  errors.dateReceived,
                ),
              )}
            />
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Due date
            </label>

            <input
              id="dueDate"
              type="date"
              {...register("dueDate")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.dueDate),
              )}
            />

            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-700">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="filedDate"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Filed date
            </label>

            <input
              id="filedDate"
              type="date"
              {...register("filedDate")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.filedDate),
              )}
            />

            {errors.filedDate && (
              <p className="mt-1 text-sm text-red-700">
                {errors.filedDate.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="acceptedDate"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Accepted date
            </label>

            <input
              id="acceptedDate"
              type="date"
              {...register("acceptedDate")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(
                  errors.acceptedDate,
                ),
              )}
            />

            {errors.acceptedDate && (
              <p className="mt-1 text-sm text-red-700">
                {errors.acceptedDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register("extensionFiled")}
              disabled={isSubmitting}
              className="size-5"
            />

            <span className="font-medium text-slate-800">
              Extension filed
            </span>
          </label>

          {extensionFiled && (
            <div className="mt-4 max-w-sm">
              <label
                htmlFor="extensionDate"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                Extension filing date
              </label>

              <input
                id="extensionDate"
                type="date"
                {...register(
                  "extensionDate",
                )}
                disabled={isSubmitting}
                className={fieldClasses(
                  Boolean(
                    errors.extensionDate,
                  ),
                )}
              />

              {errors.extensionDate && (
                <p className="mt-1 text-sm text-red-700">
                  {
                    errors.extensionDate
                      .message
                  }
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Filing requirements
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
            <input
              type="checkbox"
              {...register(
                "federalReturnRequired",
              )}
              disabled={isSubmitting}
              className="size-5"
            />

            <span className="font-medium text-slate-800">
              Federal return
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
            <input
              type="checkbox"
              {...register(
                "stateReturnRequired",
              )}
              disabled={isSubmitting}
              className="size-5"
            />

            <span className="font-medium text-slate-800">
              State return
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
            <input
              type="checkbox"
              {...register(
                "localReturnRequired",
              )}
              disabled={isSubmitting}
              className="size-5"
            />

            <span className="font-medium text-slate-800">
              Local return
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Calculator className="size-5 text-blue-700" />

          <h2 className="text-lg font-bold text-slate-950">
            Fees and estimates
          </h2>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label
              htmlFor="preparationFee"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Preparation fee
            </label>

            <input
              id="preparationFee"
              type="number"
              min="0"
              step="0.01"
              {...register(
                "preparationFee",
                {
                  valueAsNumber: true,
                },
              )}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(
                  errors.preparationFee,
                ),
              )}
            />
          </div>

          <div>
            <label
              htmlFor="discountAmount"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Discount
            </label>

            <input
              id="discountAmount"
              type="number"
              min="0"
              step="0.01"
              {...register(
                "discountAmount",
                {
                  valueAsNumber: true,
                },
              )}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(
                  errors.discountAmount,
                ),
              )}
            />

            {errors.discountAmount && (
              <p className="mt-1 text-sm text-red-700">
                {
                  errors.discountAmount
                    .message
                }
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="estimatedRefund"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Estimated refund
            </label>

            <input
              id="estimatedRefund"
              type="number"
              min="0"
              step="0.01"
              {...register(
                "estimatedRefund",
                {
                  valueAsNumber: true,
                },
              )}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(
                  errors.estimatedRefund,
                ),
              )}
            />
          </div>

          <div>
            <label
              htmlFor="estimatedAmountDue"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Estimated amount due
            </label>

            <input
              id="estimatedAmountDue"
              type="number"
              min="0"
              step="0.01"
              {...register(
                "estimatedAmountDue",
                {
                  valueAsNumber: true,
                },
              )}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(
                  errors.estimatedAmountDue,
                ),
              )}
            />
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-700">
            Net preparation fee
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-950">
            {new Intl.NumberFormat(
              "en-US",
              {
                style: "currency",
                currency: "USD",
              },
            ).format(netFee)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Internal notes
        </h2>

        <textarea
          id="notes"
          rows={6}
          {...register("notes")}
          disabled={isSubmitting}
          className={`mt-5 ${fieldClasses(
            Boolean(errors.notes),
          )}`}
        />

        <p className="mt-2 text-xs text-slate-500">
          Do not enter passwords, full Social Security
          numbers, payment-card numbers, or banking
          credentials.
        </p>

        {errors.notes && (
          <p className="mt-1 text-sm text-red-700">
            {errors.notes.message}
          </p>
        )}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <X className="size-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <Save className="size-4" />

          {isSubmitting
            ? submittingLabel
            : buttonLabel}
        </button>
      </div>
    </form>
  )
}