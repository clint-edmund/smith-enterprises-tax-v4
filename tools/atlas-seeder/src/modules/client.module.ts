import type {
  SupabaseClient,
} from "@supabase/supabase-js"

import {
  generateClients,
} from "../generators/clients"

import type {
  GeneratedClient,
} from "../models/generated-client"

import {
  seedClients,
  verifyClients,
} from "../services/client.service"

import {
  logHeader,
} from "../utils/logger"

export async function runClientModule(
  supabase: SupabaseClient,
  administratorId: string,
): Promise<GeneratedClient[]> {
  logHeader(
    "Seeding Atlas Development Clients",
  )

  const clients =
    generateClients()

  await seedClients(
    supabase,
    clients,
    administratorId,
  )

  await verifyClients(
    supabase,
    clients.length,
  )

  return clients
}