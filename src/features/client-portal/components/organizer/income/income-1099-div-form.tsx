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
  OrganizerIncome1099DivDetails,
  SaveOrganizerIncome1099DivRequest,
} from "@/features/client-portal/types/organizer-income-1099.types"

import {
  Income1099AmountField,
  parseAmountInput,
  toAmountInput,
  validateAmountInput,
} from "./income-1099-form-fields"

interface Income1099DivFormProps {
  organizerId: string
  incomeSource: OrganizerIncomeSource
  details?:
    OrganizerIncome1099DivDetails | null
  isLoading?: boolean
  isSaving?: boolean
  errorMessage?: string | null
  onCancel: () => void
  onSave: (
    request:
      SaveOrganizerIncome1099DivRequest,
  ) => Promise<void>
}

interface FormState {
  payerIdentificationNumber: string
  totalOrdinaryDividends: string
  qualifiedDividends: string
  totalCapitalGainDistributions: string
  unrecapturedSection1250Gain: string
  section1202Gain: string
  collectibles28PercentRateGain: string
  section897OrdinaryDividends: string
  section897CapitalGain: string
  nondividendDistributions: string
  federalIncomeTaxWithheld: string
  section199aDividends: string
  investmentExpenses: string
  foreignTaxPaid: string
  foreignCountryOrUsPossession: string
  exemptInterestDividends: string
  specifiedPrivateActivityBondInterestDividends:
    string
  stateCode: string
  stateIdentificationNumber: string
  stateTaxWithheld: string
  documentReceived: boolean
}

type AmountField =
  | "totalOrdinaryDividends"
  | "qualifiedDividends"
  | "totalCapitalGainDistributions"
  | "unrecapturedSection1250Gain"
  | "section1202Gain"
  | "collectibles28PercentRateGain"
  | "section897OrdinaryDividends"
  | "section897CapitalGain"
  | "nondividendDistributions"
  | "federalIncomeTaxWithheld"
  | "section199aDividends"
  | "investmentExpenses"
  | "foreignTaxPaid"
  | "exemptInterestDividends"
  | "specifiedPrivateActivityBondInterestDividends"
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
    totalOrdinaryDividends:
      "Total ordinary dividends",
    qualifiedDividends:
      "Qualified dividends",
    totalCapitalGainDistributions:
      "Total capital gain distributions",
    unrecapturedSection1250Gain:
      "Unrecaptured Section 1250 gain",
    section1202Gain:
      "Section 1202 gain",
    collectibles28PercentRateGain:
      "Collectibles 28% rate gain",
    section897OrdinaryDividends:
      "Section 897 ordinary dividends",
    section897CapitalGain:
      "Section 897 capital gain",
    nondividendDistributions:
      "Nondividend distributions",
    federalIncomeTaxWithheld:
      "Federal income tax withheld",
    section199aDividends:
      "Section 199A dividends",
    investmentExpenses:
      "Investment expenses",
    foreignTaxPaid:
      "Foreign tax paid",
    exemptInterestDividends:
      "Exempt-interest dividends",
    specifiedPrivateActivityBondInterestDividends:
      "Private activity bond interest dividends",
    stateTaxWithheld:
      "State tax withheld",
  }

