export const dependentRelationships = [
  {
    value: "son",
    label: "Son",
  },
  {
    value: "daughter",
    label: "Daughter",
  },
  {
    value: "stepson",
    label: "Stepson",
  },
  {
    value: "stepdaughter",
    label: "Stepdaughter",
  },
  {
    value: "foster_child",
    label: "Foster Child",
  },
  {
    value: "brother",
    label: "Brother",
  },
  {
    value: "sister",
    label: "Sister",
  },
  {
    value: "stepbrother",
    label: "Stepbrother",
  },
  {
    value: "stepsister",
    label: "Stepsister",
  },
  {
    value: "half_brother",
    label: "Half Brother",
  },
  {
    value: "half_sister",
    label: "Half Sister",
  },
  {
    value: "grandchild",
    label: "Grandchild",
  },
  {
    value: "parent",
    label: "Parent",
  },
  {
    value: "grandparent",
    label: "Grandparent",
  },
  {
    value: "niece",
    label: "Niece",
  },
  {
    value: "nephew",
    label: "Nephew",
  },
  {
    value: "other_relative",
    label: "Other Relative",
  },
  {
    value: "non_relative",
    label: "Non-Relative",
  },
] as const

export type DependentRelationship =
  (typeof dependentRelationships)[number]["value"]