/**
 * Atlas Fixture Library
 * DMV-area development locations.
 */

export interface AtlasLocationFixture {
  city: string
  state: "DC" | "MD" | "VA"
  postalCodes: readonly string[]
}

export const locations: readonly AtlasLocationFixture[] = [
  {
    city: "Alexandria",
    state: "VA",
    postalCodes: [
      "22301",
      "22304",
      "22314",
    ],
  },
  {
    city: "Arlington",
    state: "VA",
    postalCodes: [
      "22201",
      "22203",
      "22207",
    ],
  },
  {
    city: "Ashburn",
    state: "VA",
    postalCodes: [
      "20147",
      "20148",
    ],
  },
  {
    city: "Bowie",
    state: "MD",
    postalCodes: [
      "20715",
      "20716",
      "20720",
      "20721",
    ],
  },
  {
    city: "Brambleton",
    state: "VA",
    postalCodes: [
      "20148",
    ],
  },
  {
    city: "Capitol Heights",
    state: "MD",
    postalCodes: [
      "20743",
    ],
  },
  {
    city: "Chantilly",
    state: "VA",
    postalCodes: [
      "20151",
      "20152",
    ],
  },
  {
    city: "District Heights",
    state: "MD",
    postalCodes: [
      "20747",
    ],
  },
  {
    city: "Falls Church",
    state: "VA",
    postalCodes: [
      "22042",
      "22043",
      "22046",
    ],
  },
  {
    city: "Greenbelt",
    state: "MD",
    postalCodes: [
      "20770",
    ],
  },
  {
    city: "Herndon",
    state: "VA",
    postalCodes: [
      "20170",
      "20171",
    ],
  },
  {
    city: "Hyattsville",
    state: "MD",
    postalCodes: [
      "20781",
      "20782",
      "20783",
    ],
  },
  {
    city: "Laurel",
    state: "MD",
    postalCodes: [
      "20707",
      "20723",
      "20724",
    ],
  },
  {
    city: "Leesburg",
    state: "VA",
    postalCodes: [
      "20175",
      "20176",
    ],
  },
  {
    city: "Oxon Hill",
    state: "MD",
    postalCodes: [
      "20745",
    ],
  },
  {
    city: "Reston",
    state: "VA",
    postalCodes: [
      "20190",
      "20191",
      "20194",
    ],
  },
  {
    city: "Rockville",
    state: "MD",
    postalCodes: [
      "20850",
      "20852",
    ],
  },
  {
    city: "Silver Spring",
    state: "MD",
    postalCodes: [
      "20901",
      "20902",
      "20910",
    ],
  },
  {
    city: "Sterling",
    state: "VA",
    postalCodes: [
      "20164",
      "20165",
      "20166",
    ],
  },
  {
    city: "Suitland",
    state: "MD",
    postalCodes: [
      "20746",
    ],
  },
  {
    city: "Temple Hills",
    state: "MD",
    postalCodes: [
      "20748",
    ],
  },
  {
    city: "Upper Marlboro",
    state: "MD",
    postalCodes: [
      "20772",
      "20774",
    ],
  },
  {
    city: "Washington",
    state: "DC",
    postalCodes: [
      "20001",
      "20002",
      "20003",
      "20009",
      "20011",
      "20019",
      "20020",
      "20032",
    ],
  },
] as const