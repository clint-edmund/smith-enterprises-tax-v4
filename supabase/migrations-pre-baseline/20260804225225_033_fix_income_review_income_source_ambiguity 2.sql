-- ==========================================================
-- Smith Enterprises Tax Management
-- Sprint 12.7.3D
-- Correct staff Income review RPC ambiguity
--
-- Source:
-- Exact function definitions exported from the deployed Supabase database.
--
-- Change:
-- Adds #variable_conflict use_column to each PL/pgSQL function and
-- properly terminates every CREATE OR REPLACE FUNCTION statement.
-- ==========================================================

begin;

CREATE OR REPLACE FUNCTION public.save_income_review_notes(requested_income_source_id uuid, requested_internal_notes text)
 RETURNS TABLE(review_id uuid, income_source_id uuid, review_status text, internal_notes text, reviewed_by uuid, reviewed_by_name text, reviewed_at timestamp with time zone, follow_up_requested_at timestamp with time zone, returned_to_client_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
#variable_conflict use_column
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

CREATE OR REPLACE FUNCTION public.mark_income_review_complete(requested_income_source_id uuid)
 RETURNS TABLE(review_id uuid, income_source_id uuid, review_status text, internal_notes text, reviewed_by uuid, reviewed_by_name text, reviewed_at timestamp with time zone, follow_up_requested_at timestamp with time zone, returned_to_client_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
#variable_conflict use_column
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

CREATE OR REPLACE FUNCTION public.mark_income_review_needs_followup(requested_income_source_id uuid, requested_internal_notes text DEFAULT NULL::text)
 RETURNS TABLE(review_id uuid, income_source_id uuid, review_status text, internal_notes text, reviewed_by uuid, reviewed_by_name text, reviewed_at timestamp with time zone, follow_up_requested_at timestamp with time zone, returned_to_client_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
#variable_conflict use_column
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

CREATE OR REPLACE FUNCTION public.return_income_record_to_client(requested_income_source_id uuid, requested_internal_notes text DEFAULT NULL::text)
 RETURNS TABLE(review_id uuid, income_source_id uuid, review_status text, internal_notes text, reviewed_by uuid, reviewed_by_name text, reviewed_at timestamp with time zone, follow_up_requested_at timestamp with time zone, returned_to_client_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
#variable_conflict use_column
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

commit;
