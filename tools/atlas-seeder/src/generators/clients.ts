import {
  createClient,
} from "../factories/client.factory"

import type {
  GeneratedClient,
} from "../models/generated-client"

import {
  ATLAS_DEFAULT_SEED,
  SeededRandom,
} from "../utils/random"

export const ATLAS_DEFAULT_CLIENT_COUNT =
  125

export function generateClients(
  count =
    ATLAS_DEFAULT_CLIENT_COUNT,
  seed =
    ATLAS_DEFAULT_SEED,
): GeneratedClient[] {
  if (
    !Number.isInteger(count) ||
    count < 1
  ) {
    throw new Error(
      "Client count must be a positive integer.",
    )
  }

  const random =
    new SeededRandom(
      seed,
    )

  return Array.from(
    {
      length: count,
    },

    (_, position) =>
      createClient(
        position + 1,
        random,
      ),
  )
}