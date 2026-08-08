# ADR-0005: Use a Shared Evidence Registry

**Status:** Accepted  
**Date:** 2026-08-05

## Context

Uploaded documents may support multiple organizer fields and review decisions.
Storing document references independently inside each review module would
duplicate data and make verification history inconsistent.

## Decision

Create a shared Evidence Registry.

A document is stored once. An evidence source records its business meaning,
confidence, and verification state. Evidence links associate that source with
one or more organizer fields or review subjects.

## Alternatives Considered

- Attach documents directly to each review item.
- Store one document copy per supported field.
- Store verification only as checklist text.
- Use the general audit log as the evidence registry.

## Consequences

### Positive

- Upload once and link many times.
- Preserves evidence verification history.
- Supports field-level traceability.
- Prepares the platform for OCR and AI-assisted matching.
- Keeps review modules from duplicating document logic.

### Trade-offs

- Adds registry and linking tables.
- Requires careful permission checks.
- Evidence and document lifecycle must remain synchronized.
- Field keys must use a stable naming convention.

## Implementation Notes

The first implementation should support document-backed evidence, manual
classification, verification state, confidence, and links to Dependents review
fields.
