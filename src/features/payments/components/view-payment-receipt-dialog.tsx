import {
  Loader2,
  Printer,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { usePaymentReceipt } from "../hooks/use-payment-receipt"
import { PaymentReceipt } from "./payment-receipt"

interface ViewPaymentReceiptDialogProps {
  paymentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewPaymentReceiptDialog({
  paymentId,
  open,
  onOpenChange,
}: ViewPaymentReceiptDialogProps) {
  const {
    receipt,
    isLoading,
    errorMessage,
  } = usePaymentReceipt(
    open
      ? paymentId
      : null,
  )

  function handlePrint() {
    window.print()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Payment Receipt
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        {!isLoading && receipt && (
          <>
            <div className="mb-4 flex justify-end">
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            </div>

            <PaymentReceipt receipt={receipt} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}