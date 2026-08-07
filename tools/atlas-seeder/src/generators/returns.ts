import {
  createReturn,
} from "../factories/return.factory"

import {
  generateClients,
} from "./clients"

import type {
  GeneratedReturn,
} from "../models/generated-return"

import {
  ATLAS_DEFAULT_SEED,
  SeededRandom,
} from "../utils/random"

export function generateReturns(
  seed =
    ATLAS_DEFAULT_SEED + 1000,
): GeneratedReturn[] {
  const clients =
    generateClients()

  const random =
    new SeededRandom(
      seed,
    )

  const returns: GeneratedReturn[] = []

  let returnIndex = 1

  for (
    const client
    of clients
  ) {
    /*
     * Everyone receives a 2025 return.
     */
    returns.push(
      createReturn(
        client,
        returnIndex,
        2025,
        random,
      ),
    )

    returnIndex += 1

    /*
     * Most clients also receive a 2024 return.
     */
    if (
      client.clientNumber % 4 !== 0
    ) {
      returns.push(
        createReturn(
          client,
          returnIndex,
          2024,
          random,
        ),
      )

      returnIndex += 1
    }
  }

  return returns
}