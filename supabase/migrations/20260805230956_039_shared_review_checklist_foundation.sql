-- ==========================================================
-- Smith Enterprises Tax Management
-- Release 0.9 — Sprint 0.9.5A
-- Shared Organizer Review Checklist Foundation
-- ==========================================================

begin;

-- ----------------------------------------------------------
-- Checklist definitions identify the reusable checklist for a
-- review section and subject type.
-- ----------------------------------------------------------

create table if not exists
public.organizer_review_checklist_definitions (
  id uuid primary key
    default gen_random_uuid(),

  section_key text not null,

  subject_type text not null,

  name text not null,

  description text,

  version integer not null
    default 1,

  is_active boolean not null
    default true,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint review_checklist_definition_section_valid
    check (
      section_key in (
        'income',
        'dependents',
        'healthcare',
        'deductions',
        'credits',
        'business',
        'investments',
        'final_review'
      )
    ),

  constraint review_checklist_definition_subject_valid
    check (
      subject_type in (
        'income_source',
        'dependent',
        'healthcare_record',
        'deduction',
        'credit',
        'business_record',
        'investment_record',
        'organizer'
      )
    ),

  constraint review_checklist_definition_version_valid
    check (
      version > 0
    ),

  constraint review_checklist_definition_name_required
    check (
      char_length(
        trim(name)
      ) > 0
    ),

  constraint review_checklist_definition_unique
    unique (
      section_key,
      subject_type,
      version
    )
);

-- ----------------------------------------------------------
-- Checklist items define the required and optional checks.
-- ----------------------------------------------------------

create table if not exists
public.organizer_review_checklist_items (
  id uuid primary key
    default gen_random_uuid(),

  definition_id uuid not null
    references public.organizer_review_checklist_definitions(id)
    on delete cascade,

  item_key text not null,

  label text not null,

  description text,

  is_required boolean not null
    default true,

  display_order integer not null,

  is_active boolean not null
    default true,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint review_checklist_item_key_required
    check (
      char_length(
        trim(item_key)
      ) > 0
    ),

  constraint review_checklist_item_label_required
    check (
      char_length(
        trim(label)
      ) > 0
    ),

  constraint review_checklist_item_order_valid
    check (
      display_order >= 0
    ),

  constraint review_checklist_item_key_unique
    unique (
      definition_id,
      item_key
    ),

  constraint review_checklist_item_order_unique
    unique (
      definition_id,
      display_order
    )
);

-- ----------------------------------------------------------
-- Per-subject checklist responses.
-- A response row is created only after staff interacts with an item.
-- ----------------------------------------------------------

create table if not exists
public.organizer_review_checklist_responses (
  id uuid primary key
    default gen_random_uuid(),

  organizer_id uuid not null
    references public.client_tax_organizers(id)
    on delete cascade,

  subject_type text not null,

  subject_id uuid not null,

  checklist_item_id uuid not null
    references public.organizer_review_checklist_items(id)
    on delete cascade,

  is_completed boolean not null
    default false,

  completed_by uuid
    references public.profiles(id)
    on delete set null,

  completed_at timestamptz,

  updated_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null
    default timezone('utc', now()),

  updated_at timestamptz not null
    default timezone('utc', now()),

  constraint review_checklist_response_subject_valid
    check (
      subject_type in (
        'income_source',
        'dependent',
        'healthcare_record',
        'deduction',
        'credit',
        'business_record',
        'investment_record',
        'organizer'
      )
    ),

  constraint review_checklist_response_completion_valid
    check (
      (
        is_completed = false
        and completed_at is null
      )
      or
      (
        is_completed = true
        and completed_by is not null
        and completed_at is not null
      )
    ),

  constraint review_checklist_response_unique
    unique (
      subject_type,
      subject_id,
      checklist_item_id
    )
);

create index if not exists
review_checklist_items_definition_index
on public.organizer_review_checklist_items (
  definition_id,
  display_order
);

create index if not exists
review_checklist_responses_subject_index
on public.organizer_review_checklist_responses (
  organizer_id,
  subject_type,
  subject_id
);

drop trigger if exists
review_checklist_definitions_set_updated_at
on public.organizer_review_checklist_definitions;

create trigger
review_checklist_definitions_set_updated_at
before update
on public.organizer_review_checklist_definitions
for each row
execute function public.set_updated_at();

