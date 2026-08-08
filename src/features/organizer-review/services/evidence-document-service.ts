import { supabase } from "@/services/supabase"
import type {
  EvidenceConfidence,
  EvidenceVerificationStatus,
  OrganizerAvailableDocument,
  RegisterDocumentEvidenceRequest,
} from "@/features/organizer-review/types/evidence.types"

interface Row {
  document_id: string
  client_id: string
  tax_return_id: string | null
  tax_year: number | null
  category: string
  document_status: string
  original_file_name: string
  storage_bucket: string
  storage_path: string
  mime_type: string
  size_bytes: number
  description: string | null
  uploaded_by_name: string
  uploaded_at: string
  evidence_id: string | null
  evidence_type: string | null
  evidence_confidence: string | null
  evidence_verification_status: string | null
  is_registered_as_evidence: boolean
}

type Rpc = (
  name: "list_organizer_available_documents" | "register_document_as_organizer_evidence",
  args?: Record<string, unknown>,
) => Promise<{ data: unknown; error: { message: string } | null }>

const rpc = supabase.rpc.bind(supabase) as unknown as Rpc

function confidence(value: string | null): EvidenceConfidence | null {
  return value === "high" || value === "medium" || value === "low" || value === "unverified"
    ? value
    : null
}

function status(value: string | null): EvidenceVerificationStatus | null {
  return value === "verified" || value === "under_review" || value === "rejected" || value === "needs_replacement" || value === "unverified"
    ? value
    : null
}

export async function listOrganizerAvailableDocuments(
  organizerId: string,
): Promise<OrganizerAvailableDocument[]> {
  if (!organizerId.trim()) throw new Error("An organizer identifier is required.")
  const { data, error } = await rpc("list_organizer_available_documents", {
    requested_organizer_id: organizerId.trim(),
  })
  if (error) throw new Error(error.message)

  return (((data ?? []) as Row[])).map((row) => ({
    documentId: row.document_id,
    clientId: row.client_id,
    taxReturnId: row.tax_return_id,
    taxYear: row.tax_year,
    category: row.category,
    documentStatus: row.document_status,
    originalFileName: row.original_file_name,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    description: row.description,
    uploadedByName: row.uploaded_by_name,
    uploadedAt: row.uploaded_at,
    evidenceId: row.evidence_id,
    evidenceType: row.evidence_type,
    evidenceConfidence: confidence(row.evidence_confidence),
    evidenceVerificationStatus: status(row.evidence_verification_status),
    isRegisteredAsEvidence: row.is_registered_as_evidence,
  }))
}

export async function registerDocumentAsEvidence(
  request: RegisterDocumentEvidenceRequest,
): Promise<void> {
  const { error } = await rpc("register_document_as_organizer_evidence", {
    requested_organizer_id: request.organizerId,
    requested_document_id: request.documentId,
    requested_section_key: request.sectionKey,
    requested_subject_type: request.subjectType,
    requested_subject_id: request.subjectId,
    requested_field_key: request.fieldKey ?? "",
    requested_evidence_type: request.evidenceType,
    requested_confidence: request.confidence,
    requested_link_type: request.linkType ?? "supports",
    requested_notes: request.notes?.trim() ?? "",
  })
  if (error) throw new Error(error.message)
}


export async function createEvidenceDocumentPreviewUrl(
  document: OrganizerAvailableDocument,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(document.storageBucket)
    .createSignedUrl(document.storagePath, 60 * 10)

  if (error) {
    throw new Error(error.message)
  }

  if (!data.signedUrl) {
    throw new Error(
      "A secure document preview URL was not returned.",
    )
  }

  return data.signedUrl
}
