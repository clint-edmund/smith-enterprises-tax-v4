import type {
  SupabaseClient,
} from "@supabase/supabase-js"

import {
  developmentStaff,
} from "./staff"

import {
  runClientModule,
} from "./modules/client.module"

import {
  runReturnModule,
} from "./modules/return.module"

import {
  runStaffModule,
} from "./modules/staff.module"

import {
  logHeader,
} from "./utils/logger"

import {
  runPaymentModule,
} from "./modules/payment.module"

export interface AtlasOfficeSeedResult {
  staffCount: number
  clientCount: number
  returnCount: number
  paymentCount: number
  administratorId: string
}

export async function seedAtlasOffice(
  supabase: SupabaseClient,
): Promise<AtlasOfficeSeedResult> {
  const {
    administrator,
  } = await runStaffModule(
    supabase,
  )

  const clients =
    await runClientModule(
      supabase,
      administrator.id,
    )

  const returns =
    await runReturnModule(
      supabase,
      administrator.id,
    )

  const payments =
    await runPaymentModule()

  logHeader(
    "Atlas Seeder Complete",
  )

  console.log(
    `✓ ${developmentStaff.length} development staff accounts ready`,
  )

  console.log(
    `✓ ${clients.length} development clients ready`,
  )

  console.log(
    `✓ ${returns.length} development tax returns ready`,
  )

  console.log(
    `✓ ${payments.length} development payments ready`,
  )

  console.log("")

  return {
    staffCount:
      developmentStaff.length,

    clientCount:
      clients.length,

    returnCount:
      returns.length,

    paymentCount:
      payments.length,

    administratorId:
      administrator.id,
  }
}