drop trigger if exists
review_checklist_items_set_updated_at
on public.organizer_review_checklist_items;

create trigger
review_checklist_items_set_updated_at
before update
on public.organizer_review_checklist_items
for each row
execute function public.set_updated_at();

drop trigger if exists
review_checklist_responses_set_updated_at
on public.organizer_review_checklist_responses;

create trigger
review_checklist_responses_set_updated_at
before update
on public.organizer_review_checklist_responses
for each row
execute function public.set_updated_at();

-- ----------------------------------------------------------
-- Security
-- ----------------------------------------------------------

alter table
public.organizer_review_checklist_definitions
enable row level security;

alter table
public.organizer_review_checklist_definitions
force row level security;

alter table
public.organizer_review_checklist_items
enable row level security;

alter table
public.organizer_review_checklist_items
force row level security;

alter table
public.organizer_review_checklist_responses
enable row level security;

alter table
public.organizer_review_checklist_responses
force row level security;

drop policy if exists
review_checklist_definitions_staff_select
on public.organizer_review_checklist_definitions;

create policy
review_checklist_definitions_staff_select
on public.organizer_review_checklist_definitions
for select
to authenticated
using (
  public.current_user_is_active()
);

drop policy if exists
review_checklist_items_staff_select
on public.organizer_review_checklist_items;

create policy
review_checklist_items_staff_select
on public.organizer_review_checklist_items
for select
to authenticated
using (
  public.current_user_is_active()
);

drop policy if exists
review_checklist_responses_staff_select
on public.organizer_review_checklist_responses;

create policy
review_checklist_responses_staff_select
on public.organizer_review_checklist_responses
for select
to authenticated
using (
  public.current_user_is_active()
);

drop policy if exists
review_checklist_responses_staff_manage
on public.organizer_review_checklist_responses;

create policy
review_checklist_responses_staff_manage
on public.organizer_review_checklist_responses
for all
to authenticated
using (
  public.current_user_can_manage_records()
)
with check (
  public.current_user_can_manage_records()
);

-- Definition and item writes are intentionally reserved for migrations
-- and administrative tooling. Ordinary staff only read templates.

-- ----------------------------------------------------------
-- Seed Dependents checklist version 1.
-- No sensitive values are stored in checklist responses.
-- ----------------------------------------------------------

insert into
public.organizer_review_checklist_definitions (
  section_key,
  subject_type,
  name,
  description,
  version,
  is_active
)
values (
  'dependents',
  'dependent',
  'Dependent Review Checklist',
  'Required verification steps for one dependent review record.',
  1,
  true
)
on conflict (
  section_key,
  subject_type,
  version
)
do update set
  name =
    excluded.name,
  description =
    excluded.description,
  is_active =
    excluded.is_active;

with dependent_definition as (
  select definition.id
  from public.organizer_review_checklist_definitions
    as definition
  where definition.section_key =
      'dependents'
    and definition.subject_type =
      'dependent'
    and definition.version =
      1
)
insert into
public.organizer_review_checklist_items (
  definition_id,
  item_key,
  label,
  description,
  is_required,
  display_order,
  is_active
)
select
  dependent_definition.id,
  seed.item_key,
  seed.label,
  seed.description,
  seed.is_required,
  seed.display_order,
  true
from dependent_definition
cross join (
  values
    (
      'name_verified',
      'Name matches source documents',
      'Confirm the dependent name matches the supporting documentation.',
      true,
      10
    ),
    (
      'birth_date_verified',
      'Date of birth verified',
      'Confirm the date of birth matches the supporting documentation.',
      true,
      20
    ),
    (
      'taxpayer_identifier_verified',
      'Taxpayer identification verified',
      'Confirm the required taxpayer identification documentation has been reviewed without recording the identifier in the checklist.',
      true,
      30
    ),
    (
      'relationship_verified',
      'Relationship confirmed',
      'Confirm the claimed relationship is supported.',
      true,
      40
    ),
    (
      'residency_verified',
      'Residency confirmed',
      'Confirm residency facts and supporting records.',
      true,
      50
    ),
    (
      'support_test_reviewed',
      'Support test reviewed',
      'Confirm support-test requirements have been considered.',
      true,
      60
    ),
    (
      'age_student_disability_reviewed',
      'Age, student, and disability rules reviewed',
      'Review the applicable age, full-time student, and disability facts.',
      true,
      70
    ),
    (
      'citizenship_residency_status_verified',
      'Citizenship or residency status verified',
      'Confirm the applicable citizenship or residency status.',
      true,
      80
    ),
    (
      'documentation_reviewed',
      'Supporting documentation reviewed',
      'Confirm available supporting documents have been reviewed and missing documents have been requested.',
      true,
      90
    )
) as seed (
  item_key,
  label,
  description,
  is_required,
  display_order
)
on conflict (
  definition_id,
  item_key
)
do update set
  label =
    excluded.label,
  description =
    excluded.description,
  is_required =
    excluded.is_required,
  display_order =
    excluded.display_order,
  is_active =
    true;

