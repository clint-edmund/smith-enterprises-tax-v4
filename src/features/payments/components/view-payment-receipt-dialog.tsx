import {
  Download,
  Loader2,
  Printer,
} from "lucide-react"

import {
  useRef,
  useState,
} from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { usePaymentReceipt } from "../hooks/use-payment-receipt"
import { PaymentReceipt } from "./payment-receipt"

import {
  downloadPaymentReceiptPdf,
} from "../services/payment-pdf-service"

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
  const receiptRef =
  useRef<HTMLDivElement>(null)

  const [
    isGeneratingPdf,
    setIsGeneratingPdf,
  ] = useState(false)

  function handlePrint() {
    window.print()
  }

  async function handleDownloadPdf() {
    if (!receipt || !receiptRef.current) {
      console.error("Receipt or receipt element is missing.")
      return
    }

    try {
      setIsGeneratingPdf(true)

      console.log("Generating PDF...")
      console.log("Receipt:", receipt.receiptNumber)
      console.log("Element:", receiptRef.current)

      await downloadPaymentReceiptPdf(
        receiptRef.current,
        receipt.receiptNumber ?? "",
      )

      console.log("PDF generated successfully.")
    } catch (error) {
      console.error("PDF generation failed:", error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
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
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-4 flex shrink-0 justify-end gap-2 border-b border-slate-200 pb-4">
              <Button
                type="button"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              <div
                ref={receiptRef}
                data-payment-receipt="true"
              >
                <PaymentReceipt receipt={receipt} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}