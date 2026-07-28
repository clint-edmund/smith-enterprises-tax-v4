import { Calendar } from "lucide-react"

import { FileText } from "lucide-react"
import { User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import type {
  ClientReturnSummary,
} from "../types/client-return.types"

import {
  ClientReturnStatusBadge,
} from "./client-return-status-badge"

interface Props {
  taxReturn: ClientReturnSummary

  onViewDetails: (
    returnId: string
  ) => void
}

function currency(
  amount: number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(amount)
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
    }
  ).format(
    new Date(value)
  )
}

export function ClientReturnCard({
  taxReturn,
  onViewDetails,
}: Props) {
  return (
    <Card className="space-y-6 p-6">

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-xl font-semibold">
            {taxReturn.taxYear}
            {" "}
            {taxReturn.returnType}
          </h2>

          <p className="text-sm text-muted-foreground">
            {taxReturn.taxForm}
          </p>

        </div>

        <ClientReturnStatusBadge
          status={taxReturn.status}
        />

      </div>

      <div className="grid gap-4 md:grid-cols-2">

        <div className="flex items-center gap-3">

          <User className="h-4 w-4" />

          <div>

            <p className="text-xs text-muted-foreground">
              Assigned Preparer
            </p>

            <p className="font-medium">
              {taxReturn.assignedPreparerName ??
                "Not Assigned"}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <Calendar className="h-4 w-4" />

          <div>

            <p className="text-xs text-muted-foreground">
              Updated
            </p>

            <p className="font-medium">
              {formatDate(
                taxReturn.updatedAt
              )}
            </p>

          </div>

        </div>

      </div>

      <div className="grid gap-4 sm:grid-cols-3">

        <div>

          <p className="text-xs text-muted-foreground">
            Fee
          </p>

          <p className="font-semibold">
            {currency(
              taxReturn.preparationFee
            )}
          </p>

        </div>

        <div>

          <p className="text-xs text-muted-foreground">
            Payments
          </p>

          <p className="font-semibold">
            {currency(
              taxReturn.totalPayments
            )}
          </p>

        </div>

        <div>

          <p className="text-xs text-muted-foreground">
            Balance
          </p>

          <p className="font-semibold">
            {currency(
              taxReturn.outstandingBalance
            )}
          </p>

        </div>

      </div>

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <FileText className="h-4 w-4" />

          <span>
            {taxReturn.documentCount}
            {" "}
            Documents
          </span>

        </div>

        <Button
          onClick={() =>
            onViewDetails(
              taxReturn.returnId
            )
          }
        >
          View Details
        </Button>

      </div>

    </Card>
  )
}