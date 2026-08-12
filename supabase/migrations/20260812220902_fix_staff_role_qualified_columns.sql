begin;

create or replace function public.update_staff_role(
  target_staff_id uuid,
  new_role public.app_role
)
returns table (
  id uuid,
  email text,
  first_name text,
  last_name text,
  display_name text,
  phone text,
  role public.app_role,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile public.profiles%rowtype;
  target_profile public.profiles%rowtype;
begin
  select profile.*
  into current_profile
  from public.profiles as profile
  where profile.id = auth.uid();

  if current_profile.id is null then
    raise exception 'Staff profile not found.';
  end if;

  if not current_profile.is_active then
    raise exception 'Staff account is not active.';
  end if;

  if current_profile.role <>
     'administrator'::public.app_role then
    raise exception
      'You are not authorized to manage staff roles.';
  end if;

  select profile.*
  into target_profile
  from public.profiles as profile
  where profile.id = target_staff_id;

  if target_profile.id is null then
    raise exception
      'Target staff account was not found.';
  end if;

  if target_staff_id = auth.uid()
     and new_role <>
       'administrator'::public.app_role then
    raise exception
      'You cannot remove your own administrator role.';
  end if;

  update public.profiles as profile
  set role = new_role
  where profile.id = target_staff_id;

  return query
  select
    profile.id,
    profile.email,
    profile.first_name,
    profile.last_name,
    profile.display_name,
    profile.phone,
    profile.role,
    profile.is_active,
    profile.created_at,
    profile.updated_at
  from public.profiles as profile
  where profile.id = target_staff_id;
end;
$$;

comment on function
  public.update_staff_role(
    uuid,
    public.app_role
  )
is
  'Allows active administrators to change another staff member role while preventing self-demotion.';

revoke all
on function public.update_staff_role(
  uuid,
  public.app_role
)
from public;

grant execute
on function public.update_staff_role(
  uuid,
  public.app_role
)
to authenticated;

grant execute
on function public.update_staff_role(
  uuid,
  public.app_role
)
to service_role;

commit;