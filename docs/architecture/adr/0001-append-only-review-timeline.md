# ADR-0001: Append-Only Organizer Review Timelines

**Status:** Accepted  
**Date:** 2026-08-05

## Context
A single editable staff-notes field loses prior context and attribution.

## Decision
Store staff notes and significant review actions as append-only timeline
entries. Current-state tables remain responsible for fast status lookup.

## Consequences
Historical context, actor, and timestamps are preserved. Corrections require a
new entry rather than silent editing. Timeline storage grows continuously.
