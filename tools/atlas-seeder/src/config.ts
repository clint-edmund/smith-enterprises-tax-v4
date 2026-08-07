import {
  config,
} from "dotenv"

config({
  path: ".env.local",
})

function requiredEnvironmentVariable(
  name: string,
): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `Required environment variable ${name} is missing.`,
    )
  }

  return value
}

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "")
}

function assertLocalSupabaseUrl(url: string): void {
  const parsedUrl = new URL(url)

  const allowedHosts = new Set([
    "127.0.0.1",
    "localhost",
  ])

  if (!allowedHosts.has(parsedUrl.hostname)) {
    throw new Error(
      [
        "Atlas Seeder refused to run.",
        "",
        `Detected Supabase host: ${parsedUrl.hostname}`,
        "",
        "The Atlas Seeder may only run against local Supabase.",
      ].join("\n"),
    )
  }

  if (parsedUrl.port !== "54321") {
    throw new Error(
      [
        "Atlas Seeder refused to run.",
        "",
        `Detected Supabase port: ${parsedUrl.port || "<none>"}`,
        "Expected local Supabase API port: 54321",
      ].join("\n"),
    )
  }
}

const supabaseUrl = normalizeUrl(
  requiredEnvironmentVariable(
    "VITE_SUPABASE_URL",
  ),
)

assertLocalSupabaseUrl(supabaseUrl)

export const atlasSeederConfig = {
  supabaseUrl,

  publishableKey:
    requiredEnvironmentVariable(
      "VITE_SUPABASE_PUBLISHABLE_KEY",
    ),

  secretKey:
    requiredEnvironmentVariable(
      "ATLAS_SUPABASE_SECRET_KEY",
    ),

  developmentPassword:
    process.env.ATLAS_DEV_PASSWORD?.trim() ||
    "AtlasLocal!2026",
} as const