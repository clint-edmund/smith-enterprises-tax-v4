import { z } from "zod"

const optionalEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      z.string().email().safeParse(value).success,
    "Enter a valid email address.",
  )

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (value === "") {
        return true
      }

      const digits = value.replace(/\D/g, "")

      return digits.length === 10
    },
    "Enter a 10-digit telephone number.",
  )

export const clientSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(100, "First name is too long."),

  middleName: z
    .string()
    .trim()
    .max(100, "Middle name is too long."),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(100, "Last name is too long."),

  preferredName: z
    .string()
    .trim()
    .max(100, "Preferred name is too long."),

  email: optionalEmailSchema,

  phone: optionalPhoneSchema,

  alternatePhone: optionalPhoneSchema,

  addressLine1: z
    .string()
    .trim()
    .max(200, "Address line is too long."),

  addressLine2: z
    .string()
    .trim()
    .max(200, "Address line is too long."),

  city: z
    .string()
    .trim()
    .max(100, "City is too long."),

  state: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        /^[A-Za-z]{2}$/.test(value),
      "Use the two-letter state abbreviation.",
    ),

  postalCode: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        /^\d{5}(-\d{4})?$/.test(value),
      "Enter a valid ZIP code.",
    ),

  birthDate: z
    .string()
    .refine(
      (value) => {
        if (value === "") {
          return true
        }

        const date = new Date(`${value}T00:00:00`)

        return (
          !Number.isNaN(date.getTime()) &&
          date <= new Date()
        )
      },
      "Birth date cannot be in the future.",
    ),

  status: z.enum([
    "active",
    "inactive",
    "archived",
  ]),

  notes: z
    .string()
    .trim()
    .max(5000, "Notes are too long."),
})

export type ClientSchemaValues =
  z.infer<typeof clientSchema>