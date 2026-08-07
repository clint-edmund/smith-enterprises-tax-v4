-- ==========================================================
-- Smith Enterprises Tax Management
-- Atomic Secure Vault Storage
-- Version 1.0
-- ==========================================================

begin;

create or replace function public.store_vault_secret(
  requested_client_id uuid,
  requested_organizer_id uuid,
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
  saved_at timestamptz;
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
      trim(requested_secret_type)
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
      trim(requested_masked_value)
    ) = 0
  then
    raise exception
      'A masked value is required.';
  end if;

  if not exists (
    select 1
    from public.clients as client
    where client.id =
      requested_client_id
  ) then
    raise exception
      'The requested client was not found.';
  end if;

  if requested_organizer_id is not null
    and not exists (
      select 1
      from public.client_tax_organizers
        as organizer
      where organizer.id =
          requested_organizer_id
        and organizer.client_id =
          requested_client_id
    )
  then
    raise exception
      'The requested organizer does not belong to the client.';
  end if;

  if not exists (
    select 1
    from public.vault_key_versions
      as vault_key
    where vault_key.key_version =
        requested_key_version
      and vault_key.active = true
      and vault_key.retired_at is null
  ) then
    raise exception
      'The requested vault key version is not active.';
  end if;

  saved_at :=
    now();

  -- Lock an existing current record so simultaneous requests
  -- cannot replace the same secret independently.

  select
    vault_secret.id
  into
    existing_secret_id
  from public.vault_secrets
    as vault_secret
  where vault_secret.client_id =
      requested_client_id
    and vault_secret.organizer_id
      is not distinct from
      requested_organizer_id
    and vault_secret.secret_type =
      requested_secret_type
    and vault_secret.archived_at
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
        saved_at,

      archived_by =
        requested_actor_user_id,

      archive_reason =
        'Replaced by a newer encrypted value.',

      updated_by =
        requested_actor_user_id,

      updated_at =
        saved_at
    where id =
      existing_secret_id;
  end if;

  insert into public.vault_secrets (
    client_id,
    organizer_id,
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
    saved_at,
    saved_at
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
    saved_at,
    replaced_existing;
end;
$function$;

comment on function public.store_vault_secret(
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
'Atomically archives an existing active vault secret and stores its encrypted replacement. This function accepts encrypted bytes only and must never receive plaintext secret data.';

-- ==========================================================
-- Permissions
-- ==========================================================

revoke all
on function public.store_vault_secret(
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
on function public.store_vault_secret(
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
on function public.store_vault_secret(
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
on function public.store_vault_secret(
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

commit;