-- ==========================================================
-- Smith Enterprises Tax Management
-- Extend Secure Vault for Dependents
-- ==========================================================

begin;

-- ==========================================================
-- Add Dependent Ownership to Vault Secrets
-- ==========================================================

alter table public.vault_secrets
add column if not exists dependent_id uuid;

alter table public.vault_secrets
drop constraint if exists
  vault_secrets_dependent_id_fkey;

alter table public.vault_secrets
add constraint
  vault_secrets_dependent_id_fkey
foreign key (
  dependent_id
)
references
  public.client_tax_organizer_dependents(id)
on delete cascade;

comment on column
  public.vault_secrets.dependent_id
is
'Optional dependent associated with the protected value. Dependent identifiers such as SSNs must reference this column.';

-- A dependent belongs to an organizer, so dependent-level
-- vault records must also include organizer_id.

alter table public.vault_secrets
drop constraint if exists
  vault_secrets_dependent_requires_organizer;

alter table public.vault_secrets
add constraint
  vault_secrets_dependent_requires_organizer
check (
  dependent_id is null
  or organizer_id is not null
);

-- ==========================================================
-- Expand Supported Secret Types
-- ==========================================================

alter table public.vault_secrets
drop constraint if exists
  vault_secrets_secret_type_check;

alter table public.vault_secrets
add constraint
  vault_secrets_secret_type_check
check (
  secret_type in (
    'social_security_number',
    'dependent_social_security_number',
    'itin',
    'drivers_license',
    'passport',
    'state_identification',
    'routing_number',
    'bank_account_number',
    'identity_protection_pin',
    'employer_identification_number'
  )
);

-- A dependent SSN must always identify the dependent that owns it.

alter table public.vault_secrets
drop constraint if exists
  vault_secrets_dependent_ssn_owner_check;

alter table public.vault_secrets
add constraint
  vault_secrets_dependent_ssn_owner_check
check (
  secret_type <>
    'dependent_social_security_number'
  or dependent_id is not null
);

-- ==========================================================
-- Replace Active-Secret Uniqueness Rule
-- ==========================================================

drop index if exists
  public.vault_secrets_unique_active_secret;

create unique index
  vault_secrets_unique_active_secret
on public.vault_secrets (
  client_id,

  coalesce(
    organizer_id,
    '00000000-0000-0000-0000-000000000000'
      ::uuid
  ),

  coalesce(
    dependent_id,
    '00000000-0000-0000-0000-000000000000'
      ::uuid
  ),

  secret_type
)
where archived_at is null;

-- ==========================================================
-- Supporting Indexes
-- ==========================================================

create index if not exists
  vault_secrets_dependent_id_index
on public.vault_secrets (
  dependent_id
)
where dependent_id is not null;

create index if not exists
  vault_secrets_dependent_active_lookup_index
on public.vault_secrets (
  client_id,
  organizer_id,
  dependent_id,
  secret_type
)
where
  dependent_id is not null
  and archived_at is null;

-- ==========================================================
-- Extend the Audit Table
-- ==========================================================

alter table public.vault_audit_log
add column if not exists dependent_id uuid;

alter table public.vault_audit_log
drop constraint if exists
  vault_audit_log_dependent_id_fkey;

alter table public.vault_audit_log
add constraint
  vault_audit_log_dependent_id_fkey
foreign key (
  dependent_id
)
references
  public.client_tax_organizer_dependents(id)
on delete set null;

comment on column
  public.vault_audit_log.dependent_id
is
'Optional dependent associated with the audited Secure Vault operation.';

create index if not exists
  vault_audit_log_dependent_id_index
on public.vault_audit_log (
  dependent_id
)
where dependent_id is not null;

-- Expand the audit-log secret-type constraint.

alter table public.vault_audit_log
drop constraint if exists
  vault_audit_log_secret_type_check;

alter table public.vault_audit_log
add constraint
  vault_audit_log_secret_type_check
check (
  secret_type is null
  or secret_type in (
    'social_security_number',
    'dependent_social_security_number',
    'itin',
    'drivers_license',
    'passport',
    'state_identification',
    'routing_number',
    'bank_account_number',
    'identity_protection_pin',
    'employer_identification_number'
  )
);

commit;