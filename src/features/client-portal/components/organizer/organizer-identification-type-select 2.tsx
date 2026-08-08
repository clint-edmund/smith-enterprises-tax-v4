import {
  OrganizerSelectField,
} from "./organizer-select-field"

const identificationTypes = [
  {
    value: "drivers_license",
    label: "Driver's License",
  },
  {
    value: "state_id",
    label: "State Identification Card",
  },
  {
    value: "passport",
    label: "Passport",
  },
  {
    value: "military_id",
    label: "Military Identification",
  },
  {
    value: "other",
    label: "Other Government Identification",
  },
]

interface OrganizerIdentificationTypeSelectProps {
  id: string
  value: string
  onChange: React.ChangeEventHandler<HTMLSelectElement>

  required?: boolean
  disabled?: boolean
  errorMessage?: string | null
}

export function OrganizerIdentificationTypeSelect({
  id,
  value,
  onChange,
  required = false,
  disabled = false,
  errorMessage,
}: OrganizerIdentificationTypeSelectProps) {
  return (
    <OrganizerSelectField
      id={id}
      label="Identification Type"
      value={value}
      options={identificationTypes}
      onChange={onChange}
      required={required}
      disabled={disabled}
      errorMessage={errorMessage}
    />
  )
}