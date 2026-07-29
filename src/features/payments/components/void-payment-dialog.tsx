import {
  useState,
} from "react"

import {
  Button,
} from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Label,
} from "@/components/ui/label"

import {
  Textarea,
} from "@/components/ui/textarea"

interface VoidPaymentDialogProps {
  open: boolean

  paymentAmount: number

  onCancel: () => void

  onConfirm: (
    reason: string,
  ) => Promise<void>

  isSubmitting: boolean
}

export function VoidPaymentDialog({
  open,
  paymentAmount,
  onCancel,
  onConfirm,
  isSubmitting,
}: VoidPaymentDialogProps) {

  const [
    reason,
    setReason,
  ] = useState("")

  const [
    error,
    setError,
  ] = useState("")

  async function handleConfirm() {

    const trimmedReason =
      reason.trim()

    if (!trimmedReason) {

      setError(
        "Enter a reason for voiding this payment.",
      )

      return
    }

    setError("")

    await onConfirm(
      trimmedReason,
    )

    setReason("")
  }

  function handleClose() {

    if (isSubmitting) {
      return
    }

    setReason("")

    setError("")

    onCancel()
  }

  return (

    <Dialog
      open={open}
      onOpenChange={handleClose}
    >

      <DialogContent>

        <DialogHeader>

          <DialogTitle>
            Void Payment
          </DialogTitle>

          <DialogDescription>

            You are about to void a payment of

            {" "}

            <strong>

              $
              {paymentAmount.toFixed(2)}

            </strong>

            .

            This action will be recorded in the audit trail.

          </DialogDescription>

        </DialogHeader>

        <div className="space-y-3">

          <Label htmlFor="void-reason">

            Reason

          </Label>

          <Textarea
            id="void-reason"
            value={reason}
            rows={4}
            disabled={isSubmitting}
            placeholder="Explain why this payment is being voided..."
            onChange={(event) => {
              setReason(
                event.target.value,
              )

              if (error) {
                setError("")
              }
            }}
          />

          {error && (

            <p className="text-sm text-red-600">

              {error}

            </p>

          )}

        </div>

        <DialogFooter>

          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting
              ? "Voiding..."
              : "Void Payment"}
          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>
  )
}