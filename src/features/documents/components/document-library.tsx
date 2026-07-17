import { FileArchive } from "lucide-react"

import { DocumentCard } from "@/features/documents/components/document-card"
import type { ClientDocument } from "@/features/documents/types/document.types"

interface DocumentLibraryProps {
  documents: ClientDocument[]
  onArchived: (documentId: string) => void
}

export function DocumentLibrary({ documents, onArchived }: DocumentLibraryProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <FileArchive className="mx-auto size-8 text-slate-400" />
        <h3 className="mt-3 font-semibold text-slate-900">No documents uploaded</h3>
        <p className="mt-1 text-sm text-slate-600">Use the upload area above to add the first document.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} onArchived={onArchived} />
      ))}
    </div>
  )
}
