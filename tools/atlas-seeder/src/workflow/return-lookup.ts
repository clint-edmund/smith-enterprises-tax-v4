import type {
  SupabaseClient,
} from "@supabase/supabase-js"

interface ReturnLookupRow {
  id: string
  tax_year: number

  clients:
    | {
        client_number: number
      }
    | {
        client_number: number
      }[]
    | null
}

function createKey(
  clientNumber: number,
  taxYear: number,
): string {
  return `${clientNumber}:${taxYear}`
}

function getClientNumber(
  row: ReturnLookupRow,
): number {
  if (!row.clients) {
    throw new Error(
      `Tax return ${row.id} has no client relationship.`,
    )
  }

  if (
    Array.isArray(
      row.clients,
    )
  ) {
    const firstClient =
      row.clients[0]

    if (!firstClient) {
      throw new Error(
        `Tax return ${row.id} has no client relationship.`,
      )
    }

    return Number(
      firstClient.client_number,
    )
  }

  return Number(
    row.clients.client_number,
  )
}

export async function loadReturnIdsByClientYear(
  supabase: SupabaseClient,
): Promise<Map<string, string>> {
  const {
    data,
    error,
  } = await supabase
    .from("tax_returns")
    .select(`
      id,
      tax_year,
      clients!inner (
        client_number
      )
    `)
    .gte(
      "clients.client_number",
      900001,
    )
    .lte(
      "clients.client_number",
      999999,
    )

  if (error) {
    throw new Error(
      `Unable to load development tax returns: ${error.message}`,
    )
  }

  const rows =
    (data ?? []) as ReturnLookupRow[]

  const map =
    new Map<
      string,
      string
    >()

  for (const row of rows) {
    const clientNumber =
      getClientNumber(
        row,
      )

    const key =
      createKey(
        clientNumber,
        row.tax_year,
      )

    if (map.has(key)) {
      throw new Error(
        `Duplicate development return lookup key: ${key}`,
      )
    }

    map.set(
      key,
      row.id,
    )
  }

  return map
}

export function getReturnLookupKey(
  clientNumber: number,
  taxYear: number,
): string {
  return createKey(
    clientNumber,
    taxYear,
  )
}