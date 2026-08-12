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
  previous_role public.app_role;
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

  previous_role :=
    target_profile.role;

  update public.profiles as profile
  set role = new_role
  where profile.id = target_staff_id;

  insert into public.staff_admin_audit_events (
    actor_user_id,
    target_staff_id,
    action,
    previous_role,
    new_role,
    target_email
  )
  values (
    auth.uid(),
    target_staff_id,
    'role_changed',
    previous_role,
    new_role,
    target_profile.email
  );

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
  previous_status boolean;
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
      'You are not authorized to manage staff status.';
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
     and new_is_active = false then
    raise exception
      'You cannot deactivate your own staff account.';
  end if;

  previous_status :=
    target_profile.is_active;

  update public.profiles as profile
  set is_active = new_is_active
  where profile.id = target_staff_id;

  insert into public.staff_admin_audit_events (
    actor_user_id,
    target_staff_id,
    action,
    previous_is_active,
    new_is_active,
    target_email
  )
  values (
    auth.uid(),
    target_staff_id,
    case
      when new_is_active
        then 'activated'
      else 'deactivated'
    end,
    previous_status,
    new_is_active,
    target_profile.email
  );

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

commit;