-- ============================================================
-- Smith Enterprises Tax Management v4
-- Phase 8.5.1 strengthened tax-return update foundation
-- ============================================================
-- ------------------------------------------------------------
-- Determine whether a workflow transition is allowed
-- ------------------------------------------------------------
create or replace function public.is_valid_return_status_transition(
    current_status public.return_status,
    requested_status public.return_status
  ) returns boolean language sql immutable security invoker
set search_path = '' as $$
select current_status = requested_status
  or (
    current_status = 'not_started'
    and requested_status in (
      'documents_pending',
      'in_progress',
      'on_hold'
    )
  )
  or (
    current_status = 'documents_pending'
    and requested_status in (
      'not_started',
      'in_progress',
      'on_hold'
    )
  )
  or (
    current_status = 'in_progress'
    and requested_status in (
      'documents_pending',
      'ready_for_review',
      'on_hold'
    )
  )
  or (
    current_status = 'ready_for_review'
    and requested_status in (
      'in_progress',
      'under_review',
      'on_hold'
    )
  )
  or (
    current_status = 'under_review'
    and requested_status in (
      'in_progress',
      'ready_for_review',
      'ready_to_file',
      'on_hold'
    )
  )
  or (
    current_status = 'ready_to_file'
    and requested_status in (
      'under_review',
      'filed',
      'on_hold'
    )
  )
  or (
    current_status = 'filed'
    and requested_status in (
      'accepted',
      'rejected',
      'ready_to_file',
      'on_hold'
    )
  )
  or (
    current_status = 'rejected'
    and requested_status in (
      'in_progress',
      'ready_for_review',
      'ready_to_file',
      'filed',
      'on_hold'
    )
  )
  or (
    current_status = 'accepted'
    and requested_status in ('completed', 'rejected')
  )
  or (
    current_status = 'completed'
    and requested_status in (
      'accepted',
      'in_progress'
    )
  )
  or (
    current_status = 'on_hold'
    and requested_status in (
      'documents_pending',
      'in_progress',
      'ready_for_review',
      'under_review',
      'ready_to_file',
      'filed'
    )
  );
$$;
revoke all on function public.is_valid_return_status_transition(public.return_status, public.return_status)
from public;
revoke all on function public.is_valid_return_status_transition(public.return_status, public.return_status)
from anon;
grant execute on function public.is_valid_return_status_transition(public.return_status, public.return_status) to authenticated;
comment on function public.is_valid_return_status_transition(public.return_status, public.return_status) is 'Returns true when the requested tax-return workflow transition is allowed.';
-- ------------------------------------------------------------
-- Replace the existing update function
-- ------------------------------------------------------------
create or replace function public.update_tax_return_record(
    requested_return_id uuid,
    requested_client_id uuid,
    requested_tax_year integer,
    requested_return_type public.return_type,
    requested_tax_form public.tax_form_type,
    requested_filing_status public.filing_status,
    requested_status public.return_status,
    requested_assigned_preparer_id uuid default null,
    requested_assigned_reviewer_id uuid default null,
    requested_date_received date default null,
    requested_due_date date default null,
    requested_filed_date date default null,
    requested_accepted_date date default null,
    requested_preparation_fee numeric default 0,
    requested_discount_amount numeric default 0,
    requested_description text default null,
    requested_federal_return_required boolean default true,
    requested_state_return_required boolean default false,
    requested_local_return_required boolean default false,
    requested_extension_filed boolean default false,
    requested_extension_date date default null,
    requested_estimated_refund numeric default 0,
    requested_estimated_amount_due numeric default 0,
    requested_notes text default null
  ) returns public.tax_returns language plpgsql security definer
