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
} from "@/features/client-portal/types/organizer-income.types"

import type {
  OrganizerIncome1099IntDetails,
  SaveOrganizerIncome1099IntRequest,
} from "@/features/client-portal/types/organizer-income-1099.types"

import {
  Income1099AmountField,
  parseAmountInput,
  toAmountInput,
  validateAmountInput,
} from "./income-1099-form-fields"

interface Income1099IntFormProps {
  organizerId: string
  incomeSource: OrganizerIncomeSource
  details?:
    OrganizerIncome1099IntDetails | null
  isLoading?: boolean
  isSaving?: boolean
  errorMessage?: string | null
  onCancel: () => void
  onSave: (
    request:
      SaveOrganizerIncome1099IntRequest,
  ) => Promise<void>
}

interface FormState {
  payerIdentificationNumber: string
  interestIncome: string
  earlyWithdrawalPenalty: string
  interestOnUsSavingsBondsAndTreasuryObligations:
    string
  federalIncomeTaxWithheld: string
  investmentExpenses: string
  foreignTaxPaid: string
  foreignCountryOrUsPossession: string
  taxExemptInterest: string
  specifiedPrivateActivityBondInterest:
    string
  marketDiscount: string
  bondPremium: string
  bondPremiumOnTreasuryObligations:
    string
  bondPremiumOnTaxExemptBond: string
  stateCode: string
  stateIdentificationNumber: string
  stateTaxWithheld: string
  documentReceived: boolean
}

type AmountField =
  | "interestIncome"
  | "earlyWithdrawalPenalty"
  | "interestOnUsSavingsBondsAndTreasuryObligations"
  | "federalIncomeTaxWithheld"
  | "investmentExpenses"
  | "foreignTaxPaid"
  | "taxExemptInterest"
  | "specifiedPrivateActivityBondInterest"
  | "marketDiscount"
  | "bondPremium"
  | "bondPremiumOnTreasuryObligations"
  | "bondPremiumOnTaxExemptBond"
  | "stateTaxWithheld"

type FormErrors =
  Partial<
    Record<
      keyof FormState | "form",
      string
    >
  >

const amountLabels:
  Record<AmountField, string> = {
    interestIncome:
      "Interest income",
    earlyWithdrawalPenalty:
      "Early withdrawal penalty",
    interestOnUsSavingsBondsAndTreasuryObligations:
      "U.S. Savings Bond and Treasury interest",
    federalIncomeTaxWithheld:
      "Federal income tax withheld",
    investmentExpenses:
      "Investment expenses",
    foreignTaxPaid:
      "Foreign tax paid",
    taxExemptInterest:
      "Tax-exempt interest",
    specifiedPrivateActivityBondInterest:
      "Private activity bond interest",
    marketDiscount:
      "Market discount",
    bondPremium:
      "Bond premium",
    bondPremiumOnTreasuryObligations:
      "Treasury obligation bond premium",
    bondPremiumOnTaxExemptBond:
      "Tax-exempt bond premium",
    stateTaxWithheld:
      "State tax withheld",
  }

