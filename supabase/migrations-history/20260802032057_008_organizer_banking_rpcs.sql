-- ==========================================================
-- Smith Enterprises Tax Management
-- Organizer Banking RPC Functions
-- ==========================================================

begin;

-- ==========================================================
-- Read Banking Information
-- ==========================================================

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
    profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as profile
  where profile.auth_user_id =
      current_user_id
    and profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizers
      as organizer
    where organizer.id =
        requested_organizer_id
      and organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  return query
  select
    requested_organizer_id,

    banking.account_holder_name,

    banking.bank_name,

    banking.account_type,

    banking.use_direct_deposit,

    banking.authorize_direct_debit,

    routing_secret.id is not null,

    routing_secret.masked_value,

    account_secret.id is not null,

    account_secret.masked_value,

    banking.created_at,

    banking.updated_at
  from (
    select
      banking_record.account_holder_name,
      banking_record.bank_name,
      banking_record.account_type,
      banking_record.use_direct_deposit,
      banking_record.authorize_direct_debit,
      banking_record.created_at,
      banking_record.updated_at
    from public.client_tax_organizer_banking_information
      as banking_record
    where banking_record.organizer_id =
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
      from public.client_tax_organizer_banking_information
        as existing_banking
      where existing_banking.organizer_id =
        requested_organizer_id
    )
  ) as banking

  left join lateral (
    select
      vault_secret.id,
      vault_secret.masked_value
    from public.vault_secrets
      as vault_secret
    where vault_secret.client_id =
        current_client_id
      and vault_secret.organizer_id =
        requested_organizer_id
      and vault_secret.secret_type =
        'routing_number'
      and vault_secret.archived_at
        is null
    order by
      vault_secret.updated_at desc
    limit 1
  ) as routing_secret
    on true

  left join lateral (
    select
      vault_secret.id,
      vault_secret.masked_value
    from public.vault_secrets
      as vault_secret
    where vault_secret.client_id =
        current_client_id
      and vault_secret.organizer_id =
        requested_organizer_id
      and vault_secret.secret_type =
        'bank_account_number'
      and vault_secret.archived_at
        is null
    order by
      vault_secret.updated_at desc
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


-- ==========================================================
-- Save Banking Information
-- ==========================================================

create or replace function
public.save_client_organizer_banking_information(
  requested_organizer_id uuid,
  requested_account_holder_name text,
  requested_bank_name text,
  requested_account_type text,
  requested_use_direct_deposit boolean,
  requested_authorize_direct_debit boolean
)
returns table (
  organizer_id uuid,
  section_status public.tax_organizer_section_status,
  section_progress_percentage integer,
  organizer_progress_percentage integer,
  saved_at timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  banking_requested boolean;
  has_routing_number boolean;
  has_account_number boolean;
  required_fields_complete boolean;

  completed_section_count integer;
  total_section_count integer;
  calculated_organizer_progress integer;

  saved_at timestamptz;
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
    profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as profile
  where profile.auth_user_id =
      current_user_id
    and profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as organizer
  where organizer.id =
      requested_organizer_id
    and organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if requested_account_type is not null
    and trim(requested_account_type) <> ''
    and trim(requested_account_type)
      not in (
        'checking',
        'savings'
      )
  then
    raise exception
      'The selected bank account type is invalid.';
  end if;

  saved_at :=
    now();

  insert into
    public.client_tax_organizer_banking_information (
      organizer_id,
      account_holder_name,
      bank_name,
      account_type,
      use_direct_deposit,
      authorize_direct_debit,
      created_at,
      updated_at
    )
  values (
    requested_organizer_id,

    nullif(
      trim(
        requested_account_holder_name
      ),
      ''
    ),

    nullif(
      trim(
        requested_bank_name
      ),
      ''
    ),

    nullif(
      trim(
        requested_account_type
      ),
      ''
    ),

    requested_use_direct_deposit,

    requested_authorize_direct_debit,

    saved_at,

    saved_at
  )
  on conflict (
    organizer_id
  )
  do update
  set
    account_holder_name =
      excluded.account_holder_name,

    bank_name =
      excluded.bank_name,

    account_type =
      excluded.account_type,

    use_direct_deposit =
      excluded.use_direct_deposit,

    authorize_direct_debit =
      excluded.authorize_direct_debit,

    updated_at =
      saved_at;

  banking_requested :=
    coalesce(
      requested_use_direct_deposit,
      false
    )
    or coalesce(
      requested_authorize_direct_debit,
      false
    );

  select exists (
    select 1
    from public.vault_secrets
      as vault_secret
    where vault_secret.client_id =
        current_client_id
      and vault_secret.organizer_id =
        requested_organizer_id
      and vault_secret.secret_type =
        'routing_number'
      and vault_secret.archived_at
        is null
  )
  into
    has_routing_number;

  select exists (
    select 1
    from public.vault_secrets
      as vault_secret
    where vault_secret.client_id =
        current_client_id
      and vault_secret.organizer_id =
        requested_organizer_id
      and vault_secret.secret_type =
        'bank_account_number'
      and vault_secret.archived_at
        is null
  )
  into
    has_account_number;

  required_fields_complete :=
    requested_use_direct_deposit
      is not null

    and requested_authorize_direct_debit
      is not null

    and (
      not banking_requested

      or (
        nullif(
          trim(
            requested_account_holder_name
          ),
          ''
        ) is not null

        and nullif(
          trim(
            requested_bank_name
          ),
          ''
        ) is not null

        and nullif(
          trim(
            requested_account_type
          ),
          ''
        ) is not null

        and has_routing_number

        and has_account_number
      )
    );

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      case
        when required_fields_complete
        then 'completed'
          ::public.tax_organizer_section_status
        else 'in_progress'
          ::public.tax_organizer_section_status
      end,

    progress_percentage =
      case
        when required_fields_complete
        then 100
        else 50
      end,

    started_at =
      coalesce(
        organizer_section.started_at,
        saved_at
      ),

    completed_at =
      case
        when required_fields_complete
        then coalesce(
          organizer_section.completed_at,
          saved_at
        )
        else null
      end,

    last_saved_at =
      saved_at,

    updated_at =
      saved_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'banking';

  select
    count(*) filter (
      where organizer_section.status =
        'completed'
    ),

    count(*)
  into
    completed_section_count,
    total_section_count
  from public.client_tax_organizer_sections
    as organizer_section
  where organizer_section.organizer_id =
    requested_organizer_id;

  calculated_organizer_progress :=
    case
      when total_section_count = 0
      then 0
      else round(
        (
          completed_section_count::numeric /
          total_section_count::numeric
        ) * 100
      )::integer
    end;

  update public.client_tax_organizers
    as organizer
  set
    status =
      case
        when organizer.status =
          'not_started'
        then 'in_progress'
          ::public.tax_organizer_status
        else organizer.status
      end,

    current_section =
      case
        when required_fields_complete
        then 'dependents'
          ::public.tax_organizer_section_key
        else 'banking'
          ::public.tax_organizer_section_key
      end,

    progress_percentage =
      calculated_organizer_progress,

    started_at =
      coalesce(
        organizer.started_at,
        saved_at
      ),

    last_saved_at =
      saved_at,

    updated_at =
      saved_at
  where organizer.id =
    requested_organizer_id;

  return query
  select
    requested_organizer_id,

    case
      when required_fields_complete
      then 'completed'
        ::public.tax_organizer_section_status
      else 'in_progress'
        ::public.tax_organizer_section_status
    end,

    case
      when required_fields_complete
      then 100
      else 50
    end,

    calculated_organizer_progress,

    saved_at;
end;
$function$;


-- ==========================================================
-- Permissions
-- ==========================================================

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


revoke all
on function
public.save_client_organizer_banking_information(
  uuid,
  text,
  text,
  text,
  boolean,
  boolean
)
from public;

revoke all
on function
public.save_client_organizer_banking_information(
  uuid,
  text,
  text,
  text,
  boolean,
  boolean
)
from anon;

grant execute
on function
public.save_client_organizer_banking_information(
  uuid,
  text,
  text,
  text,
  boolean,
  boolean
)
to authenticated;

commit;