set search_path = '' as $$
declare previous_record public.tax_returns;
updated_record public.tax_returns;
effective_filed_date date;
effective_accepted_date date;
effective_extension_date date;
status_changed boolean;
preparer_changed boolean;
reviewer_changed boolean;
begin -- ----------------------------------------------------------
-- Authentication and authorization
-- ----------------------------------------------------------
if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_can_manage_records() then raise exception 'You are not authorized to update tax returns.';
end if;
-- ----------------------------------------------------------
-- Locate and lock the current record
-- ----------------------------------------------------------
select * into previous_record
from public.tax_returns
where id = requested_return_id for
update;
if not found then raise exception 'Tax return was not found.';
end if;
-- ----------------------------------------------------------
-- Validate related client
-- ----------------------------------------------------------
if not exists (
  select 1
  from public.clients
  where id = requested_client_id
) then raise exception 'Client record was not found.';
end if;
-- ----------------------------------------------------------
-- Validate tax year
-- ----------------------------------------------------------
if requested_tax_year < 2000
or requested_tax_year > 2100 then raise exception 'Tax year is invalid.';
end if;
-- ----------------------------------------------------------
-- Validate workflow transition
-- ----------------------------------------------------------
if not public.is_valid_return_status_transition(
  previous_record.status,
  requested_status
) then raise exception 'The workflow transition from % to % is not allowed.',
previous_record.status,
requested_status;
end if;
-- ----------------------------------------------------------
-- Validate financial values
-- ----------------------------------------------------------
if requested_preparation_fee is null
or requested_preparation_fee < 0 then raise exception 'Preparation fee cannot be negative.';
end if;
if requested_discount_amount is null
or requested_discount_amount < 0 then raise exception 'Discount cannot be negative.';
end if;
if requested_discount_amount > requested_preparation_fee then raise exception 'Discount cannot exceed preparation fee.';
end if;
if requested_estimated_refund is null
or requested_estimated_refund < 0 then raise exception 'Estimated refund cannot be negative.';
end if;
if requested_estimated_amount_due is null
or requested_estimated_amount_due < 0 then raise exception 'Estimated amount due cannot be negative.';
end if;
-- ----------------------------------------------------------
-- Validate date relationships
-- ----------------------------------------------------------
if requested_date_received is not null
and requested_due_date is not null
and requested_due_date < requested_date_received then raise exception 'Due date cannot be before the received date.';
end if;
if requested_filed_date is not null
and requested_accepted_date is not null
and requested_accepted_date < requested_filed_date then raise exception 'Accepted date cannot be before the filed date.';
end if;
-- ----------------------------------------------------------
-- Validate extension values
-- ----------------------------------------------------------
if requested_extension_filed
and requested_extension_date is null then raise exception 'Extension date is required when an extension is filed.';
end if;
effective_extension_date := case
  when requested_extension_filed then requested_extension_date
  else null