function createFormState(
  incomeSource:
    OrganizerIncomeSource,
  details:
    OrganizerIncome1099IntDetails | null,
): FormState {
  return {
    payerIdentificationNumber:
      details?.payerIdentificationNumber ??
      "",
    interestIncome:
      toAmountInput(
        details?.interestIncome ??
          null,
      ),
    earlyWithdrawalPenalty:
      toAmountInput(
        details?.earlyWithdrawalPenalty ??
          null,
      ),
    interestOnUsSavingsBondsAndTreasuryObligations:
      toAmountInput(
        details
          ?.interestOnUsSavingsBondsAndTreasuryObligations ??
          null,
      ),
    federalIncomeTaxWithheld:
      toAmountInput(
        details
          ?.federalIncomeTaxWithheld ??
          null,
      ),
    investmentExpenses:
      toAmountInput(
        details?.investmentExpenses ??
          null,
      ),
    foreignTaxPaid:
      toAmountInput(
        details?.foreignTaxPaid ??
          null,
      ),
    foreignCountryOrUsPossession:
      details
        ?.foreignCountryOrUsPossession ??
      "",
    taxExemptInterest:
      toAmountInput(
        details?.taxExemptInterest ??
          null,
      ),
    specifiedPrivateActivityBondInterest:
      toAmountInput(
        details
          ?.specifiedPrivateActivityBondInterest ??
          null,
      ),
    marketDiscount:
      toAmountInput(
        details?.marketDiscount ??
          null,
      ),
    bondPremium:
      toAmountInput(
        details?.bondPremium ??
          null,
      ),
    bondPremiumOnTreasuryObligations:
      toAmountInput(
        details
          ?.bondPremiumOnTreasuryObligations ??
          null,
      ),
    bondPremiumOnTaxExemptBond:
      toAmountInput(
        details
          ?.bondPremiumOnTaxExemptBond ??
          null,
      ),
    stateCode:
      details?.stateCode ?? "",
    stateIdentificationNumber:
      details
        ?.stateIdentificationNumber ??
      "",
    stateTaxWithheld:
      toAmountInput(
        details?.stateTaxWithheld ??
          null,
      ),
    documentReceived:
      incomeSource.documentReceived,
  }
}

