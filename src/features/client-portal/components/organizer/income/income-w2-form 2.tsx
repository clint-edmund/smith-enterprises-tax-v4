import {
  useEffect,
  useState,
  type FormEvent,
} from "react"

import {
  OrganizerCheckboxField,
  OrganizerFormActions,
  OrganizerTextField,
} from "@/features/client-portal/components/organizer/form"
import {
  OrganizerSectionCard,
  OrganizerValidationSummary,
} from "@/features/client-portal/components/organizer"
import type {
  OrganizerIncomeSource,
  OrganizerIncomeW2Details,
  SaveIncomeW2DetailsRequest,
} from "@/features/client-portal/types/organizer-income.types"

interface IncomeW2FormProps {
  organizerId: string
  incomeSource: OrganizerIncomeSource
  w2Details?: OrganizerIncomeW2Details | null
  isLoading?: boolean
  isSaving?: boolean
  onCancel: () => void
  onSave: (
    request: SaveIncomeW2DetailsRequest,
  ) => Promise<void>
}

interface IncomeW2FormState {
  employerIdentificationNumber: string
  wages: string
  federalIncomeTaxWithheld: string
  socialSecurityWages: string
  socialSecurityTaxWithheld: string
  medicareWages: string
  medicareTaxWithheld: string
  stateCode: string
  stateWages: string
  stateIncomeTaxWithheld: string
  localWages: string
  localIncomeTaxWithheld: string
  documentReceived: boolean
}

type AmountField =
  | "wages"
  | "federalIncomeTaxWithheld"
  | "socialSecurityWages"
  | "socialSecurityTaxWithheld"
  | "medicareWages"
  | "medicareTaxWithheld"
  | "stateWages"
  | "stateIncomeTaxWithheld"
  | "localWages"
  | "localIncomeTaxWithheld"

interface IncomeW2FormErrors {
  employerIdentificationNumber?: string
  stateCode?: string
  wages?: string
  federalIncomeTaxWithheld?: string
  socialSecurityWages?: string
  socialSecurityTaxWithheld?: string
  medicareWages?: string
  medicareTaxWithheld?: string
  stateWages?: string
  stateIncomeTaxWithheld?: string
  localWages?: string
  localIncomeTaxWithheld?: string
  form?: string
}

const amountLabels: Record<AmountField, string> = {
  wages: "Wages",
  federalIncomeTaxWithheld: "Federal income tax withheld",
  socialSecurityWages: "Social Security wages",
  socialSecurityTaxWithheld: "Social Security tax withheld",
  medicareWages: "Medicare wages",
  medicareTaxWithheld: "Medicare tax withheld",
  stateWages: "State wages",
  stateIncomeTaxWithheld: "State income tax withheld",
  localWages: "Local wages",
  localIncomeTaxWithheld: "Local income tax withheld",
}

function toInputValue(
  value: number | null,
): string {
  return value === null
    ? ""
    : String(value)
}

function createFormState(
  incomeSource: OrganizerIncomeSource,
  details: OrganizerIncomeW2Details | null,
): IncomeW2FormState {
  return {
    employerIdentificationNumber:
      details?.employerIdentificationNumber ?? "",
    wages: toInputValue(details?.wages ?? null),
    federalIncomeTaxWithheld: toInputValue(
      details?.federalIncomeTaxWithheld ?? null,
    ),
    socialSecurityWages: toInputValue(
      details?.socialSecurityWages ?? null,
    ),
    socialSecurityTaxWithheld: toInputValue(
      details?.socialSecurityTaxWithheld ?? null,
    ),
    medicareWages: toInputValue(
      details?.medicareWages ?? null,
    ),
    medicareTaxWithheld: toInputValue(
      details?.medicareTaxWithheld ?? null,
    ),
    stateCode: details?.stateCode ?? "",
    stateWages: toInputValue(
      details?.stateWages ?? null,
    ),
    stateIncomeTaxWithheld: toInputValue(
      details?.stateIncomeTaxWithheld ?? null,
    ),
    localWages: toInputValue(
      details?.localWages ?? null,
    ),
    localIncomeTaxWithheld: toInputValue(
      details?.localIncomeTaxWithheld ?? null,
    ),
    documentReceived:
      incomeSource.documentReceived,
  }
}

function parseAmount(
  value: string,
): number | null {
  const normalized = value.trim()

  if (!normalized) {
    return null
  }

  return Number(normalized)
}

