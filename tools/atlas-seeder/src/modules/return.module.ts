import type {
  SupabaseClient,
} from "@supabase/supabase-js"

import {
  generateReturns,
} from "../generators/returns"

import type {
  GeneratedReturn,
} from "../models/generated-return"

import {
  seedReturns,
  verifyReturns,
} from "../services/return.service"

import {
  logHeader,
} from "../utils/logger"

export async function runReturnModule(
  supabase: SupabaseClient,
  administratorId: string,
): Promise<GeneratedReturn[]> {
  logHeader(
    "Seeding Atlas Development Tax Returns",
  )

  const returns =
    generateReturns()

  await seedReturns(
    supabase,
    returns,
    administratorId,
  )

  await verifyReturns(
    supabase,
    returns.length,
  )

  return returns
}