/**
 * Atlas Office Simulation Clock
 *
 * All deterministic development scenarios should
 * derive relative dates from this value rather than
 * directly calling new Date().
 */

export const ATLAS_SIMULATION_DATE =
  new Date("2026-08-07T12:00:00Z")

const millisecondsPerDay =
  24 * 60 * 60 * 1000

export function simulationDate():
Date {
  return new Date(
    ATLAS_SIMULATION_DATE.getTime(),
  )
}

export function simulationDateOffset(
  days: number,
): Date {
  return new Date(
    ATLAS_SIMULATION_DATE.getTime() +
      days * millisecondsPerDay,
  )
}

export function simulationDateOnlyOffset(
  days: number,
): string {
  return simulationDateOffset(
    days,
  )
    .toISOString()
    .slice(0, 10)
}

export function daysBeforeSimulation(
  days: number,
): Date {
  return simulationDateOffset(
    -days,
  )
}

export function daysAfterSimulation(
  days: number,
): Date {
  return simulationDateOffset(
    days,
  )
}