-- ==========================================================
-- Smith Enterprises Tax Management
-- Fix Banking RPC organizer_id ambiguity
-- ==========================================================

begin;

create or replace function
public.get_client_organizer_banking_information(
  requested_organizer_id uuid
)
returns table (
  organizer_id uuid,
  account_holder_name text,
  bank_name text,
  account_type text,
  use_direct_deposit boolean,
  authorize_direct_debit boolean,
  has_routing_number boolean,
  routing_number_masked text,
  has_bank_account_number boolean,
  bank_account_number_masked text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $function$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizers
      as tax_organizer
    where tax_organizer.id =
        requested_organizer_id
      and tax_organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  return query
  select
    requested_organizer_id
      as result_organizer_id,

    banking_record.account_holder_name,

    banking_record.bank_name,

    banking_record.account_type,

    banking_record.use_direct_deposit,

    banking_record.authorize_direct_debit,

    routing_secret.id
      is not null
      as result_has_routing_number,

    routing_secret.masked_value
      as result_routing_number_masked,

    account_secret.id
      is not null
      as result_has_bank_account_number,

    account_secret.masked_value
      as result_bank_account_number_masked,

    banking_record.created_at,

    banking_record.updated_at

  from (
    select
      stored_banking.account_holder_name,
      stored_banking.bank_name,
      stored_banking.account_type,
      stored_banking.use_direct_deposit,
      stored_banking.authorize_direct_debit,
      stored_banking.created_at,
      stored_banking.updated_at

    from
      public.client_tax_organizer_banking_information
        as stored_banking

    where stored_banking.organizer_id =
      requested_organizer_id

    union all

    select
      null::text,
      null::text,
      null::text,
      null::boolean,
      null::boolean,
      null::timestamptz,
      null::timestamptz

    where not exists (
      select 1
      from
        public.client_tax_organizer_banking_information
          as existing_banking
      where existing_banking.organizer_id =
        requested_organizer_id
    )
  ) as banking_record

  left join lateral (
    select
      stored_secret.id,
      stored_secret.masked_value

    from public.vault_secrets
      as stored_secret

    where stored_secret.client_id =
        current_client_id

      and stored_secret.organizer_id =
        requested_organizer_id

      and stored_secret.secret_type =
        'routing_number'

      and stored_secret.archived_at
        is null

    order by
      stored_secret.updated_at desc

    limit 1
  ) as routing_secret
    on true

  left join lateral (
    select
      stored_secret.id,
      stored_secret.masked_value

    from public.vault_secrets
      as stored_secret

    where stored_secret.client_id =
        current_client_id

      and stored_secret.organizer_id =
        requested_organizer_id

      and stored_secret.secret_type =
        'bank_account_number'

      and stored_secret.archived_at
        is null

    order by
      stored_secret.updated_at desc

    limit 1
  ) as account_secret
    on true

  limit 1;
end;
$function$;

comment on function
public.get_client_organizer_banking_information(uuid)
is
'Returns non-sensitive organizer banking preferences and masked Secure Vault status for the authenticated client.';

revoke all
on function
public.get_client_organizer_banking_information(uuid)
from public;

revoke all
on function
public.get_client_organizer_banking_information(uuid)
from anon;

grant execute
on function
public.get_client_organizer_banking_information(uuid)
to authenticated;

commit;