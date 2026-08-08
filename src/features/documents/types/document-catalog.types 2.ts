export type DocumentCatalogCategory =
  | "identity"
  | "income"
  | "deduction"
  | "business"
  | "investment"
  | "retirement"
  | "prior_year"
  | "organizer"
  | "signature"
  | "other"

export type DocumentRequirementLevel =
  | "required"
  | "conditional"
  | "optional"

export interface DocumentType {
  id: string
  code: string
  name: string
  description: string | null
  category: DocumentCatalogCategory
  defaultRequired: boolean
  supportsMultiple: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface TaxPackageTemplate {
  id: string
  code: string
  name: string
  returnForm: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TaxPackageTemplateItem {
  id: string
  templateId: string
  documentTypeId: string
  requirementLevel: DocumentRequirementLevel
  instructions: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface TaxPackageTemplateItemDetails
  extends TaxPackageTemplateItem {
  documentType: DocumentType
}

export interface TaxPackageTemplateDetails
  extends TaxPackageTemplate {
  items: TaxPackageTemplateItemDetails[]
}