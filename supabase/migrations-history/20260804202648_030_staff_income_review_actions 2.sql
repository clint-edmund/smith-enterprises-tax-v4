-- ==========================================================
-- Smith Enterprises Tax Management
-- Sprint 12.7.2B
-- Staff Income Review Actions
-- ==========================================================

begin;

-- ----------------------------------------------------------
-- Review state is stored separately from client-entered data.
-- One current review record exists per Income source.
-- Audit logs preserve each action.
-- ----------------------------------------------------------

create table if not exists
public.client_tax_organizer_income_reviews (
  id uuid primary key
    default gen_random_uuid(),

  income_source_id uuid not null
    references public.client_tax_organizer_income_sources(id)
    on delete cascade,

  review_status text not null
    default 'pending',

  internal_notes text not null
    default '',

  reviewed_by uuid
    references public.profiles(id)
    on delete set null,

  reviewed_at timestamptz,

  follow_up_requested_by uuid
    references public.profiles(id)
    on delete set null,

  follow_up_requested_at timestamptz,

  returned_to_client_by uuid
    references public.profiles(id)
    on delete set null,

  returned_to_client_at timestamptz,

  created_by uuid
    references public.profiles(id)
    on delete set null,

  updated_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint income_reviews_source_unique
    unique (income_source_id),

  constraint income_reviews_status_valid
    check (
      review_status in (
        'pending',
        'reviewed',
        'needs_follow_up',
        'returned_to_client'
      )
    ),

  constraint income_reviews_notes_length
    check (
      char_length(internal_notes) <= 10000
    ),

  constraint income_reviews_reviewed_fields_valid
    check (
      review_status <> 'reviewed'
      or (
        reviewed_by is not null
        and reviewed_at is not null
      )
    ),

  constraint income_reviews_follow_up_fields_valid
    check (
      review_status <> 'needs_follow_up'
      or (
        follow_up_requested_by is not null
        and follow_up_requested_at is not null
      )
    ),

  constraint income_reviews_returned_fields_valid
    check (
      review_status <> 'returned_to_client'
      or (
        returned_to_client_by is not null
        and returned_to_client_at is not null
      )
    )
);

create index if not exists
income_reviews_status_index
on public.client_tax_organizer_income_reviews (
  review_status
);

create index if not exists
income_reviews_reviewed_by_index
on public.client_tax_organizer_income_reviews (
  reviewed_by
);

drop trigger if exists
income_reviews_set_updated_at
on public.client_tax_organizer_income_reviews;

create trigger
income_reviews_set_updated_at
before update
on public.client_tax_organizer_income_reviews
for each row
execute function public.set_updated_at();

alter table
public.client_tax_organizer_income_reviews
enable row level security;

alter table
public.client_tax_organizer_income_reviews
force row level security;

drop policy if exists
income_reviews_select_active_staff
on public.client_tax_organizer_income_reviews;

create policy
income_reviews_select_active_staff
on public.client_tax_organizer_income_reviews
for select
to authenticated
using (
  public.current_user_is_active()
);

drop policy if exists
income_reviews_manage_authorized_staff
on public.client_tax_organizer_income_reviews;

create policy
income_reviews_manage_authorized_staff
on public.client_tax_organizer_income_reviews
for all
to authenticated
using (
  public.current_user_can_manage_records()
)
with check (
  public.current_user_can_manage_records()
);

-- ----------------------------------------------------------
-- Shared return shape used by all action RPCs.
-- ----------------------------------------------------------

drop function if exists
public.mark_income_review_complete(uuid);

