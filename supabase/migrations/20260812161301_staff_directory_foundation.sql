begin;

create or replace function public.get_staff_directory()
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

  if current_profile.role not in (
    'administrator'::public.app_role,
    'manager'::public.app_role
  ) then
    raise exception 'You are not authorized to view the staff directory.';
  end if;

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
  order by
    profile.is_active desc,
    coalesce(
      nullif(profile.display_name, ''),
      nullif(
        trim(
          concat_ws(
            ' ',
            profile.first_name,
            profile.last_name
          )
        ),
        ''
      ),
      profile.email
    ),
    profile.email;
end;
$$;

comment on function public.get_staff_directory()
is
  'Returns the staff directory to active administrators and managers.';

revoke all
on function public.get_staff_directory()
from public;

grant execute
on function public.get_staff_directory()
to authenticated;

grant execute
on function public.get_staff_directory()
to service_role;

commit;