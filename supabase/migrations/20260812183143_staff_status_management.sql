begin;

create or replace function public.update_staff_status(
  target_staff_id uuid,
  new_is_active boolean
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
  select *
  into current_profile
  from public.profiles
  where id = auth.uid();

  if current_profile.id is null then
    raise exception 'Staff profile not found.';
  end if;

  if not current_profile.is_active then
    raise exception 'Staff account is not active.';
  end if;

  if current_profile.role <>
     'administrator'::public.app_role then
    raise exception
      'You are not authorized to manage staff status.';
  end if;

  select *
  into target_profile
  from public.profiles
  where id = target_staff_id;

  if target_profile.id is null then
    raise exception
      'Target staff account was not found.';
  end if;

  if target_staff_id = auth.uid()
     and new_is_active = false then
    raise exception
      'You cannot deactivate your own staff account.';
  end if;

  update public.profiles
  set is_active = new_is_active
  where profiles.id = target_staff_id;

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
  public.update_staff_status(uuid, boolean)
is
  'Allows active administrators to activate or deactivate staff while preventing self-deactivation.';

revoke all
on function public.update_staff_status(uuid, boolean)
from public;

grant execute
on function public.update_staff_status(uuid, boolean)
to authenticated;

grant execute
on function public.update_staff_status(uuid, boolean)
to service_role;

commit;