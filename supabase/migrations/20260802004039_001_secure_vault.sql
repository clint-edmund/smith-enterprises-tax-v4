-- ==========================================================
-- Smith Enterprises Tax Management
-- Secure Vault
-- Version 1.0
-- ==========================================================

begin;

-- ==========================================================
-- Extensions
-- ==========================================================

create extension if not exists pgcrypto;

-- ==========================================================
-- Vault Key Versions
-- ==========================================================

create table if not exists vault_key_versions (

    id uuid
        primary key
        default gen_random_uuid(),

    key_version integer
        not null
        unique,

    algorithm text
        not null,

    active boolean
        not null
        default false,

    created_at timestamptz
        not null
        default now(),

    retired_at timestamptz
);

comment on table vault_key_versions is
'Tracks encryption key versions used by the Secure Vault.';

insert into vault_key_versions
(
    key_version,
    algorithm,
    active
)
values
(
    1,
    'AES-256-GCM',
    true
)
on conflict
(key_version)
do nothing;

commit;