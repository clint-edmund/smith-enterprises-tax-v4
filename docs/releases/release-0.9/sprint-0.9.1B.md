# Release 0.9 — Sprint 0.9.1B
## Review Status Header

### User-visible changes

Dependents Review now includes a reusable Review Workspace status header showing:

- Current review status
- Review health
- Priority
- Assigned reviewer
- Review started
- Last updated
- Last action
- Workflow stage
- Checklist readiness
- Risk level

### Technical changes

- Added reusable `ReviewStatusHeader`.
- Added a Dependents-specific metadata adapter.
- Integrated the shared metadata model into `DependentReviewCard`.
- Preserved the existing compact card badge and Review Timeline.

### Database changes

None.

### Known limitations

- Checklist values remain at zero until Sprint 0.9.2.
- Reviewer assignment currently derives from the reviewer who completed the
  most recent persisted review action.
- Review-start time uses the best timestamp available from the current review
  record.

### Verification

- Run `npm run build`.
- Open Organizer Review > Dependents.
- Confirm the status header appears on every dependent card.
- Confirm Timeline notes continue to work.
- Confirm status, health, and priority match the dependent's current state.
