import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  Building2,
  CreditCard,
  Landmark,
  ShieldCheck,
} from "lucide-react"

import {
  OrganizerErrorState,
} from "@/features/client-portal/components/organizer/organizer-error-state"
import {
  OrganizerLoadingState,
} from "@/features/client-portal/components/organizer/organizer-loading-state"
import {
  OrganizerSaveBar,
} from "@/features/client-portal/components/organizer/organizer-save-bar"
import {
  OrganizerSection,
} from "@/features/client-portal/components/organizer/organizer-section"
import {
  OrganizerWorkspace,
} from "@/features/client-portal/components/organizer/workspace/organizer-workspace"
import {
  useOrganizer,
} from "@/features/client-portal/context/organizer/use-organizer"
import {
  useOrganizerBankingInformation,
} from "@/features/client-portal/hooks/use-organizer-banking-information"
import {
  getOrganizerNavigationItems,
} from "@/features/client-portal/services/organizer-navigation-service"
import type {
  OrganizerBankAccountType,
  SaveOrganizerBankingInformationRequest,
} from "@/features/client-portal/types/organizer-banking-information.types"
import {
  SecureTextField,
} from "@/features/security/vault/components/secure-text-field"
import {
  OrganizerDecisionCard,
} from "@/features/client-portal/components/organizer/organizer-decision-card"

import {
  OrganizerDecisionCardGroup,
} from "@/features/client-portal/components/organizer/organizer-decision-card-group"

interface BankingFormState {
  accountHolderName: string
  bankName: string
  accountType: OrganizerBankAccountType
  useDirectDeposit: boolean | null
  authorizeDirectDebit: boolean | null
}

interface BankingValidationErrors {
  accountHolderName?: string
  bankName?: string
  accountType?: string
  useDirectDeposit?: string
  authorizeDirectDebit?: string
  secureBanking?: string
}

const emptyForm: BankingFormState = {
  accountHolderName: "",
  bankName: "",
  accountType: "",
  useDirectDeposit: null,
  authorizeDirectDebit: null,
}