create function
public.mark_income_review_complete(
  requested_income_source_id uuid
)
returns table (
  review_id uuid,
  income_source_id uuid,
  review_status text,
  internal_notes text,
  reviewed_by uuid,
  reviewed_by_name text,
  reviewed_at timestamptz,
  follow_up_requested_at timestamptz,
  returned_to_client_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid;
  selected_source
    public.client_tax_organizer_income_sources;
  saved_review
    public.client_tax_organizer_income_reviews;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles as profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An Income source identifier is required.';
  end if;

  select source.*
  into selected_source
  from public.client_tax_organizer_income_sources
    as source
  where source.id =
    requested_income_source_id;

  if not found then
    raise exception
      'The selected Income source was not found.';
  end if;

  insert into
  public.client_tax_organizer_income_reviews (
    income_source_id,
    review_status,
    reviewed_by,
    reviewed_at,
    follow_up_requested_by,
    follow_up_requested_at,
    returned_to_client_by,
    returned_to_client_at,
    created_by,
    updated_by
  )
  values (
    selected_source.id,
    'reviewed',
    current_user_id,
    timezone('utc', now()),
    null,
    null,
    null,
    null,
    current_user_id,
    current_user_id
  )
  on conflict (income_source_id)
  do update set
    review_status = 'reviewed',
    reviewed_by = current_user_id,
    reviewed_at = timezone('utc', now()),
    follow_up_requested_by = null,
    follow_up_requested_at = null,
    returned_to_client_by = null,
    returned_to_client_at = null,
    updated_by = current_user_id
  returning *
  into saved_review;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values,
    metadata
  )
  values (
    current_user_id,
    'income_review_marked_complete',
    'client_tax_organizer_income_review',
    saved_review.id,
    jsonb_build_object(
      'review_status',
      saved_review.review_status,
      'income_source_id',
      saved_review.income_source_id
    ),
    jsonb_build_object(
      'organizer_id',
      selected_source.organizer_id
    )
  );

  return query
  select
    saved_review.id,
    saved_review.income_source_id,
    saved_review.review_status,
    saved_review.internal_notes,
    saved_review.reviewed_by,
    coalesce(
      nullif(
        trim(profile.display_name),
        ''
      ),
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
    saved_review.reviewed_at,
    saved_review.follow_up_requested_at,
    saved_review.returned_to_client_at,
    saved_review.updated_at
  from public.profiles as profile
  where profile.id = current_user_id;
end;
$function$;

drop function if exists
public.mark_income_review_needs_followup(
  uuid,
  text
);

create function
public.mark_income_review_needs_followup(
  requested_income_source_id uuid,
  requested_internal_notes text
    default null
)
returns table (
  review_id uuid,
  income_source_id uuid,
  review_status text,
  internal_notes text,
  reviewed_by uuid,
  reviewed_by_name text,
  reviewed_at timestamptz,
  follow_up_requested_at timestamptz,
  returned_to_client_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid;
  selected_source
    public.client_tax_organizer_income_sources;
  saved_review
    public.client_tax_organizer_income_reviews;
  normalized_notes text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles as profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An Income source identifier is required.';
  end if;

  normalized_notes :=
    trim(
      coalesce(
        requested_internal_notes,
        ''
      )
    );

  if not normalized_notes then
    raise exception
      'A follow-up note is required.';
  end if;

  if char_length(normalized_notes) > 10000 then
    raise exception
      'The internal note cannot exceed 10,000 characters.';
  end if;

  select source.*
  into selected_source
  from public.client_tax_organizer_income_sources
    as source
  where source.id =
    requested_income_source_id;

  if not found then
    raise exception
      'The selected Income source was not found.';
  end if;

  insert into
  public.client_tax_organizer_income_reviews (
    income_source_id,
    review_status,
    internal_notes,
    reviewed_by,
    reviewed_at,
    follow_up_requested_by,
    follow_up_requested_at,
    returned_to_client_by,
    returned_to_client_at,
    created_by,
    updated_by
  )
  values (
    selected_source.id,
    'needs_follow_up',
    normalized_notes,
    null,
    null,
    current_user_id,
    timezone('utc', now()),
    null,
    null,
    current_user_id,
    current_user_id
  )
  on conflict (income_source_id)
  do update set
    review_status = 'needs_follow_up',
    internal_notes = normalized_notes,
    reviewed_by = null,
    reviewed_at = null,
    follow_up_requested_by = current_user_id,
    follow_up_requested_at = timezone('utc', now()),
    returned_to_client_by = null,
    returned_to_client_at = null,
    updated_by = current_user_id
  returning *
  into saved_review;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values,
    metadata
  )
  values (
    current_user_id,
    'income_review_needs_follow_up',
    'client_tax_organizer_income_review',
    saved_review.id,
    jsonb_build_object(
      'review_status',
      saved_review.review_status,
      'income_source_id',
      saved_review.income_source_id,
      'internal_notes',
      saved_review.internal_notes
    ),
    jsonb_build_object(
      'organizer_id',
      selected_source.organizer_id
    )
  );

  return query
  select
    saved_review.id,
    saved_review.income_source_id,
    saved_review.review_status,
    saved_review.internal_notes,
    current_user_id,
    coalesce(
      nullif(
        trim(profile.display_name),
        ''
      ),
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
    saved_review.reviewed_at,
    saved_review.follow_up_requested_at,
    saved_review.returned_to_client_at,
    saved_review.updated_at
  from public.profiles as profile
  where profile.id = current_user_id;
end;
$function$;

drop function if exists
public.save_income_review_notes(
  uuid,
  text
);

create function
public.save_income_review_notes(
  requested_income_source_id uuid,
  requested_internal_notes text
)
returns table (
  review_id uuid,
  income_source_id uuid,
  review_status text,
  internal_notes text,
  reviewed_by uuid,
  reviewed_by_name text,
  reviewed_at timestamptz,
  follow_up_requested_at timestamptz,
  returned_to_client_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid;
  selected_source
    public.client_tax_organizer_income_sources;
  saved_review
    public.client_tax_organizer_income_reviews;
  normalized_notes text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles as profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An Income source identifier is required.';
  end if;

  normalized_notes :=
    trim(
      coalesce(
        requested_internal_notes,
        ''
      )
    );

  if char_length(normalized_notes) > 10000 then
    raise exception
      'The internal note cannot exceed 10,000 characters.';
  end if;

  select source.*
  into selected_source
  from public.client_tax_organizer_income_sources
    as source
  where source.id =
    requested_income_source_id;

  if not found then
    raise exception
      'The selected Income source was not found.';
  end if;

  insert into
  public.client_tax_organizer_income_reviews (
    income_source_id,
    internal_notes,
    created_by,
    updated_by
  )
  values (
    selected_source.id,
    normalized_notes,
    current_user_id,
    current_user_id
  )
  on conflict (income_source_id)
  do update set
    internal_notes = normalized_notes,
    updated_by = current_user_id
  returning *
  into saved_review;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values,
    metadata
  )
  values (
    current_user_id,
    'income_review_notes_saved',
    'client_tax_organizer_income_review',
    saved_review.id,
    jsonb_build_object(
      'income_source_id',
      saved_review.income_source_id,
      'internal_notes',
      saved_review.internal_notes
    ),
    jsonb_build_object(
      'organizer_id',
      selected_source.organizer_id
    )
  );

  return query
  select
    saved_review.id,
    saved_review.income_source_id,
    saved_review.review_status,
    saved_review.internal_notes,
    saved_review.reviewed_by,
    case
      when saved_review.reviewed_by is null
        then null
      else coalesce(
        nullif(
          trim(reviewer.display_name),
          ''
        ),
        nullif(
          trim(
            concat_ws(
              ' ',
              reviewer.first_name,
              reviewer.last_name
            )
          ),
          ''
        ),
        reviewer.email
      )
    end,
    saved_review.reviewed_at,
    saved_review.follow_up_requested_at,
    saved_review.returned_to_client_at,
    saved_review.updated_at
  from (
    select 1
  ) as placeholder
  left join public.profiles as reviewer
    on reviewer.id =
      saved_review.reviewed_by;
end;
$function$;

drop function if exists
public.return_income_record_to_client(
  uuid,
  text
);

create function
public.return_income_record_to_client(
  requested_income_source_id uuid,
  requested_internal_notes text
    default null
)
returns table (
  review_id uuid,
  income_source_id uuid,
  review_status text,
  internal_notes text,
  reviewed_by uuid,
  reviewed_by_name text,
  reviewed_at timestamptz,
  follow_up_requested_at timestamptz,
  returned_to_client_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid;
  selected_source
    public.client_tax_organizer_income_sources;
  saved_review
    public.client_tax_organizer_income_reviews;
  normalized_notes text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles as profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An Income source identifier is required.';
  end if;

  normalized_notes :=
    trim(
      coalesce(
        requested_internal_notes,
        ''
      )
    );

  if not normalized_notes then
    raise exception
      'A return-to-client note is required.';
  end if;

  if char_length(normalized_notes) > 10000 then
    raise exception
      'The internal note cannot exceed 10,000 characters.';
  end if;

  select source.*
  into selected_source
  from public.client_tax_organizer_income_sources
    as source
  where source.id =
    requested_income_source_id;

  if not found then
    raise exception
      'The selected Income source was not found.';
  end if;

  insert into
  public.client_tax_organizer_income_reviews (
    income_source_id,
    review_status,
    internal_notes,
    reviewed_by,
    reviewed_at,
    follow_up_requested_by,
    follow_up_requested_at,
    returned_to_client_by,
    returned_to_client_at,
    created_by,
    updated_by
  )
  values (
    selected_source.id,
    'returned_to_client',
    normalized_notes,
    null,
    null,
    current_user_id,
    timezone('utc', now()),
    current_user_id,
    timezone('utc', now()),
    current_user_id,
    current_user_id
  )
  on conflict (income_source_id)
  do update set
    review_status = 'returned_to_client',
    internal_notes = normalized_notes,
    reviewed_by = null,
    reviewed_at = null,
    follow_up_requested_by = current_user_id,
    follow_up_requested_at = timezone('utc', now()),
    returned_to_client_by = current_user_id,
    returned_to_client_at = timezone('utc', now()),
    updated_by = current_user_id
  returning *
  into saved_review;

  update public.client_tax_organizers
  set
    status = 'returned',
    current_section = 'income',
    updated_at = timezone('utc', now())
  where id =
    selected_source.organizer_id;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values,
    metadata
  )
  values (
    current_user_id,
    'income_review_returned_to_client',
    'client_tax_organizer_income_review',
    saved_review.id,
    jsonb_build_object(
      'review_status',
      saved_review.review_status,
      'income_source_id',
      saved_review.income_source_id,
      'internal_notes',
      saved_review.internal_notes
    ),
    jsonb_build_object(
      'organizer_id',
      selected_source.organizer_id
    )
  );

  return query
  select
    saved_review.id,
    saved_review.income_source_id,
    saved_review.review_status,
    saved_review.internal_notes,
    current_user_id,
    coalesce(
      nullif(
        trim(profile.display_name),
        ''
      ),
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
    saved_review.reviewed_at,
    saved_review.follow_up_requested_at,
    saved_review.returned_to_client_at,
    saved_review.updated_at
  from public.profiles as profile
  where profile.id = current_user_id;
end;
$function$;

-- ----------------------------------------------------------
-- Restrict direct function access.
-- ----------------------------------------------------------

revoke all
on function
public.mark_income_review_complete(uuid)
from public, anon;

revoke all
on function
public.mark_income_review_needs_followup(
  uuid,
  text
)
from public, anon;

revoke all
on function
public.save_income_review_notes(
  uuid,
  text
)
from public, anon;

revoke all
on function
public.return_income_record_to_client(
  uuid,
  text
)
from public, anon;

grant execute
on function
public.mark_income_review_complete(uuid)
to authenticated;

grant execute
on function
public.mark_income_review_needs_followup(
  uuid,
  text
)
to authenticated;

grant execute
on function
public.save_income_review_notes(
  uuid,
  text
)
to authenticated;

grant execute
on function
public.return_income_record_to_client(
  uuid,
  text
)
to authenticated;

comment on table
public.client_tax_organizer_income_reviews
is
'Stores staff-only review status and internal notes separately from client-entered Income data.';

commit;