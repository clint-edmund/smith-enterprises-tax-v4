import {
  useEffect,
  useMemo,
  useState,
} from "react"

import type {
  OrganizerBusiness,
  OrganizerBusinessAccountingMethod,
  OrganizerBusinessEntityType,
  OrganizerBusinessFormValues,
  OrganizerBusinessValidationErrors,
  SaveOrganizerBusinessRequest,
  UpdateOrganizerBusinessRequest,
} from "@/features/client-portal/types/organizer-business.types"

import {
  createOrganizerBusinessFormValues,
} from "@/features/client-portal/services/organizer-business-service"

import {
  emptyOrganizerBusinessFormValues,
} from "@/features/client-portal/types/organizer-business.types"

interface BusinessFormProps {
  organizerId: string
  business?: OrganizerBusiness | null
  isSaving?: boolean

  onCancel(): void

  onCreate(
    request: SaveOrganizerBusinessRequest,
  ): Promise<unknown>

  onUpdate(
    request: UpdateOrganizerBusinessRequest,
  ): Promise<unknown>
}

interface SelectOption<
  Value extends string,
> {
  value: Value
  label: string
}

const entityTypeOptions:
  SelectOption<OrganizerBusinessEntityType>[] = [
    {
      value: "",
      label: "Select an entity type",
    },
    {
      value: "sole_proprietorship",
      label: "Sole Proprietorship",
    },
    {
      value: "single_member_llc",
      label: "Single-Member LLC",
    },
    {
      value: "partnership",
      label: "Partnership",
    },
    {
      value: "multi_member_llc",
      label: "Multi-Member LLC",
    },
    {
      value: "s_corporation",
      label: "S Corporation",
    },
    {
      value: "c_corporation",
      label: "C Corporation",
    },
    {
      value: "farm",
      label: "Farm",
    },
    {
      value: "other",
      label: "Other",
    },
  ]

const accountingMethodOptions:
  SelectOption<OrganizerBusinessAccountingMethod>[] = [
    {
      value: "",
      label: "Select an accounting method",
    },
    {
      value: "cash",
      label: "Cash",
    },
    {
      value: "accrual",
      label: "Accrual",
    },
    {
      value: "other",
      label: "Other",
    },
  ]

const currencyFields = [
  {
    key: "grossReceipts",
    label: "Gross receipts or sales",
  },
  {
    key: "returnsAndAllowances",
    label: "Returns and allowances",
  },
  {
    key: "otherBusinessIncome",
    label: "Other business income",
  },
  {
    key: "costOfGoodsSold",
    label: "Cost of goods sold",
  },
  {
    key: "advertisingExpense",
    label: "Advertising",
  },
  {
    key: "carAndTruckExpense",
    label: "Car and truck expenses",
  },
  {
    key: "commissionsAndFeesExpense",
    label: "Commissions and fees",
  },
  {
    key: "contractLaborExpense",
    label: "Contract labor",
  },
  {
    key: "depreciationExpense",
    label: "Depreciation",
  },
  {
    key: "employeeBenefitExpense",
    label: "Employee benefit programs",
  },
  {
    key: "insuranceExpense",
    label: "Insurance",
  },
  {
    key: "interestExpense",
    label: "Interest",
  },
  {
    key: "legalAndProfessionalExpense",
    label: "Legal and professional services",
  },
  {
    key: "officeExpense",
    label: "Office expense",
  },
  {
    key: "pensionAndProfitSharingExpense",
    label: "Pension and profit-sharing plans",
  },
  {
    key: "rentOrLeaseExpense",
    label: "Rent or lease",
  },
  {
    key: "repairsAndMaintenanceExpense",
    label: "Repairs and maintenance",
  },
  {
    key: "suppliesExpense",
    label: "Supplies",
  },
  {
    key: "taxesAndLicensesExpense",
    label: "Taxes and licenses",
  },
  {
    key: "travelExpense",
    label: "Travel",
  },
  {
    key: "deductibleMealsExpense",
    label: "Deductible meals",
  },
  {
    key: "utilitiesExpense",
    label: "Utilities",
  },
  {
    key: "wagesExpense",
    label: "Wages",
  },
  {
    key: "otherExpense",
    label: "Other expense",
  },
] as const satisfies ReadonlyArray<{
  key:
    keyof OrganizerBusinessFormValues
  label: string
}>

