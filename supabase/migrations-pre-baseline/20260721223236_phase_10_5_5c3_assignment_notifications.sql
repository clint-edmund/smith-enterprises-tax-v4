begin;

create or replace function
  public.create_return_assignment_notification()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  notification_title text;
  notification_message text;
begin
  /*
   * Only create a notification when the assigned
   * preparer actually changes.
   */
  if new.assigned_preparer_id
    is not distinct from
    old.assigned_preparer_id
  then
    return new;
  end if;

  /*
   * An unassignment does not require a notification
   * for a new preparer.
   */
  if new.assigned_preparer_id is null then
    return new;
  end if;

  /*
   * Confirm the selected preparer corresponds to
   * an authenticated application user.
   */
  if not exists (
    select 1
    from auth.users
    where id =
      new.assigned_preparer_id
  ) then
    raise warning
      'Assignment notification skipped because preparer % is not an auth user.',
      new.assigned_preparer_id;

    return new;
  end if;

  notification_title :=
    'Return Assigned';

  notification_message :=
    'A tax return has been assigned to you.';

  insert into public.notifications (
    recipient_user_id,
    title,
    message,
    category,
    priority,
    action_url,
    related_entity_id,
    related_entity_type,
    metadata
  )
  values (
    new.assigned_preparer_id,
    notification_title,
    notification_message,
    'assignment',
    'high',
    '/returns',
    new.id,
    'tax_return',
    jsonb_build_object(
      'tax_return_id',
        new.id,
      'assigned_preparer_id',
        new.assigned_preparer_id,
      'previous_preparer_id',
        old.assigned_preparer_id,
      'generated_by',
        'tax_return_assignment_trigger'
    )
  );

  return new;
end;
$$;

revoke all
on function
  public.create_return_assignment_notification()
from public;

revoke all
on function
  public.create_return_assignment_notification()
from anon;

revoke all
on function
  public.create_return_assignment_notification()
from authenticated;

drop trigger if exists
  create_return_assignment_notification_trigger
on public.tax_returns;

create trigger
  create_return_assignment_notification_trigger
after update of assigned_preparer_id
on public.tax_returns
for each row
when (
  old.assigned_preparer_id
    is distinct from
  new.assigned_preparer_id
)
execute function
  public.create_return_assignment_notification();

commit;