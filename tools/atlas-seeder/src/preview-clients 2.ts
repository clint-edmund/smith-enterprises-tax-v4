import {
  generateClients,
} from "./generators/clients"

import type {
  GeneratedClient,
} from "./models/generated-client"

function assertUnique(
  clients: readonly GeneratedClient[],
  selector: (
    client: GeneratedClient,
  ) => string,
  label: string,
): void {
  const values =
    clients.map(
      selector,
    )

  const uniqueValues =
    new Set(
      values,
    )

  if (
    uniqueValues.size !==
    values.length
  ) {
    throw new Error(
      `Duplicate ${label} detected.`,
    )
  }

  console.log(
    `✓ Unique ${label.padEnd(18)} ${values.length}`,
  )
}

function formatClient(
  client: GeneratedClient,
): string {
  return [
    client.clientNumber,
    `${client.firstName} ${client.lastName}`,
    `${client.city}, ${client.state} ${client.postalCode}`,
    client.phone,
    client.filingStatus,
    client.scenario,
  ].join(
    " | ",
  )
}

function main(): void {
  const clients =
    generateClients()

  console.log("")
  console.log(
    "==============================================",
  )
  console.log(
    " Atlas Client Factory Preview",
  )
  console.log(
    "==============================================",
  )
  console.log("")

  console.log(
    `Generated Clients: ${clients.length}`,
  )

  console.log("")

  assertUnique(
    clients,
    (client) =>
      String(client.clientNumber),
    "client numbers",
  )

  assertUnique(
    clients,
    (client) =>
      client.email,
    "email addresses",
  )

  assertUnique(
    clients,
    (client) =>
      client.phone,
    "phone numbers",
  )

  console.log("")
  console.log(
    "First 15 Clients",
  )
  console.log(
    "----------------------------------------------",
  )

  for (
    const client
    of clients.slice(
      0,
      15,
    )
  ) {
    console.log(
      formatClient(
        client,
      ),
    )
  }

  console.log("")
  console.log(
    "Scenario Distribution",
  )
  console.log(
    "----------------------------------------------",
  )

  const distribution =
    new Map<
      string,
      number
    >()

  for (
    const client
    of clients
  ) {
    distribution.set(
      client.scenario,
      (
        distribution.get(
          client.scenario,
        ) ?? 0
      ) + 1,
    )
  }

  for (
    const [
      scenario,
      count,
    ]
    of distribution
  ) {
    console.log(
      `${scenario.padEnd(24)} ${count}`,
    )
  }

  console.log("")
  console.log(
    "✅ Atlas Client Factory validation passed.",
  )
  console.log("")
}

main()