-- ==========================================================
-- Smith Enterprises Tax Management
-- Secure Vault Secrets
-- Version 1.0
-- ==========================================================

begin;

-- ==========================================================
-- Core Vault Secrets Table
-- ==========================================================

create table if not exists public.vault_secrets (
  id uuid
    primary key
    default gen_random_uuid(),

  client_id uuid
    not null
    references public.clients(id)
    on delete restrict,

  organizer_id uuid
    references public.client_tax_organizers(id)
    on delete cascade,

  secret_type text
    not null,

  encrypted_value bytea
    not null,

  initialization_vector bytea
    not null,

  authentication_tag bytea
    not null,

  key_version integer
    not null
    references public.vault_key_versions(key_version)
    on update restrict
    on delete restrict,

  masked_value text
    not null,

  status text
    not null
    default 'collected',

  verified_by uuid
    references auth.users(id)
    on delete set null,

  verified_at timestamptz,

  created_by uuid
    references auth.users(id)
    on delete set null,

  updated_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  archived_at timestamptz,

  archived_by uuid
    references auth.users(id)
    on delete set null,

  archive_reason text,

  constraint vault_secrets_secret_type_check
    check (
      secret_type in (
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

  constraint vault_secrets_status_check
    check (
      status in (
        'collected',
        'pending_verification',
        'verified',
        'rejected',
        'replaced',
        'archived'
      )
    ),

  constraint vault_secrets_masked_value_not_blank
    check (
      length(
        trim(masked_value)
      ) > 0
    ),

  constraint vault_secrets_masked_value_length
    check (
      length(masked_value) <= 128
    ),

  constraint vault_secrets_encrypted_value_not_empty
    check (
      octet_length(
        encrypted_value
      ) > 0
    ),

  constraint vault_secrets_initialization_vector_not_empty
    check (
      octet_length(
        initialization_vector
      ) > 0
    ),

  constraint vault_secrets_authentication_tag_not_empty
    check (
      octet_length(
        authentication_tag
      ) > 0
    ),

  constraint vault_secrets_verified_fields_check
    check (
      (
        status = 'verified'
        and verified_by is not null
        and verified_at is not null
      )
      or
      (
        status <> 'verified'
      )
    ),

  constraint vault_secrets_archive_fields_check
    check (
      (
        archived_at is null
        and archived_by is null
        and archive_reason is null
      )
      or
      (
        archived_at is not null
        and archive_reason is not null
        and length(
          trim(archive_reason)
        ) > 0
      )
    ),

  constraint vault_secrets_archived_status_check
    check (
      archived_at is null
      or status in (
        'replaced',
        'archived'
      )
    )
);

-- ==========================================================
-- Documentation
-- ==========================================================

comment on table public.vault_secrets is
'Stores encrypted sensitive client and organizer information. Plaintext secret values must never be stored in this table.';

comment on column public.vault_secrets.client_id is
'Client who owns the encrypted secret.';

comment on column public.vault_secrets.organizer_id is
'Optional tax organizer associated with the secret.';

comment on column public.vault_secrets.secret_type is
'Classification of the protected value, such as social_security_number or bank_account_number.';

comment on column public.vault_secrets.encrypted_value is
'AES-256-GCM encrypted ciphertext. This column must never contain plaintext.';

comment on column public.vault_secrets.initialization_vector is
'Random initialization vector used for AES-GCM encryption.';

comment on column public.vault_secrets.authentication_tag is
'Authentication tag used to verify ciphertext integrity during decryption.';

comment on column public.vault_secrets.key_version is
'Encryption key version used to protect this record.';

comment on column public.vault_secrets.masked_value is
'Non-sensitive masked representation suitable for ordinary display, such as ***-**-6789.';

comment on column public.vault_secrets.status is
'Lifecycle state of the protected secret.';

comment on column public.vault_secrets.archived_at is
'Timestamp indicating that the secret is no longer active. Archived ciphertext is retained according to retention policy.';

-- ==========================================================
-- Indexes
-- ==========================================================

create index if not exists
  vault_secrets_client_id_index
on public.vault_secrets (
  client_id
);

create index if not exists
  vault_secrets_organizer_id_index
on public.vault_secrets (
  organizer_id
);

create index if not exists
  vault_secrets_secret_type_index
on public.vault_secrets (
  secret_type
);

create index if not exists
  vault_secrets_status_index
on public.vault_secrets (
  status
);

create index if not exists
  vault_secrets_key_version_index
on public.vault_secrets (
  key_version
);

create index if not exists
  vault_secrets_active_lookup_index
on public.vault_secrets (
  client_id,
  organizer_id,
  secret_type
)
where archived_at is null;

-- Only one current, non-archived secret of each type may exist
-- for a given client and organizer scope.

create unique index if not exists
  vault_secrets_unique_active_secret
on public.vault_secrets (
  client_id,
  coalesce(
    organizer_id,
    '00000000-0000-0000-0000-000000000000'
      ::uuid
  ),
  secret_type
)
where archived_at is null;

-- ==========================================================
-- Automatic updated_at Handling
-- ==========================================================

drop trigger if exists
  vault_secrets_updated_at
on public.vault_secrets;

create trigger
  vault_secrets_updated_at
before update
on public.vault_secrets
for each row
execute function
  public.update_updated_at_column();

-- ==========================================================
-- Row Level Security
-- ==========================================================

alter table
  public.vault_secrets
enable row level security;

-- No client-facing policies are created here intentionally.
-- Browser clients must not query or modify this table directly.
-- Access will occur through secured Edge Functions using the
-- service role after application-level authorization checks.

revoke all
on table public.vault_secrets
from anon;

revoke all
on table public.vault_secrets
from authenticated;

commit;