export function OrganizerBankingInformationPage() {
  const {
    taxYear,
    summary,
    organizer,
    progress,
    completedSections,
    totalSections,
    isLoading,
    errorMessage,
    refreshOrganizer,
  } = useOrganizer()

  const organizerId =
    organizer?.id ?? ""

  const {
    bankingInformation,
    isLoading: isBankingLoading,
    isSaving,
    errorMessage: bankingError,
    saveMessage,
    refresh: refreshBanking,
    save,
  } = useOrganizerBankingInformation(
    organizerId,
  )

  const [
    form,
    setForm,
  ] = useState<BankingFormState>(
    emptyForm,
  )

  const [
    initialForm,
    setInitialForm,
  ] = useState<BankingFormState>(
    emptyForm,
  )

  const [
    validationErrors,
    setValidationErrors,
  ] = useState<BankingValidationErrors>(
    {},
  )

  const [
    pageMessage,
    setPageMessage,
  ] = useState<string | null>(
    null,
  )

  const validationSummaryRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  useEffect(() => {
    if (!bankingInformation) {
      return
    }

    const nextForm:
      BankingFormState = {
        accountHolderName:
          bankingInformation.accountHolderName,

        bankName:
          bankingInformation.bankName,

        accountType:
          bankingInformation.accountType,

        useDirectDeposit:
          bankingInformation.useDirectDeposit,

        authorizeDirectDebit:
          bankingInformation.authorizeDirectDebit,
      }

    setForm(nextForm)
    setInitialForm(nextForm)
    setValidationErrors({})
  }, [bankingInformation])

  const hasUnsavedChanges =
    useMemo(
      () =>
        JSON.stringify(form) !==
        JSON.stringify(initialForm),
      [
        form,
        initialForm,
      ],
    )

  const navigationItems =
    useMemo(
      () =>
        getOrganizerNavigationItems({
          sections:
            summary?.sections ?? [],

          currentSectionKey:
            organizer?.currentSection ??
            "banking",
        }),
      [
        summary,
        organizer,
      ],
    )

  const bankingRequested =
    form.useDirectDeposit === true ||
    form.authorizeDirectDebit === true

  function updateField<
    Field extends keyof BankingFormState,
  >(
    field: Field,
    value:
      BankingFormState[Field],
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
        secureBanking: undefined,
      }),
    )

    setPageMessage(null)
  }

  function validateForm():
    BankingValidationErrors {
    const errors:
      BankingValidationErrors = {}

    if (
      form.useDirectDeposit ===
      null
    ) {
      errors.useDirectDeposit =
        "Choose Yes or No for direct deposit."
    }

    if (
      form.authorizeDirectDebit ===
      null
    ) {
      errors.authorizeDirectDebit =
        "Choose Yes or No for direct debit."
    }

    if (bankingRequested) {
      if (
        !form.accountHolderName.trim()
      ) {
        errors.accountHolderName =
          "Account holder name is required."
      }

      if (!form.bankName.trim()) {
        errors.bankName =
          "Bank name is required."
      }

      if (!form.accountType) {
        errors.accountType =
          "Choose checking or savings."
      }

      if (
        !bankingInformation?.hasRoutingNumber ||
        !bankingInformation?.hasBankAccountNumber
      ) {
        errors.secureBanking =
          "Save both the routing number and bank account number before completing Banking Information."
      }
    }

    return errors
  }

  function createSaveRequest():
    SaveOrganizerBankingInformationRequest {
    return {
      organizerId,

      accountHolderName:
        form.accountHolderName,

      bankName:
        form.bankName,

      accountType:
        form.accountType,

      useDirectDeposit:
        form.useDirectDeposit,

      authorizeDirectDebit:
        form.authorizeDirectDebit,
    }
  }

  async function handleSave(
    continueAfterSave: boolean,
  ) {
    setPageMessage(null)

    const errors =
      validateForm()

    setValidationErrors(errors)

    if (
      Object.keys(errors).length >
      0
    ) {
      setPageMessage(
        "Review the highlighted Banking Information fields before saving.",
      )

      requestAnimationFrame(() => {
        validationSummaryRef.current?.scrollIntoView(
          {
            behavior: "smooth",
            block: "center",
          },
        )
      })

      return
    }

    try {
      const result =
        await save(
          createSaveRequest(),
        )

      await Promise.all([
        refreshOrganizer(),
        refreshBanking(),
      ])

      setInitialForm(form)

      if (continueAfterSave) {
        setPageMessage(
          result.sectionStatus ===
          "completed"
            ? "Banking Information is complete. Dependents is the next organizer section."
            : "Your Banking Information draft was saved. Complete the remaining required information before continuing.",
        )
      } else {
        setPageMessage(
          result.sectionStatus ===
          "completed"
            ? "Banking Information was saved and marked complete."
            : "Your Banking Information draft was saved.",
        )
      }
    } catch {
      // The hook exposes the safe service error through bankingError.
    }
  }

  if (isLoading) {
    return (
      <OrganizerLoadingState message="Loading your tax organizer..." />
    )
  }

  if (errorMessage) {
    return (
      <OrganizerErrorState
        message={errorMessage}
        onRetry={() => {
          void refreshOrganizer()
        }}
      />
    )
  }

  if (isBankingLoading) {
    return (
      <OrganizerLoadingState message="Loading your Banking Information..." />
    )
  }

  if (
    bankingError &&
    !bankingInformation
  ) {
    return (
      <OrganizerErrorState
        title="Unable to load Banking Information"
        message={bankingError}
        onRetry={() => {
          void refreshBanking()
        }}
      />
    )
  }

  return (
    <OrganizerWorkspace
      title="Banking Information"
      description="Choose how eligible refunds and tax payments should be handled."
      taxYear={taxYear}
      progress={progress}
      completedSections={
        completedSections
      }
      totalSections={totalSections}
      currentSectionTitle="Banking Information"
      navigationItems={
        navigationItems
      }
    >
      <form
        className="space-y-8"
        onSubmit={(event) => {
          event.preventDefault()

          void handleSave(false)
        }}
      >
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            {taxYear} Tax Organizer
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Banking Information
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Tell us whether you want to use electronic deposit or payment.
            Routing and account numbers are encrypted through the Secure Vault
            and are never redisplayed in full.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-10">
            <div className="grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {completedSections}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Total sections
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {totalSections}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Save status
                </p>

                <p
                  className={[
                    "mt-2 font-bold",
                    hasUnsavedChanges
                      ? "text-amber-700"
                      : "text-emerald-700",
                  ].join(" ")}
                >
                  {hasUnsavedChanges
                    ? "Unsaved Changes"
                    : "All Changes Saved"}
                </p>
              </div>
            </div>

            {(
              pageMessage ||
              saveMessage ||
              bankingError
            ) && (
              <div
                ref={
                  validationSummaryRef
                }
                role="status"
                className={[
                  "rounded-xl border p-4 text-sm",
                  bankingError
                    ? "border-red-200 bg-red-50 text-red-800"
                    : Object.keys(
                          validationErrors,
                        ).length > 0
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800",
                ].join(" ")}
              >
                {bankingError ??
                  pageMessage ??
                  saveMessage}
              </div>
            )}

            <OrganizerSection
              title="Refund Preference"
              description="Choose whether eligible refunds should be deposited electronically."
            >
              <div className="space-y-4 md:col-span-2">
                <OrganizerDecisionCardGroup
                  label="Would you like to use direct deposit?"
                  description="Choose how an eligible federal or state refund should be delivered."
                  errorMessage={
                    validationErrors.useDirectDeposit
                  }
                >
                  <OrganizerDecisionCard
                    selected={
                      form.useDirectDeposit ===
                      true
                    }
                    label="Yes — Use Direct Deposit"
                    description="Deposit an eligible federal or state refund into the account below."
                    disabled={isSaving}
                    onSelect={() => {
                      updateField(
                        "useDirectDeposit",
                        true,
                      )
                    }}
                  />

                  <OrganizerDecisionCard
                    selected={
                      form.useDirectDeposit ===
                      false
                    }
                    label="No — Do Not Use Direct Deposit"
                    description="Do not use this account for an electronic tax refund."
                    disabled={isSaving}
                    onSelect={() => {
                      updateField(
                        "useDirectDeposit",
                        false,
                      )
                    }}
                  />
                </OrganizerDecisionCardGroup>
              </div>
            </OrganizerSection>

            <div className="border-t border-slate-200" />

            <OrganizerSection
              title="Payment Preference"
              description="Choose whether this account may be used for an authorized tax payment."
            >
              <div className="space-y-4 md:col-span-2">
                <OrganizerDecisionCardGroup
                  label="May this account be used for an authorized direct debit?"
                  description="Choose whether an electronic tax payment may be scheduled from this account."
                  errorMessage={
                    validationErrors.authorizeDirectDebit
                  }
                >
                  <OrganizerDecisionCard
                    selected={
                      form.authorizeDirectDebit ===
                      true
                    }
                    label="Yes — Allow Direct Debit"
                    description="Allow an authorized tax payment to be scheduled from this account."
                    disabled={isSaving}
                    onSelect={() => {
                      updateField(
                        "authorizeDirectDebit",
                        true,
                      )
                    }}
                  />

                  <OrganizerDecisionCard
                    selected={
                      form.authorizeDirectDebit ===
                      false
                    }
                    label="No — Do Not Allow Direct Debit"
                    description="Do not use this account for an electronic tax payment."
                    disabled={isSaving}
                    onSelect={() => {
                      updateField(
                        "authorizeDirectDebit",
                        false,
                      )
                    }}
                  />
                </OrganizerDecisionCardGroup>
              </div>
            </OrganizerSection>

            {bankingRequested && (
              <>
                <div className="border-t border-slate-200" />

                <OrganizerSection
                  title="Bank Account Details"
                  description="Enter the non-sensitive details associated with the account."
                >
                  <div>
                    <label
                      htmlFor="account-holder-name"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Account holder name
                    </label>

                    <input
                      id="account-holder-name"
                      type="text"
                      value={
                        form.accountHolderName
                      }
                      disabled={isSaving}
                      autoComplete="name"
                      maxLength={200}
                      onChange={(event) => {
                        updateField(
                          "accountHolderName",
                          event.target.value,
                        )
                      }}
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    />

                    {validationErrors.accountHolderName && (
                      <p
                        role="alert"
                        className="mt-2 text-sm font-medium text-red-700"
                      >
                        {
                          validationErrors.accountHolderName
                        }
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="bank-name"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Bank name
                    </label>

                    <input
                      id="bank-name"
                      type="text"
                      value={form.bankName}
                      disabled={isSaving}
                      autoComplete="organization"
                      maxLength={200}
                      onChange={(event) => {
                        updateField(
                          "bankName",
                          event.target.value,
                        )
                      }}
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    />

                    {validationErrors.bankName && (
                      <p
                        role="alert"
                        className="mt-2 text-sm font-medium text-red-700"
                      >
                        {
                          validationErrors.bankName
                        }
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-slate-800">
                      Account type
                    </p>

                    <div className="mt-2 grid gap-4 sm:grid-cols-2">
                      <OrganizerDecisionCard
                        selected={
                          form.accountType ===
                          "checking"
                        }
                        label="Checking"
                        description="Use a checking account for the selected electronic transactions."
                        disabled={isSaving}
                        onSelect={() => {
                          updateField(
                            "accountType",
                            "checking",
                          )
                        }}
                      />

                      <OrganizerDecisionCard
                        selected={
                          form.accountType ===
                          "savings"
                        }
                        label="Savings"
                        description="Use a savings account for the selected electronic transactions."
                        disabled={isSaving}
                        onSelect={() => {
                          updateField(
                            "accountType",
                            "savings",
                          )
                        }}
                      />
                    </div>

                    {validationErrors.accountType && (
                      <p
                        role="alert"
                        className="mt-2 text-sm font-medium text-red-700"
                      >
                        {
                          validationErrors.accountType
                        }
                      </p>
                    )}
                  </div>
                </OrganizerSection>

                <div className="border-t border-slate-200" />

                <section className="space-y-6">
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        className="mt-0.5 h-6 w-6 text-blue-700"
                        aria-hidden="true"
                      />

                      <div>
                        <h2 className="text-lg font-semibold text-blue-950">
                          Secure Banking
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-blue-900">
                          Routing and account numbers are encrypted using
                          AES-256-GCM. After saving, only masked values are
                          displayed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <SecureTextField
                    organizerId={organizerId}
                    label="Routing Number"
                    secretType="routing_number"
                    placeholder="9-digit routing number"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={9}
                    confirmValue
                    disabled={isSaving}
                    helpText="Enter the nine-digit routing number exactly as shown on the account or voided check."
                    onSaved={() => {
                      void refreshBanking()
                    }}
                  />

                  <SecureTextField
                    organizerId={organizerId}
                    label="Bank Account Number"
                    secretType="bank_account_number"
                    placeholder="Account number"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={17}
                    confirmValue
                    disabled={isSaving}
                    helpText="Enter the account number without spaces or punctuation."
                    onSaved={() => {
                      void refreshBanking()
                    }}
                  />

                  {validationErrors.secureBanking && (
                    <p
                      role="alert"
                      className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900"
                    >
                      {
                        validationErrors.secureBanking
                      }
                    </p>
                  )}
                </section>
              </>
            )}

            {!bankingRequested &&
              form.useDirectDeposit !==
                null &&
              form.authorizeDirectDebit !==
                null && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <Landmark
                      className="mt-0.5 h-5 w-5 text-slate-600"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="font-semibold text-slate-900">
                        No bank account details required
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Because both electronic options are set to No, you may
                        complete this section without providing routing or
                        account numbers.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <Building2
                  className="mt-0.5 h-5 w-5 text-blue-700"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Bank details
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Standard account metadata remains editable.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard
                  className="mt-0.5 h-5 w-5 text-blue-700"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Protected values
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Routing and account numbers remain encrypted.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 text-emerald-700"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Audited access
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Secure Vault actions are recorded for accountability.
                  </p>
                </div>
              </div>
            </div>

            <OrganizerSaveBar
              isSaving={isSaving}
              saveMessage={
                pageMessage ??
                saveMessage
              }
              onSave={() => {
                void handleSave(false)
              }}
              onContinue={() => {
                void handleSave(true)
              }}
            />
          </div>
        </div>
      </form>
    </OrganizerWorkspace>
  )
}
