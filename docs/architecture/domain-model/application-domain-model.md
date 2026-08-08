# Smith Enterprises Application Domain Model

**Status:** Approved foundation  
**Release:** 0.10  
**Updated:** August 2026

## Purpose

This document defines the core business entities in Smith Enterprises Tax
Management and how they relate to one another.

The model is designed to support:

- Client self-service
- Staff-assisted intake
- Document and evidence verification
- Organizer review
- Tax preparation
- Quality review
- Billing
- Communications
- Assignment
- Timeline history
- Auditability
- Future multi-office support

---

## Core Principles

### One source of truth

Client and staff workflows operate on the same organizer and return records.

### Separate business state from historical activity

Current-state tables answer:

> What is true now?

Timeline and audit records answer:

> What happened, who did it, and when?

### Evidence is reusable

One document or evidence source may support multiple organizer fields and review
decisions.

### Staff actions are attributable

Every significant action should record actor, timestamp, workspace, source, and
related business object.

### Client-visible and staff-only data remain separate

Internal notes, risk flags, reviewer checklists, assignment history, and audit
records must never appear in the client portal.

---

# Domain Areas

The platform is divided into the following domain areas:

```text
Identity and Access
Client and Household
Tax Return Lifecycle
Organizer and Intake
Documents and Evidence
Review and Quality
Communications
Assignments and Tasks
Billing and Payments
Activity and Audit
Firm Configuration
```

---

# 1. Identity and Access

## User

Represents an authenticated account.

Typical account types:

- Client
- Receptionist
- Intake Specialist
- Tax Preparer
- Reviewer
- Manager
- Administrator

## Profile

Stores display and business identity information associated with a user.

Typical fields:

```text
id
display_name
first_name
last_name
email
phone
status
created_at
updated_at
```

## Role

Defines a named responsibility set.

Examples:

```text
client
receptionist
intake_specialist
tax_preparer
reviewer
manager
administrator
```

## Permission

Defines an individual authorized capability.

Examples:

```text
organizer.read
organizer.staff_assisted_edit
document.verify
restricted_data.read
review.complete
review.return_to_client
intake.assign
workflow.configure
```

## User Role Assignment

Associates a user with one or more roles.

A user may hold multiple roles.

---

# 2. Client and Household

## Client

Represents one tax-office client record.

Typical relationships:

```text
Client
├── Contact Information
├── Household Members
├── Tax Returns
├── Organizers
├── Documents
├── Communications
├── Billing Accounts
└── Activity History
```

## Household

Groups related clients and dependents.

A household may contain:

- Primary taxpayer
- Spouse
- Dependents
- Other related persons

## Household Member

Represents one person associated with a household.

The same person record may be referenced by:

- Organizer dependents
- Return taxpayers
- Identity documents
- Evidence links

## Contact Method

Stores approved communication channels.

Examples:

- Email
- Mobile phone
- Mailing address
- Secure portal

---

# 3. Tax Return Lifecycle

## Tax Return

Represents one client return for one tax year and return type.

Typical fields:

```text
id
client_id
tax_year
return_type
status
priority
assigned_preparer_id
assigned_reviewer_id
date_received
due_date
created_at
updated_at
```

## Return Status

Examples:

```text
intake
waiting_on_client
ready_for_preparation
in_preparation
ready_for_review
changes_requested
ready_for_signature
ready_to_file
filed
accepted
rejected
archived
```

## Return Assignment

Records current and historical staff assignment.

Assignments may include:

- Intake owner
- Preparer
- Reviewer
- Manager

## Return Workflow Event

Represents a significant lifecycle transition.

Examples:

- Assigned
- Intake completed
- Preparation started
- Ready for review
- Returned for correction
- Approved
- Filed
- Accepted
- Rejected

---

# 4. Organizer and Intake

## Organizer

Represents the tax organizer for one client and tax year.

The organizer is shared by:

- Client portal
- Staff-assisted intake
- Preparer review

## Organizer Section

Examples:

```text
personal_information
filing_status
dependents
income
healthcare
deductions
credits
business
investments
banking
documents
final_review
```

## Organizer Record

Represents one structured record inside an organizer section.

Examples:

- One dependent
- One employer
- One interest account
- One business
- One healthcare record

