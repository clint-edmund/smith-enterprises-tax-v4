# Release 0.10 — Sprint 0.10.1B
## Evidence Registry Frontend and Dependents Integration

### User-visible changes

Dependents Review now contains an Evidence Workspace where staff can:

- Register manual evidence
- Select an evidence type
- Assign confidence
- Link evidence to a dependent field
- Verify evidence
- Place evidence under review
- Request replacement evidence
- Reject evidence
- View staff attribution and timestamps

### Technical changes

- Added shared Evidence types.
- Added Evidence service and hook.
- Added reusable EvidencePanel.
- Integrated EvidencePanel into Dependents Review.

### Database changes

Uses the Evidence Registry RPCs deployed in Sprint 0.10.1A.

### Known limitation

Existing uploaded files cannot yet be selected from the panel. The project’s
current document table and storage contract must be confirmed before adding the
document picker and foreign key.
