import { CheckCircle2, FileText, Link2, Search, X } from "lucide-react"
import { DocumentReviewWorkspace } from "@/features/organizer-review/components/document-review-workspace"
import { useMemo, useState } from "react"
import { ReviewNotice } from "@/features/organizer-review/components/review-workspace/review-notice"
import { useEvidenceDocumentLibrary } from "@/features/organizer-review/hooks/use-evidence-document-library"
import type { EvidenceConfidence, EvidenceFieldOption } from "@/features/organizer-review/types/evidence.types"

interface Props {
  organizerId: string
  sectionKey: string
  subjectType: string
  subjectId: string
  subjectLabel: string
  fieldOptions: EvidenceFieldOption[]
  onEvidenceChanged?: () => Promise<void> | void
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
}

export function EvidenceDocumentPicker(props: Props) {
  const library = useEvidenceDocumentLibrary(props.organizerId)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [fieldKey, setFieldKey] = useState(props.fieldOptions[0]?.key ?? "")
  const [evidenceType, setEvidenceType] = useState("other")
  const [confidence, setConfidence] = useState<EvidenceConfidence>("unverified")
  const [reviewDocumentId, setReviewDocumentId] = useState<string | null>(null)

  const categories = useMemo(() => Array.from(new Set(library.documents.map((item) => item.category))).sort(), [library.documents])
  const documents = useMemo(() => {
    const term = search.trim().toLowerCase()
    return library.documents.filter((item) =>
      (category === "all" || item.category === category) &&
      (!term || [item.originalFileName, item.category, item.description ?? "", item.uploadedByName].some((value) => value.toLowerCase().includes(term))),
    )
  }, [category, library.documents, search])
  const selected = library.documents.find((item) => item.documentId === documentId) ?? null

  async function linkReviewFields(
    fieldKeys: string[],
    selectedEvidenceType: string,
    selectedConfidence: EvidenceConfidence,
  ): Promise<boolean> {
    const reviewDocument =
      library.documents.find(
        (item) =>
          item.documentId === reviewDocumentId,
      )

    if (!reviewDocument) {
      return false
    }

    for (const fieldKey of fieldKeys) {
      const didSave =
        await library.registerDocument({
          documentId:
            reviewDocument.documentId,
          sectionKey:
            props.sectionKey,
          subjectType:
            props.subjectType,
          subjectId:
            props.subjectId,
          fieldKey,
          evidenceType:
            selectedEvidenceType,
          confidence:
            selectedConfidence,
          notes:
            `Existing client document linked to ${props.subjectLabel}.`,
        })

      if (!didSave) {
        return false
      }
    }

    await props.onEvidenceChanged?.()

    return true
  }

  async function save() {
    if (!selected) return
    const ok = await library.registerDocument({
      documentId: selected.documentId,
      sectionKey: props.sectionKey,
      subjectType: props.subjectType,
      subjectId: props.subjectId,
      fieldKey,
      evidenceType,
      confidence,
      notes: `Existing client document linked to ${props.subjectLabel}.`,
    })
    if (ok) {
      await props.onEvidenceChanged?.()
      setDocumentId(null)
    }
  }

  return <div className="mt-4">
    <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50">
      <Link2 className="h-4 w-4" aria-hidden="true" /> Attach Existing Document
    </button>

    {library.successMessage && <ReviewNotice tone="success" message={library.successMessage} onDismiss={library.clearMessages} />}
    {library.errorMessage && <ReviewNotice tone="error" message={library.errorMessage} onDismiss={library.clearMessages} />}

    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="document-picker-title" className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Evidence Workspace</p>
            <h2 id="document-picker-title" className="mt-1 text-xl font-semibold">Attach Existing Document</h2>
            <p className="mt-1 text-sm text-slate-600">Link a current client document to {props.subjectLabel}.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} disabled={library.savingDocumentId !== null} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50"><X className="h-5 w-5" /><span className="sr-only">Close</span></button>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_20rem]">
          <div className="min-h-0 overflow-y-auto p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
              <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search documents" className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm" /></label>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border bg-white px-3 py-2.5 text-sm"><option value="all">All Categories</option>{categories.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
            </div>

            {library.isLoading ? <div className="mt-5 space-y-3">{[1,2,3].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}</div> :
              documents.length === 0 ? <div className="mt-5 rounded-xl border border-dashed p-6 text-center text-sm text-slate-600">No current documents match.</div> :
              <div className="mt-5 space-y-3">{documents.map((item) => <button key={item.documentId} type="button" onClick={() => { setDocumentId(item.documentId); setEvidenceType(item.evidenceType ?? "other"); setConfidence(item.evidenceConfidence ?? "unverified") }} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left ${documentId === item.documentId ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100"><FileText className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{item.originalFileName}</span><span className="mt-1 block text-xs text-slate-600">{label(item.category)} • Uploaded {date(item.uploadedAt)} by {item.uploadedByName}</span></span>
                {item.isRegisteredAsEvidence && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" /> In Registry</span>}
              </button>)}</div>}
          </div>

          <aside className="border-t bg-slate-50 p-5 lg:border-l lg:border-t-0">
            <h3 className="font-semibold">Link Details</h3>
            {selected ? <div className="mt-4 space-y-4">
              <p className="rounded-xl border bg-white p-3 text-sm font-semibold break-words">{selected.originalFileName}</p>
              {selected.isRegisteredAsEvidence && <p className="text-xs font-medium text-emerald-700">This will reuse the existing Evidence Source.</p>}
              <label className="block text-sm font-semibold">Supports Field<select value={fieldKey} onChange={(event) => setFieldKey(event.target.value)} className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5 font-normal">{props.fieldOptions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
              <label className="block text-sm font-semibold">Evidence Type<select value={evidenceType} onChange={(event) => setEvidenceType(event.target.value)} className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5 font-normal"><option value="birth_certificate">Birth Certificate</option><option value="social_security_card">Taxpayer Identification Document</option><option value="school_record">School Record</option><option value="medical_record">Medical or Disability Record</option><option value="prior_year_return">Prior-Year Return</option><option value="other">Other</option></select></label>
              <label className="block text-sm font-semibold">Confidence<select value={confidence} onChange={(event) => setConfidence(event.target.value as EvidenceConfidence)} className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5 font-normal"><option value="unverified">Unverified</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
              <button
                type="button"
                onClick={() =>
                  setReviewDocumentId(
                    selected.documentId,
                  )
                }
                disabled={
                  library.savingDocumentId !== null
                }
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
              >
                <FileText className="h-4 w-4" />
                Review and Link Multiple Fields
              </button>

              <button
                type="button"
                onClick={() => void save()}
                disabled={
                  library.savingDocumentId !== null
                }
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-4 text-sm font-semibold text-blue-800 disabled:opacity-50"
              >
                <Link2 className="h-4 w-4" />
                {library.savingDocumentId
                  ? "Linking..."
                  : "Quick Link One Field"}
              </button>
            </div> : <p className="mt-4 text-sm text-slate-600">Select a document to configure its evidence link.</p>}
          </aside>
        </div>
      </section>
    </div>}

    <DocumentReviewWorkspace
      document={
        library.documents.find(
          (item) =>
            item.documentId ===
            reviewDocumentId,
        ) ?? null
      }
      subjectLabel={props.subjectLabel}
      fieldOptions={props.fieldOptions}
      isSaving={
        library.savingDocumentId !== null
      }
      onClose={() =>
        setReviewDocumentId(null)
      }
      onLinkFields={linkReviewFields}
    />
  </div>
}