function hasValidationErrors(
  errors:
    OrganizerBusinessValidationErrors,
): boolean {
  return Object.values(
    errors,
  ).some(Boolean)
}

function validateCurrency(
  value: string,
  label: string,
): string | undefined {
  const normalizedValue =
    value.trim()

  if (!normalizedValue) {
    return undefined
  }

  const numericValue =
    Number(normalizedValue)

  if (
    !Number.isFinite(
      numericValue,
    ) ||
    numericValue < 0
  ) {
    return `${label} must be zero or greater.`
  }

  return undefined
}

function validateForm(
  form:
    OrganizerBusinessFormValues,
): OrganizerBusinessValidationErrors {
  const errors:
    OrganizerBusinessValidationErrors = {}

  if (
    !form.businessName.trim() &&
    !form.dbaName.trim()
  ) {
    errors.businessName =
      "Enter a business name or DBA."
  }

  if (!form.entityType) {
    errors.entityType =
      "Select a business entity type."
  }

  if (
    !form
      .principalBusinessActivity
      .trim()
  ) {
    errors.principalBusinessActivity =
      "Enter the principal business activity."
  }

  if (
    form
      .employerIdentificationNumber
      .trim() &&
    !/^\d{2}-?\d{7}$/.test(
      form
        .employerIdentificationNumber
        .trim(),
    )
  ) {
    errors.employerIdentificationNumber =
      "Enter a valid nine-digit EIN."
  }

  if (
    form.state.trim() &&
    !/^[A-Za-z]{2}$/.test(
      form.state.trim(),
    )
  ) {
    errors.state =
      "Use a two-letter state abbreviation."
  }

  if (
    form.dateStarted &&
    form.dateClosed &&
    form.dateClosed <
      form.dateStarted
  ) {
    errors.dateClosed =
      "The closing date cannot be before the start date."
  }

  if (
    form.ownershipPercentage
      .trim()
  ) {
    const ownershipPercentage =
      Number(
        form
          .ownershipPercentage,
      )

    if (
      !Number.isFinite(
        ownershipPercentage,
      ) ||
      ownershipPercentage < 0 ||
      ownershipPercentage > 100
    ) {
      errors.ownershipPercentage =
        "Ownership must be between 0 and 100."
    }
  }

  if (
    form.wasActiveDuringTaxYear ===
    null
  ) {
    errors.wasActiveDuringTaxYear =
      "Confirm whether the business was active during the tax year."
  }

  for (
    const field of currencyFields
  ) {
    const value =
      form[field.key]

    if (
      typeof value ===
      "string"
    ) {
      const error =
        validateCurrency(
          value,
          field.label,
        )

      if (error) {
        errors[
          field.key as keyof OrganizerBusinessValidationErrors
        ] = error
      }
    }
  }

  if (
    form.otherExpense.trim() &&
    !form
      .otherExpenseDescription
      .trim()
  ) {
    errors.otherExpenseDescription =
      "Describe the other expense."
  }

  if (
    form.notes.length >
    10000
  ) {
    errors.notes =
      "Notes cannot exceed 10,000 characters."
  }

  return errors
}

function inputClassName(
  hasError: boolean,
): string {
  return [
    "mt-1 w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
  ].join(" ")
}

function FieldError({
  message,
}: {
  message?: string
}) {
  if (!message) {
    return null
  }

  return (
    <p className="mt-1 text-sm text-red-700">
      {message}
    </p>
  )
}

function YesNoField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: boolean | null
  onChange(
    value: boolean | null,
  ): void
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-800">
        {label}
      </legend>

      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="button"
          id={`${id}-yes`}
          onClick={() => {
            onChange(true)
          }}
          className={[
            "rounded-lg border px-4 py-2 text-sm font-medium",
            value === true
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-300 bg-white text-slate-700",
          ].join(" ")}
        >
          Yes
        </button>

        <button
          type="button"
          id={`${id}-no`}
          onClick={() => {
            onChange(false)
          }}
          className={[
            "rounded-lg border px-4 py-2 text-sm font-medium",
            value === false
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-300 bg-white text-slate-700",
          ].join(" ")}
        >
          No
        </button>
      </div>
    </fieldset>
  )
}

