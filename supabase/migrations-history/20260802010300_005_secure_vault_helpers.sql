-- ==========================================================
-- Smith Enterprises Tax Management
-- Secure Vault Database Helpers
-- Version 1.0
-- ==========================================================

begin;

-- ==========================================================
-- Retrieve Active Vault Key Metadata
-- ==========================================================

create or replace function
public.get_active_vault_key_version()
returns table (
  key_version integer,
  algorithm text,
  activated_at timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  return query
  select
    vault_key.key_version,
    vault_key.algorithm,
    vault_key.activated_at
  from public.vault_key_versions
    as vault_key
  where vault_key.active = true
    and vault_key.retired_at is null
  order by
    vault_key.key_version desc
  limit 1;

  if not found then
    raise exception
      'No active Secure Vault encryption key version is configured.';
  end if;
end;
$function$;

comment on function
public.get_active_vault_key_version()
is
'Returns non-sensitive metadata for the single active Secure Vault encryption-key version. Actual encryption keys are never stored or returned by this function.';

-- ==========================================================
-- Append Vault Audit Event
-- ==========================================================

create or replace function
public.write_vault_audit_event(
  requested_vault_secret_id uuid,
  requested_client_id uuid,
  requested_organizer_id uuid,
  requested_secret_type text,
  requested_actor_user_id uuid,
  requested_action text,
  requested_outcome text,
  requested_reason text,
  requested_source text,
  requested_request_id uuid,
  requested_session_id text,
  requested_ip_address inet,
  requested_user_agent text,
  requested_metadata jsonb
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  audit_event_id uuid;
  normalized_metadata jsonb;
begin
  if requested_action is null
    or length(
      trim(requested_action)
    ) = 0
  then
    raise exception
      'A vault audit action is required.';
  end if;

  if requested_outcome is null
    or length(
      trim(requested_outcome)
    ) = 0
  then
    raise exception
      'A vault audit outcome is required.';
  end if;

  if requested_source is null
    or length(
      trim(requested_source)
    ) = 0
  then
    raise exception
      'A vault audit source is required.';
  end if;

  normalized_metadata :=
    coalesce(
      requested_metadata,
      '{}'::jsonb
    );

  if jsonb_typeof(
    normalized_metadata
  ) <> 'object'
  then
    raise exception
      'Vault audit metadata must be a JSON object.';
  end if;

  insert into public.vault_audit_log (
    vault_secret_id,
    client_id,
    organizer_id,
    secret_type,
    actor_user_id,
    action,
    outcome,
    reason,
    source,
    request_id,
    session_id,
    ip_address,
    user_agent,
    metadata
  )
  values (
    requested_vault_secret_id,
    requested_client_id,
    requested_organizer_id,

    nullif(
      trim(
        requested_secret_type
      ),
      ''
    ),

    requested_actor_user_id,

    lower(
      trim(
        requested_action
      )
    ),

    lower(
      trim(
        requested_outcome
      )
    ),

    nullif(
      trim(
        requested_reason
      ),
      ''
    ),

    lower(
      trim(
        requested_source
      )
    ),

    requested_request_id,

    nullif(
      trim(
        requested_session_id
      ),
      ''
    ),

    requested_ip_address,

    nullif(
      trim(
        requested_user_agent
      ),
      ''
    ),

    normalized_metadata
  )
  returning id
  into audit_event_id;

  return audit_event_id;
end;
$function$;

comment on function
public.write_vault_audit_event(
  uuid,
  uuid,
  uuid,
  text,
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  text,
  inet,
  text,
  jsonb
)
is
'Appends a non-sensitive Secure Vault audit event. Plaintext secrets must never be supplied in the reason, user-agent, session, or metadata arguments.';

-- ==========================================================
-- Permissions
-- ==========================================================

revoke all
on function
public.get_active_vault_key_version()
from public;

revoke all
on function
public.get_active_vault_key_version()
from anon;

revoke all
on function
public.get_active_vault_key_version()
from authenticated;

grant execute
on function
public.get_active_vault_key_version()
to service_role;

revoke all
on function
public.write_vault_audit_event(
  uuid,
  uuid,
  uuid,
  text,
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  text,
  inet,
  text,
  jsonb
)
from public;

revoke all
on function
public.write_vault_audit_event(
  uuid,
  uuid,
  uuid,
  text,
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  text,
  inet,
  text,
  jsonb
)
from anon;

revoke all
on function
public.write_vault_audit_event(
  uuid,
  uuid,
  uuid,
  text,
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  text,
  inet,
  text,
  jsonb
)
from authenticated;

grant execute
on function
public.write_vault_audit_event(
  uuid,
  uuid,
  uuid,
  text,
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  text,
  inet,
  text,
  jsonb
)
to service_role;

commit;