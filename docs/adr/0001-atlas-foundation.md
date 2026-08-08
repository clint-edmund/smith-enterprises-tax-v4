# ADR-0001

## Title

Atlas Foundation

## Status

Accepted

## Context

Atlas evolved from a sequence of iterative database migrations.

As the project matured, schema drift and historical migration dependencies made local database reconstruction difficult.

## Decision

The project establishes an Atlas Foundation baseline derived from the production schema.

Future development begins from this baseline instead of replaying the complete historical migration chain.

Historical migrations are preserved for reference and auditing.

## Consequences

Benefits:

- Faster local setup
- Reliable database rebuilds
- Easier onboarding
- Reduced migration drift
- Improved long-term maintainability