## Organizer Field Attribution

Records how an organizer value entered the system.

Recommended fields:

```text
organizer_id
section_key
subject_type
subject_id
field_key
entered_by
entered_at
entry_method
updated_by
updated_at
source_evidence_id
source_document_page
client_confirmation_status
staff_validation_status
```

Recommended entry methods:

```text
client_portal
staff_assisted
document_transcription
ocr_assisted
import
system
```

## Intake Case

Represents the operational intake workflow for one organizer or return.

Typical fields:

```text
id
organizer_id
return_id
status
priority
assigned_staff_id
received_method
received_at
started_at
completed_at
created_at
updated_at
```

## Intake Status

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

## Intake Checklist

Reception and intake staff use this checklist to verify:

- Documents received
- Organizer data entered
- Required identity information present
- Missing items requested
- Staff-assisted transcription validated
- Case ready for preparer

## Missing Information Request

Represents a structured request sent to a client.

Typical fields:

```text
id
organizer_id
return_id
requested_by
request_type
subject
details
status
due_date
created_at
responded_at
resolved_at
```

---

# 5. Documents and Evidence

## Document

Represents a stored digital file.

Typical fields:

```text
id
client_id
organizer_id
return_id
storage_path
original_filename
mime_type
file_size
uploaded_by
uploaded_at
document_status
document_type
page_count
checksum
```

Document status examples:

```text
uploaded
received
classified
under_review
verified
rejected
archived
```

## Evidence Source

Represents the business meaning of a piece of evidence.

Evidence may be:

- A digital document
- A physical document
- A secure message
- A phone confirmation
- A prior-year return
- A client organizer answer
- A staff observation
- An imported tax-software record

Typical fields:

```text
id
organizer_id
return_id
evidence_type
document_id
title
description
confidence
verification_status
created_by
created_at
verified_by
verified_at
metadata
```

## Evidence Type

Examples:

```text
birth_certificate
drivers_license
passport
social_security_card
w2
form_1099_int
form_1099_div
form_1098
school_record
medical_record
prior_year_return
organizer_answer
secure_message
phone_confirmation
staff_observation
other
```

## Evidence Confidence

```text
high
medium
low
unverified
```

Confidence describes the source quality, not whether the tax decision is
correct.

## Evidence Verification Status

```text
unverified
under_review
verified
rejected
needs_replacement
```

## Evidence Link

Connects one evidence source to one or more business facts.

Typical fields:

```text
id
evidence_id
organizer_id
section_key
subject_type
subject_id
field_key
link_type
linked_by
linked_at
notes
```

Example:

```text
Birth Certificate
├── Dependent Name
├── Date of Birth
└── Relationship
```

## Evidence Verification Event

Records each verification decision.

Typical fields:

```text
id
evidence_id
action
actor_id
note
created_at
metadata
```

Actions:

```text
verification_started
verified
rejected
replacement_requested
confidence_changed
link_added
link_removed
```

---

# 6. Review and Quality

## Review Item

Represents the current staff-review state for one organizer record.

Examples:

- One dependent review
- One income-source review
- One healthcare-record review

Typical fields:

```text
id
organizer_id
section_key
subject_type
subject_id
review_status
reviewed_by
reviewed_at
follow_up_requested_at
returned_to_client_at
updated_at
```

## Review Status

```text
pending
reviewed
needs_follow_up
returned_to_client
```

## Review Metadata

Shared review concepts:

```text
status
health
priority
workflow_stage
assigned_reviewer
review_owner
review_started_at
last_updated_at
last_action
checklist_progress
risk_level
```

## Review Checklist Definition

Defines the checklist template for one review module.

## Review Checklist Item

Defines one required or optional verification step.

## Review Checklist Response

Stores completion state for one checklist item and review subject.

## Review Timeline Entry

Append-only staff review history.

Event examples:

```text
staff_note
marked_reviewed
needs_follow_up
returned_to_client
resubmitted
status_changed
```

## Quality Review

Represents manager or reviewer approval of a prepared return.

## Quality Checklist

Separate from organizer review.

Examples:

- Taxpayer identity verified
- Filing status reviewed
- Diagnostics cleared
- Supporting documents matched
- Return totals reviewed
- E-file readiness confirmed

---

# 7. Communications

