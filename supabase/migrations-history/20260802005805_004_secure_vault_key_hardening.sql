-- ==========================================================
-- Smith Enterprises Tax Management
-- Secure Vault Key Version Hardening
-- Version 1.0
-- ==========================================================

begin;

-- ==========================================================
-- Add Lifecycle Metadata
-- ==========================================================

alter table public.vault_key_versions
add column if not exists updated_at timestamptz
  not null
  default now();

alter table public.vault_key_versions
add column if not exists activated_at timestamptz;

alter table public.vault_key_versions
add column if not exists description text;

-- ==========================================================
-- Constraints
-- ==========================================================

alter table public.vault_key_versions
drop constraint if exists
  vault_key_versions_key_version_positive;

alter table public.vault_key_versions
add constraint
  vault_key_versions_key_version_positive
check (
  key_version > 0
);

alter table public.vault_key_versions
drop constraint if exists
  vault_key_versions_algorithm_check;

alter table public.vault_key_versions
add constraint
  vault_key_versions_algorithm_check
check (
  algorithm in (
    'AES-256-GCM'
  )
);

alter table public.vault_key_versions
drop constraint if exists
  vault_key_versions_retirement_check;

alter table public.vault_key_versions
add constraint
  vault_key_versions_retirement_check
check (
  retired_at is null
  or retired_at >= created_at
);

alter table public.vault_key_versions
drop constraint if exists
  vault_key_versions_active_retirement_check;

alter table public.vault_key_versions
add constraint
  vault_key_versions_active_retirement_check
check (
  not active
  or retired_at is null
);

alter table public.vault_key_versions
drop constraint if exists
  vault_key_versions_description_length;

alter table public.vault_key_versions
add constraint
  vault_key_versions_description_length
check (
  description is null
  or length(description) <= 1000
);

-- ==========================================================
-- Normalize Existing Seed Record
-- ==========================================================

update public.vault_key_versions
set
  activated_at =
    coalesce(
      activated_at,
      created_at
    ),

  description =
    coalesce(
      description,
      'Initial Smith Enterprises Secure Vault encryption key version.'
    ),

  updated_at =
    now()
where active = true;

-- ==========================================================
-- Single Active Key Enforcement
-- ==========================================================

create unique index if not exists
  vault_key_versions_single_active_key
on public.vault_key_versions (
  active
)
where active = true;

-- ==========================================================
-- Supporting Indexes
-- ==========================================================

create index if not exists
  vault_key_versions_created_at_index
on public.vault_key_versions (
  created_at desc
);

create index if not exists
  vault_key_versions_retired_at_index
on public.vault_key_versions (
  retired_at
)
where retired_at is not null;

-- ==========================================================
-- Automatic updated_at Handling
-- ==========================================================

drop trigger if exists
  vault_key_versions_updated_at
on public.vault_key_versions;

create trigger
  vault_key_versions_updated_at
before update
on public.vault_key_versions
for each row
execute function
  public.update_updated_at_column();

-- ==========================================================
-- Documentation
-- ==========================================================

comment on table public.vault_key_versions is
'Tracks encryption-key metadata and lifecycle versions used by the Smith Enterprises Secure Vault. Actual encryption keys are never stored in this table.';

comment on column public.vault_key_versions.key_version is
'Monotonically increasing version number referenced by encrypted vault records.';

comment on column public.vault_key_versions.algorithm is
'Approved encryption algorithm associated with this key version.';

comment on column public.vault_key_versions.active is
'Indicates the single key version currently used for new encryption operations.';

comment on column public.vault_key_versions.activated_at is
'Timestamp when this key version became active for new encryption operations.';

comment on column public.vault_key_versions.retired_at is
'Timestamp when this key version was retired from new encryption operations. Existing records may still reference it until re-encrypted.';

comment on column public.vault_key_versions.description is
'Non-sensitive operational description of the key version.';

comment on column public.vault_key_versions.updated_at is
'Timestamp of the latest metadata update.';

-- ==========================================================
-- Row Level Security
-- ==========================================================

alter table
  public.vault_key_versions
enable row level security;

-- Browser clients must never query or modify key-management
-- metadata directly. Edge Functions will read this table using
-- the service role after authorization checks.

revoke all
on table public.vault_key_versions
from anon;

revoke all
on table public.vault_key_versions
from authenticated;

commit;