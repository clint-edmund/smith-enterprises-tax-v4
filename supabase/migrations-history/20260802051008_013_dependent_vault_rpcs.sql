-- ==========================================================
-- Smith Enterprises Tax Management
-- Dependent-Aware Secure Vault RPCs
-- ==========================================================

begin;

-- ==========================================================
-- Store Vault Secret V2
-- ==========================================================

create or replace function public.store_vault_secret_v2(
  requested_client_id uuid,
  requested_organizer_id uuid,
  requested_dependent_id uuid,
  requested_secret_type text,
  requested_encrypted_value bytea,
  requested_initialization_vector bytea,
  requested_authentication_tag bytea,
  requested_key_version integer,
  requested_masked_value text,
  requested_actor_user_id uuid
)
returns table (
  vault_secret_id uuid,
  masked_value text,
  key_version integer,
  status text,
  updated_at timestamptz,
  replaced_existing_secret boolean
)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  current_saved_at timestamptz;
  existing_secret_id uuid;
  new_secret_id uuid;
  replaced_existing boolean;
begin
  if requested_client_id is null then
    raise exception
      'A client identifier is required.';
  end if;

  if requested_secret_type is null
    or length(
      trim(
        requested_secret_type
      )
    ) = 0
  then
    raise exception
      'A vault secret type is required.';
  end if;

  if requested_encrypted_value is null
    or octet_length(
      requested_encrypted_value
    ) = 0
  then
    raise exception
      'An encrypted value is required.';
  end if;

  if requested_initialization_vector is null
    or octet_length(
      requested_initialization_vector
    ) = 0
  then
    raise exception
      'An initialization vector is required.';
  end if;

  if requested_authentication_tag is null
    or octet_length(
      requested_authentication_tag
    ) = 0
  then
    raise exception
      'An authentication tag is required.';
  end if;

  if requested_key_version is null then
    raise exception
      'A vault key version is required.';
  end if;

  if requested_masked_value is null
    or length(
      trim(
        requested_masked_value
      )
    ) = 0
  then
    raise exception
      'A masked value is required.';
  end if;

  if not exists (
    select 1
    from public.clients
      as client_record
    where client_record.id =
      requested_client_id
  ) then
    raise exception
      'The requested client was not found.';
  end if;

  if requested_organizer_id is not null
    and not exists (
      select 1
      from public.client_tax_organizers
        as organizer_record
      where organizer_record.id =
          requested_organizer_id
        and organizer_record.client_id =
          requested_client_id
    )
  then
    raise exception
      'The requested organizer does not belong to the client.';
  end if;

  if requested_dependent_id is not null
    and not exists (
      select 1
      from public.client_tax_organizer_dependents
        as dependent_record
      join public.client_tax_organizers
        as organizer_record
        on organizer_record.id =
          dependent_record.organizer_id
      where dependent_record.id =
          requested_dependent_id
        and dependent_record.organizer_id =
          requested_organizer_id
        and organizer_record.client_id =
          requested_client_id
    )
  then
    raise exception
      'The requested dependent does not belong to the organizer.';
  end if;

  if requested_secret_type =
      'dependent_social_security_number'
    and requested_dependent_id is null
  then
    raise exception
      'A dependent identifier is required for a dependent Social Security number.';
  end if;

  if requested_dependent_id is not null
    and requested_secret_type <>
      'dependent_social_security_number'
  then
    raise exception
      'The requested secret type is not supported for a dependent.';
  end if;

  if not exists (
    select 1
    from public.vault_key_versions
      as key_record
    where key_record.key_version =
        requested_key_version
      and key_record.active = true
      and key_record.retired_at is null
  ) then
    raise exception
      'The requested vault key version is not active.';
  end if;

  current_saved_at :=
    now();

  select
    secret_record.id
  into
    existing_secret_id
  from public.vault_secrets
    as secret_record
  where secret_record.client_id =
      requested_client_id
    and secret_record.organizer_id
      is not distinct from
      requested_organizer_id
    and secret_record.dependent_id
      is not distinct from
      requested_dependent_id
    and secret_record.secret_type =
      requested_secret_type
    and secret_record.archived_at
      is null
  for update;

  replaced_existing :=
    existing_secret_id is not null;

  if replaced_existing then
    update public.vault_secrets
    set
      status =
        'replaced',

      archived_at =
        current_saved_at,

      archived_by =
        requested_actor_user_id,

      archive_reason =
        'Replaced by a newer encrypted value.',

      updated_by =
        requested_actor_user_id,

      updated_at =
        current_saved_at
    where id =
      existing_secret_id;
  end if;

  insert into public.vault_secrets (
    client_id,
    organizer_id,
    dependent_id,
    secret_type,
    encrypted_value,
    initialization_vector,
    authentication_tag,
    key_version,
    masked_value,
    status,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  values (
    requested_client_id,
    requested_organizer_id,
    requested_dependent_id,
    trim(
      requested_secret_type
    ),
    requested_encrypted_value,
    requested_initialization_vector,
    requested_authentication_tag,
    requested_key_version,
    trim(
      requested_masked_value
    ),
    'pending_verification',
    requested_actor_user_id,
    requested_actor_user_id,
    current_saved_at,
    current_saved_at
  )
  returning id
  into new_secret_id;

  return query
  select
    new_secret_id,
    trim(
      requested_masked_value
    ),
    requested_key_version,
    'pending_verification'::text,
    current_saved_at,
    replaced_existing;
end;
$function$;

comment on function public.store_vault_secret_v2(
  uuid,
  uuid,
  uuid,
  text,
  bytea,
  bytea,
  bytea,
  integer,
  text,
  uuid
)
is
'Atomically stores or replaces an encrypted client-, organizer-, or dependent-level Secure Vault secret. Plaintext must never be passed to this function.';

-- ==========================================================
-- Write Vault Audit Event V2
-- ==========================================================

create or replace function public.write_vault_audit_event_v2(
  requested_vault_secret_id uuid,
  requested_client_id uuid,
  requested_organizer_id uuid,
  requested_dependent_id uuid,
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
      trim(
        requested_action
      )
    ) = 0
  then
    raise exception
      'A vault audit action is required.';
  end if;

  if requested_outcome is null
    or length(
      trim(
        requested_outcome
      )
    ) = 0
  then
    raise exception
      'A vault audit outcome is required.';
  end if;

  if requested_source is null
    or length(
      trim(
        requested_source
      )
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
    dependent_id,
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
    requested_dependent_id,

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

comment on function public.write_vault_audit_event_v2(
  uuid,
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
'Appends a non-sensitive Secure Vault audit event with optional dependent ownership. Plaintext secrets are prohibited in every argument.';

-- ==========================================================
-- Permissions
-- ==========================================================

revoke all
on function public.store_vault_secret_v2(
  uuid,
  uuid,
  uuid,
  text,
  bytea,
  bytea,
  bytea,
  integer,
  text,
  uuid
)
from public;

revoke all
on function public.store_vault_secret_v2(
  uuid,
  uuid,
  uuid,
  text,
  bytea,
  bytea,
  bytea,
  integer,
  text,
  uuid
)
from anon;

revoke all
on function public.store_vault_secret_v2(
  uuid,
  uuid,
  uuid,
  text,
  bytea,
  bytea,
  bytea,
  integer,
  text,
  uuid
)
from authenticated;

grant execute
on function public.store_vault_secret_v2(
  uuid,
  uuid,
  uuid,
  text,
  bytea,
  bytea,
  bytea,
  integer,
  text,
  uuid
)
to service_role;


revoke all
on function public.write_vault_audit_event_v2(
  uuid,
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
on function public.write_vault_audit_event_v2(
  uuid,
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
on function public.write_vault_audit_event_v2(
  uuid,
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
on function public.write_vault_audit_event_v2(
  uuid,
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