import { z } from "zod"

const currentYear = new Date().getFullYear()

const optionalDateSchema = z
  .string()
  .refine(
    (value) => {
      if (value === "") {
        return true
      }

      const parsedDate = new Date(`${value}T00:00:00`)

      return !Number.isNaN(parsedDate.getTime())
    },
    "Enter a valid date.",
  )

export const returnSchema = z
  .object({
    clientId: z
      .string()
      .uuid("Select a valid client."),

    taxYear: z
      .number()
      .int("Tax year must be a whole number.")
      .min(2000, "Tax year is too early.")
      .max(
        currentYear + 2,
        "Tax year is too far in the future.",
      ),

    returnType: z.enum([
      "individual",
      "business",
      "amended",
      "extension",
      "other",
    ]),

    taxForm: z.enum([
      "1040",
      "1040_nr",
      "1041",
      "1065",
      "1120",
      "1120_s",
      "990",
      "schedule_c",
      "state_only",
      "other",
    ]),

    filingStatus: z.enum([
      "single",
      "married_filing_jointly",
      "married_filing_separately",
      "head_of_household",
      "qualifying_surviving_spouse",
      "not_applicable",
    ]),

    status: z.enum([
      "not_started",
      "documents_pending",
      "in_progress",
      "ready_for_review",
      "under_review",
      "ready_to_file",
      "filed",
      "accepted",
      "rejected",
      "completed",
      "on_hold",
    ]),

    assignedPreparerId: z.string(),

    assignedReviewerId: z.string(),

    dateReceived: optionalDateSchema,

    dueDate: optionalDateSchema,

    filedDate: optionalDateSchema,

    acceptedDate: optionalDateSchema,

    preparationFee: z
      .number()
      .min(
        0,
        "Preparation fee cannot be negative.",
      ),

    discountAmount: z
      .number()
      .min(
        0,
        "Discount cannot be negative.",
      ),

    description: z
      .string()
      .trim()
      .max(
        500,
        "Description cannot exceed 500 characters.",
      ),

    federalReturnRequired: z.boolean(),

    stateReturnRequired: z.boolean(),

    localReturnRequired: z.boolean(),

    extensionFiled: z.boolean(),

    extensionDate: optionalDateSchema,

    estimatedRefund: z
      .number()
      .min(
        0,
        "Estimated refund cannot be negative.",
      ),

    estimatedAmountDue: z
      .number()
      .min(
        0,
        "Estimated amount due cannot be negative.",
      ),

    notes: z
      .string()
      .trim()
      .max(
        5000,
        "Notes cannot exceed 5,000 characters.",
      ),
  })
  .superRefine((values, context) => {
    if (
      values.discountAmount >
      values.preparationFee
    ) {
      context.addIssue({
        code: "custom",
        path: ["discountAmount"],
        message:
          "Discount cannot exceed the preparation fee.",
      })
    }

    if (
      values.extensionFiled &&
      values.extensionDate === ""
    ) {
      context.addIssue({
        code: "custom",
        path: ["extensionDate"],
        message:
          "Extension date is required when an extension is filed.",
      })
    }

    if (
      values.acceptedDate !== "" &&
      values.filedDate === ""
    ) {
      context.addIssue({
        code: "custom",
        path: ["filedDate"],
        message:
          "Filed date is required before an accepted date can be entered.",
      })
    }

    if (
      values.dateReceived !== "" &&
      values.dueDate !== ""
    ) {
      const receivedDate = new Date(
        `${values.dateReceived}T00:00:00`,
      )

      const dueDate = new Date(
        `${values.dueDate}T00:00:00`,
      )

      if (dueDate < receivedDate) {
        context.addIssue({
          code: "custom",
          path: ["dueDate"],
          message:
            "Due date cannot be before the received date.",
        })
      }
    }

    if (
      values.filedDate !== "" &&
      values.acceptedDate !== ""
    ) {
      const filedDate = new Date(
        `${values.filedDate}T00:00:00`,
      )

      const acceptedDate = new Date(
        `${values.acceptedDate}T00:00:00`,
      )

      if (acceptedDate < filedDate) {
        context.addIssue({
          code: "custom",
          path: ["acceptedDate"],
          message:
            "Accepted date cannot be before the filed date.",
        })
      }
    }
  })

export type ReturnSchemaValues =
  z.infer<typeof returnSchema>