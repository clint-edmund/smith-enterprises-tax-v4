-- ============================================================
-- Client Document Activity
--
-- Returns sanitized document activity for a selected client.
-- The function intentionally excludes old_values, new_values,
-- browser metadata, user-agent information, and other detailed
-- audit fields.
-- ============================================================

create or replace function public.get_client_document_activity(
  requested_client_id uuid,
  requested_limit integer default 10
)
returns table (
  id bigint,
  action text,
  entity_type text,
  entity_id uuid,
  document_name text,
  actor_name text,
  occurred_at timestamptz,
  description text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  safe_limit integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  if requested_client_id is null then
    raise exception 'A client ID is required.';
  end if;

  safe_limit := least(
    greatest(
      coalesce(requested_limit, 10),
      1
    ),
    50
  );

  return query
  select
    audit.id,
    audit.action,
    audit.entity_type,
    audit.entity_id,
    document.original_file_name as document_name,
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
    audit.created_at as occurred_at,
    case
      when audit.action = 'document_uploaded'
        then 'Uploaded ' || document.original_file_name
      when audit.action = 'document_archived'
        then 'Archived ' || document.original_file_name
      when audit.action = 'document_downloaded'
        then 'Downloaded ' || document.original_file_name
      when audit.action = 'document_viewed'
        then 'Viewed ' || document.original_file_name
      when audit.action = 'document_updated'
        then 'Updated ' || document.original_file_name
      else
        initcap(
          replace(
            audit.action,
            '_',
            ' '
          )
        ) || ': ' || document.original_file_name
    end as description
  from public.audit_logs as audit
  inner join public.client_documents as document
    on document.id = audit.entity_id
  left join public.profiles as profile
    on profile.id = audit.actor_id
  where audit.entity_type = 'document'
    and document.client_id = requested_client_id
  order by audit.created_at desc
  limit safe_limit;
end;
$$;

revoke all
on function public.get_client_document_activity(uuid, integer)
from public;

revoke all
on function public.get_client_document_activity(uuid, integer)
from anon;

grant execute
on function public.get_client_document_activity(uuid, integer)
to authenticated;

comment on function
  public.get_client_document_activity(uuid, integer)
is
  'Returns sanitized document audit activity for an authorized staff user and selected client.';