end;
-- ----------------------------------------------------------
-- Validate preparer assignment
-- ----------------------------------------------------------
if requested_assigned_preparer_id is not null
and not exists (
  select 1
  from public.profiles
  where id = requested_assigned_preparer_id
    and is_active = true
    and role in (
      'administrator',
      'manager',
      'preparer'
    )
) then raise exception 'The selected preparer is not an active authorized preparer.';
end if;
-- ----------------------------------------------------------
-- Validate reviewer assignment
-- ----------------------------------------------------------
if requested_assigned_reviewer_id is not null
and not exists (
  select 1
  from public.profiles
  where id = requested_assigned_reviewer_id
    and is_active = true
    and role in (
      'administrator',
      'manager',
      'reviewer'
    )
) then raise exception 'The selected reviewer is not an active authorized reviewer.';
end if;
if requested_assigned_preparer_id is not null
and requested_assigned_reviewer_id is not null
and requested_assigned_preparer_id = requested_assigned_reviewer_id then raise exception 'The preparer and reviewer must be different staff members.';
end if;
-- ----------------------------------------------------------
-- Require assignments at relevant workflow stages
-- ----------------------------------------------------------
if requested_status in (
  'in_progress',
  'ready_for_review',
  'under_review',
  'ready_to_file',
  'filed',
  'accepted',
  'completed'
)
and requested_assigned_preparer_id is null then raise exception 'A preparer must be assigned for this workflow status.';
end if;
if requested_status in ('under_review', 'ready_to_file')
and requested_assigned_reviewer_id is null then raise exception 'A reviewer must be assigned for this workflow status.';
end if;
-- ----------------------------------------------------------
-- Automatic workflow dates
-- ----------------------------------------------------------
effective_filed_date := requested_filed_date;
effective_accepted_date := requested_accepted_date;
if requested_status in ('filed', 'accepted', 'completed')
and effective_filed_date is null then effective_filed_date := current_date;
end if;
if requested_status in ('accepted', 'completed')
and effective_accepted_date is null then effective_accepted_date := current_date;
end if;
if effective_filed_date is not null
and effective_accepted_date is not null
and effective_accepted_date < effective_filed_date then raise exception 'Accepted date cannot be before the filed date.';
end if;
-- A rejected return remains filed historically but is not
-- considered accepted.
if requested_status = 'rejected' then effective_accepted_date := null;
end if;
-- A return moved back before filing may clear filing dates.
if requested_status in (
  'not_started',
  'documents_pending',
  'in_progress',
  'ready_for_review',
  'under_review',
  'ready_to_file'
) then effective_filed_date := requested_filed_date;
effective_accepted_date := null;
end if;
-- ----------------------------------------------------------
-- Detect important changes before updating
-- ----------------------------------------------------------
status_changed := previous_record.status is distinct
from requested_status;
preparer_changed := previous_record.assigned_preparer_id is distinct
from requested_assigned_preparer_id;
reviewer_changed := previous_record.assigned_reviewer_id is distinct
from requested_assigned_reviewer_id;
-- ----------------------------------------------------------
-- Update the tax return
-- ----------------------------------------------------------
update public.tax_returns
set client_id = requested_client_id,
  tax_year = requested_tax_year,
  return_type = requested_return_type,
  tax_form = requested_tax_form,
  filing_status = requested_filing_status,
  status = requested_status,
  assigned_preparer_id = requested_assigned_preparer_id,
  assigned_reviewer_id = requested_assigned_reviewer_id,
  date_received = requested_date_received,
  due_date = requested_due_date,
  filed_date = effective_filed_date,
  accepted_date = effective_accepted_date,
  preparation_fee = requested_preparation_fee,
  discount_amount = requested_discount_amount,
  description = nullif(
    trim(requested_description),
    ''
  ),
  federal_return_required = requested_federal_return_required,
  state_return_required = requested_state_return_required,
  local_return_required = requested_local_return_required,
  extension_filed = requested_extension_filed,
  extension_date = effective_extension_date,
  estimated_refund = requested_estimated_refund,
  estimated_amount_due = requested_estimated_amount_due,
  notes = nullif(
    trim(requested_notes),
    ''
  ),
  updated_by = auth.uid()
where id = requested_return_id
returning * into updated_record;
-- ----------------------------------------------------------
-- General update audit record
-- ----------------------------------------------------------
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata
  )
values (
    auth.uid(),
    'tax_return_updated',
    'tax_return',
    updated_record.id,
    jsonb_build_object(
      'client_id',
      previous_record.client_id,
      'tax_year',
      previous_record.tax_year,
      'return_type',
      previous_record.return_type,
      'tax_form',
      previous_record.tax_form,
      'filing_status',
      previous_record.filing_status,
      'status',
      previous_record.status,
      'assigned_preparer_id',
      previous_record.assigned_preparer_id,
      'assigned_reviewer_id',
      previous_record.assigned_reviewer_id,
      'date_received',
      previous_record.date_received,
      'due_date',
      previous_record.due_date,
      'filed_date',
      previous_record.filed_date,
      'accepted_date',
      previous_record.accepted_date,
      'preparation_fee',
      previous_record.preparation_fee,
      'discount_amount',
      previous_record.discount_amount,
      'extension_filed',
      previous_record.extension_filed,
      'extension_date',
      previous_record.extension_date
    ),
    jsonb_build_object(
      'client_id',
      updated_record.client_id,
      'tax_year',
      updated_record.tax_year,
      'return_type',
      updated_record.return_type,
      'tax_form',
      updated_record.tax_form,
      'filing_status',
      updated_record.filing_status,
      'status',
      updated_record.status,
      'assigned_preparer_id',
      updated_record.assigned_preparer_id,
      'assigned_reviewer_id',
      updated_record.assigned_reviewer_id,
      'date_received',
      updated_record.date_received,
      'due_date',
      updated_record.due_date,
      'filed_date',
      updated_record.filed_date,
      'accepted_date',
      updated_record.accepted_date,
      'preparation_fee',
      updated_record.preparation_fee,
      'discount_amount',
      updated_record.discount_amount,
      'extension_filed',
      updated_record.extension_filed,
      'extension_date',
      updated_record.extension_date
    ),
    jsonb_build_object(
      'status_changed',
      status_changed,
      'preparer_changed',
      preparer_changed,
      'reviewer_changed',
      reviewer_changed
    )
  );