## Secure Conversation

Represents a client or internal communication thread.

## Message

Typical fields:

```text
id
conversation_id
sender_id
message_type
body
visibility
created_at
read_at
```

Visibility:

```text
client_visible
staff_only
```

## Communication Event

Examples:

- Secure message sent
- Email notification sent
- SMS notification sent
- Client called
- Voicemail left
- Callback completed

## Notification

Represents delivery of an application alert.

---

# 8. Assignments and Tasks

## Assignment

Associates a business object with a staff member.

Target types may include:

- Intake case
- Tax return
- Review item
- Missing-information request
- Task

## Task

Represents actionable office work.

Typical fields:

```text
id
client_id
return_id
organizer_id
assigned_to
created_by
title
description
status
priority
due_at
completed_at
```

## Task Status

```text
open
in_progress
waiting
completed
cancelled
```

---

# 9. Billing and Payments

## Invoice

Represents one client invoice.

## Invoice Line

Represents one billed service or charge.

## Payment

Represents a received payment.

## Billing Status

```text
draft
issued
partially_paid
paid
past_due
void
refunded
```

---

# 10. Activity and Audit

## Activity Event

A user-facing operational history event.

Examples:

- Document uploaded
- Organizer updated
- Missing information requested
- Intake completed
- Review completed
- Return assigned
- Invoice paid

## Audit Log

A security and compliance record.

Audit logs should include:

```text
actor
action
entity_type
entity_id
old_values
new_values
metadata
timestamp
```

Activity and audit records are related but serve different purposes.

- Activity explains the business workflow.
- Audit provides detailed security and change evidence.

---

# 11. Firm Configuration

## Firm

Represents one tax business or tenant.

Version 1 may use a single firm but core entities should remain compatible with
future `firm_id` ownership.

## Office

Represents one physical or logical location.

## Workflow Configuration

Future configuration for:

- Status transitions
- Required approvals
- Notification rules
- Checklist templates
- Assignment rules

## Document Requirement

Defines required or recommended evidence by:

- Return type
- Tax year
- Organizer section
- Client situation

---

# Relationship Overview

```text
Firm
└── Office
    ├── Users and Roles
    └── Clients
        ├── Household
        │   └── Household Members
        ├── Tax Returns
        │   ├── Assignments
        │   ├── Tasks
        │   ├── Billing
        │   └── Workflow Events
        ├── Organizers
        │   ├── Intake Case
        │   ├── Organizer Records
        │   ├── Field Attribution
        │   ├── Missing Information Requests
        │   ├── Review Items
        │   │   ├── Checklist Responses
        │   │   └── Review Timeline
        │   └── Evidence Links
        ├── Documents
        │   └── Evidence Sources
        │       ├── Evidence Links
        │       └── Verification Events
        ├── Communications
        ├── Activity Events
        └── Audit Logs
```

---

# Ownership and Deletion Rules

## Client deletion

Client deletion should normally be restricted or soft-deleted because records
may be subject to retention requirements.

## Organizer deletion

Deleting an organizer should cascade only to organizer-specific temporary or
draft records when legally and operationally appropriate.

## Document deletion

Document deletion should be controlled. Evidence links and audit history should
preserve the fact that a file once existed.

## Timeline deletion

Ordinary users must not update or delete timeline history.

## Audit deletion

Audit records must be retained according to firm policy and applicable legal
requirements.

---

# Security Boundaries

## Client-accessible

- Client organizer
- Client documents
- Client-visible requests
- Client-visible messages
- Invoice and payment status
- Signature status

## Staff-only

- Review timeline
- Staff notes
- Intake checklist
- Review checklist
- Risk flags
- Internal assignment
- Internal tasks
- Quality review
- Audit records

## Restricted staff-only

- Social Security numbers
- Bank data
- Driver's-license details
- Identity documents
- Sensitive tax documents
- Security logs

---

# Immediate Implementation Boundary

Release 0.10 should begin with:

1. Evidence source registry
2. Evidence-to-field links
3. Verification status and confidence
4. Evidence verification events
5. Staff-only RLS
6. Secure RPCs
7. Dependents Evidence Panel
8. Intake integration later

The Evidence Registry should reuse existing uploaded document records rather
than duplicate stored files.
