import type {
  ChangeEventHandler,
} from "react"

import {
  OrganizerSelectField,
  type OrganizerSelectOption,
} from "./organizer-select-field"

const citizenshipStatusOptions:
  OrganizerSelectOption[] = [
    {
      value: "us_citizen",
      label: "U.S. Citizen",
    },
    {
      value: "resident_alien",
      label: "Resident Alien",
    },
    {
      value: "nonresident_alien",
      label: "Nonresident Alien",
    },
    {
      value: "dual_citizen",
      label: "Dual Citizen",
    },
    {
      value: "other",
      label: "Other",
    },
  ]

interface OrganizerCitizenshipStatusSelectProps {
  id: string
  value: string

  onChange:
    ChangeEventHandler<HTMLSelectElement>

  label?: string
  required?: boolean
  disabled?: boolean
  errorMessage?: string | null
  helpText?: string
}

export function OrganizerCitizenshipStatusSelect({
  id,
  value,
  onChange,
  label = "Citizenship status",
  required = false,
  disabled = false,
  errorMessage,
  helpText,
}: OrganizerCitizenshipStatusSelectProps) {
  return (
    <OrganizerSelectField
      id={id}
      label={label}
      value={value}
      options={
        citizenshipStatusOptions
      }
      onChange={onChange}
      required={required}
      disabled={disabled}
      errorMessage={errorMessage}
      helpText={helpText}
    />
  )
}