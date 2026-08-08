-- ==========================================================
-- Smith Enterprises Tax Management
-- Secure Vault Audit Log
-- Version 1.0
-- ==========================================================

begin;

-- ==========================================================
-- Vault Audit Log
-- ==========================================================

create table if not exists public.vault_audit_log (
  id uuid
    primary key
    default gen_random_uuid(),

  vault_secret_id uuid
    references public.vault_secrets(id)
    on delete set null,

  client_id uuid
    references public.clients(id)
    on delete set null,

  organizer_id uuid
    references public.client_tax_organizers(id)
    on delete set null,

  secret_type text,

  actor_user_id uuid
    references auth.users(id)
    on delete set null,

  action text
    not null,

  outcome text
    not null
    default 'success',

  reason text,

  source text
    not null
    default 'edge_function',

  request_id uuid,

  session_id text,

  ip_address inet,

  user_agent text,

  metadata jsonb
    not null
    default '{}'::jsonb,

  created_at timestamptz
    not null
    default now(),

  constraint vault_audit_log_action_check
    check (
      action in (
        'create',
        'replace',
        'view_masked',
        'view_full',
        'verify',
        'reject',
        'archive',
        'access_denied',
        'decrypt_failed',
        'encrypt_failed'
      )
    ),

  constraint vault_audit_log_outcome_check
    check (
      outcome in (
        'success',
        'failure',
        'denied'
      )
    ),

  constraint vault_audit_log_source_check
    check (
      source in (
        'client_portal',
        'staff_portal',
        'admin_portal',
        'edge_function',
        'system',
        'migration'
      )
    ),

  constraint vault_audit_log_secret_type_check
    check (
      secret_type is null
      or secret_type in (
        'social_security_number',
        'itin',
        'drivers_license',
        'passport',
        'state_identification',
        'routing_number',
        'bank_account_number',
        'identity_protection_pin',
        'employer_identification_number'
      )
    ),

  constraint vault_audit_log_reason_length
    check (
      reason is null
      or length(reason) <= 1000
    ),

  constraint vault_audit_log_session_length
    check (
      session_id is null
      or length(session_id) <= 512
    ),

  constraint vault_audit_log_user_agent_length
    check (
      user_agent is null
      or length(user_agent) <= 2000
    ),

  constraint vault_audit_log_metadata_object
    check (
      jsonb_typeof(metadata) = 'object'
    )
);

-- ==========================================================
-- Documentation
-- ==========================================================

comment on table public.vault_audit_log is
'Append-only audit history for Secure Vault operations. Audit records must never contain plaintext secret values.';

comment on column public.vault_audit_log.vault_secret_id is
'Vault record associated with the event. This may be null for denied or failed requests that did not resolve a record.';

comment on column public.vault_audit_log.actor_user_id is
'Authenticated user responsible for the vault operation.';

comment on column public.vault_audit_log.action is
'Security-sensitive action attempted or completed.';

comment on column public.vault_audit_log.outcome is
'Result of the audited action: success, failure, or denied.';

comment on column public.vault_audit_log.reason is
'Business justification supplied for sensitive access when required.';

comment on column public.vault_audit_log.request_id is
'Correlation identifier used to trace the operation across services.';

comment on column public.vault_audit_log.metadata is
'Non-sensitive structured operational metadata. Plaintext secrets are prohibited.';

-- ==========================================================
-- Indexes
-- ==========================================================

create index if not exists
  vault_audit_log_secret_id_index
on public.vault_audit_log (
  vault_secret_id
);

create index if not exists
  vault_audit_log_client_id_index
on public.vault_audit_log (
  client_id
);

create index if not exists
  vault_audit_log_organizer_id_index
on public.vault_audit_log (
  organizer_id
);

create index if not exists
  vault_audit_log_actor_user_id_index
on public.vault_audit_log (
  actor_user_id
);

create index if not exists
  vault_audit_log_action_index
on public.vault_audit_log (
  action
);

create index if not exists
  vault_audit_log_created_at_index
on public.vault_audit_log (
  created_at desc
);

create index if not exists
  vault_audit_log_client_created_at_index
on public.vault_audit_log (
  client_id,
  created_at desc
);

create index if not exists
  vault_audit_log_request_id_index
on public.vault_audit_log (
  request_id
)
where request_id is not null;

-- ==========================================================
-- Append-Only Protection
-- ==========================================================

create or replace function public.prevent_vault_audit_log_changes()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  raise exception
    'Vault audit records are append-only and cannot be updated or deleted.';
end;
$function$;

drop trigger if exists
  vault_audit_log_prevent_update
on public.vault_audit_log;

create trigger
  vault_audit_log_prevent_update
before update
on public.vault_audit_log
for each row
execute function
  public.prevent_vault_audit_log_changes();

drop trigger if exists
  vault_audit_log_prevent_delete
on public.vault_audit_log;

create trigger
  vault_audit_log_prevent_delete
before delete
on public.vault_audit_log
for each row
execute function
  public.prevent_vault_audit_log_changes();

-- ==========================================================
-- Row Level Security
-- ==========================================================

alter table
  public.vault_audit_log
enable row level security;

-- No browser-facing policies are created intentionally.
-- Edge Functions will write audit events with the service role.
-- Staff audit review will later use a dedicated secured RPC or
-- Edge Function that enforces role-based authorization.

revoke all
on table public.vault_audit_log
from anon;

revoke all
on table public.vault_audit_log
from authenticated;

commit;