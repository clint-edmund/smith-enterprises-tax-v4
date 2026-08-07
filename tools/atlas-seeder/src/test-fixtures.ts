import {
  emailDomains,
  employers,
  filingStatuses,
  firstNames,
  lastNames,
  locations,
  occupations,
  phoneAreaCodes,
  streetNames,
} from "./fixtures"

function assertNotEmpty(
  name: string,
  values: readonly unknown[],
): void {
  if (values.length === 0) {
    throw new Error(
      `${name} fixture is empty.`,
    )
  }

  console.log(
    `✓ ${name.padEnd(20)} ${values.length}`,
  )
}

function main(): void {
  console.log("")
  console.log(
    "==============================================",
  )
  console.log(
    " Atlas Fixture Library Test",
  )
  console.log(
    "==============================================",
  )
  console.log("")

  assertNotEmpty(
    "First Names",
    firstNames,
  )

  assertNotEmpty(
    "Last Names",
    lastNames,
  )

  assertNotEmpty(
    "Locations",
    locations,
  )

  assertNotEmpty(
    "Streets",
    streetNames,
  )

  assertNotEmpty(
    "Employers",
    employers,
  )

  assertNotEmpty(
    "Occupations",
    occupations,
  )

  assertNotEmpty(
    "Email Domains",
    emailDomains,
  )

  assertNotEmpty(
    "Phone Area Codes",
    phoneAreaCodes,
  )

  assertNotEmpty(
    "Filing Statuses",
    filingStatuses,
  )

  const invalidLocations =
    locations.filter(
      (location) =>
        location.postalCodes.length === 0,
    )

  if (invalidLocations.length > 0) {
    throw new Error(
      "One or more location fixtures have no postal codes.",
    )
  }

  console.log("")
  console.log(
    "✅ Atlas Fixture Library validation passed.",
  )
  console.log("")
}

main()