-- ----------------------------------------------------------
-- Load checklist and current responses for one subject.
-- ----------------------------------------------------------

drop function if exists
public.get_organizer_review_checklist(
  uuid,
  text,
  text,
  uuid
);

create function
public.get_organizer_review_checklist(
  requested_organizer_id uuid,
  requested_section_key text,
  requested_subject_type text,
  requested_subject_id uuid
)
returns table (
  definition_id uuid,
  definition_name text,
  checklist_version integer,
  item_id uuid,
  item_key text,
  item_label text,
  item_description text,
  is_required boolean,
  display_order integer,
  is_completed boolean,
  completed_by uuid,
  completed_by_name text,
  completed_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
#variable_conflict use_column
begin
  if auth.uid() is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_organizer_id is null
    or requested_subject_id is null then
    raise exception
      'Organizer and review subject identifiers are required.';
  end if;

  return query
  select
    definition.id,
    definition.name,
    definition.version,
    item.id,
    item.item_key,
    item.label,
    item.description,
    item.is_required,
    item.display_order,
    coalesce(
      response.is_completed,
      false
    ),
    response.completed_by,
    case
      when response.completed_by is null
        then null
      else coalesce(
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
      )
    end,
    response.completed_at,
    coalesce(
      response.updated_at,
      item.updated_at
    )
  from public.organizer_review_checklist_definitions
    as definition
  join public.organizer_review_checklist_items
    as item
    on item.definition_id =
      definition.id
  left join public.organizer_review_checklist_responses
    as response
    on response.organizer_id =
      requested_organizer_id
    and response.subject_type =
      requested_subject_type
    and response.subject_id =
      requested_subject_id
    and response.checklist_item_id =
      item.id
  left join public.profiles
    as profile
    on profile.id =
      response.completed_by
  where definition.section_key =
      trim(
        requested_section_key
      )
    and definition.subject_type =
      trim(
        requested_subject_type
      )
    and definition.is_active =
      true
    and item.is_active =
      true
    and definition.version = (
      select max(
        current_definition.version
      )
      from public.organizer_review_checklist_definitions
        as current_definition
      where current_definition.section_key =
          definition.section_key
        and current_definition.subject_type =
          definition.subject_type
        and current_definition.is_active =
          true
    )
  order by
    item.display_order,
    item.id;
end;
$function$;

-- ----------------------------------------------------------
-- Complete or reopen one checklist item.
-- ----------------------------------------------------------

drop function if exists
public.set_organizer_review_checklist_item(
  uuid,
  text,
  text,
  uuid,
  uuid,
  boolean
);

create function
public.set_organizer_review_checklist_item(
  requested_organizer_id uuid,
  requested_section_key text,
  requested_subject_type text,
  requested_subject_id uuid,
  requested_item_id uuid,
  requested_is_completed boolean
)
returns table (
  item_id uuid,
  is_completed boolean,
  completed_by uuid,
  completed_by_name text,
  completed_at timestamptz,
  completed_items integer,
  required_items integer,
  total_items integer,
  completion_percentage integer
)
language plpgsql
security definer
set search_path = ''
as $function$
#variable_conflict use_column
declare
  current_user_id uuid;
  selected_item
    public.organizer_review_checklist_items;
  selected_definition
    public.organizer_review_checklist_definitions;
  saved_response
    public.organizer_review_checklist_responses;
  completed_count integer;
  required_count integer;
  total_count integer;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if not public.current_user_can_manage_records() then
    raise exception
      'You do not have permission to update review checklists.';
  end if;

  if requested_organizer_id is null
    or requested_subject_id is null
    or requested_item_id is null then
    raise exception
      'Organizer, subject, and checklist item identifiers are required.';
  end if;

  select item.*
  into selected_item
  from public.organizer_review_checklist_items
    as item
  where item.id =
      requested_item_id
    and item.is_active =
      true;

  if not found then
    raise exception
      'The selected checklist item was not found.';
  end if;

  select definition.*
  into selected_definition
  from public.organizer_review_checklist_definitions
    as definition
  where definition.id =
      selected_item.definition_id
    and definition.section_key =
      trim(
        requested_section_key
      )
    and definition.subject_type =
      trim(
        requested_subject_type
      )
    and definition.is_active =
      true;

  if not found then
    raise exception
      'The checklist item does not belong to the requested review section.';
  end if;

  insert into
  public.organizer_review_checklist_responses (
    organizer_id,
    subject_type,
    subject_id,
    checklist_item_id,
    is_completed,
    completed_by,
    completed_at,
    updated_by
  )
  values (
    requested_organizer_id,
    trim(
      requested_subject_type
    ),
    requested_subject_id,
    selected_item.id,
    requested_is_completed,
    case
      when requested_is_completed
        then current_user_id
      else null
    end,
    case
      when requested_is_completed
        then timezone(
          'utc',
          now()
        )
      else null
    end,
    current_user_id
  )
  on conflict (
    subject_type,
    subject_id,
    checklist_item_id
  )
  do update set
    organizer_id =
      excluded.organizer_id,
    is_completed =
      excluded.is_completed,
    completed_by =
      excluded.completed_by,
    completed_at =
      excluded.completed_at,
    updated_by =
      current_user_id
  returning *
  into saved_response;

  select
    count(*) filter (
      where coalesce(
        response.is_completed,
        false
      )
    )::integer,
    count(*) filter (
      where item.is_required
    )::integer,
    count(*)::integer
  into
    completed_count,
    required_count,
    total_count
  from public.organizer_review_checklist_items
    as item
  left join public.organizer_review_checklist_responses
    as response
    on response.organizer_id =
      requested_organizer_id
    and response.subject_type =
      trim(
        requested_subject_type
      )
    and response.subject_id =
      requested_subject_id
    and response.checklist_item_id =
      item.id
  where item.definition_id =
      selected_definition.id
    and item.is_active =
      true;

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
    case
      when requested_is_completed
        then 'organizer_review_checklist_item_completed'
      else 'organizer_review_checklist_item_reopened'
    end,
    'organizer_review_checklist_response',
    saved_response.id,
    jsonb_build_object(
      'checklist_item_id',
      selected_item.id,
      'item_key',
      selected_item.item_key,
      'is_completed',
      saved_response.is_completed
    ),
    jsonb_build_object(
      'organizer_id',
      requested_organizer_id,
      'section_key',
      selected_definition.section_key,
      'subject_type',
      selected_definition.subject_type,
      'subject_id',
      requested_subject_id
    )
  );

  return query
  select
    saved_response.checklist_item_id,
    saved_response.is_completed,
    saved_response.completed_by,
    case
      when saved_response.completed_by is null
        then null
      else coalesce(
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
      )
    end,
    saved_response.completed_at,
    completed_count,
    required_count,
    total_count,
    case
      when total_count = 0
        then 0
      else round(
        (
          completed_count::numeric /
          total_count::numeric
        ) * 100
      )::integer
    end
  from public.profiles
    as profile
  where profile.id =
    current_user_id

  union all

  select
    saved_response.checklist_item_id,
    saved_response.is_completed,
    null,
    null,
    null,
    completed_count,
    required_count,
    total_count,
    case
      when total_count = 0
        then 0
      else round(
        (
          completed_count::numeric /
          total_count::numeric
        ) * 100
      )::integer
    end
  where saved_response.completed_by is null;
end;
$function$;

revoke all
on function public.get_organizer_review_checklist(
  uuid,
  text,
  text,
  uuid
)
from public, anon;

revoke all
on function public.set_organizer_review_checklist_item(
  uuid,
  text,
  text,
  uuid,
  uuid,
  boolean
)
from public, anon;

grant execute
on function public.get_organizer_review_checklist(
  uuid,
  text,
  text,
  uuid
)
to authenticated;

grant execute
on function public.set_organizer_review_checklist_item(
  uuid,
  text,
  text,
  uuid,
  uuid,
  boolean
)
to authenticated;

commit;
