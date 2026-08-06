import type {
  Json,
} from "@/types/database.types"

export type EvidenceConfidence =
  | "high"
  | "medium"
  | "low"
  | "unverified"

export type EvidenceVerificationStatus =
  | "unverified"
  | "under_review"
  | "verified"
  | "rejected"
  | "needs_replacement"

export type EvidenceLinkType =
  | "supports"
  | "contradicts"
  | "replaces"
  | "reference"

export interface OrganizerEvidenceLink {
  linkId: string
  fieldKey: string | null
  linkType: EvidenceLinkType
  notes: string | null
  linkedBy: string | null
  linkedByName: string | null
  linkedAt: string
}

export interface OrganizerEvidenceSource {
  evidenceId: string
  organizerId: string
  returnId: string | null
  documentId: string | null
  evidenceType: string
  title: string
  description: string | null
  confidence: EvidenceConfidence
  verificationStatus:
    EvidenceVerificationStatus
  createdBy: string | null
  createdByName: string
  verifiedBy: string | null
  verifiedByName: string | null
  verifiedAt: string | null
  metadata: Json
  createdAt: string
  updatedAt: string
  links:
    OrganizerEvidenceLink[]
}

export interface EvidenceFieldOption {
  key: string
  label: string
}

export interface GetSubjectEvidenceRequest {
  organizerId: string
  sectionKey: string
  subjectType: string
  subjectId: string
}

export interface CreateAndLinkEvidenceRequest
  extends GetSubjectEvidenceRequest {
  returnId?: string | null
  documentId?: string | null
  evidenceType: string
  title: string
  description?: string
  confidence:
    EvidenceConfidence
  fieldKey?: string | null
  linkType?:
    EvidenceLinkType
  linkNotes?: string
  metadata?: Json
}

export interface UpdateEvidenceVerificationRequest {
  evidenceId: string
  confidence:
    EvidenceConfidence
  verificationStatus:
    EvidenceVerificationStatus
  note?: string
}


export interface OrganizerAvailableDocument {
  documentId: string
  clientId: string
  taxReturnId: string | null
  taxYear: number | null
  category: string
  documentStatus: string
  originalFileName: string
  mimeType: string
  sizeBytes: number
  description: string | null
  uploadedByName: string
  uploadedAt: string
  evidenceId: string | null
  evidenceType: string | null
  evidenceConfidence: EvidenceConfidence | null
  evidenceVerificationStatus: EvidenceVerificationStatus | null
  isRegisteredAsEvidence: boolean
}

export interface RegisterDocumentEvidenceRequest {
  organizerId: string
  documentId: string
  sectionKey: string
  subjectType: string
  subjectId: string
  fieldKey: string | null
  evidenceType: string
  confidence: EvidenceConfidence
  linkType?: EvidenceLinkType
  notes?: string
}
