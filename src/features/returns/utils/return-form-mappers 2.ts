import type {
  TaxReturnFormValues,
  TaxReturnRecord,
} from "@/features/returns/types/return.types"

export function mapTaxReturnToFormValues(
  taxReturn: TaxReturnRecord,
): TaxReturnFormValues {
  return {
    clientId: taxReturn.clientId,
    taxYear: taxReturn.taxYear,
    returnType:
      taxReturn.returnType,
    taxForm:
      taxReturn.taxForm,
    filingStatus:
      taxReturn.filingStatus,
    status:
      taxReturn.status,

    assignedPreparerId:
      taxReturn.assignedPreparerId ??
      "",

    assignedReviewerId:
      taxReturn.assignedReviewerId ??
      "",

    dateReceived:
      taxReturn.dateReceived ??
      "",

    dueDate:
      taxReturn.dueDate ??
      "",

    filedDate:
      taxReturn.filedDate ??
      "",

    acceptedDate:
      taxReturn.acceptedDate ??
      "",

    preparationFee:
      taxReturn.preparationFee,

    discountAmount:
      taxReturn.discountAmount,

    description:
      taxReturn.description ??
      "",

    federalReturnRequired:
      taxReturn.federalReturnRequired,

    stateReturnRequired:
      taxReturn.stateReturnRequired,

    localReturnRequired:
      taxReturn.localReturnRequired,

    extensionFiled:
      taxReturn.extensionFiled,

    extensionDate:
      taxReturn.extensionDate ??
      "",

    estimatedRefund:
      taxReturn.estimatedRefund,

    estimatedAmountDue:
      taxReturn.estimatedAmountDue,

    notes:
      taxReturn.notes ?? "",
  }
}