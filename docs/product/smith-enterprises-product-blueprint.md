# Smith Enterprises Tax Management Platform
## Product and Architecture Blueprint

**Status:** Approved foundation  
**Target:** Version 1.0  
**Updated:** August 2026

## Product vision

Smith Enterprises Tax Management is a secure, role-based platform supporting
the full tax-office lifecycle from intake through filing and archival.

It must support clients who complete organizers independently, upload documents
without entering data, drop off paper documents, need staff assistance, or use
a hybrid workflow.

## Core principles

1. **Enter data once.** Client and staff workflows use the same organizer data.
2. **Preserve attribution.** Meaningful actions record actor, time, source, and
   workflow state.
3. **Separate intake from review.** Reception validates completeness and
   transcription; preparers make tax decisions.
4. **Use role-focused workspaces.** Each role sees tools relevant to its work.
5. **Preserve append-only history.** Notes and workflow actions are not silently
   overwritten.
6. **Secure by design.** Sensitive data, internal notes, and documents remain
   permission-controlled and auditable.

## Office workflow

```text
Prospective Client
→ Client Record
→ Organizer Created
→ Documents Collected
→ Client, Staff-Assisted, or Hybrid Entry
→ Missing Information Follow-Up
→ Intake Validation
→ Organizer Submitted
→ Preparer Review
→ Tax Preparation
→ Quality Review
→ Client Approval and Signature
→ Electronic Filing
→ Acceptance or Rejection
→ Delivery and Archive
```

## Intake models

- **Self-service:** Client completes organizer and uploads documents.
- **Staff-assisted drop-off:** Staff transcribe uploaded or paper documents.
- **Hybrid:** Client starts; staff completes remaining information.
- **Walk-in:** Staff create the organizer, scan documents, and enter data.

## Workspaces

### Reception
New clients, drop-offs, uploads, callbacks, assisted entry, missing information,
and intake assignments.

### Intake
Client summary, documents, assisted organizer entry, checklist, requests,
timeline, assignment, and intake completion.

### Preparation
Organizer review, tax questions, tax preparation, diagnostics, and readiness.

### Review
Quality checklist, risk review, corrections, approvals, and reviewer timeline.

### Client Portal
Organizer, uploads, requests, messages, signatures, invoices, and status.
Internal notes and workflow controls never appear here.

### Management
Queues, workload balancing, assignments, productivity, bottlenecks, and audit
reporting.

### Administration
Users, roles, security, workflow configuration, checklists, templates, tax-year
settings, and branding.

## Shared frameworks

### Review Timeline
Append-only staff notes and events such as reviewed, follow-up, returned to
client, resubmitted, and status changes.

### Review Workspace
Current status, reviewer metadata, checklist, action buttons, required
explanations, and timeline.

### Staff-Assisted Organizer Entry
Authorized staff edit the same organizer records used by clients. Staff never
impersonate clients. Changes record actor, time, entry method, and source
document when available.

### Document Workspace
Long-term target:

```text
Source Document Viewer | Organizer Data Entry
```

### Intake Checklist
Reception validates completeness and transcription.

### Review Checklist
Preparers validate tax facts and decisions.

### Missing-Information Workflow
Structured requests visible to clients, Waiting on Client status, response
tracking, and staff queue return.

### Assignment Framework
Assignment to reception, intake, preparer, reviewer, or manager with retained
history.

## Attribution metadata

Where applicable, organizer data should capture:

- entered_by
- entered_at
- entry_method
- updated_by
- updated_at
- source_document_id
- source_document_page
- client_confirmation_status
- staff_validation_status

Recommended entry methods:

```text
client_portal
staff_assisted
document_transcription
ocr_assisted
import
system
```

## Workflow statuses

### Intake

```text
new
documents_received
data_entry_needed
intake_in_progress
missing_information
waiting_on_client
client_responded
intake_validation
ready_for_preparation
```

### Organizer

```text
not_started
in_progress
submitted
under_review
changes_requested
approved
```

### Review item

```text
pending
reviewed
needs_follow_up
returned_to_client
```

## Security model

- Reception may validate completeness and transcription but not tax treatment
  unless separately authorized.
- SSNs, bank details, driver's-license data, and restricted documents require
  explicit permissions.
- Staff notes, internal checklists, risk flags, assignments, and audit records
  remain hidden from clients.
- Required controls include RLS, role authorization, security-definer RPC
  validation, append-only timelines, audit logging, and restricted document
  access.

## Version roadmap

### Version 1.0
Client portal, document upload, staff-assisted intake, intake queue, requests,
checklists, organizer review, timeline, tax-preparation workflow, quality
review, billing, reporting, and security hardening.

### Version 1.5
OCR-assisted extraction, document annotations, mentions, notifications,
calendar integration, and advanced workload reporting.

### Version 2.0
Workflow designer, multi-office support, API, AI document classification,
AI-assisted intake and review, and mobile client app.

## Immediate sequence

1. Complete Dependents Review actions and timeline events.
2. Build Staff-Assisted Intake database foundation.
3. Build Intake Queue and assignments.
4. Add source-document linking.
5. Add missing-information workflow.
6. Add intake checklist and Ready for Preparation transition.
7. Resume remaining review modules.

## Development standard

1. Architecture decision
2. Database migration
3. RLS and permissions
4. RPC/service contract
5. TypeScript service and hook
6. Reusable component
7. Workspace integration
8. Verification SQL
9. Build and regression test
10. Commit and deployment notes
