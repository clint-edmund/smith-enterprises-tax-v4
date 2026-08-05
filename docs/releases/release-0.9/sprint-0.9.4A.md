# Release 0.9 — Sprint 0.9.4A
## Dependents Quick Actions

### User-visible changes

Dependents Review now includes reusable Quick Actions for:

- Mark Reviewed
- Needs Follow-up
- Return to Client

Every action requires an explanation and produces a timeline event.

### Technical changes

- Added shared action types.
- Added workflow-event service.
- Added reusable QuickActionButton.
- Added reusable QuickActionsToolbar.
- Added reusable ReviewActionDialog.
- Integrated actions with the existing dependent review hook and RPCs.
- Timeline remounts after each successful action to display the new event.

### Database changes

Uses the previously deployed `add_organizer_review_workflow_event` RPC.

### Known limitation

The review status update and timeline event are currently two consecutive RPC
calls. A future database refinement may combine them into one transaction per
module action.

### Verification

Test all three actions and confirm status, reviewer, timestamp, metadata header,
and timeline update correctly.
