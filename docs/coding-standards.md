# Smith Enterprises Coding Standards

## Layering

```text
Database → RPC → Service → Hook → Component → Workspace
```

Components must not call Supabase directly or contain reusable business rules.

## TypeScript

- Keep strict typing enabled.
- Avoid `any`.
- Use union types for controlled states.
- Normalize remote data before exposing it to components.
- Use explicit return types for exported functions.

## Components

Components render typed data, provide accessible controls, and handle visual
loading and error states.

## Services

Services own data access, normalization, and application-facing errors.

## Hooks

Hooks coordinate service calls and UI state.

## Database changes

Every migration must consider constraints, indexes, RLS, permissions, audit
logging, verification SQL, and rollback implications.

## Security

Never expose staff-only notes to clients. Never impersonate a client for
staff-assisted entry. Preserve actor and timestamp attribution.

## Definition of Done

- `npm run build` succeeds.
- No new TypeScript errors exist.
- Existing behavior is regression-tested.
- Security is verified where applicable.
- Documentation is updated.
- Changes are committed to `develop`.
