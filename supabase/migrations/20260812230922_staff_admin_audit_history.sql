begin;

create or replace function public.get_staff_admin_audit_history(
  requested_limit integer default 50
)
returns table (
  id uuid,
  actor_user_id uuid,
  actor_email text,
  actor_display_name text,
  target_staff_id uuid,
  target_email text,
  action text,
  outcome text,
  previous_role public.app_role,
  new_role public.app_role,
  previous_is_active boolean,
  new_is_active boolean,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile public.profiles%rowtype;
  safe_limit integer;
begin
  select profile.*
  into current_profile
  from public.profiles as profile
  where profile.id = auth.uid();

  if current_profile.id is null then
    raise exception
      'Staff profile not found.';
  end if;

  if not current_profile.is_active then
    raise exception
      'Staff account is not active.';
  end if;

  if current_profile.role <>
     'administrator'::public.app_role then
    raise exception
      'You are not authorized to view staff administration audit history.';
  end if;

  safe_limit :=
    least(
      greatest(
        coalesce(
          requested_limit,
          50
        ),
        1
      ),
      250
    );

  return query
  select
    audit.id,
    audit.actor_user_id,
    actor.email,
    coalesce(
      nullif(
        actor.display_name,
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            actor.first_name,
            actor.last_name
          )
        ),
        ''
      ),
      actor.email
    ),
    audit.target_staff_id,
    audit.target_email,
    audit.action,
    audit.outcome,
    audit.previous_role,
    audit.new_role,
    audit.previous_is_active,
    audit.new_is_active,
    audit.metadata,
    audit.created_at
  from public.staff_admin_audit_events
    as audit
  left join public.profiles
    as actor
    on actor.id =
      audit.actor_user_id
  order by
    audit.created_at desc
  limit safe_limit;
end;
$$;

comment on function
  public.get_staff_admin_audit_history(integer)
is
  'Returns recent staff administration audit events to active administrators.';

revoke all
on function
  public.get_staff_admin_audit_history(integer)
from public;

grant execute
on function
  public.get_staff_admin_audit_history(integer)
to authenticated;

grant execute
on function
  public.get_staff_admin_audit_history(integer)
to service_role;

commit;