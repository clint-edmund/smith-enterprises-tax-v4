import type {
  DocumentAnalysisSuggestion,
  OrganizerAvailableDocument,
} from "@/features/organizer-review/types/evidence.types"

function normalizeDocumentText(
  document:
    OrganizerAvailableDocument,
): string {
  return [
    document.originalFileName,
    document.category,
    document.description ??
      "",
    document.mimeType,
  ]
    .join(" ")
    .toLowerCase()
}

function includesAny(
  value: string,
  terms: string[],
): boolean {
  return terms.some(
    (term) =>
      value.includes(
        term,
      ),
  )
}

export function analyzeDependentDocument(
  document:
    OrganizerAvailableDocument,
): DocumentAnalysisSuggestion {
  const searchable =
    normalizeDocumentText(
      document,
    )

  if (
    includesAny(
      searchable,
      [
        "birth certificate",
        "birth_cert",
        "birth-certificate",
        "certificate of birth",
      ],
    )
  ) {
    return {
      evidenceType:
        "birth_certificate",

      confidence:
        "high",

      suggestedFields: [
        {
          fieldKey:
            "first_name",
          reason:
            "Birth certificates commonly support the dependent's legal first name.",
        },
        {
          fieldKey:
            "middle_name",
          reason:
            "Birth certificates commonly support the dependent's legal middle name.",
        },
        {
          fieldKey:
            "last_name",
          reason:
            "Birth certificates commonly support the dependent's legal last name.",
        },
        {
          fieldKey:
            "birth_date",
          reason:
            "Birth certificates commonly support the dependent's date of birth.",
        },
        {
          fieldKey:
            "relationship",
          reason:
            "Parent information may help support the claimed relationship.",
        },
      ],

      explanation:
        "The filename or category appears consistent with a birth certificate.",
    }
  }

  if (
    includesAny(
      searchable,
      [
        "social security",
        "social_security",
        "ss card",
        "ssn card",
        "taxpayer identification",
      ],
    )
  ) {
    return {
      evidenceType:
        "social_security_card",

      confidence:
        "high",

      suggestedFields: [
        {
          fieldKey:
            "first_name",
          reason:
            "The card may support the dependent's legal first name.",
        },
        {
          fieldKey:
            "middle_name",
          reason:
            "The card may support the dependent's legal middle name.",
        },
        {
          fieldKey:
            "last_name",
          reason:
            "The card may support the dependent's legal last name.",
        },
        {
          fieldKey:
            "taxpayer_identifier_documentation",
          reason:
            "The document may support confirmation that taxpayer identification documentation was reviewed.",
        },
      ],

      explanation:
        "The filename or category appears consistent with taxpayer identification documentation.",
    }
  }

  if (
    includesAny(
      searchable,
      [
        "school",
        "student",
        "report card",
        "enrollment",
        "attendance",
      ],
    )
  ) {
    return {
      evidenceType:
        "school_record",

      confidence:
        "medium",

      suggestedFields: [
        {
          fieldKey:
            "is_full_time_student",
          reason:
            "School records may support full-time student status.",
        },
        {
          fieldKey:
            "lived_with_taxpayer_all_year",
          reason:
            "School records may help support residency.",
        },
        {
          fieldKey:
            "months_lived_with_taxpayer",
          reason:
            "School attendance dates may help support months of residency.",
        },
        {
          fieldKey:
            "supporting_documentation",
          reason:
            "The document may serve as general dependent supporting evidence.",
        },
      ],

      explanation:
        "The filename or category appears consistent with a school or student record.",
    }
  }

  if (
    includesAny(
      searchable,
      [
        "medical",
        "doctor",
        "disability",
        "disabled",
        "physician",
      ],
    )
  ) {
    return {
      evidenceType:
        "medical_record",

      confidence:
        "medium",

      suggestedFields: [
        {
          fieldKey:
            "is_permanently_disabled",
          reason:
            "Medical documentation may support permanent disability status.",
        },
        {
          fieldKey:
            "supporting_documentation",
          reason:
            "The record may serve as general supporting documentation.",
        },
      ],

      explanation:
        "The filename or category appears consistent with medical or disability documentation.",
    }
  }

  if (
    includesAny(
      searchable,
      [
        "prior year",
        "prior_year",
        "tax return",
        "1040",
      ],
    )
  ) {
    return {
      evidenceType:
        "prior_year_return",

      confidence:
        "medium",

      suggestedFields: [
        {
          fieldKey:
            "first_name",
          reason:
            "A prior-year return may support comparison of the dependent's name.",
        },
        {
          fieldKey:
            "last_name",
          reason:
            "A prior-year return may support comparison of the dependent's name.",
        },
        {
          fieldKey:
            "birth_date",
          reason:
            "A prior-year return may support comparison of dependent identity details.",
        },
        {
          fieldKey:
            "relationship",
          reason:
            "A prior-year return may support comparison of the claimed relationship.",
        },
        {
          fieldKey:
            "supporting_documentation",
          reason:
            "A prior-year return may be useful as a reference source.",
        },
      ],

      explanation:
        "The filename or category appears consistent with a prior-year tax return.",
    }
  }

  return {
    evidenceType:
      "other",

    confidence:
      "unverified",

    suggestedFields: [],

    explanation:
      "No reliable rule-based document match was found. Review and classify the document manually.",
  }
}
