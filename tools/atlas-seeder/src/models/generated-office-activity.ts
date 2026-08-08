export interface GeneratedOfficeActivity {
  clientNumber: number
  taxYear: number

  simulationKey: string

  eventType: string
  eventLabel: string
  eventDescription: string

  isClientVisible: boolean

  occurredAt: string

  eventData: Record<
    string,
    unknown
  >
}