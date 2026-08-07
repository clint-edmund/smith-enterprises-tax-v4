import type {
  SupabaseClient,
} from "@supabase/supabase-js"

import type {
  GeneratedClient,
} from "../models/generated-client"

interface ClientInsertRow {
  client_number: number
  first_name: string
  last_name: string
  email: string
  phone: string
  address_line_1: string
  city: string
  state: string
  postal_code: string
  birth_date: string
  status:
    | "active"
    | "inactive"
    | "archived"
  notes: string
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

function mapClientToInsert(
  client: GeneratedClient,
  actorUserId: string,
): ClientInsertRow {
  return {
    client_number:
      client.clientNumber,

    first_name:
      client.firstName,

    last_name:
      client.lastName,

    email:
      client.email,

    phone:
      client.phone,

    address_line_1:
      client.addressLine1,

    city:
      client.city,

    state:
      client.state,

    postal_code:
      client.postalCode,

    birth_date:
      client.birthDate,

    status:
      client.status,

    notes:
      [
        "Atlas development data.",
        `Scenario: ${client.scenario}.`,
        `Occupation: ${client.occupation}.`,
        client.employer
          ? `Employer: ${client.employer}.`
          : null,
      ]
        .filter(Boolean)
        .join(" "),

    created_by:
      actorUserId,

    updated_by:
      actorUserId,

    created_at:
      client.createdAt,

    updated_at:
      client.createdAt,
  }
}

export async function seedClients(
  supabase: SupabaseClient,
  clients: readonly GeneratedClient[],
  actorUserId: string,
): Promise<void> {
  const rows =
    clients.map(
      (client) =>
        mapClientToInsert(
          client,
          actorUserId,
        ),
    )

  /*
   * Insert in manageable batches.
   */
  const batchSize = 50

  for (
    let offset = 0;
    offset < rows.length;
    offset += batchSize
  ) {
    const batch =
      rows.slice(
        offset,
        offset + batchSize,
      )

    const {
      error,
    } = await supabase
      .from("clients")
      .upsert(
        batch,
        {
          onConflict:
            "client_number",
        },
      )

    if (error) {
      throw new Error(
        [
          "Client seeding failed.",
          `Batch offset: ${offset}`,
          error.message,
        ].join("\n"),
      )
    }

    console.log(
      `✓ Clients ${offset + 1}-${Math.min(
        offset + batch.length,
        rows.length,
      )}`,
    )
  }
}

export async function verifyClients(
  supabase: SupabaseClient,
  expectedCount: number,
): Promise<void> {
  const {
    count,
    error,
  } = await supabase
    .from("clients")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    )
    .gte(
      "client_number",
      900001,
    )
    .lte(
      "client_number",
      999999,
    )

  if (error) {
    throw error
  }

  if (count !== expectedCount) {
    throw new Error(
      [
        "Development client verification failed.",
        `Expected: ${expectedCount}`,
        `Found: ${count ?? 0}`,
      ].join("\n"),
    )
  }

  console.log(
    `✓ Verified ${expectedCount} development clients`,
  )
}