export function Income1099IntForm({
  organizerId,
  incomeSource,
  details = null,
  isLoading = false,
  isSaving = false,
  errorMessage = null,
  onCancel,
  onSave,
}: Income1099IntFormProps) {
  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      () =>
        createFormState(
          incomeSource,
          details,
        ),
    )

  const [
    errors,
    setErrors,
  ] =
    useState<FormErrors>({})

  useEffect(() => {
    setForm(
      createFormState(
        incomeSource,
        details,
      ),
    )
    setErrors({})
  }, [
    incomeSource,
    details,
  ])

  function updateField<
    Field extends keyof FormState,
  >(
    field: Field,
    value: FormState[Field],
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    )

    setErrors(
      (current) => ({
        ...current,
        [field]:
          undefined,
        form:
          undefined,
      }),
    )
  }

  function validateForm():
    FormErrors {
    const nextErrors:
      FormErrors = {}

    const payerDigits =
      form.payerIdentificationNumber.replace(
        /\D/g,
        "",
      )

    if (
      payerDigits &&
      payerDigits.length !== 9
    ) {
      nextErrors.payerIdentificationNumber =
        "Payer TIN must contain exactly nine digits."
    }

    const stateCode =
      form.stateCode
        .trim()
        .toUpperCase()

    if (
      stateCode &&
      !/^[A-Z]{2}$/.test(
        stateCode,
      )
    ) {
      nextErrors.stateCode =
        "State must contain a two-letter code."
    }

    for (
      const field of Object.keys(
        amountLabels,
      ) as AmountField[]
    ) {
      const error =
        validateAmountInput(
          form[field],
          amountLabels[field],
        )

      if (error) {
        nextErrors[field] =
          error
      }
    }

    if (
      form.documentReceived &&
      !form.interestIncome.trim()
    ) {
      nextErrors.interestIncome =
        "Interest income is required when the 1099-INT document has been received."
    }

    return nextErrors
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const nextErrors =
      validateForm()

    setErrors(nextErrors)

    if (
      Object.keys(
        nextErrors,
      ).length > 0
    ) {
      return
    }

    try {
      await onSave({
        organizerId,
        incomeSourceId:
          incomeSource.incomeSourceId,
        payerIdentificationNumber:
          form.payerIdentificationNumber.replace(
            /\D/g,
            "",
          ),
        interestIncome:
          parseAmountInput(
            form.interestIncome,
          ),
        earlyWithdrawalPenalty:
          parseAmountInput(
            form.earlyWithdrawalPenalty,
          ),
        interestOnUsSavingsBondsAndTreasuryObligations:
          parseAmountInput(
            form
              .interestOnUsSavingsBondsAndTreasuryObligations,
          ),
        federalIncomeTaxWithheld:
          parseAmountInput(
            form.federalIncomeTaxWithheld,
          ),
        investmentExpenses:
          parseAmountInput(
            form.investmentExpenses,
          ),
        foreignTaxPaid:
          parseAmountInput(
            form.foreignTaxPaid,
          ),
        foreignCountryOrUsPossession:
          form.foreignCountryOrUsPossession.trim(),
        taxExemptInterest:
          parseAmountInput(
            form.taxExemptInterest,
          ),
        specifiedPrivateActivityBondInterest:
          parseAmountInput(
            form
              .specifiedPrivateActivityBondInterest,
          ),
        marketDiscount:
          parseAmountInput(
            form.marketDiscount,
          ),
        bondPremium:
          parseAmountInput(
            form.bondPremium,
          ),
        bondPremiumOnTreasuryObligations:
          parseAmountInput(
            form
              .bondPremiumOnTreasuryObligations,
          ),
        bondPremiumOnTaxExemptBond:
          parseAmountInput(
            form
              .bondPremiumOnTaxExemptBond,
          ),
        stateCode:
          form.stateCode
            .trim()
            .toUpperCase(),
        stateIdentificationNumber:
          form.stateIdentificationNumber.trim(),
        stateTaxWithheld:
          parseAmountInput(
            form.stateTaxWithheld,
          ),
        documentReceived:
          form.documentReceived,
      })
    } catch {
      setErrors(
        (current) => ({
          ...current,
          form:
            "The 1099-INT details could not be saved. Review the page message and try again.",
        }),
      )
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
        Loading 1099-INT details...
      </div>
    )
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
          1099-INT Interest Income
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          {
            incomeSource.payerName
          }
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter each amount exactly as shown on Form 1099-INT. Leave fields blank when the form does not report a value.
        </p>
      </header>

      {(errors.form ||
        errorMessage) && (
        <OrganizerValidationSummary
          variant="error"
          title="Unable to save 1099-INT"
          message={
            errors.form ??
            errorMessage ??
            ""
          }
        />
      )}

      <OrganizerSectionCard
        title="Payer Information"
        description="Enter the payer identification number shown on the form."
      >
        <OrganizerTextField
          id="1099-int-payer-tin"
          label="Payer Taxpayer Identification Number"
          value={
            form.payerIdentificationNumber
          }
          error={
            errors.payerIdentificationNumber
          }
          disabled={
            isSaving
          }
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          placeholder="12-3456789"
          onChange={(event) => {
            updateField(
              "payerIdentificationNumber",
              event.target.value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Interest and Withholding"
        description="Enter the primary federal amounts from the 1099-INT."
        contentClassName="grid gap-6 md:grid-cols-2"
      >
        <Income1099AmountField
          id="1099-int-interest-income"
          label="Interest Income"
          value={
            form.interestIncome
          }
          error={
            errors.interestIncome
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "interestIncome",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-int-federal-withholding"
          label="Federal Income Tax Withheld"
          value={
            form.federalIncomeTaxWithheld
          }
          error={
            errors.federalIncomeTaxWithheld
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "federalIncomeTaxWithheld",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-int-early-withdrawal"
          label="Early Withdrawal Penalty"
          value={
            form.earlyWithdrawalPenalty
          }
          error={
            errors.earlyWithdrawalPenalty
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "earlyWithdrawalPenalty",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-int-treasury-interest"
          label="U.S. Savings Bond and Treasury Interest"
          value={
            form
              .interestOnUsSavingsBondsAndTreasuryObligations
          }
          error={
            errors
              .interestOnUsSavingsBondsAndTreasuryObligations
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "interestOnUsSavingsBondsAndTreasuryObligations",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-int-investment-expenses"
          label="Investment Expenses"
          value={
            form.investmentExpenses
          }
          error={
            errors.investmentExpenses
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "investmentExpenses",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-int-tax-exempt-interest"
          label="Tax-Exempt Interest"
          value={
            form.taxExemptInterest
          }
          error={
            errors.taxExemptInterest
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "taxExemptInterest",
              value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Bond Adjustments"
        description="Enter bond and market adjustments when they appear on the form."
        contentClassName="grid gap-6 md:grid-cols-2"
      >
        <Income1099AmountField
          id="1099-int-private-activity"
          label="Specified Private Activity Bond Interest"
          value={
            form
              .specifiedPrivateActivityBondInterest
          }
          error={
            errors
              .specifiedPrivateActivityBondInterest
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "specifiedPrivateActivityBondInterest",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-int-market-discount"
          label="Market Discount"
          value={
            form.marketDiscount
          }
          error={
            errors.marketDiscount
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "marketDiscount",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-int-bond-premium"
          label="Bond Premium"
          value={
            form.bondPremium
          }
          error={
            errors.bondPremium
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "bondPremium",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-int-treasury-premium"
          label="Bond Premium on Treasury Obligations"
          value={
            form
              .bondPremiumOnTreasuryObligations
          }
          error={
            errors
              .bondPremiumOnTreasuryObligations
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "bondPremiumOnTreasuryObligations",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-int-tax-exempt-premium"
          label="Bond Premium on Tax-Exempt Bond"
          value={
            form
              .bondPremiumOnTaxExemptBond
          }
          error={
            errors
              .bondPremiumOnTaxExemptBond
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "bondPremiumOnTaxExemptBond",
              value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Foreign Tax"
        description="Complete these fields when foreign tax information is shown."
        contentClassName="grid gap-6 md:grid-cols-2"
      >
        <Income1099AmountField
          id="1099-int-foreign-tax"
          label="Foreign Tax Paid"
          value={
            form.foreignTaxPaid
          }
          error={
            errors.foreignTaxPaid
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "foreignTaxPaid",
              value,
            )
          }}
        />

        <OrganizerTextField
          id="1099-int-foreign-country"
          label="Foreign Country or U.S. Possession"
          value={
            form.foreignCountryOrUsPossession
          }
          disabled={
            isSaving
          }
          maxLength={100}
          onChange={(event) => {
            updateField(
              "foreignCountryOrUsPossession",
              event.target.value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="State Information"
        description="Enter state withholding information when reported."
        contentClassName="grid gap-6 md:grid-cols-3"
      >
        <OrganizerTextField
          id="1099-int-state-code"
          label="State"
          value={
            form.stateCode
          }
          error={
            errors.stateCode
          }
          disabled={
            isSaving
          }
          maxLength={2}
          placeholder="VA"
          onChange={(event) => {
            updateField(
              "stateCode",
              event.target.value.toUpperCase(),
            )
          }}
        />

        <OrganizerTextField
          id="1099-int-state-id"
          label="State Identification Number"
          value={
            form.stateIdentificationNumber
          }
          disabled={
            isSaving
          }
          maxLength={40}
          onChange={(event) => {
            updateField(
              "stateIdentificationNumber",
              event.target.value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-int-state-tax"
          label="State Tax Withheld"
          value={
            form.stateTaxWithheld
          }
          error={
            errors.stateTaxWithheld
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "stateTaxWithheld",
              value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Document Status"
        description="Confirm whether the supporting 1099-INT has been uploaded or delivered."
      >
        <OrganizerCheckboxField
          id="1099-int-document-received"
          label="1099-INT document received"
          description="Mark this after the form has been uploaded or otherwise provided to the tax office."
          checked={
            form.documentReceived
          }
          disabled={
            isSaving
          }
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
          isSaving={
            isSaving
          }
          saveLabel="Save 1099-INT"
          cancelLabel="Back"
          onCancel={
            onCancel
          }
        />
      </div>
    </form>
  )
}
