# Release 0.9 — Sprint 0.9.4B
## Review Workspace Stabilization

### User-visible changes

- Review action success and error messages now use a shared notice component.
- Notices can be dismissed.
- Action dialogs restore keyboard focus after closing.

### Technical changes

- Added reusable `ReviewNotice`.
- Added reusable `useReviewActionRunner`.
- Moved action orchestration out of `DependentReviewCard`.
- Standardized loading, success, error, and timeline-refresh behavior.
- Improved dialog focus handling.

### Database changes

None.

### Behavior preserved

- Mark Reviewed
- Needs Follow-up
- Return to Client
- Required explanations
- Status refresh
- Timeline event creation
