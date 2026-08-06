# Release 0.10 — Sprint 0.10.3B
## Guided Document Analysis and Evidence Coverage

### User-visible changes

- Added rule-based document classification suggestions.
- Added recommended dependent fields with explanations.
- Added Apply Suggestions in the Document Review Workspace.
- Added Evidence Coverage to each dependent.
- Coverage distinguishes:
  - Verified evidence
  - Linked but unverified evidence
  - Missing supporting evidence

### Important boundary

This release does not perform OCR or AI extraction. Suggestions are based only
on existing filename, category, description, and MIME metadata. Staff must
review and approve every suggestion.

### Deferred

- OCR extraction
- AI document classification
- Missing-information task creation
- Client follow-up messages
