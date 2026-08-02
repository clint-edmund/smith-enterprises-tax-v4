import {
  useState,
} from "react"

import {
  LockKeyhole,
  Save,
  X,
} from "lucide-react"

import {
  useVault,
} from "@/features/security/vault/vault-hook"

import type {
  VaultSecretType,
} from "@/features/security/vault/vault.types"

import {
  MaskedSecretDisplay,
} from "./masked-secret-display"

import type {
  VaultSecretStatus,
} from "./vault-status-badge"

interface SecureTextFieldProps {
  organizerId: string

  label: string

  secretType:
    VaultSecretType

  maskedValue?: string | null

  status?: VaultSecretStatus

  updatedAt?: string | null

  placeholder?: string

  inputMode?:
    | "text"
    | "numeric"

  autoComplete?: string

  maxLength?: number

  helpText?: string

  disabled?: boolean

  confirmValue?: boolean

  onSaved?: (
    result: {
      maskedValue: string
      status: VaultSecretStatus
      updatedAt: string
    },
  ) => void
}

export function SecureTextField({
  organizerId,
  label,
  secretType,
  maskedValue = null,
  status =
    "pending_verification",
  updatedAt = null,
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
    errorMessage,
  } = useVault()

  const [
    isEditing,
    setIsEditing,
  ] = useState(
    !maskedValue,
  )

  const [
    value,
    setValue,
  ] = useState("")

  const [
    confirmationValue,
    setConfirmationValue,
  ] = useState("")

  const [
    localMaskedValue,
    setLocalMaskedValue,
  ] =
    useState<string | null>(
      maskedValue,
    )

  const [
    localStatus,
    setLocalStatus,
  ] =
    useState<VaultSecretStatus>(
      status,
    )

  const [
    localUpdatedAt,
    setLocalUpdatedAt,
  ] =
    useState<string | null>(
      updatedAt,
    )

  const [
    validationMessage,
    setValidationMessage,
  ] = useState<string | null>(
    null,
  )

  async function handleSave() {
    setValidationMessage(null)

    const trimmedValue =
      value.trim()

    if (!trimmedValue) {
      setValidationMessage(
        `${label} is required.`,
      )

      return
    }

    if (
      confirmValue &&
      trimmedValue !==
        confirmationValue.trim()
    ) {
      setValidationMessage(
        `${label} entries do not match.`,
      )

      return
    }

    try {
      const result =
        await saveSecret({
          organizerId,
          secretType,
          plainTextValue:
            trimmedValue,
        })

      const nextStatus:
        VaultSecretStatus =
          result.status ===
          "verified"
            ? "verified"
            : "pending_verification"

      setLocalMaskedValue(
        result.maskedValue,
      )

      setLocalStatus(
        nextStatus,
      )

      setLocalUpdatedAt(
        result.updatedAt,
      )

      /*
       * Remove plaintext from component state
       * immediately after the save succeeds.
       */
      setValue("")
      setConfirmationValue("")
      setIsEditing(false)

      onSaved?.({
        maskedValue:
          result.maskedValue,

        status:
          nextStatus,

        updatedAt:
          result.updatedAt,
      })
    } catch {
      /*
       * useVault exposes the safe error
       * message through errorMessage.
       */
    }
  }

  function handleCancel() {
    setValue("")
    setConfirmationValue("")
    setValidationMessage(null)

    if (localMaskedValue) {
      setIsEditing(false)
    }
  }

  if (
    localMaskedValue &&
    !isEditing
  ) {
    return (
      <MaskedSecretDisplay
        label={label}
        maskedValue={
          localMaskedValue
        }
        status={localStatus}
        updatedAt={
          localUpdatedAt
        }
        disabled={
          disabled ||
          isSaving
        }
        onReplace={() => {
          setValidationMessage(
            null,
          )

          setIsEditing(true)
        }}
      />
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <LockKeyhole
          className="h-4 w-4 text-slate-500"
          aria-hidden="true"
        />

        <label
          htmlFor={`${secretType}-secure-value`}
          className="text-sm font-semibold text-slate-800"
        >
          {label}
        </label>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <input
            id={`${secretType}-secure-value`}
            type="password"
            value={value}
            disabled={
              disabled ||
              isSaving
            }
            placeholder={
              placeholder
            }
            inputMode={
              inputMode
            }
            autoComplete={
              autoComplete
            }
            maxLength={
              maxLength
            }
            spellCheck={false}
            onCopy={(
              event,
            ) => {
              event.preventDefault()
            }}
            onCut={(
              event,
            ) => {
              event.preventDefault()
            }}
            onChange={(
              event,
            ) => {
              setValue(
                event.target.value,
              )

              setValidationMessage(
                null,
              )
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
              value={
                confirmationValue
              }
              disabled={
                disabled ||
                isSaving
              }
              placeholder={`Re-enter ${label.toLowerCase()}`}
              inputMode={
                inputMode
              }
              autoComplete="off"
              maxLength={
                maxLength
              }
              spellCheck={false}
              onCopy={(
                event,
              ) => {
                event.preventDefault()
              }}
              onCut={(
                event,
              ) => {
                event.preventDefault()
              }}
              onPaste={(
                event,
              ) => {
                event.preventDefault()
              }}
              onChange={(
                event,
              ) => {
                setConfirmationValue(
                  event.target.value,
                )

                setValidationMessage(
                  null,
                )
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>
        )}

        {(validationMessage ||
          errorMessage) && (
          <p
            role="alert"
            className="text-sm font-medium text-red-700"
          >
            {validationMessage ??
              errorMessage}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={
              disabled ||
              isSaving ||
              !organizerId
            }
            onClick={() => {
              void handleSave()
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save
              className="h-4 w-4"
              aria-hidden="true"
            />

            {isSaving
              ? "Saving Securely..."
              : localMaskedValue
                ? "Save Replacement"
                : "Save Securely"}
          </button>

          {localMaskedValue && (
            <button
              type="button"
              disabled={
                disabled ||
                isSaving
              }
              onClick={
                handleCancel
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X
                className="h-4 w-4"
                aria-hidden="true"
              />

              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}