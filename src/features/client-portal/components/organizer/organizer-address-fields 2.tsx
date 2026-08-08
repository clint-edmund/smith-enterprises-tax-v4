import {
  OrganizerSelectField,
  type OrganizerSelectOption,
} from "./organizer-select-field"
import {
  OrganizerTextField,
} from "./organizer-text-field"

interface OrganizerAddressValue {
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
}

interface OrganizerAddressErrors {
  addressLine1?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
}

interface OrganizerAddressFieldsProps {
  value: OrganizerAddressValue

  onChange: (
    field: keyof OrganizerAddressValue,
    value: string,
  ) => void

  disabled?: boolean
  errors?: OrganizerAddressErrors
}

const stateOptions: OrganizerSelectOption[] = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
]

export function OrganizerAddressFields({
  value,
  onChange,
  disabled = false,
  errors = {},
}: OrganizerAddressFieldsProps) {
  return (
    <>
      <div className="md:col-span-2">
        <OrganizerTextField
          id="address-line-1"
          label="Street address"
          value={value.addressLine1}
          onChange={(event) => {
            onChange(
              "addressLine1",
              event.target.value,
            )
          }}
          autoComplete="street-address"
          required
          disabled={disabled}
          errorMessage={
            errors.addressLine1
          }
        />
      </div>

      <div className="md:col-span-2">
        <OrganizerTextField
          id="address-line-2"
          label="Apartment, suite, or unit"
          value={value.addressLine2}
          onChange={(event) => {
            onChange(
              "addressLine2",
              event.target.value,
            )
          }}
          autoComplete="address-line2"
          disabled={disabled}
          helpText="Optional"
        />
      </div>

      <OrganizerTextField
        id="city"
        label="City"
        value={value.city}
        onChange={(event) => {
          onChange(
            "city",
            event.target.value,
          )
        }}
        autoComplete="address-level2"
        required
        disabled={disabled}
        errorMessage={errors.city}
      />

      <OrganizerSelectField
        id="state"
        label="State"
        value={value.state}
        options={stateOptions}
        onChange={(event) => {
          onChange(
            "state",
            event.target.value,
          )
        }}
        required
        disabled={disabled}
        errorMessage={errors.state}
      />

      <OrganizerTextField
        id="postal-code"
        label="ZIP code"
        value={value.postalCode}
        onChange={(event) => {
          onChange(
            "postalCode",
            event.target.value,
          )
        }}
        autoComplete="postal-code"
        inputMode="numeric"
        required
        disabled={disabled}
        errorMessage={
          errors.postalCode
        }
      />
    </>
  )
}