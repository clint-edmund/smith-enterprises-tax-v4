import {
  useEffect,
  useState,
} from "react"

import {
  LoaderCircle,
  LockKeyhole,
  Save,
  ShieldCheck,
  X,
} from "lucide-react"

import {
  useVault,
} from "@/features/security/vault/vault-hook"
import {
  useVaultSecret,
} from "@/features/security/vault/use-vault-secret"
import type {
  VaultSecretType,
} from "@/features/security/vault/vault.types"

import {
  MaskedSecretDisplay,
} from "./masked-secret-display"

import {
  validateVaultSecret,
} from "@/features/security/vault/vault-validation"

interface SecureTextFieldProps {
  organizerId: string
  label: string
  secretType: VaultSecretType
  placeholder?: string
  inputMode?: "text" | "numeric"
  autoComplete?: string
  maxLength?: number
  helpText?: string
  disabled?: boolean
  confirmValue?: boolean
  onSaved?: () => void
}

export function SecureTextField({
  organizerId,
  label,
  secretType,
  placeholder,
  inputMode = "text",
  autoComplete = "off",
  maxLength,
  helpText,
  disabled = false,
  confirmValue = false,
  onSaved,
}: SecureTextFieldProps) {
  const {
    saveSecret,
    isSaving,
    errorMessage: saveErrorMessage,
  } = useVault()

  const {
    metadata,
    hasValue,
    isLoading,
    errorMessage: metadataErrorMessage,
    refresh,
  } = useVaultSecret({
    organizerId,
    secretType,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState("")
  const [confirmationValue, setConfirmationValue] = useState("")
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !hasValue) {
      setIsEditing(true)
    }
  }, [hasValue, isLoading])

  function clearPlaintextState() {
    setValue("")
    setConfirmationValue("")
  }

  async function handleSave() {
    setValidationMessage(null)
    setSuccessMessage(null)

   const validation =
    validateVaultSecret(
      value,
      secretType,
    )

  if (!validation.valid) {
    setValidationMessage(
      validation.errorMessage ??
        `${label} is invalid.`,
    )

    return
  }

  const confirmation =
    validateVaultSecret(
      confirmationValue,
      secretType,
    )

  if (
    confirmValue &&
    validation.normalizedValue !==
      confirmation.normalizedValue
  ) {
      setValidationMessage(`${label} entries do not match.`)
      return
    }

    try {
      await saveSecret({
        organizerId,
        secretType,
        plainTextValue:
          validation.normalizedValue,
      })

      clearPlaintextState()
      await refresh()
      setIsEditing(false)
      setSuccessMessage(
        hasValue
          ? `${label} was securely replaced.`
          : `${label} was securely stored.`,
      )
      onSaved?.()
    } catch {
      // useVault exposes a safe client-facing message.
    }
  }

  function handleReplace() {
    clearPlaintextState()
    setValidationMessage(null)
    setSuccessMessage(null)
    setIsEditing(true)
  }

  function handleCancel() {
    clearPlaintextState()
    setValidationMessage(null)
    setSuccessMessage(null)

    if (hasValue) {
      setIsEditing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center gap-3">
          <LoaderCircle
            className="h-5 w-5 animate-spin text-blue-700"
            aria-hidden="true"
          />

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Loading {label}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Retrieving secure metadata only.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (metadataErrorMessage && !hasValue) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p role="alert" className="text-sm font-semibold text-red-800">
          {metadataErrorMessage}
        </p>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            void refresh()
          }}
          className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (metadata && !isEditing) {
    return (
      <div className="space-y-3">
        <MaskedSecretDisplay
          label={label}
          maskedValue={metadata.maskedValue}
          status={metadata.status}
          updatedAt={metadata.updatedAt}
          disabled={disabled || isSaving}
          onReplace={handleReplace}
        />

        {successMessage && (
          <p role="status" className="text-sm font-medium text-emerald-700">
            {successMessage}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-blue-50 p-2">
          <LockKeyhole
            className="h-5 w-5 text-blue-700"
            aria-hidden="true"
          />
        </div>

        <div>
          <label
            htmlFor={`${secretType}-secure-value`}
            className="text-sm font-semibold text-slate-900"
          >
            {label}
          </label>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Protected by the Smith Enterprises Secure Vault.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <input
            id={`${secretType}-secure-value`}
            type="password"
            value={value}
            disabled={disabled || isSaving}
            placeholder={placeholder}
            inputMode={inputMode}
            autoComplete={autoComplete}
            maxLength={maxLength}
            spellCheck={false}
            onCopy={(event) => {
              event.preventDefault()
            }}
            onCut={(event) => {
              event.preventDefault()
            }}
            onChange={(event) => {
              setValue(event.target.value)
              setValidationMessage(null)
              setSuccessMessage(null)
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          {helpText && (
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {helpText}
            </p>
          )}
        </div>

        {confirmValue && (
          <div>
            <label
              htmlFor={`${secretType}-secure-confirmation`}
              className="text-sm font-semibold text-slate-700"
            >
              Confirm {label}
            </label>

            <input
              id={`${secretType}-secure-confirmation`}
              type="password"
              value={confirmationValue}
              disabled={disabled || isSaving}
              placeholder={`Re-enter ${label.toLowerCase()}`}
              inputMode={inputMode}
              autoComplete="off"
              maxLength={maxLength}
              spellCheck={false}
              onCopy={(event) => {
                event.preventDefault()
              }}
              onCut={(event) => {
                event.preventDefault()
              }}
              onPaste={(event) => {
                event.preventDefault()
              }}
              onChange={(event) => {
                setConfirmationValue(event.target.value)
                setValidationMessage(null)
                setSuccessMessage(null)
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-blue-700"
            aria-hidden="true"
          />

          <p className="text-xs leading-5 text-blue-800">
            This value is encrypted using AES-256-GCM. After saving, only a
            masked version is displayed in the portal.
          </p>
        </div>

        {(validationMessage || saveErrorMessage || metadataErrorMessage) && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {validationMessage ?? saveErrorMessage ?? metadataErrorMessage}
          </p>
        )}

        {successMessage && (
          <p role="status" className="text-sm font-medium text-emerald-700">
            {successMessage}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={disabled || isSaving || !organizerId}
            onClick={() => {
              void handleSave()
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <LoaderCircle
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}

            {isSaving
              ? "Saving Securely..."
              : hasValue
                ? "Save Replacement"
                : "Save Securely"}
          </button>

          {hasValue && (
            <button
              type="button"
              disabled={disabled || isSaving}
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
