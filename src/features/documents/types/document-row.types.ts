export interface DocumentCategoryRow {
  id: string
  code: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClientDocumentRow {
  id: string
  client_id: string
  tax_return_id: string | null
  category: string
  status: string
  original_file_name: string
  storage_bucket: string
  storage_path: string
  mime_type: string
  size_bytes: number
  description: string | null
  uploaded_by: string
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface DocumentAccessLogRow {
  id: number
  document_id: string
  actor_id: string | null
  action: string
  occurred_at: string
  details: Record<string, unknown>
}