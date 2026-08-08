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
} from "../fixtures"

import type {
  GeneratedClient,
  AtlasClientScenario,
  AtlasClientStatus,
} from "../models/generated-client"

import type {
  SeededRandom,
} from "../utils/random"

function formatIndex(
  index: number,
): string {
  return String(index).padStart(
    4,
    "0",
  )
}

function generateClientNumber(
  index: number,
): number {
  return 900000 + index
}

function generateScenario(
  index: number,
): AtlasClientScenario {
  const bucket =
    (index - 1) % 100

  if (bucket < 28) {
    return "simple_w2"
  }

  if (bucket < 52) {
    return "married_family"
  }

  if (bucket < 64) {
    return "retired"
  }

  if (bucket < 80) {
    return "self_employed"
  }

  if (bucket < 88) {
    return "small_business"
  }

  if (bucket < 96) {
    return "rental_property"
  }

  return "complex_investor"
}

function generateFilingStatus(
  scenario: AtlasClientScenario,
  random: SeededRandom,
) {
  switch (scenario) {
    case "married_family":
      return random.chance(0.9)
        ? "married_filing_jointly"
        : "married_filing_separately"

    case "retired":
      return random.pick([
        "single",
        "married_filing_jointly",
        "qualifying_surviving_spouse",
      ] as const)

    case "self_employed":
    case "small_business":
    case "rental_property":
    case "complex_investor":
      return random.pick(
        filingStatuses,
      )

    case "simple_w2":
    default:
      return random.pick([
        "single",
        "head_of_household",
        "married_filing_jointly",
      ] as const)
  }
}

function generateStatus(
  index: number,
): AtlasClientStatus {
  const bucket =
    (index - 1) % 20

  if (bucket === 18) {
    return "inactive"
  }

  if (bucket === 19) {
    return "archived"
  }

  return "active"
}

function generateBirthDate(
  scenario: AtlasClientScenario,
  random: SeededRandom,
): string {
  let start: Date
  let end: Date

  if (scenario === "retired") {
    start =
      new Date("1938-01-01T00:00:00Z")

    end =
      new Date("1961-12-31T23:59:59Z")
  } else {
    start =
      new Date("1958-01-01T00:00:00Z")

    end =
      new Date("2004-12-31T23:59:59Z")
  }

  return random
    .dateBetween(
      start,
      end,
    )
    .toISOString()
    .slice(0, 10)
}

function generatePhone(
  index: number,
): string {
  const areaCode =
    phoneAreaCodes[
      (index - 1) %
        phoneAreaCodes.length
    ]

  /*
   * 555-01xx numbers are used so development
   * data does not resemble a customer's
   * actual telephone number.
   */
  const suffixGroup =
    Math.floor(
      (index - 1) /
        phoneAreaCodes.length,
    )

  const lineNumber =
    100 + suffixGroup

  return `(${areaCode}) 555-${String(
    lineNumber,
  ).padStart(4, "0")}`
}

function slugify(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      ".",
    )
    .replace(
      /^\.+|\.+$/g,
      "",
    )
}

function generateEmail(
  firstName: string,
  lastName: string,
  index: number,
  random: SeededRandom,
): string {
  const domain =
    random.pick(
      emailDomains,
    )

  return [
    slugify(firstName),
    ".",
    slugify(lastName),
    ".",
    formatIndex(index),
    "@",
    domain,
  ].join("")
}

function generateEmployment(
  scenario: AtlasClientScenario,
  random: SeededRandom,
): {
  occupation: string
  employer: string | null
} {
  if (scenario === "retired") {
    return {
      occupation: "Retired",
      employer: null,
    }
  }

  if (
    scenario === "self_employed" ||
    scenario === "small_business"
  ) {
    return {
      occupation:
        "Small Business Owner",

      employer: null,
    }
  }

  return {
    occupation:
      random.pick(
        occupations.filter(
          (occupation) =>
            occupation !== "Retired",
        ),
      ),

    employer:
      random.pick(
        employers,
      ),
  }
}

export function createClient(
  index: number,
  random: SeededRandom,
): GeneratedClient {
  if (index < 1) {
    throw new Error(
      "Client index must start at 1.",
    )
  }

  const scenario =
    generateScenario(index)

  const firstName =
    random.pick(
      firstNames,
    )

  const lastName =
    random.pick(
      lastNames,
    )

  const location =
    random.pick(
      locations,
    )

  const postalCode =
    random.pick(
      location.postalCodes,
    )

  const streetNumber =
    random.integer(
      100,
      9999,
    )

  const streetName =
    random.pick(
      streetNames,
    )

  const employment =
    generateEmployment(
      scenario,
      random,
    )

  const createdAt =
    random.dateBetween(
      new Date(
        "2023-01-01T00:00:00Z",
      ),
      new Date(
        "2026-07-31T23:59:59Z",
      ),
    )

  return {
    clientNumber:
      generateClientNumber(
        index,
      ),

    firstName,
    lastName,

    birthDate:
      generateBirthDate(
        scenario,
        random,
      ),

    email:
      generateEmail(
        firstName,
        lastName,
        index,
        random,
      ),

    phone:
      generatePhone(
        index,
      ),

    addressLine1:
      `${streetNumber} ${streetName}`,

    city:
      location.city,

    state:
      location.state,

    postalCode,

    occupation:
      employment.occupation,

    employer:
      employment.employer,

    filingStatus:
      generateFilingStatus(
        scenario,
        random,
      ),

    status:
      generateStatus(
        index,
      ),

    scenario,

    createdAt:
      createdAt.toISOString(),
  }
}