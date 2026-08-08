# Evidence Domain Model

## Goal

The Evidence domain establishes a reusable registry for documents and other
sources supporting organizer data and review decisions.

## Key distinction

A **Document** is a stored file.

An **Evidence Source** is the business meaning and verification state of a
source.

One document may become one evidence source. Some evidence sources may not have
a file, such as a phone confirmation.

## Entities

### Evidence Source

```text
id
organizer_id
return_id
document_id
evidence_type
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

### Evidence Link

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

### Evidence Verification Event

```text
id
evidence_id
action
actor_id
note
created_at
metadata
```

## Example

```text
Evidence Source
Birth Certificate.pdf
Confidence: High
Status: Verified

Links
├── Dependents / Emily Smith / Name
├── Dependents / Emily Smith / Birth Date
└── Dependents / Emily Smith / Relationship
```

## Verification rules

- Evidence may be linked before verification.
- A verified field should show who verified the supporting evidence and when.
- Rejecting evidence does not delete it.
- Replacing evidence creates a new source and preserves the old history.
- Sensitive identifiers must not be copied into evidence-link notes.

## Confidence guidance

### High

Official government, financial, or tax document.

### Medium

Trusted third-party or business record.

### Low

Client-provided statement or informal source.

### Unverified

Not yet classified or reviewed.

## Release 0.10 initial scope

- Evidence registry
- Document-backed evidence
- Manual evidence type selection
- Manual confidence selection
- Verification status
- Field links
- Verification history
- Dependents Evidence Panel

## Deferred

- OCR
- Automatic classification
- AI field matching
- Duplicate detection
- Document annotations
- Prior-year comparison
