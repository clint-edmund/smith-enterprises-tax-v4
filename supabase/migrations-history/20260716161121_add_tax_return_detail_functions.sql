-- ============================================================
-- Smith Enterprises Tax Management v4
-- Phase 8.4 tax-return detail and activity functions
-- ============================================================
-- ------------------------------------------------------------
-- Full tax-return detail
-- ------------------------------------------------------------
create or replace function public.get_tax_return_details(requested_return_id uuid) returns table (
    id uuid,
    client_id uuid,
    client_number bigint,
    client_first_name text,
    client_middle_name text,
    client_last_name text,
    client_preferred_name text,
    client_email text,
    client_phone text,
    tax_year integer,
    return_type public.return_type,
    tax_form public.tax_form_type,
    filing_status public.filing_status,
    status public.return_status,
    description text,
    assigned_preparer_id uuid,
    assigned_preparer_name text,
    assigned_preparer_email text,
    assigned_reviewer_id uuid,
    assigned_reviewer_name text,
    assigned_reviewer_email text,
    date_received date,
    due_date date,
    filed_date date,
    accepted_date date,
    federal_return_required boolean,
    state_return_required boolean,
    local_return_required boolean,
    extension_filed boolean,
    extension_date date,
    preparation_fee numeric,
    discount_amount numeric,
    net_fee numeric,
    estimated_refund numeric,
    estimated_amount_due numeric,
    notes text,
    created_at timestamptz,
    updated_at timestamptz
  ) language plpgsql stable security definer
set search_path = '' as $$ begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
return query
select tax_return.id,
  tax_return.client_id,
  client.client_number,
  client.first_name,
  client.middle_name,
  client.last_name,
  client.preferred_name,
  client.email,
  client.phone,
  tax_return.tax_year,
  tax_return.return_type,
  tax_return.tax_form,
  tax_return.filing_status,
  tax_return.status,
  tax_return.description,
  tax_return.assigned_preparer_id,
  coalesce(
    nullif(preparer.display_name, ''),
    nullif(
      concat_ws(
        ' ',
        preparer.first_name,
        preparer.last_name
      ),
      ''
    ),
    preparer.email
  ) as assigned_preparer_name,
  preparer.email as assigned_preparer_email,
  tax_return.assigned_reviewer_id,
  coalesce(
    nullif(reviewer.display_name, ''),
    nullif(
      concat_ws(
        ' ',
        reviewer.first_name,
        reviewer.last_name
      ),
      ''
    ),
    reviewer.email
  ) as assigned_reviewer_name,
  reviewer.email as assigned_reviewer_email,
  tax_return.date_received,
  tax_return.due_date,
  tax_return.filed_date,
  tax_return.accepted_date,
  tax_return.federal_return_required,
  tax_return.state_return_required,
  tax_return.local_return_required,
  tax_return.extension_filed,
  tax_return.extension_date,
  tax_return.preparation_fee,
  tax_return.discount_amount,
  (
    tax_return.preparation_fee - tax_return.discount_amount
  )::numeric as net_fee,
  tax_return.estimated_refund,
  tax_return.estimated_amount_due,
  tax_return.notes,
  tax_return.created_at,
  tax_return.updated_at
from public.tax_returns as tax_return
  join public.clients as client on client.id = tax_return.client_id
  left join public.profiles as preparer on preparer.id = tax_return.assigned_preparer_id
  left join public.profiles as reviewer on reviewer.id = tax_return.assigned_reviewer_id
where tax_return.id = requested_return_id;
end;
$$;
revoke all on function public.get_tax_return_details(uuid)
from public;
revoke all on function public.get_tax_return_details(uuid)
from anon;
grant execute on function public.get_tax_return_details(uuid) to authenticated;
-- ------------------------------------------------------------
-- Sanitized return activity
--
-- This intentionally excludes old_values, new_values, browser
-- metadata, and other administrator-only audit information.
-- ------------------------------------------------------------
create or replace function public.get_tax_return_activity(
    requested_return_id uuid,
    requested_limit integer default 25
  ) returns table (
    id bigint,
    action text,
    actor_id uuid,
    actor_name text,
    occurred_at timestamptz
  ) language plpgsql stable security definer
set search_path = '' as $$
declare safe_limit integer;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
if not exists (
  select 1
  from public.tax_returns
  where id = requested_return_id
) then raise exception 'Tax return was not found.';
end if;
safe_limit := least(
  greatest(
    coalesce(requested_limit, 25),
    1
  ),
  100
);
return query
select audit.id,
  audit.action,
  audit.actor_id,
  coalesce(
    nullif(profile.display_name, ''),
    nullif(
      concat_ws(
        ' ',
        profile.first_name,
        profile.last_name
      ),
      ''
    ),
    profile.email,
    'System'
  ) as actor_name,
  audit.created_at as occurred_at
from public.audit_logs as audit
  left join public.profiles as profile on profile.id = audit.actor_id
where audit.entity_type = 'tax_return'
  and audit.entity_id = requested_return_id
order by audit.created_at desc
limit safe_limit;
end;
$$;
revoke all on function public.get_tax_return_activity(uuid, integer)
from public;
revoke all on function public.get_tax_return_activity(uuid, integer)
from anon;
grant execute on function public.get_tax_return_activity(uuid, integer) to authenticated;
comment on function public.get_tax_return_details(uuid) is 'Returns a tax return with client and staff assignment details for active staff.';
comment on function public.get_tax_return_activity(uuid, integer) is 'Returns sanitized activity history for one tax return.';