function createFormState(
  incomeSource:
    OrganizerIncomeSource,
  details:
    OrganizerIncome1099DivDetails | null,
): FormState {
  return {
    payerIdentificationNumber:
      details?.payerIdentificationNumber ??
      "",
    totalOrdinaryDividends:
      toAmountInput(
        details
          ?.totalOrdinaryDividends ??
          null,
      ),
    qualifiedDividends:
      toAmountInput(
        details?.qualifiedDividends ??
          null,
      ),
    totalCapitalGainDistributions:
      toAmountInput(
        details
          ?.totalCapitalGainDistributions ??
          null,
      ),
    unrecapturedSection1250Gain:
      toAmountInput(
        details
          ?.unrecapturedSection1250Gain ??
          null,
      ),
    section1202Gain:
      toAmountInput(
        details?.section1202Gain ??
          null,
      ),
    collectibles28PercentRateGain:
      toAmountInput(
        details
          ?.collectibles28PercentRateGain ??
          null,
      ),
    section897OrdinaryDividends:
      toAmountInput(
        details
          ?.section897OrdinaryDividends ??
          null,
      ),
    section897CapitalGain:
      toAmountInput(
        details?.section897CapitalGain ??
          null,
      ),
    nondividendDistributions:
      toAmountInput(
        details
          ?.nondividendDistributions ??
          null,
      ),
    federalIncomeTaxWithheld:
      toAmountInput(
        details
          ?.federalIncomeTaxWithheld ??
          null,
      ),
    section199aDividends:
      toAmountInput(
        details?.section199aDividends ??
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
    exemptInterestDividends:
      toAmountInput(
        details
          ?.exemptInterestDividends ??
          null,
      ),
    specifiedPrivateActivityBondInterestDividends:
      toAmountInput(
        details
          ?.specifiedPrivateActivityBondInterestDividends ??
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

export function Income1099DivForm({
  organizerId,
  incomeSource,
  details = null,
  isLoading = false,
  isSaving = false,
  errorMessage = null,
  onCancel,
  onSave,
}: Income1099DivFormProps) {
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
      !form.totalOrdinaryDividends.trim()
    ) {
      nextErrors.totalOrdinaryDividends =
        "Total ordinary dividends are required when the 1099-DIV document has been received."
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
        totalOrdinaryDividends:
          parseAmountInput(
            form.totalOrdinaryDividends,
          ),
        qualifiedDividends:
          parseAmountInput(
            form.qualifiedDividends,
          ),
        totalCapitalGainDistributions:
          parseAmountInput(
            form
              .totalCapitalGainDistributions,
          ),
        unrecapturedSection1250Gain:
          parseAmountInput(
            form
              .unrecapturedSection1250Gain,
          ),
        section1202Gain:
          parseAmountInput(
            form.section1202Gain,
          ),
        collectibles28PercentRateGain:
          parseAmountInput(
            form
              .collectibles28PercentRateGain,
          ),
        section897OrdinaryDividends:
          parseAmountInput(
            form
              .section897OrdinaryDividends,
          ),
        section897CapitalGain:
          parseAmountInput(
            form.section897CapitalGain,
          ),
        nondividendDistributions:
          parseAmountInput(
            form
              .nondividendDistributions,
          ),
        federalIncomeTaxWithheld:
          parseAmountInput(
            form.federalIncomeTaxWithheld,
          ),
        section199aDividends:
          parseAmountInput(
            form.section199aDividends,
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
        exemptInterestDividends:
          parseAmountInput(
            form.exemptInterestDividends,
          ),
        specifiedPrivateActivityBondInterestDividends:
          parseAmountInput(
            form
              .specifiedPrivateActivityBondInterestDividends,
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
            "The 1099-DIV details could not be saved. Review the page message and try again.",
        }),
      )
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
        Loading 1099-DIV details...
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
          1099-DIV Dividend Income
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          {
            incomeSource.payerName
          }
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter each amount exactly as shown on Form 1099-DIV. Leave fields blank when the form does not report a value.
        </p>
      </header>

      {(errors.form ||
        errorMessage) && (
        <OrganizerValidationSummary
          variant="error"
          title="Unable to save 1099-DIV"
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
          id="1099-div-payer-tin"
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
        title="Dividend Income"
        description="Enter the primary dividend amounts from the 1099-DIV."
        contentClassName="grid gap-6 md:grid-cols-2"
      >
        <Income1099AmountField
          id="1099-div-ordinary"
          label="Total Ordinary Dividends"
          value={
            form.totalOrdinaryDividends
          }
          error={
            errors.totalOrdinaryDividends
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "totalOrdinaryDividends",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-div-qualified"
          label="Qualified Dividends"
          value={
            form.qualifiedDividends
          }
          error={
            errors.qualifiedDividends
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "qualifiedDividends",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-div-capital-gain"
          label="Total Capital Gain Distributions"
          value={
            form
              .totalCapitalGainDistributions
          }
          error={
            errors
              .totalCapitalGainDistributions
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "totalCapitalGainDistributions",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-div-nondividend"
          label="Nondividend Distributions"
          value={
            form.nondividendDistributions
          }
          error={
            errors.nondividendDistributions
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "nondividendDistributions",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-div-federal-withholding"
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
          id="1099-div-199a"
          label="Section 199A Dividends"
          value={
            form.section199aDividends
          }
          error={
            errors.section199aDividends
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "section199aDividends",
              value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Capital Gain Detail"
        description="Enter the detailed gain amounts when reported."
        contentClassName="grid gap-6 md:grid-cols-2"
      >
        <Income1099AmountField
          id="1099-div-1250"
          label="Unrecaptured Section 1250 Gain"
          value={
            form
              .unrecapturedSection1250Gain
          }
          error={
            errors
              .unrecapturedSection1250Gain
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "unrecapturedSection1250Gain",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-div-1202"
          label="Section 1202 Gain"
          value={
            form.section1202Gain
          }
          error={
            errors.section1202Gain
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "section1202Gain",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-div-collectibles"
          label="Collectibles 28% Rate Gain"
          value={
            form
              .collectibles28PercentRateGain
          }
          error={
            errors
              .collectibles28PercentRateGain
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "collectibles28PercentRateGain",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-div-897-ordinary"
          label="Section 897 Ordinary Dividends"
          value={
            form
              .section897OrdinaryDividends
          }
          error={
            errors
              .section897OrdinaryDividends
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "section897OrdinaryDividends",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-div-897-capital"
          label="Section 897 Capital Gain"
          value={
            form.section897CapitalGain
          }
          error={
            errors.section897CapitalGain
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "section897CapitalGain",
              value,
            )
          }}
        />
      </OrganizerSectionCard>

      <OrganizerSectionCard
        title="Additional Dividend Information"
        description="Enter investment expense and tax-exempt dividend information when reported."
        contentClassName="grid gap-6 md:grid-cols-2"
      >
        <Income1099AmountField
          id="1099-div-investment-expenses"
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
          id="1099-div-exempt-interest"
          label="Exempt-Interest Dividends"
          value={
            form.exemptInterestDividends
          }
          error={
            errors.exemptInterestDividends
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "exemptInterestDividends",
              value,
            )
          }}
        />

        <Income1099AmountField
          id="1099-div-private-activity"
          label="Specified Private Activity Bond Interest Dividends"
          value={
            form
              .specifiedPrivateActivityBondInterestDividends
          }
          error={
            errors
              .specifiedPrivateActivityBondInterestDividends
          }
          disabled={
            isSaving
          }
          onChange={(value) => {
            updateField(
              "specifiedPrivateActivityBondInterestDividends",
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
          id="1099-div-foreign-tax"
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
          id="1099-div-foreign-country"
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
          id="1099-div-state-code"
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
          id="1099-div-state-id"
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
          id="1099-div-state-tax"
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
        description="Confirm whether the supporting 1099-DIV has been uploaded or delivered."
      >
        <OrganizerCheckboxField
          id="1099-div-document-received"
          label="1099-DIV document received"
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
          saveLabel="Save 1099-DIV"
          cancelLabel="Back"
          onCancel={
            onCancel
          }
        />
      </div>
    </form>
  )
}
