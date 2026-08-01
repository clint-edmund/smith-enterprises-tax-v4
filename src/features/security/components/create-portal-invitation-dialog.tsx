import { useState } from "react"

import {
  createPortalInvitation,
} from "../services/portal-invitation-service"

import {
  buildPortalInvitationLink,
} from "../utils/portal-links"

interface CreatePortalInvitationDialogProps {
  clientId: string

  clientName: string

  email: string

  open: boolean

  onClose: () => void
}

export function CreatePortalInvitationDialog({
  clientId,
  clientName,
  email,
  open,
  onClose,
}: CreatePortalInvitationDialogProps) {
  const [
    expirationHours,
    setExpirationHours,
  ] = useState(72)

  const [
    invitationLink,
    setInvitationLink,
  ] = useState("")

  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  if (!open) {
    return null
  }

  async function handleGenerate() {
    try {
      setIsGenerating(true)

      setErrorMessage(null)

      const result =
        await createPortalInvitation({
          clientId,
          email,
          expiresInHours:
            expirationHours,
        })

      setInvitationLink(
        buildPortalInvitationLink(
          result.rawToken,
        ),
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create invitation.",
      )
    } finally {
      setIsGenerating(false)
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(
      invitationLink,
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">

        <div className="border-b border-slate-200 p-6">
          <h2 className="text-xl font-bold">
            Invite Client to Portal
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {clientName}
          </p>

          <p className="text-sm text-slate-500">
            {email}
          </p>
        </div>

        <div className="space-y-5 p-6">

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Invitation expires after
            </label>

            <select
              value={expirationHours}
              onChange={(event) =>
                setExpirationHours(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="w-full rounded-xl border border-slate-300 p-3"
            >
              <option value={24}>
                24 Hours
              </option>

              <option value={48}>
                48 Hours
              </option>

              <option value={72}>
                72 Hours
              </option>

              <option value={168}>
                7 Days
              </option>
            </select>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {invitationLink && (
            <div className="space-y-3">

              <textarea
                readOnly
                value={invitationLink}
                rows={5}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm"
              />

              <button
                type="button"
                onClick={copyLink}
                className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white"
              >
                Copy Invitation Link
              </button>
            </div>
          )}

        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 p-6">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3"
          >
            Close
          </button>

          {!invitationLink && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white"
            >
              {isGenerating
                ? "Generating..."
                : "Generate Invitation"}
            </button>
          )}

        </div>

      </div>
    </div>
  )
}