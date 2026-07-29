import { useState } from "react"
import { X } from "lucide-react"

import { recordReturnPayment } from "../services/payment-service"
import type { RecordPaymentValues } from "../types/payment.types"
import { PaymentForm } from "./payment-form"

interface PaymentDialogProps {
  open: boolean
  taxReturnId: string
  onClose: () => void
  onPaymentRecorded: () => void
}

export function PaymentDialog({
  open,
  taxReturnId,
  onClose,
  onPaymentRecorded,
}: PaymentDialogProps) {
  const [isSaving, setIsSaving] = useState(false)

  if (!open) {
    return null
  }

  async function handleSave(
    values: RecordPaymentValues,
  ): Promise<void> {
    try {
      setIsSaving(true)

      await recordReturnPayment(values)

      onPaymentRecorded()
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">
              Record Payment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record a payment received for this tax return.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6">
          <PaymentForm
            taxReturnId={taxReturnId}
            isSaving={isSaving}
            onCancel={onClose}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  )
}