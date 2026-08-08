import {
  supabase,
} from "@/services/supabase"

import type {
  CreateAndLinkEvidenceRequest,
  EvidenceConfidence,
  EvidenceLinkType,
  EvidenceVerificationStatus,
  GetSubjectEvidenceRequest,
  OrganizerEvidenceLink,
  OrganizerEvidenceSource,
  UpdateEvidenceVerificationRequest,
} from "@/features/organizer-review/types/evidence.types"

interface SubjectEvidenceRow {
  evidence_id: string
  organizer_id: string
  return_id: string | null
  document_id: string | null
  evidence_type: string
  title: string
  description: string | null
  confidence: string
  verification_status: string
  created_by: string | null
  created_by_name: string
  verified_by: string | null
  verified_by_name: string | null
  verified_at: string | null
  metadata: unknown
  created_at: string
  updated_at: string
  link_id: string
  field_key: string | null
  link_type: string
  link_notes: string | null
  linked_by: string | null
  linked_by_name: string | null
  linked_at: string
}

interface CreatedEvidenceRow {
  evidence_id: string
}

function requireValue(
  value: string,
  label: string,
): string {
  const normalized =
    value.trim()

  if (!normalized) {
    throw new Error(
      `${label} is required.`,
    )
  }

  return normalized
}

function mapConfidence(
  value: string,
): EvidenceConfidence {
  switch (value) {
    case "high":
    case "medium":
    case "low":
    case "unverified":
      return value

    default:
      throw new Error(
        `Unsupported evidence confidence: ${value}`,
      )
  }
}

function mapStatus(
  value: string,
): EvidenceVerificationStatus {
  switch (value) {
    case "unverified":
    case "under_review":
    case "verified":
    case "rejected":
    case "needs_replacement":
      return value

    default:
      throw new Error(
        `Unsupported evidence verification status: ${value}`,
      )
  }
}

function mapLinkType(
  value: string,
): EvidenceLinkType {
  switch (value) {
    case "supports":
    case "contradicts":
    case "replaces":
    case "reference":
      return value

    default:
      throw new Error(
        `Unsupported evidence link type: ${value}`,
      )
  }
}

function mapLink(
  row:
    SubjectEvidenceRow,
): OrganizerEvidenceLink {
  return {
    linkId:
      row.link_id,

    fieldKey:
      row.field_key,

    linkType:
      mapLinkType(
        row.link_type,
      ),

    notes:
      row.link_notes,

    linkedBy:
      row.linked_by,

    linkedByName:
      row.linked_by_name,

    linkedAt:
      row.linked_at,
  }
}

function groupEvidence(
  rows:
    SubjectEvidenceRow[],
): OrganizerEvidenceSource[] {
  const evidenceMap =
    new Map<
      string,
      OrganizerEvidenceSource
    >()

  for (const row of rows) {
    const existing =
      evidenceMap.get(
        row.evidence_id,
      )

    if (existing) {
      existing.links.push(
        mapLink(row),
      )

      continue
    }

    evidenceMap.set(
      row.evidence_id,
      {
        evidenceId:
          row.evidence_id,

        organizerId:
          row.organizer_id,

        returnId:
          row.return_id,

        documentId:
          row.document_id,

        evidenceType:
          row.evidence_type,

        title:
          row.title,

        description:
          row.description,

        confidence:
          mapConfidence(
            row.confidence,
          ),

        verificationStatus:
          mapStatus(
            row.verification_status,
          ),

        createdBy:
          row.created_by,

        createdByName:
          row.created_by_name,

        verifiedBy:
          row.verified_by,

        verifiedByName:
          row.verified_by_name,

        verifiedAt:
          row.verified_at,

        metadata:
          (
            row.metadata &&
            typeof row.metadata ===
              "object"
              ? row.metadata
              : {}
          ) as OrganizerEvidenceSource["metadata"],

        createdAt:
          row.created_at,

        updatedAt:
          row.updated_at,

        links: [
          mapLink(row),
        ],
      },
    )
  }

  return Array.from(
    evidenceMap.values(),
  )
}

export async function getSubjectEvidence(
  request:
    GetSubjectEvidenceRequest,
): Promise<OrganizerEvidenceSource[]> {
  const organizerId =
    requireValue(
      request.organizerId,
      "An organizer identifier",
    )

  const subjectId =
    requireValue(
      request.subjectId,
      "An evidence subject identifier",
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_organizer_subject_evidence",
    {
      requested_organizer_id:
        organizerId,

      requested_section_key:
        request.sectionKey,

      requested_subject_type:
        request.subjectType,

      requested_subject_id:
        subjectId,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  return groupEvidence(
    (
      data as
        | SubjectEvidenceRow[]
        | null
    ) ?? [],
  )
}

export async function createAndLinkEvidence(
  request:
    CreateAndLinkEvidenceRequest,
): Promise<void> {
  const organizerId =
    requireValue(
      request.organizerId,
      "An organizer identifier",
    )

  const subjectId =
    requireValue(
      request.subjectId,
      "An evidence subject identifier",
    )

  const title =
    requireValue(
      request.title,
      "An evidence title",
    )

  const evidenceType =
    requireValue(
      request.evidenceType,
      "An evidence type",
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "create_organizer_evidence_source",
    {
      requested_organizer_id:
        organizerId,

      requested_return_id:
        request.returnId ??
        (null as unknown as string),

      requested_document_id:
        request.documentId ??
        (null as unknown as string),

      requested_evidence_type:
        evidenceType,

      requested_title:
        title,

      requested_description:
        request.description?.trim() ??
        "",

      requested_confidence:
        request.confidence,

      requested_metadata:
        request.metadata ?? {},
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const created =
    (
      data as
        | CreatedEvidenceRow[]
        | null
    )?.[0]

  if (!created) {
    throw new Error(
      "The created evidence source was not returned.",
    )
  }

  const {
    error:
      linkError,
  } = await supabase.rpc(
    "link_organizer_evidence",
    {
      requested_evidence_id:
        created.evidence_id,

      requested_organizer_id:
        organizerId,

      requested_section_key:
        request.sectionKey,

      requested_subject_type:
        request.subjectType,

      requested_subject_id:
        subjectId,

      requested_field_key:
        request.fieldKey?.trim() ??
        "",

      requested_link_type:
        request.linkType ??
        "supports",

      requested_notes:
        request.linkNotes?.trim() ??
        "",
    },
  )

  if (linkError) {
    throw new Error(
      linkError.message,
    )
  }
}

export async function updateEvidenceVerification(
  request:
    UpdateEvidenceVerificationRequest,
): Promise<void> {
  const evidenceId =
    requireValue(
      request.evidenceId,
      "An evidence identifier",
    )

  const {
    error,
  } = await supabase.rpc(
    "update_organizer_evidence_verification",
    {
      requested_evidence_id:
        evidenceId,

      requested_confidence:
        request.confidence,

      requested_verification_status:
        request.verificationStatus,

      requested_note:
        request.note?.trim() ??
        "",
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }
}