-- ----------------------------------------------------------
-- Specific workflow-status event
-- ----------------------------------------------------------
if status_changed then
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  )
values (
    auth.uid(),
    'return_status_updated',
    'tax_return',
    updated_record.id,
    jsonb_build_object(
      'status',
      previous_record.status
    ),
    jsonb_build_object(
      'status',
      updated_record.status
    )
  );
end if;
-- ----------------------------------------------------------
-- Specific preparer-assignment event
-- ----------------------------------------------------------
if preparer_changed then
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  )
values (
    auth.uid(),
    'return_preparer_assigned',
    'tax_return',
    updated_record.id,
    jsonb_build_object(
      'assigned_preparer_id',
      previous_record.assigned_preparer_id
    ),
    jsonb_build_object(
      'assigned_preparer_id',
      updated_record.assigned_preparer_id
    )
  );
end if;
-- ----------------------------------------------------------
-- Specific reviewer-assignment event
-- ----------------------------------------------------------
if reviewer_changed then
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  )
values (
    auth.uid(),
    'return_reviewer_assigned',
    'tax_return',
    updated_record.id,
    jsonb_build_object(
      'assigned_reviewer_id',
      previous_record.assigned_reviewer_id
    ),
    jsonb_build_object(
      'assigned_reviewer_id',
      updated_record.assigned_reviewer_id
    )
  );
end if;
return updated_record;
end;
$$;
-- ------------------------------------------------------------
-- Reapply permissions to the replaced function
-- ------------------------------------------------------------
revoke all on function public.update_tax_return_record(
  uuid,
  uuid,
  integer,
  public.return_type,
  public.tax_form_type,
  public.filing_status,
  public.return_status,
  uuid,
  uuid,
  date,
  date,
  date,
  date,
  numeric,
  numeric,
  text,
  boolean,
  boolean,
  boolean,
  boolean,
  date,
  numeric,
  numeric,
  text
)
from public;
revoke all on function public.update_tax_return_record(
  uuid,
  uuid,
  integer,
  public.return_type,
  public.tax_form_type,
  public.filing_status,
  public.return_status,
  uuid,
  uuid,
  date,
  date,
  date,
  date,
  numeric,
  numeric,
  text,
  boolean,
  boolean,
  boolean,
  boolean,
  date,
  numeric,
  numeric,
  text
)
from anon;
grant execute on function public.update_tax_return_record(
    uuid,
    uuid,
    integer,
    public.return_type,
    public.tax_form_type,
    public.filing_status,
    public.return_status,
    uuid,
    uuid,
    date,
    date,
    date,
    date,
    numeric,
    numeric,
    text,
    boolean,
    boolean,
    boolean,
    boolean,
    date,
    numeric,
    numeric,
    text
  ) to authenticated;
comment on function public.update_tax_return_record(
  uuid,
  uuid,
  integer,
  public.return_type,
  public.tax_form_type,
  public.filing_status,
  public.return_status,
  uuid,
  uuid,
  date,
  date,
  date,
  date,
  numeric,
  numeric,
  text,
  boolean,
  boolean,
  boolean,
  boolean,
  date,
  numeric,
  numeric,
  text
) is 'Validates and updates a tax return while recording workflow, assignment, and general audit events.';