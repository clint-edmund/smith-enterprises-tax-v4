import { z } from "zod"

const environmentSchema = z.object({
  VITE_APP_NAME: z
    .string()
    .trim()
    .min(1, "VITE_APP_NAME is required"),

  VITE_APP_VERSION: z
    .string()
    .trim()
    .min(1, "VITE_APP_VERSION is required"),

  VITE_APP_ENVIRONMENT: z
    .enum(["development", "test", "production"])
    .default("development"),

  VITE_SUPABASE_URL: z.string().trim().optional().default(""),

  VITE_SUPABASE_ANON_KEY: z.string().trim().optional().default(""),
})

const environmentResult = environmentSchema.safeParse(import.meta.env)

if (!environmentResult.success) {
  console.error(
    "Invalid application environment configuration:",
    environmentResult.error.flatten().fieldErrors,
  )

  throw new Error(
    "The application environment configuration is invalid.",
  )
}

export const env = environmentResult.data