export function IncomeW2Form({
  organizerId,
  incomeSource,
  w2Details = null,
  isLoading = false,
  isSaving = false,
  onCancel,
  onSave,
}: IncomeW2FormProps) {
  const [
    form,
    setForm,
  ] = useState<IncomeW2FormState>(
    () =>
      createFormState(
        incomeSource,
        w2Details,
      ),
  )

  const [
    errors,
    setErrors,
  ] = useState<IncomeW2FormErrors>({})

  useEffect(() => {
    setForm(
      createFormState(
        incomeSource,
        w2Details,
      ),
    )
    setErrors({})
  }, [incomeSource, w2Details])

  function updateField<
    Field extends keyof IncomeW2FormState,
  >(
    field: Field,
    value: IncomeW2FormState[Field],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }))
  }

  function validateForm(): IncomeW2FormErrors {
    const nextErrors: IncomeW2FormErrors = {}
    const einDigits =
      form.employerIdentificationNumber.replace(
        /\D/g,
        "",
      )

    if (einDigits && einDigits.length !== 9) {
      nextErrors.employerIdentificationNumber =
        "Employer EIN must contain exactly nine digits."
    }

    const stateCode =
      form.stateCode.trim().toUpperCase()

    if (
      stateCode &&
      !/^[A-Z]{2}$/.test(stateCode)
    ) {
      nextErrors.stateCode =
        "State must contain a two-letter code."
    }

    for (
      const field of Object.keys(
        amountLabels,
      ) as AmountField[]
    ) {
      const value = form[field].trim()

      if (!value) {
        continue
      }

      const parsed = Number(value)

      if (!Number.isFinite(parsed)) {
        nextErrors[field] =
          `${amountLabels[field]} must be a valid number.`
      } else if (parsed < 0) {
        nextErrors[field] =
          `${amountLabels[field]} cannot be negative.`
      }
    }

    return nextErrors
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const nextErrors = validateForm()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      await onSave({
        organizerId,
        incomeSourceId:
          incomeSource.incomeSourceId,
        employerIdentificationNumber:
          form.employerIdentificationNumber.replace(
            /\D/g,
            "",
          ),
        wages: parseAmount(form.wages),
        federalIncomeTaxWithheld: parseAmount(
          form.federalIncomeTaxWithheld,
        ),
        socialSecurityWages: parseAmount(
          form.socialSecurityWages,
        ),
        socialSecurityTaxWithheld: parseAmount(
          form.socialSecurityTaxWithheld,
        ),
        medicareWages: parseAmount(
          form.medicareWages,
        ),
        medicareTaxWithheld: parseAmount(
          form.medicareTaxWithheld,
        ),
        stateCode:
          form.stateCode.trim().toUpperCase(),
        stateWages: parseAmount(
          form.stateWages,
        ),
        stateIncomeTaxWithheld: parseAmount(
          form.stateIncomeTaxWithheld,
        ),
        localWages: parseAmount(
          form.localWages,
        ),
        localIncomeTaxWithheld: parseAmount(
          form.localIncomeTaxWithheld,
        ),
        documentReceived:
          form.documentReceived,
      })
    } catch {
      setErrors((current) => ({
        ...current,
        form:
          "The W-2 details could not be saved. Review the page message and try again.",
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
        Loading W-2 details...
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
          W-2 Employment
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          {incomeSource.payerName}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter each amount exactly as shown on the W-2. Leave fields blank when the form does not report a value.
        </p>
      </header>

      {errors.form && (
        <OrganizerValidationSummary
          variant="error"
          title="Unable to save W-2"
          message={errors.form}
        />
      )}

      <OrganizerSectionCard
        title="Employer Information"
        description="Enter the employer identification number shown in Box b."
      >
        <OrganizerTextField
          id="w2-employer-ein"
          label="Employer Identification Number (EIN)"
          value={
            form.employerIdentificationNumber
          }
          error={
            errors.employerIdentificationNumber
          }
          disabled={isSaving}
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          placeholder="12-3456789"
          onChange={(event) => {
            updateField(
              "employerIdentificationNumber",
              event.target.value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Federal Income"
        description="Enter Box 1 wages and Box 2 federal income tax withheld."
        contentClassName="grid gap-6 md:grid-cols-2"
      >
        <AmountFieldInput
          id="w2-wages"
          label="Wages, Tips, and Other Compensation"
          value={form.wages}
          error={errors.wages}
          disabled={isSaving}
          onChange={(value) => {
            updateField("wages", value)
          }}
        />
        <AmountFieldInput
          id="w2-federal-withholding"
          label="Federal Income Tax Withheld"
          value={
            form.federalIncomeTaxWithheld
          }
          error={
            errors.federalIncomeTaxWithheld
          }
          disabled={isSaving}
          onChange={(value) => {
            updateField(
              "federalIncomeTaxWithheld",
              value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Social Security"
        description="Enter Box 3 Social Security wages and Box 4 Social Security tax withheld."
        contentClassName="grid gap-6 md:grid-cols-2"
      >
        <AmountFieldInput
          id="w2-social-security-wages"
          label="Social Security Wages"
          value={form.socialSecurityWages}
          error={errors.socialSecurityWages}
          disabled={isSaving}
          onChange={(value) => {
            updateField(
              "socialSecurityWages",
              value,
            )
          }}
        />
        <AmountFieldInput
          id="w2-social-security-tax"
          label="Social Security Tax Withheld"
          value={
            form.socialSecurityTaxWithheld
          }
          error={
            errors.socialSecurityTaxWithheld
          }
          disabled={isSaving}
          onChange={(value) => {
            updateField(
              "socialSecurityTaxWithheld",
              value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Medicare"
        description="Enter Box 5 Medicare wages and Box 6 Medicare tax withheld."
        contentClassName="grid gap-6 md:grid-cols-2"
      >
        <AmountFieldInput
          id="w2-medicare-wages"
          label="Medicare Wages and Tips"
          value={form.medicareWages}
          error={errors.medicareWages}
          disabled={isSaving}
          onChange={(value) => {
            updateField(
              "medicareWages",
              value,
            )
          }}
        />
        <AmountFieldInput
          id="w2-medicare-tax"
          label="Medicare Tax Withheld"
          value={
            form.medicareTaxWithheld
          }
          error={errors.medicareTaxWithheld}
          disabled={isSaving}
          onChange={(value) => {
            updateField(
              "medicareTaxWithheld",
              value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="State Information"
        description="Enter the state code, state wages, and state income tax withheld."
        contentClassName="grid gap-6 md:grid-cols-3"
      >
        <OrganizerTextField
          id="w2-state-code"
          label="State"
          value={form.stateCode}
          error={errors.stateCode}
          disabled={isSaving}
          maxLength={2}
          placeholder="VA"
          onChange={(event) => {
            updateField(
              "stateCode",
              event.target.value.toUpperCase(),
            )
          }}
        />
        <AmountFieldInput
          id="w2-state-wages"
          label="State Wages"
          value={form.stateWages}
          error={errors.stateWages}
          disabled={isSaving}
          onChange={(value) => {
            updateField(
              "stateWages",
              value,
            )
          }}
        />
        <AmountFieldInput
          id="w2-state-tax"
          label="State Income Tax Withheld"
          value={
            form.stateIncomeTaxWithheld
          }
          error={
            errors.stateIncomeTaxWithheld
          }
          disabled={isSaving}
          onChange={(value) => {
            updateField(
              "stateIncomeTaxWithheld",
              value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Local Information"
        description="Enter local wages and local income tax withheld when reported."
        contentClassName="grid gap-6 md:grid-cols-2"
      >
        <AmountFieldInput
          id="w2-local-wages"
          label="Local Wages"
          value={form.localWages}
          error={errors.localWages}
          disabled={isSaving}
          onChange={(value) => {
            updateField(
              "localWages",
              value,
            )
          }}
        />
        <AmountFieldInput
          id="w2-local-tax"
          label="Local Income Tax Withheld"
          value={
            form.localIncomeTaxWithheld
          }
          error={
            errors.localIncomeTaxWithheld
          }
          disabled={isSaving}
          onChange={(value) => {
            updateField(
              "localIncomeTaxWithheld",
              value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Document Status"
        description="Confirm whether the supporting W-2 has been uploaded or delivered."
      >
        <OrganizerCheckboxField
          id="w2-document-received"
          label="W-2 document received"
          description="Mark this after the W-2 has been uploaded or otherwise provided to the tax office."
          checked={form.documentReceived}
          disabled={isSaving}
          onChange={(event) => {
            updateField(
              "documentReceived",
              event.target.checked,
            )
          }}
        />
      </OrganizerSectionCard>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <OrganizerFormActions
          isSaving={isSaving}
          saveLabel="Save W-2"
          cancelLabel="Back"
          onCancel={onCancel}
        />
      </div>
    </form>
  )
}

interface AmountFieldInputProps {
  id: string
  label: string
  value: string
  error?: string
  disabled: boolean
  onChange: (value: string) => void
}

function AmountFieldInput({
  id,
  label,
  value,
  error,
  disabled,
  onChange,
}: AmountFieldInputProps) {
  return (
    <OrganizerTextField
      id={id}
      label={label}
      value={value}
      error={error}
      disabled={disabled}
      inputMode="decimal"
      placeholder="0.00"
      onChange={(event) => {
        onChange(event.target.value)
      }}
    />
  )
}