export function BusinessForm({
  organizerId,
  business = null,
  isSaving = false,
  onCancel,
  onCreate,
  onUpdate,
}: BusinessFormProps) {
  const [
    form,
    setForm,
  ] =
    useState<
      OrganizerBusinessFormValues
    >(
      business
        ? createOrganizerBusinessFormValues(
            business,
          )
        : emptyOrganizerBusinessFormValues,
    )

  const [
    validationErrors,
    setValidationErrors,
  ] =
    useState<
      OrganizerBusinessValidationErrors
    >({})

  const [
    pageMessage,
    setPageMessage,
  ] =
    useState<string | null>(
      null,
    )

  useEffect(() => {
    setForm(
      business
        ? createOrganizerBusinessFormValues(
            business,
          )
        : emptyOrganizerBusinessFormValues,
    )

    setValidationErrors({})
    setPageMessage(null)
  }, [
    business,
  ])

  const formTitle =
    business
      ? "Edit Business"
      : "Add Business"

  const submitLabel =
    business
      ? "Save Changes"
      : "Save Business"

  const isFormDisabled =
    isSaving ||
    !organizerId.trim()

  const hasErrors =
    useMemo(
      () =>
        hasValidationErrors(
          validationErrors,
        ),
      [
        validationErrors,
      ],
    )

  function updateField<
    Field extends
      keyof OrganizerBusinessFormValues,
  >(
    field: Field,
    value:
      OrganizerBusinessFormValues[Field],
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,
        [field]: value,
      }),
    )

    setValidationErrors(
      (currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
        form: undefined,
      }),
    )

    setPageMessage(null)
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const errors =
      validateForm(
        form,
      )

    setValidationErrors(
      errors,
    )

    if (
      hasValidationErrors(
        errors,
      )
    ) {
      setPageMessage(
        "Review the highlighted fields before saving.",
      )

      return
    }

    try {
      if (business) {
        await onUpdate({
          organizerId,
          businessId:
            business.id,
          business: form,
        })
      } else {
        await onCreate({
          organizerId,
          business: form,
        })
      }
    } catch {
      // The parent hook exposes the service error.
    }
  }

  return (
    <form
      className="space-y-8"
      onSubmit={handleSubmit}
      noValidate
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Business Organizer
          </p>

          <h2 className="text-2xl font-bold text-slate-950">
            {formTitle}
          </h2>

          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Enter the information available for this business. Atlas collects the information for staff review and does not calculate taxable business income.
          </p>
        </div>

        {pageMessage && (
          <div
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            {pageMessage}
          </div>
        )}

        {hasErrors && (
          <div className="sr-only">
            The form contains validation errors.
          </div>
        )}

        <div className="mt-6 space-y-8">
          <section>
            <h3 className="text-lg font-semibold text-slate-950">
              Business Identity
            </h3>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  Legal business name
                </span>

                <input
                  value={
                    form.businessName
                  }
                  onChange={(event) => {
                    updateField(
                      "businessName",
                      event.target.value,
                    )
                  }}
                  className={inputClassName(
                    Boolean(
                      validationErrors.businessName,
                    ),
                  )}
                  autoComplete="organization"
                />

                <FieldError
                  message={
                    validationErrors.businessName
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  DBA or trade name
                </span>

                <input
                  value={
                    form.dbaName
                  }
                  onChange={(event) => {
                    updateField(
                      "dbaName",
                      event.target.value,
                    )
                  }}
                  className={inputClassName(
                    Boolean(
                      validationErrors.businessName,
                    ),
                  )}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  Entity type
                </span>

                <select
                  value={
                    form.entityType
                  }
                  onChange={(event) => {
                    updateField(
                      "entityType",
                      event.target.value as OrganizerBusinessEntityType,
                    )
                  }}
                  className={inputClassName(
                    Boolean(
                      validationErrors.entityType,
                    ),
                  )}
                >
                  {entityTypeOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>

                <FieldError
                  message={
                    validationErrors.entityType
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  Employer Identification Number
                </span>

                <input
                  value={
                    form.employerIdentificationNumber
                  }
                  onChange={(event) => {
                    updateField(
                      "employerIdentificationNumber",
                      event.target.value,
                    )
                  }}
                  placeholder="12-3456789"
                  className={inputClassName(
                    Boolean(
                      validationErrors.employerIdentificationNumber,
                    ),
                  )}
                  inputMode="numeric"
                />

                <FieldError
                  message={
                    validationErrors.employerIdentificationNumber
                  }
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-800">
                  Principal business activity
                </span>

                <input
                  value={
                    form.principalBusinessActivity
                  }
                  onChange={(event) => {
                    updateField(
                      "principalBusinessActivity",
                      event.target.value,
                    )
                  }}
                  placeholder="Example: Residential cleaning services"
                  className={inputClassName(
                    Boolean(
                      validationErrors.principalBusinessActivity,
                    ),
                  )}
                />

                <FieldError
                  message={
                    validationErrors.principalBusinessActivity
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  Business code
                </span>

                <input
                  value={
                    form.businessCode
                  }
                  onChange={(event) => {
                    updateField(
                      "businessCode",
                      event.target.value,
                    )
                  }}
                  className={inputClassName(
                    false,
                  )}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  Ownership percentage
                </span>

                <input
                  value={
                    form.ownershipPercentage
                  }
                  onChange={(event) => {
                    updateField(
                      "ownershipPercentage",
                      event.target.value,
                    )
                  }}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className={inputClassName(
                    Boolean(
                      validationErrors.ownershipPercentage,
                    ),
                  )}
                />

                <FieldError
                  message={
                    validationErrors.ownershipPercentage
                  }
                />
              </label>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-8">
            <h3 className="text-lg font-semibold text-slate-950">
              Business Address
            </h3>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-800">
                  Address line 1
                </span>

                <input
                  value={
                    form.addressLine1
                  }
                  onChange={(event) => {
                    updateField(
                      "addressLine1",
                      event.target.value,
                    )
                  }}
                  className={inputClassName(
                    false,
                  )}
                  autoComplete="address-line1"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-800">
                  Address line 2
                </span>

                <input
                  value={
                    form.addressLine2
                  }
                  onChange={(event) => {
                    updateField(
                      "addressLine2",
                      event.target.value,
                    )
                  }}
                  className={inputClassName(
                    false,
                  )}
                  autoComplete="address-line2"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  City
                </span>

                <input
                  value={
                    form.city
                  }
                  onChange={(event) => {
                    updateField(
                      "city",
                      event.target.value,
                    )
                  }}
                  className={inputClassName(
                    false,
                  )}
                  autoComplete="address-level2"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  State
                </span>

                <input
                  value={
                    form.state
                  }
                  onChange={(event) => {
                    updateField(
                      "state",
                      event.target.value
                        .toUpperCase(),
                    )
                  }}
                  maxLength={2}
                  className={inputClassName(
                    Boolean(
                      validationErrors.state,
                    ),
                  )}
                  autoComplete="address-level1"
                />

                <FieldError
                  message={
                    validationErrors.state
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  Postal code
                </span>

                <input
                  value={
                    form.postalCode
                  }
                  onChange={(event) => {
                    updateField(
                      "postalCode",
                      event.target.value,
                    )
                  }}
                  className={inputClassName(
                    false,
                  )}
                  autoComplete="postal-code"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  Country
                </span>

                <input
                  value={
                    form.country
                  }
                  onChange={(event) => {
                    updateField(
                      "country",
                      event.target.value,
                    )
                  }}
                  className={inputClassName(
                    false,
                  )}
                  autoComplete="country-name"
                />
              </label>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-8">
            <h3 className="text-lg font-semibold text-slate-950">
              Operating Details
            </h3>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  Date started
                </span>

                <input
                  value={
                    form.dateStarted
                  }
                  onChange={(event) => {
                    updateField(
                      "dateStarted",
                      event.target.value,
                    )
                  }}
                  type="date"
                  className={inputClassName(
                    Boolean(
                      validationErrors.dateStarted,
                    ),
                  )}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  Date closed
                </span>

                <input
                  value={
                    form.dateClosed
                  }
                  onChange={(event) => {
                    updateField(
                      "dateClosed",
                      event.target.value,
                    )
                  }}
                  type="date"
                  className={inputClassName(
                    Boolean(
                      validationErrors.dateClosed,
                    ),
                  )}
                />

                <FieldError
                  message={
                    validationErrors.dateClosed
                  }
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  Accounting method
                </span>

                <select
                  value={
                    form.accountingMethod
                  }
                  onChange={(event) => {
                    updateField(
                      "accountingMethod",
                      event.target.value as OrganizerBusinessAccountingMethod,
                    )
                  }}
                  className={inputClassName(
                    Boolean(
                      validationErrors.accountingMethod,
                    ),
                  )}
                >
                  {accountingMethodOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <div>
                <YesNoField
                  id="active-during-tax-year"
                  label="Was the business active during the tax year?"
                  value={
                    form.wasActiveDuringTaxYear
                  }
                  onChange={(value) => {
                    updateField(
                      "wasActiveDuringTaxYear",
                      value,
                    )
                  }}
                />

                <FieldError
                  message={
                    validationErrors.wasActiveDuringTaxYear
                  }
                />
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <YesNoField
                id="home-office"
                label="Did you use a home office?"
                value={
                  form.hasHomeOffice
                }
                onChange={(value) => {
                  updateField(
                    "hasHomeOffice",
                    value,
                  )
                }}
              />

              <YesNoField
                id="employees"
                label="Did the business have employees?"
                value={
                  form.hasEmployees
                }
                onChange={(value) => {
                  updateField(
                    "hasEmployees",
                    value,
                  )
                }}
              />

              <YesNoField
                id="inventory"
                label="Did the business maintain inventory?"
                value={
                  form.hasInventory
                }
                onChange={(value) => {
                  updateField(
                    "hasInventory",
                    value,
                  )
                }}
              />

              <YesNoField
                id="vehicle"
                label="Was a vehicle used for business?"
                value={
                  form.usesVehicle
                }
                onChange={(value) => {
                  updateField(
                    "usesVehicle",
                    value,
                  )
                }}
              />

              <YesNoField
                id="bookkeeping"
                label="Are the business books and records complete?"
                value={
                  form.bookkeepingComplete
                }
                onChange={(value) => {
                  updateField(
                    "bookkeepingComplete",
                    value,
                  )
                }}
              />
            </div>
          </section>

          <section className="border-t border-slate-200 pt-8">
            <h3 className="text-lg font-semibold text-slate-950">
              Income and Expenses
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter totals available from your bookkeeping records. Leave a field blank when it does not apply.
            </p>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {currencyFields.map(
                (field) => {
                  const value =
                    form[field.key]

                  const error =
                    validationErrors[
                      field.key as keyof OrganizerBusinessValidationErrors
                    ]

                  return (
                    <label
                      key={
                        field.key
                      }
                      className="block"
                    >
                      <span className="text-sm font-medium text-slate-800">
                        {field.label}
                      </span>

                      <input
                        value={
                          typeof value ===
                          "string"
                            ? value
                            : ""
                        }
                        onChange={(event) => {
                          updateField(
                            field.key,
                            event.target.value as never,
                          )
                        }}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        className={inputClassName(
                          Boolean(
                            error,
                          ),
                        )}
                      />

                      <FieldError
                        message={
                          error
                        }
                      />
                    </label>
                  )
                },
              )}
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-800">
                Other expense description
              </span>

              <input
                value={
                  form.otherExpenseDescription
                }
                onChange={(event) => {
                  updateField(
                    "otherExpenseDescription",
                    event.target.value,
                  )
                }}
                className={inputClassName(
                  Boolean(
                    validationErrors.otherExpenseDescription,
                  ),
                )}
              />

              <FieldError
                message={
                  validationErrors.otherExpenseDescription
                }
              />
            </label>
          </section>

          <section className="border-t border-slate-200 pt-8">
            <label className="block">
              <span className="text-lg font-semibold text-slate-950">
                Notes for your preparer
              </span>

              <textarea
                value={
                  form.notes
                }
                onChange={(event) => {
                  updateField(
                    "notes",
                    event.target.value,
                  )
                }}
                rows={6}
                className={inputClassName(
                  Boolean(
                    validationErrors.notes,
                  ),
                )}
                placeholder="Add any details that will help staff understand this business."
              />

              <div className="mt-1 flex items-center justify-between gap-4">
                <FieldError
                  message={
                    validationErrors.notes
                  }
                />

                <span className="ml-auto text-xs text-slate-500">
                  {form.notes.length.toLocaleString()} / 10,000
                </span>
              </div>
            </label>
          </section>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            isFormDisabled
          }
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : submitLabel}
        </button>
      </div>
    </form>
  )
}
