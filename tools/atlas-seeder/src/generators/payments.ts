import {
  createPaymentsForReturn,
} from "../factories/payment.factory"

import type {
  GeneratedPayment,
} from "../models/generated-payment"

import {
  generateReturns,
} from "./returns"

import {
  ATLAS_DEFAULT_SEED,
  SeededRandom,
} from "../utils/random"

export function generatePayments(
  seed =
    ATLAS_DEFAULT_SEED + 2000,
): GeneratedPayment[] {
  const returns =
    generateReturns()

  const random =
    new SeededRandom(
      seed,
    )

  const payments: GeneratedPayment[] = []

  for (
    let index = 0;
    index < returns.length;
    index += 1
  ) {
    payments.push(
      ...createPaymentsForReturn(
        returns[index],
        index + 1,
        random,
      ),
    )
  }

  return payments
}