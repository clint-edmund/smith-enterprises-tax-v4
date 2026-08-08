


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."app_role" AS ENUM (
    'administrator',
    'manager',
    'preparer',
    'reviewer',
    'receptionist',
    'read_only'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."client_portal_status" AS ENUM (
    'invited',
    'active',
    'disabled'
);


ALTER TYPE "public"."client_portal_status" OWNER TO "postgres";


CREATE TYPE "public"."client_status" AS ENUM (
    'active',
    'inactive',
    'archived'
);


ALTER TYPE "public"."client_status" OWNER TO "postgres";


CREATE TYPE "public"."filing_status" AS ENUM (
    'single',
    'married_filing_jointly',
    'married_filing_separately',
    'head_of_household',
    'qualifying_surviving_spouse',
    'not_applicable'
);


ALTER TYPE "public"."filing_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_method" AS ENUM (
    'cash',
    'check',
    'credit_card',
    'debit_card',
    'ach',
    'money_order',
    'other'
);


ALTER TYPE "public"."payment_method" OWNER TO "postgres";


CREATE TYPE "public"."portal_account_status" AS ENUM (
    'inactive',
    'active',
    'locked'
);


ALTER TYPE "public"."portal_account_status" OWNER TO "postgres";


CREATE TYPE "public"."portal_invitation_status" AS ENUM (
    'pending',
    'accepted',
    'expired',
    'revoked'
);


ALTER TYPE "public"."portal_invitation_status" OWNER TO "postgres";


CREATE TYPE "public"."return_status" AS ENUM (
    'not_started',
    'documents_pending',
    'in_progress',
    'ready_for_review',
    'under_review',
    'ready_to_file',
    'filed',
    'accepted',
    'rejected',
    'completed',
    'on_hold'
);


ALTER TYPE "public"."return_status" OWNER TO "postgres";


CREATE TYPE "public"."return_type" AS ENUM (
    'individual',
    'business',
    'amended',
    'extension',
    'other'
);


ALTER TYPE "public"."return_type" OWNER TO "postgres";


CREATE TYPE "public"."tax_form_type" AS ENUM (
    '1040',
    '1040_nr',
    '1041',
    '1065',
    '1120',
    '1120_s',
    '990',
    'schedule_c',
    'state_only',
    'other'
);


ALTER TYPE "public"."tax_form_type" OWNER TO "postgres";


CREATE TYPE "public"."tax_organizer_section_key" AS ENUM (
    'personal',
    'identity',
    'banking',
    'dependents',
    'income',
    'business',
    'rental',
    'healthcare',
    'education',
    'deductions',
    'documents',
    'review',
    'signature'
);


ALTER TYPE "public"."tax_organizer_section_key" OWNER TO "postgres";


CREATE TYPE "public"."tax_organizer_section_status" AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'needs_attention'
);


ALTER TYPE "public"."tax_organizer_section_status" OWNER TO "postgres";


CREATE TYPE "public"."tax_organizer_status" AS ENUM (
    'not_started',
    'in_progress',
    'submitted',
    'under_review',
    'changes_requested',
    'approved'
);


ALTER TYPE "public"."tax_organizer_status" OWNER TO "postgres";


CREATE TYPE "public"."tax_return_workflow_status" AS ENUM (
    'intake',
    'documents_pending',
    'ready_for_preparation',
    'in_preparation',
    'review',
    'signature_pending',
    'ready_to_file',
    'filed',
    'completed',
    'on_hold'
);


ALTER TYPE "public"."tax_return_workflow_status" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."security_acknowledgments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notice_version" "text" NOT NULL,
    "accepted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_agent" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "security_acknowledgments_version_length" CHECK ((("length"(TRIM(BOTH FROM "notice_version")) >= 1) AND ("length"(TRIM(BOTH FROM "notice_version")) <= 50)))
);

ALTER TABLE ONLY "public"."security_acknowledgments" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."security_acknowledgments" OWNER TO "postgres";


COMMENT ON TABLE "public"."security_acknowledgments" IS 'Versioned records showing that an authenticated staff member accepted the system authorized-use notice.';



CREATE OR REPLACE FUNCTION "public"."accept_security_notice"("requested_notice_version" "text", "requested_user_agent" "text" DEFAULT NULL::"text", "requested_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "public"."security_acknowledgments"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare acknowledgment_record public.security_acknowledgments;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
if requested_notice_version is null
or length(trim(requested_notice_version)) = 0 then raise exception 'A notice version is required.';
end if;
insert into public.security_acknowledgments (
    user_id,
    notice_version,
    user_agent,
    metadata
  )
values (
    auth.uid(),
    trim(requested_notice_version),
    nullif(trim(requested_user_agent), ''),
    coalesce(requested_metadata, '{}'::jsonb)
  ) on conflict (user_id, notice_version) do
update
set user_agent = excluded.user_agent,
  metadata = excluded.metadata
returning * into acknowledgment_record;
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values,
    metadata
  )
values (
    auth.uid(),
    'security_notice_accepted',
    'security_acknowledgment',
    acknowledgment_record.id,
    jsonb_build_object(
      'notice_version',
      acknowledgment_record.notice_version,
      'accepted_at',
      acknowledgment_record.accepted_at
    ),
    jsonb_build_object(
      'user_agent',
      requested_user_agent
    ) || coalesce(requested_metadata, '{}'::jsonb)
  );
return acknowledgment_record;
end;
$$;


ALTER FUNCTION "public"."accept_security_notice"("requested_notice_version" "text", "requested_user_agent" "text", "requested_metadata" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."accept_security_notice"("requested_notice_version" "text", "requested_user_agent" "text", "requested_metadata" "jsonb") IS 'Records an authorized-use acknowledgment and corresponding audit event.';



CREATE TABLE IF NOT EXISTS "public"."client_portal_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "status" "public"."portal_account_status" DEFAULT 'inactive'::"public"."portal_account_status" NOT NULL,
    "invitation_status" "public"."portal_invitation_status" DEFAULT 'pending'::"public"."portal_invitation_status" NOT NULL,
    "invitation_token_hash" "text",
    "invitation_sent_at" timestamp with time zone,
    "accepted_at" timestamp with time zone,
    "last_sign_in_at" timestamp with time zone,
    "failed_sign_in_attempts" integer DEFAULT 0 NOT NULL,
    "locked_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "invitation_expires_at" timestamp with time zone,
    "auth_user_id" "uuid"
);


ALTER TABLE "public"."client_portal_accounts" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."activate_client_portal_account"("requested_token_hash" "text") RETURNS "public"."client_portal_accounts"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
  current_user_email text;
  normalized_token_hash text;
  portal_account public.client_portal_accounts;
  activated_account public.client_portal_accounts;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  normalized_token_hash :=
    trim(
      coalesce(
        requested_token_hash,
        ''
      )
    );

  if normalized_token_hash = '' then
    raise exception
      'An invitation token is required.';
  end if;

  select
    lower(
      trim(
        coalesce(
          auth.jwt() ->> 'email',
          ''
        )
      )
    )
  into current_user_email;

  if current_user_email = '' then
    raise exception
      'The authenticated account does not have an email address.';
  end if;

  select account.*
  into portal_account
  from public.client_portal_accounts account
  where account.invitation_token_hash =
    normalized_token_hash
  for update;

  if not found then
    raise exception
      'The invitation is invalid or no longer available.';
  end if;

  if portal_account.invitation_status = 'accepted' then
    raise exception
      'This invitation has already been accepted.';
  end if;

  if portal_account.invitation_status = 'revoked' then
    raise exception
      'This invitation has been revoked.';
  end if;

  if portal_account.invitation_expires_at is null
    or portal_account.invitation_expires_at <= now()
  then
    raise exception
      'This invitation has expired.';
  end if;

  if lower(trim(portal_account.email)) <>
    current_user_email
  then
    raise exception
      'The authenticated email does not match this invitation.';
  end if;

  if portal_account.auth_user_id is not null
    and portal_account.auth_user_id <>
      current_user_id
  then
    raise exception
      'This portal account is already linked to another user.';
  end if;

  update public.client_portal_accounts
  set
    auth_user_id =
      current_user_id,

    status =
      'active',

    invitation_status =
      'accepted',

    accepted_at =
      now(),

    invitation_token_hash =
      null,

    failed_sign_in_attempts =
      0,

    locked_at =
      null,

    updated_at =
      now()
  where id =
    portal_account.id
  returning *
  into activated_account;

  insert into public.audit_logs (
    action,
    actor_id,
    entity_type,
    entity_id,
    metadata,
    old_values,
    new_values
  )
  values (
    'client_portal_account_activated',
    current_user_id,
    'client_portal_account',
    activated_account.id,
    jsonb_build_object(
      'client_id',
      activated_account.client_id,
      'email',
      activated_account.email
    ),
    jsonb_build_object(
      'status',
      portal_account.status,
      'invitation_status',
      portal_account.invitation_status
    ),
    jsonb_build_object(
      'status',
      activated_account.status,
      'invitation_status',
      activated_account.invitation_status
    )
  );

  return activated_account;
end;
$$;


ALTER FUNCTION "public"."activate_client_portal_account"("requested_token_hash" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_suffix" "text", "requested_relationship" "text", "requested_birth_date" "date", "requested_is_full_time_student" boolean, "requested_is_permanently_disabled" boolean, "requested_lived_with_taxpayer_all_year" boolean, "requested_months_lived_with_taxpayer" smallint, "requested_us_citizen_or_resident" boolean, "requested_claimed_by_another_taxpayer" boolean) RETURNS TABLE("dependent_id" "uuid", "organizer_id" "uuid", "first_name" "text", "middle_name" "text", "last_name" "text", "suffix" "text", "relationship" "text", "birth_date" "date", "is_full_time_student" boolean, "is_permanently_disabled" boolean, "lived_with_taxpayer_all_year" boolean, "months_lived_with_taxpayer" smallint, "us_citizen_or_resident" boolean, "claimed_by_another_taxpayer" boolean, "display_order" integer, "section_status" "public"."tax_organizer_section_status", "section_progress_percentage" integer, "organizer_progress_percentage" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  new_dependent_id uuid;
  next_display_order integer;

  completed_section_count integer;
  total_section_count integer;
  calculated_organizer_progress integer;

  current_saved_at timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if nullif(
    trim(
      requested_first_name
    ),
    ''
  ) is null then
    raise exception
      'The dependent first name is required.';
  end if;

  if nullif(
    trim(
      requested_last_name
    ),
    ''
  ) is null then
    raise exception
      'The dependent last name is required.';
  end if;

  if nullif(
    trim(
      requested_relationship
    ),
    ''
  ) is null then
    raise exception
      'The dependent relationship is required.';
  end if;

  if requested_relationship not in (
    'son',
    'daughter',
    'stepson',
    'stepdaughter',
    'foster_child',
    'brother',
    'sister',
    'stepbrother',
    'stepsister',
    'half_brother',
    'half_sister',
    'grandchild',
    'parent',
    'grandparent',
    'niece',
    'nephew',
    'other_relative',
    'non_relative'
  ) then
    raise exception
      'The selected dependent relationship is invalid.';
  end if;

  if requested_birth_date is null then
    raise exception
      'The dependent date of birth is required.';
  end if;

  if requested_birth_date >
      current_date then
    raise exception
      'The dependent date of birth cannot be in the future.';
  end if;

  if requested_months_lived_with_taxpayer
      is null
    or requested_months_lived_with_taxpayer
      not between 0 and 12
  then
    raise exception
      'Months lived with the taxpayer must be between 0 and 12.';
  end if;

  if (
    requested_lived_with_taxpayer_all_year = true
    and requested_months_lived_with_taxpayer <> 12
  ) then
    raise exception
      'A dependent who lived with the taxpayer all year must have 12 months recorded.';
  end if;

  if (
    requested_lived_with_taxpayer_all_year = false
    and requested_months_lived_with_taxpayer = 12
  ) then
    raise exception
      'Select lived all year when 12 months are recorded.';
  end if;

  current_saved_at :=
    now();

  select
    coalesce(
      max(
        dependent_record.display_order
      ),
      -1
    ) + 1
  into
    next_display_order
  from public.client_tax_organizer_dependents
    as dependent_record
  where dependent_record.organizer_id =
    requested_organizer_id;

  insert into
    public.client_tax_organizer_dependents (
      organizer_id,
      first_name,
      middle_name,
      last_name,
      suffix,
      relationship,
      birth_date,
      is_full_time_student,
      is_permanently_disabled,
      lived_with_taxpayer_all_year,
      months_lived_with_taxpayer,
      us_citizen_or_resident,
      claimed_by_another_taxpayer,
      display_order,
      created_at,
      updated_at
    )
  values (
    requested_organizer_id,

    trim(
      requested_first_name
    ),

    nullif(
      trim(
        requested_middle_name
      ),
      ''
    ),

    trim(
      requested_last_name
    ),

    nullif(
      trim(
        requested_suffix
      ),
      ''
    ),

    trim(
      requested_relationship
    ),

    requested_birth_date,

    coalesce(
      requested_is_full_time_student,
      false
    ),

    coalesce(
      requested_is_permanently_disabled,
      false
    ),

    coalesce(
      requested_lived_with_taxpayer_all_year,
      false
    ),

    requested_months_lived_with_taxpayer,

    coalesce(
      requested_us_citizen_or_resident,
      true
    ),

    coalesce(
      requested_claimed_by_another_taxpayer,
      false
    ),

    next_display_order,

    current_saved_at,

    current_saved_at
  )
  returning id
  into new_dependent_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      'in_progress'
        ::public.tax_organizer_section_status,

    progress_percentage =
      greatest(
        organizer_section.progress_percentage,
        50
      ),

    started_at =
      coalesce(
        organizer_section.started_at,
        current_saved_at
      ),

    completed_at =
      null,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'dependents';

  select
    count(*) filter (
      where organizer_section.status =
        'completed'
    ),

    count(*)
  into
    completed_section_count,
    total_section_count
  from public.client_tax_organizer_sections
    as organizer_section
  where organizer_section.organizer_id =
    requested_organizer_id;

  calculated_organizer_progress :=
    case
      when total_section_count = 0
      then 0
      else round(
        (
          completed_section_count::numeric /
          total_section_count::numeric
        ) * 100
      )::integer
    end;

  update public.client_tax_organizers
    as tax_organizer
  set
    status =
      case
        when tax_organizer.status =
          'not_started'
        then 'in_progress'
          ::public.tax_organizer_status
        else tax_organizer.status
      end,

    current_section =
      'dependents'
        ::public.tax_organizer_section_key,

    progress_percentage =
      calculated_organizer_progress,

    started_at =
      coalesce(
        tax_organizer.started_at,
        current_saved_at
      ),

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    dependent_record.id,

    dependent_record.organizer_id,

    dependent_record.first_name,

    dependent_record.middle_name,

    dependent_record.last_name,

    dependent_record.suffix,

    dependent_record.relationship,

    dependent_record.birth_date,

    dependent_record.is_full_time_student,

    dependent_record.is_permanently_disabled,

    dependent_record.lived_with_taxpayer_all_year,

    dependent_record.months_lived_with_taxpayer,

    dependent_record.us_citizen_or_resident,

    dependent_record.claimed_by_another_taxpayer,

    dependent_record.display_order,

    'in_progress'
      ::public.tax_organizer_section_status,

    50,

    calculated_organizer_progress,

    dependent_record.created_at,

    dependent_record.updated_at
  from public.client_tax_organizer_dependents
    as dependent_record
  where dependent_record.id =
    new_dependent_id;
end;
$$;


ALTER FUNCTION "public"."add_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_suffix" "text", "requested_relationship" "text", "requested_birth_date" "date", "requested_is_full_time_student" boolean, "requested_is_permanently_disabled" boolean, "requested_lived_with_taxpayer_all_year" boolean, "requested_months_lived_with_taxpayer" smallint, "requested_us_citizen_or_resident" boolean, "requested_claimed_by_another_taxpayer" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."add_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_suffix" "text", "requested_relationship" "text", "requested_birth_date" "date", "requested_is_full_time_student" boolean, "requested_is_permanently_disabled" boolean, "requested_lived_with_taxpayer_all_year" boolean, "requested_months_lived_with_taxpayer" smallint, "requested_us_citizen_or_resident" boolean, "requested_claimed_by_another_taxpayer" boolean) IS 'Adds a non-sensitive dependent record to an editable tax organizer owned by the authenticated client. Protected identifiers must be stored separately in the Secure Vault.';



CREATE OR REPLACE FUNCTION "public"."add_organizer_review_staff_note"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_note_text" "text") RETURNS TABLE("entry_id" "uuid", "organizer_id" "uuid", "section_key" "text", "subject_type" "text", "subject_id" "uuid", "event_type" "text", "note_text" "text", "actor_id" "uuid", "actor_name" "text", "metadata" "jsonb", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
#variable_conflict use_column
declare
  current_user_id uuid;
  normalized_section_key text;
  normalized_subject_type text;
  normalized_note_text text;
  saved_entry public.organizer_review_timeline_entries;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  if not public.current_user_can_manage_records() then
    raise exception 'You do not have permission to add review timeline notes.';
  end if;

  normalized_section_key := trim(coalesce(requested_section_key, ''));
  normalized_subject_type := trim(coalesce(requested_subject_type, ''));
  normalized_note_text := trim(coalesce(requested_note_text, ''));

  if requested_organizer_id is null then
    raise exception 'An organizer identifier is required.';
  end if;

  if requested_subject_id is null then
    raise exception 'A timeline subject identifier is required.';
  end if;

  if normalized_section_key = '' then
    raise exception 'A review section is required.';
  end if;

  if normalized_subject_type = '' then
    raise exception 'A timeline subject type is required.';
  end if;

  if normalized_note_text = '' then
    raise exception 'A staff note is required.';
  end if;

  if char_length(normalized_note_text) > 10000 then
    raise exception 'The staff note cannot exceed 10,000 characters.';
  end if;

  insert into public.organizer_review_timeline_entries (
    organizer_id,
    section_key,
    subject_type,
    subject_id,
    event_type,
    note_text,
    actor_id,
    metadata
  ) values (
    requested_organizer_id,
    normalized_section_key,
    normalized_subject_type,
    requested_subject_id,
    'staff_note',
    normalized_note_text,
    current_user_id,
    jsonb_build_object('source', 'staff_organizer_review')
  )
  returning * into saved_entry;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values,
    metadata
  ) values (
    current_user_id,
    'organizer_review_staff_note_added',
    'organizer_review_timeline_entry',
    saved_entry.id,
    jsonb_build_object(
      'section_key', saved_entry.section_key,
      'subject_type', saved_entry.subject_type,
      'subject_id', saved_entry.subject_id,
      'event_type', saved_entry.event_type,
      'note_text', saved_entry.note_text
    ),
    jsonb_build_object('organizer_id', saved_entry.organizer_id)
  );

  return query
  select
    saved_entry.id,
    saved_entry.organizer_id,
    saved_entry.section_key,
    saved_entry.subject_type,
    saved_entry.subject_id,
    saved_entry.event_type,
    saved_entry.note_text,
    saved_entry.actor_id,
    coalesce(
      nullif(trim(profile.display_name), ''),
      nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''),
      profile.email,
      'Unknown Staff Member'
    ),
    saved_entry.metadata,
    saved_entry.created_at
  from public.profiles as profile
  where profile.id = current_user_id;
end;
$$;


ALTER FUNCTION "public"."add_organizer_review_staff_note"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_note_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_organizer_review_workflow_event"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_event_type" "text", "requested_note_text" "text", "requested_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS TABLE("entry_id" "uuid", "organizer_id" "uuid", "section_key" "text", "subject_type" "text", "subject_id" "uuid", "event_type" "text", "note_text" "text", "actor_id" "uuid", "actor_name" "text", "metadata" "jsonb", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
#variable_conflict use_column
declare
  current_user_id uuid;
  normalized_section_key text;
  normalized_subject_type text;
  normalized_event_type text;
  normalized_note_text text;
  saved_entry public.organizer_review_timeline_entries;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  if not public.current_user_can_manage_records() then
    raise exception 'You do not have permission to record review workflow events.';
  end if;

  if requested_organizer_id is null or requested_subject_id is null then
    raise exception 'Organizer and review subject identifiers are required.';
  end if;

  normalized_section_key := trim(coalesce(requested_section_key, ''));
  normalized_subject_type := trim(coalesce(requested_subject_type, ''));
  normalized_event_type := trim(coalesce(requested_event_type, ''));
  normalized_note_text := trim(coalesce(requested_note_text, ''));

  if normalized_section_key = '' or normalized_subject_type = '' then
    raise exception 'Review section and subject type are required.';
  end if;

  if normalized_event_type not in (
    'marked_reviewed', 'needs_follow_up', 'returned_to_client',
    'resubmitted', 'status_changed'
  ) then
    raise exception 'Unsupported review workflow event type: %', normalized_event_type;
  end if;

  if normalized_event_type in (
    'marked_reviewed', 'needs_follow_up', 'returned_to_client'
  ) and normalized_note_text = '' then
    raise exception 'A review explanation is required.';
  end if;

  if char_length(normalized_note_text) > 10000 then
    raise exception 'The review explanation cannot exceed 10,000 characters.';
  end if;

  insert into public.organizer_review_timeline_entries (
    organizer_id, section_key, subject_type, subject_id, event_type,
    note_text, actor_id, metadata
  )
  values (
    requested_organizer_id, normalized_section_key, normalized_subject_type,
    requested_subject_id, normalized_event_type, nullif(normalized_note_text, ''),
    current_user_id, coalesce(requested_metadata, '{}'::jsonb) ||
      jsonb_build_object('source', 'staff_organizer_review')
  )
  returning * into saved_entry;

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id, new_values, metadata
  )
  values (
    current_user_id,
    'organizer_review_workflow_event_added',
    'organizer_review_timeline_entry',
    saved_entry.id,
    jsonb_build_object(
      'section_key', saved_entry.section_key,
      'subject_type', saved_entry.subject_type,
      'subject_id', saved_entry.subject_id,
      'event_type', saved_entry.event_type,
      'note_text', saved_entry.note_text
    ),
    jsonb_build_object('organizer_id', saved_entry.organizer_id)
  );

  return query
  select
    saved_entry.id, saved_entry.organizer_id, saved_entry.section_key,
    saved_entry.subject_type, saved_entry.subject_id, saved_entry.event_type,
    saved_entry.note_text, saved_entry.actor_id,
    coalesce(
      nullif(trim(profile.display_name), ''),
      nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''),
      profile.email, 'Unknown Staff Member'
    ),
    saved_entry.metadata, saved_entry.created_at
  from public.profiles as profile
  where profile.id = current_user_id;
end;
$$;


ALTER FUNCTION "public"."add_organizer_review_workflow_event"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_event_type" "text", "requested_note_text" "text", "requested_metadata" "jsonb") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "tax_return_id" "uuid",
    "category" "text" DEFAULT 'miscellaneous'::"text" NOT NULL,
    "status" "text" DEFAULT 'uploaded'::"text" NOT NULL,
    "original_file_name" "text" NOT NULL,
    "storage_bucket" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "mime_type" "text" NOT NULL,
    "size_bytes" bigint NOT NULL,
    "description" "text",
    "uploaded_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "archived_at" timestamp with time zone,
    "is_favorite" boolean DEFAULT false NOT NULL,
    "file_hash" "text",
    "hash_algorithm" "text" DEFAULT 'SHA-256'::"text" NOT NULL,
    "version_group_id" "uuid" NOT NULL,
    "version_number" integer DEFAULT 1 NOT NULL,
    "is_current_version" boolean DEFAULT true NOT NULL,
    "previous_version_id" "uuid",
    "version_notes" "text",
    "review_status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "review_requested_by" "uuid",
    "review_requested_at" timestamp with time zone,
    "reviewed_by" "uuid",
    "reviewed_by_name" "text",
    "reviewed_at" timestamp with time zone,
    "review_comments" "text",
    "assigned_reviewer_id" "uuid",
    "assigned_reviewer_name" "text",
    "review_due_at" timestamp with time zone,
    CONSTRAINT "client_documents_category_check" CHECK (("category" = ANY (ARRAY['identity'::"text", 'income'::"text", 'deductions'::"text", 'business'::"text", 'irs_notice'::"text", 'prior_return'::"text", 'engagement'::"text", 'internal'::"text", 'miscellaneous'::"text"]))),
    CONSTRAINT "client_documents_previous_version_not_self_check" CHECK ((("previous_version_id" IS NULL) OR ("previous_version_id" <> "id"))),
    CONSTRAINT "client_documents_review_comments_length_check" CHECK ((("review_comments" IS NULL) OR ("char_length"("review_comments") <= 2000))),
    CONSTRAINT "client_documents_review_metadata_check" CHECK (((("review_status" = ANY (ARRAY['draft'::"text", 'pending_review'::"text"])) AND ("reviewed_at" IS NULL) AND ("reviewed_by" IS NULL)) OR (("review_status" = ANY (ARRAY['approved'::"text", 'needs_changes'::"text"])) AND ("reviewed_at" IS NOT NULL) AND ("reviewed_by" IS NOT NULL)))),
    CONSTRAINT "client_documents_review_request_metadata_check" CHECK ((("review_status" <> 'pending_review'::"text") OR ("review_requested_at" IS NOT NULL))),
    CONSTRAINT "client_documents_review_status_check" CHECK (("review_status" = ANY (ARRAY['draft'::"text", 'pending_review'::"text", 'approved'::"text", 'needs_changes'::"text"]))),
    CONSTRAINT "client_documents_size_bytes_check" CHECK (("size_bytes" > 0)),
    CONSTRAINT "client_documents_status_check" CHECK (("status" = ANY (ARRAY['uploaded'::"text", 'verified'::"text", 'rejected'::"text", 'archived'::"text"]))),
    CONSTRAINT "client_documents_version_number_check" CHECK (("version_number" > 0))
);


ALTER TABLE "public"."client_documents" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_documents" IS 'Secure metadata for client and tax-return documents stored in Supabase Storage.';



COMMENT ON COLUMN "public"."client_documents"."review_status" IS 'Document review state: draft, pending_review, approved, or needs_changes.';



COMMENT ON COLUMN "public"."client_documents"."review_requested_by" IS 'Authenticated user who submitted the document for review.';



COMMENT ON COLUMN "public"."client_documents"."review_requested_at" IS 'Time the current version was submitted for review.';



COMMENT ON COLUMN "public"."client_documents"."reviewed_by" IS 'Authenticated user who approved the document or requested changes.';



COMMENT ON COLUMN "public"."client_documents"."reviewed_by_name" IS 'Display name captured when the document review decision was made.';



COMMENT ON COLUMN "public"."client_documents"."reviewed_at" IS 'Time the current review decision was recorded.';



COMMENT ON COLUMN "public"."client_documents"."review_comments" IS 'Reviewer comments associated with the current review decision.';



CREATE OR REPLACE FUNCTION "public"."approve_document"("p_document_id" "uuid", "p_comments" "text" DEFAULT NULL::"text") RETURNS "public"."client_documents"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_document public.client_documents;
    v_reviewer_name text;
BEGIN
    SELECT
        COALESCE(
            display_name,
            TRIM(
                COALESCE(first_name, '') || ' ' ||
                COALESCE(last_name, '')
            ),
            email
        )
    INTO v_reviewer_name
    FROM public.profiles
    WHERE id = auth.uid();

    UPDATE public.client_documents
    SET
        review_status = 'approved',
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        reviewed_by_name = COALESCE(v_reviewer_name, 'Unknown Reviewer'),
        review_comments = p_comments,
        updated_at = now()
    WHERE id = p_document_id
      AND review_status = 'pending_review'
    RETURNING *
    INTO v_document;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Document was not found or is no longer pending review.';
    END IF;

    RETURN v_document;
END;
$$;


ALTER FUNCTION "public"."approve_document"("p_document_id" "uuid", "p_comments" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_client_document"("requested_document_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  previous_document public.client_documents;
  archived_document public.client_documents;
begin
  if not public.current_user_can_manage_records() then
    raise exception 'You are not authorized to archive client documents.';
  end if;

  select *
  into previous_document
  from public.client_documents
  where id = requested_document_id
    and archived_at is null;

  if not found then
    raise exception 'The document could not be found.';
  end if;

  update public.client_documents
  set
    status = 'archived',
    archived_at = timezone('utc', now())
  where id = requested_document_id
  returning *
  into archived_document;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata
  )
  values (
    auth.uid(),
    'document_archived',
    'document',
    archived_document.id,
    jsonb_build_object(
      'status',
      previous_document.status,
      'archived_at',
      previous_document.archived_at
    ),
    jsonb_build_object(
      'status',
      archived_document.status,
      'archived_at',
      archived_document.archived_at
    ),
    jsonb_build_object(
      'client_id',
      archived_document.client_id,
      'tax_return_id',
      archived_document.tax_return_id,
      'original_file_name',
      archived_document.original_file_name
    )
  );
end;
$$;


ALTER FUNCTION "public"."archive_client_document"("requested_document_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."assign_tax_return_preparer"("requested_return_id" "uuid", "requested_preparer_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  current_return public.tax_returns%rowtype;
  selected_preparer public.profiles%rowtype;
  previous_preparer_id uuid;
  previous_preparer_name text;
  selected_preparer_name text;
  activity_action text;
begin
  if auth.uid() is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_can_manage_records() then
    raise exception
      'You are not authorized to assign tax returns.';
  end if;

  select tax_return.*
  into current_return
  from public.tax_returns as tax_return
  where tax_return.id = requested_return_id
  for update;

  if not found then
    raise exception
      'The tax return was not found.';
  end if;

  previous_preparer_id :=
    current_return.assigned_preparer_id;

  if previous_preparer_id is not null then
    select coalesce(
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
      'Unknown Staff Member'
    )
    into previous_preparer_name
    from public.profiles as profile
    where profile.id = previous_preparer_id;
  end if;

  if requested_preparer_id is not null then
    select profile.*
    into selected_preparer
    from public.profiles as profile
    where profile.id = requested_preparer_id
      and profile.is_active = true;

    if not found then
      raise exception
        'The selected preparer is not an active staff member.';
    end if;

    if selected_preparer.role not in (
      'administrator',
      'manager',
      'preparer'
    ) then
      raise exception
        'The selected staff member cannot be assigned as a preparer.';
    end if;

    selected_preparer_name :=
      coalesce(
        nullif(
          selected_preparer.display_name,
          ''
        ),
        nullif(
          concat_ws(
            ' ',
            selected_preparer.first_name,
            selected_preparer.last_name
          ),
          ''
        ),
        selected_preparer.email,
        'Unknown Staff Member'
      );
  end if;

  if previous_preparer_id
    is not distinct from
    requested_preparer_id
  then
    return;
  end if;

  update public.tax_returns
  set
    assigned_preparer_id =
      requested_preparer_id,
    updated_at =
      now()
  where id = requested_return_id;

  activity_action :=
    case
      when requested_preparer_id is null
        then 'return_preparer_unassigned'
      else 'return_preparer_assigned'
    end;

  insert into public.audit_logs (
    action,
    entity_type,
    entity_id,
    actor_id,
    old_values,
    new_values,
    metadata
  )
  values (
    activity_action,
    'tax_return',
    requested_return_id,
    auth.uid(),
    jsonb_build_object(
      'assigned_preparer_id',
      previous_preparer_id,
      'assigned_preparer_name',
      previous_preparer_name
    ),
    jsonb_build_object(
      'assigned_preparer_id',
      requested_preparer_id,
      'assigned_preparer_name',
      selected_preparer_name
    ),
    jsonb_build_object(
      'source',
      'dashboard_priority_queue',
      'client_id',
      current_return.client_id,
      'tax_year',
      current_return.tax_year,
      'return_type',
      current_return.return_type
    )
  );
end;
$$;


ALTER FUNCTION "public"."assign_tax_return_preparer"("requested_return_id" "uuid", "requested_preparer_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."assign_tax_return_preparer"("requested_return_id" "uuid", "requested_preparer_id" "uuid") IS 'Assigns or removes a tax-return preparer and records the change in the audit log.';



CREATE OR REPLACE FUNCTION "public"."can_view_executive_financial_analytics"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    public.current_user_is_active()
    and (
      public.current_user_is_admin()
      or public.current_user_role() = 'manager'
    );
$$;


ALTER FUNCTION "public"."can_view_executive_financial_analytics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_client_portal_activation"("requested_token_hash" "text") RETURNS TABLE("portal_profile_id" "uuid", "client_id" "uuid", "email" "text", "activated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
  current_user_email text;
  normalized_token_hash text;
  portal_account public.client_portal_accounts;
  portal_profile public.client_portal_profiles;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  normalized_token_hash :=
    trim(
      coalesce(
        requested_token_hash,
        ''
      )
    );

  if normalized_token_hash = '' then
    raise exception
      'An invitation token is required.';
  end if;

  current_user_email :=
    lower(
      trim(
        coalesce(
          auth.jwt() ->> 'email',
          ''
        )
      )
    );

  if current_user_email = '' then
    raise exception
      'The authenticated account does not have an email address.';
  end if;

  select account.*
  into portal_account
  from public.client_portal_accounts account
  where account.invitation_token_hash =
    normalized_token_hash
  for update;

  if not found then
    raise exception
      'The invitation is invalid or no longer available.';
  end if;

  if portal_account.invitation_status = 'accepted' then
    raise exception
      'This invitation has already been accepted.';
  end if;

  if portal_account.invitation_status = 'revoked' then
    raise exception
      'This invitation has been revoked.';
  end if;

  if portal_account.invitation_expires_at is null
    or portal_account.invitation_expires_at <= now()
  then
    raise exception
      'This invitation has expired.';
  end if;

  if lower(trim(portal_account.email)) <>
    current_user_email
  then
    raise exception
      'The authenticated email does not match this invitation.';
  end if;

  if portal_account.auth_user_id is not null
    and portal_account.auth_user_id <>
      current_user_id
  then
    raise exception
      'This portal account is already linked to another user.';
  end if;

  update public.client_portal_accounts
  set
    auth_user_id =
      current_user_id,

    status =
      'active',

    invitation_status =
      'accepted',

    accepted_at =
      now(),

    invitation_token_hash =
      null,

    failed_sign_in_attempts =
      0,

    locked_at =
      null,

    updated_at =
      now()
  where id =
    portal_account.id;

  insert into public.client_portal_profiles (
    auth_user_id,
    client_id,
    email,
    portal_status,
    invited_at,
    activated_at,
    created_at,
    updated_at
  )
  values (
    current_user_id,
    portal_account.client_id,
    portal_account.email,
    'active',
    portal_account.invitation_sent_at,
    now(),
    now(),
    now()
  )
  on conflict (auth_user_id)
  do update
  set
    client_id =
      excluded.client_id,

    email =
      excluded.email,

    portal_status =
      'active',

    activated_at =
      coalesce(
        public.client_portal_profiles.activated_at,
        excluded.activated_at
      ),

    updated_at =
      now()
  returning *
  into portal_profile;

  insert into public.audit_logs (
    action,
    actor_id,
    entity_type,
    entity_id,
    metadata,
    old_values,
    new_values
  )
  values (
    'client_portal_activation_completed',
    current_user_id,
    'client_portal_profile',
    portal_profile.id,
    jsonb_build_object(
      'client_id',
      portal_profile.client_id,
      'email',
      portal_profile.email,
      'portal_account_id',
      portal_account.id
    ),
    null,
    jsonb_build_object(
      'portal_status',
      portal_profile.portal_status,
      'activated_at',
      portal_profile.activated_at
    )
  );

  return query
  select
    portal_profile.id,
    portal_profile.client_id,
    portal_profile.email,
    portal_profile.activated_at;
end;
$$;


ALTER FUNCTION "public"."complete_client_portal_activation"("requested_token_hash" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_required_document"("requested_required_document_id" "uuid", "requested_document_id" "uuid" DEFAULT NULL::"uuid", "requested_is_complete" boolean DEFAULT true, "requested_notes" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "tax_return_id" "uuid", "template_id" "uuid", "name" "text", "description" "text", "category" "text", "is_required" boolean, "is_complete" boolean, "matched_document_id" "uuid", "completed_at" timestamp with time zone, "completed_by" "uuid", "notes" "text", "sort_order" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  selected_item public.return_required_documents%rowtype;
  selected_document public.client_documents%rowtype;
begin
  if not public.current_user_can_manage_records() then
    raise exception 'You are not authorized to update required documents.';
  end if;

  select *
  into selected_item
  from public.return_required_documents
  where return_required_documents.id =
    requested_required_document_id;

  if not found then
    raise exception 'Required document item not found.';
  end if;

  if requested_document_id is not null then
    select *
    into selected_document
    from public.client_documents
    where client_documents.id = requested_document_id;

    if not found then
      raise exception 'Uploaded document not found.';
    end if;

    if selected_document.tax_return_id is distinct from
      selected_item.tax_return_id then
      raise exception
        'The uploaded document does not belong to this tax return.';
    end if;

    if selected_document.status = 'archived' then
      raise exception
        'An archived document cannot satisfy a required document.';
    end if;
  end if;

  update public.return_required_documents
  set
    is_complete = requested_is_complete,
    matched_document_id = case
      when requested_is_complete then requested_document_id
      else null
    end,
    completed_at = case
      when requested_is_complete then now()
      else null
    end,
    completed_by = case
      when requested_is_complete then auth.uid()
      else null
    end,
    notes = nullif(trim(requested_notes), ''),
    updated_by = auth.uid()
  where return_required_documents.id =
    requested_required_document_id;

  return query
  select
    item.id,
    item.tax_return_id,
    item.template_id,
    item.name,
    item.description,
    item.category,
    item.is_required,
    item.is_complete,
    item.matched_document_id,
    item.completed_at,
    item.completed_by,
    item.notes,
    item.sort_order,
    item.created_at,
    item.updated_at
  from public.return_required_documents as item
  where item.id = requested_required_document_id;
end;
$$;


ALTER FUNCTION "public"."complete_required_document"("requested_required_document_id" "uuid", "requested_document_id" "uuid", "requested_is_complete" boolean, "requested_notes" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_businesses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "business_name" "text" DEFAULT ''::"text" NOT NULL,
    "dba_name" "text" DEFAULT ''::"text" NOT NULL,
    "entity_type" "text" DEFAULT ''::"text" NOT NULL,
    "employer_identification_number" "text" DEFAULT ''::"text" NOT NULL,
    "principal_business_activity" "text" DEFAULT ''::"text" NOT NULL,
    "business_code" "text" DEFAULT ''::"text" NOT NULL,
    "address_line_1" "text" DEFAULT ''::"text" NOT NULL,
    "address_line_2" "text" DEFAULT ''::"text" NOT NULL,
    "city" "text" DEFAULT ''::"text" NOT NULL,
    "state" "text" DEFAULT ''::"text" NOT NULL,
    "postal_code" "text" DEFAULT ''::"text" NOT NULL,
    "country" "text" DEFAULT 'United States'::"text" NOT NULL,
    "date_started" "date",
    "date_closed" "date",
    "ownership_percentage" numeric(5,2),
    "accounting_method" "text" DEFAULT ''::"text" NOT NULL,
    "was_active_during_tax_year" boolean,
    "has_home_office" boolean,
    "has_employees" boolean,
    "has_inventory" boolean,
    "uses_vehicle" boolean,
    "bookkeeping_complete" boolean,
    "gross_receipts" numeric(14,2) DEFAULT 0 NOT NULL,
    "returns_and_allowances" numeric(14,2) DEFAULT 0 NOT NULL,
    "other_business_income" numeric(14,2) DEFAULT 0 NOT NULL,
    "cost_of_goods_sold" numeric(14,2) DEFAULT 0 NOT NULL,
    "advertising_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "car_and_truck_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "commissions_and_fees_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "contract_labor_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "depreciation_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "employee_benefit_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "insurance_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "interest_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "legal_and_professional_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "office_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "pension_and_profit_sharing_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "rent_or_lease_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "repairs_and_maintenance_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "supplies_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "taxes_and_licenses_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "travel_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "deductible_meals_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "utilities_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "wages_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "other_expense" numeric(14,2) DEFAULT 0 NOT NULL,
    "other_expense_description" "text" DEFAULT ''::"text" NOT NULL,
    "notes" "text" DEFAULT ''::"text" NOT NULL,
    "record_status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "organizer_business_accounting_method_valid" CHECK (("accounting_method" = ANY (ARRAY[''::"text", 'cash'::"text", 'accrual'::"text", 'other'::"text"]))),
    CONSTRAINT "organizer_business_amounts_nonnegative" CHECK ((("gross_receipts" >= (0)::numeric) AND ("returns_and_allowances" >= (0)::numeric) AND ("other_business_income" >= (0)::numeric) AND ("cost_of_goods_sold" >= (0)::numeric) AND ("advertising_expense" >= (0)::numeric) AND ("car_and_truck_expense" >= (0)::numeric) AND ("commissions_and_fees_expense" >= (0)::numeric) AND ("contract_labor_expense" >= (0)::numeric) AND ("depreciation_expense" >= (0)::numeric) AND ("employee_benefit_expense" >= (0)::numeric) AND ("insurance_expense" >= (0)::numeric) AND ("interest_expense" >= (0)::numeric) AND ("legal_and_professional_expense" >= (0)::numeric) AND ("office_expense" >= (0)::numeric) AND ("pension_and_profit_sharing_expense" >= (0)::numeric) AND ("rent_or_lease_expense" >= (0)::numeric) AND ("repairs_and_maintenance_expense" >= (0)::numeric) AND ("supplies_expense" >= (0)::numeric) AND ("taxes_and_licenses_expense" >= (0)::numeric) AND ("travel_expense" >= (0)::numeric) AND ("deductible_meals_expense" >= (0)::numeric) AND ("utilities_expense" >= (0)::numeric) AND ("wages_expense" >= (0)::numeric) AND ("other_expense" >= (0)::numeric))),
    CONSTRAINT "organizer_business_dates_valid" CHECK ((("date_closed" IS NULL) OR ("date_started" IS NULL) OR ("date_closed" >= "date_started"))),
    CONSTRAINT "organizer_business_display_order_valid" CHECK (("display_order" >= 0)),
    CONSTRAINT "organizer_business_ein_valid" CHECK ((("employer_identification_number" = ''::"text") OR ("employer_identification_number" ~ '^[0-9]{2}-?[0-9]{7}$'::"text"))),
    CONSTRAINT "organizer_business_entity_type_valid" CHECK (("entity_type" = ANY (ARRAY[''::"text", 'sole_proprietorship'::"text", 'single_member_llc'::"text", 'partnership'::"text", 'multi_member_llc'::"text", 's_corporation'::"text", 'c_corporation'::"text", 'farm'::"text", 'other'::"text"]))),
    CONSTRAINT "organizer_business_notes_length" CHECK (("char_length"("notes") <= 10000)),
    CONSTRAINT "organizer_business_other_description_length" CHECK (("char_length"("other_expense_description") <= 1000)),
    CONSTRAINT "organizer_business_ownership_valid" CHECK ((("ownership_percentage" IS NULL) OR (("ownership_percentage" >= (0)::numeric) AND ("ownership_percentage" <= (100)::numeric)))),
    CONSTRAINT "organizer_business_record_status_valid" CHECK (("record_status" = ANY (ARRAY['draft'::"text", 'complete'::"text", 'needs_review'::"text"]))),
    CONSTRAINT "organizer_business_state_valid" CHECK ((("state" = ''::"text") OR ("state" ~ '^[A-Z]{2}$'::"text")))
);

ALTER TABLE ONLY "public"."client_tax_organizer_businesses" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_businesses" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_tax_organizer_businesses" IS 'Client-entered business organizer records used for staff review and TaxWise preparation.';



CREATE OR REPLACE FUNCTION "public"."create_client_organizer_business"("requested_organizer_id" "uuid", "requested_business" "jsonb") RETURNS SETOF "public"."client_tax_organizer_businesses"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  saved_at timestamptz := timezone('utc', now());
  next_order integer;
  saved_business public.client_tax_organizer_businesses;
  name_value text;
  dba_value text;
  entity_value text;
  activity_value text;
  active_value boolean;
begin
  perform public.require_client_business_organizer_access(
    requested_organizer_id, true
  );

  if requested_business is null
    or jsonb_typeof(requested_business) <> 'object'
  then
    raise exception 'Business information is required.';
  end if;

  name_value := trim(coalesce(requested_business->>'business_name', ''));
  dba_value := trim(coalesce(requested_business->>'dba_name', ''));
  entity_value := trim(coalesce(requested_business->>'entity_type', ''));
  activity_value := trim(coalesce(
    requested_business->>'principal_business_activity', ''
  ));
  active_value := case
    when requested_business ? 'was_active_during_tax_year'
    then (requested_business->>'was_active_during_tax_year')::boolean
    else null
  end;

  if name_value = '' and dba_value = '' then
    raise exception 'Enter a business name or DBA.';
  end if;
  if entity_value = '' then
    raise exception 'Select a business entity type.';
  end if;
  if activity_value = '' then
    raise exception 'Enter the principal business activity.';
  end if;
  if active_value is null then
    raise exception
      'Confirm whether the business was active during the tax year.';
  end if;

  select coalesce(max(business.display_order), -1) + 1
  into next_order
  from public.client_tax_organizer_businesses as business
  where business.organizer_id = requested_organizer_id;

  insert into public.client_tax_organizer_businesses
  select
    gen_random_uuid(),
    requested_organizer_id,
    name_value,
    dba_value,
    entity_value,
    trim(coalesce(requested_business->>'employer_identification_number', '')),
    activity_value,
    trim(coalesce(requested_business->>'business_code', '')),
    trim(coalesce(requested_business->>'address_line_1', '')),
    trim(coalesce(requested_business->>'address_line_2', '')),
    trim(coalesce(requested_business->>'city', '')),
    upper(trim(coalesce(requested_business->>'state', ''))),
    trim(coalesce(requested_business->>'postal_code', '')),
    trim(coalesce(nullif(requested_business->>'country', ''), 'United States')),
    nullif(requested_business->>'date_started', '')::date,
    nullif(requested_business->>'date_closed', '')::date,
    nullif(requested_business->>'ownership_percentage', '')::numeric,
    trim(coalesce(requested_business->>'accounting_method', '')),
    active_value,
    (requested_business->>'has_home_office')::boolean,
    (requested_business->>'has_employees')::boolean,
    (requested_business->>'has_inventory')::boolean,
    (requested_business->>'uses_vehicle')::boolean,
    (requested_business->>'bookkeeping_complete')::boolean,
    coalesce((requested_business->>'gross_receipts')::numeric, 0),
    coalesce((requested_business->>'returns_and_allowances')::numeric, 0),
    coalesce((requested_business->>'other_business_income')::numeric, 0),
    coalesce((requested_business->>'cost_of_goods_sold')::numeric, 0),
    coalesce((requested_business->>'advertising_expense')::numeric, 0),
    coalesce((requested_business->>'car_and_truck_expense')::numeric, 0),
    coalesce((requested_business->>'commissions_and_fees_expense')::numeric, 0),
    coalesce((requested_business->>'contract_labor_expense')::numeric, 0),
    coalesce((requested_business->>'depreciation_expense')::numeric, 0),
    coalesce((requested_business->>'employee_benefit_expense')::numeric, 0),
    coalesce((requested_business->>'insurance_expense')::numeric, 0),
    coalesce((requested_business->>'interest_expense')::numeric, 0),
    coalesce((requested_business->>'legal_and_professional_expense')::numeric, 0),
    coalesce((requested_business->>'office_expense')::numeric, 0),
    coalesce((requested_business->>'pension_and_profit_sharing_expense')::numeric, 0),
    coalesce((requested_business->>'rent_or_lease_expense')::numeric, 0),
    coalesce((requested_business->>'repairs_and_maintenance_expense')::numeric, 0),
    coalesce((requested_business->>'supplies_expense')::numeric, 0),
    coalesce((requested_business->>'taxes_and_licenses_expense')::numeric, 0),
    coalesce((requested_business->>'travel_expense')::numeric, 0),
    coalesce((requested_business->>'deductible_meals_expense')::numeric, 0),
    coalesce((requested_business->>'utilities_expense')::numeric, 0),
    coalesce((requested_business->>'wages_expense')::numeric, 0),
    coalesce((requested_business->>'other_expense')::numeric, 0),
    trim(coalesce(requested_business->>'other_expense_description', '')),
    trim(coalesce(requested_business->>'notes', '')),
    'complete',
    next_order,
    saved_at,
    saved_at
  returning * into saved_business;

  insert into public.client_tax_organizer_business_responses (
    organizer_id, has_business_activity, created_at, updated_at
  )
  values (requested_organizer_id, true, saved_at, saved_at)
  on conflict (organizer_id)
  do update set has_business_activity = true, updated_at = saved_at;

  perform public.refresh_client_business_organizer_progress(
    requested_organizer_id
  );

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id, new_values, metadata
  )
  values (
    auth.uid(),
    'client_business_created',
    'client_tax_organizer_business',
    saved_business.id,
    to_jsonb(saved_business),
    jsonb_build_object(
      'organizer_id', requested_organizer_id,
      'section_key', 'business'
    )
  );

  return next saved_business;
end;
$$;


ALTER FUNCTION "public"."create_client_organizer_business"("requested_organizer_id" "uuid", "requested_business" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_provider_name" "text", "requested_coverage_type" "text", "requested_covered_person_name" "text", "requested_policy_number" "text", "requested_start_month" integer, "requested_end_month" integer, "requested_is_full_year_coverage" boolean, "requested_document_received" boolean, "requested_document_type" "text", "requested_notes" "text") RETURNS TABLE("coverage_id" "uuid", "organizer_id" "uuid", "provider_name" "text", "coverage_type" "text", "covered_person_name" "text", "policy_number" "text", "start_month" integer, "end_month" integer, "is_full_year_coverage" boolean, "document_received" boolean, "document_type" "text", "notes" "text", "record_status" "text", "display_order" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  normalized_start_month integer;
  normalized_end_month integer;
  next_display_order integer;
  new_coverage_id uuid;
  current_saved_at timestamptz;
  required_fields_complete boolean;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if nullif(
    trim(
      requested_provider_name
    ),
    ''
  ) is null then
    raise exception
      'The healthcare provider name is required.';
  end if;

  if nullif(
    trim(
      requested_covered_person_name
    ),
    ''
  ) is null then
    raise exception
      'The covered person name is required.';
  end if;

  if requested_coverage_type not in (
    'employer',
    'marketplace',
    'medicare',
    'medicaid',
    'cobra',
    'private',
    'military',
    'other'
  ) then
    raise exception
      'The selected healthcare coverage type is invalid.';
  end if;

  if requested_document_type is not null
    and trim(requested_document_type) <> ''
    and requested_document_type not in (
      '1095_a',
      '1095_b',
      '1095_c',
      'insurance_card',
      'other'
    )
  then
    raise exception
      'The selected healthcare document type is invalid.';
  end if;

  if requested_is_full_year_coverage then
    normalized_start_month :=
      1;

    normalized_end_month :=
      12;
  else
    normalized_start_month :=
      requested_start_month;

    normalized_end_month :=
      requested_end_month;
  end if;

  if normalized_start_month is not null
    and normalized_start_month not between 1 and 12
  then
    raise exception
      'The coverage start month is invalid.';
  end if;

  if normalized_end_month is not null
    and normalized_end_month not between 1 and 12
  then
    raise exception
      'The coverage end month is invalid.';
  end if;

  if normalized_start_month is not null
    and normalized_end_month is not null
    and normalized_start_month >
      normalized_end_month
  then
    raise exception
      'The coverage start month cannot be after the end month.';
  end if;

  current_saved_at :=
    now();

  required_fields_complete :=
    nullif(
      trim(
        requested_provider_name
      ),
      ''
    ) is not null
    and nullif(
      trim(
        requested_covered_person_name
      ),
      ''
    ) is not null
    and (
      requested_is_full_year_coverage
      or (
        normalized_start_month is not null
        and normalized_end_month is not null
      )
    )
    and coalesce(
      requested_document_received,
      false
    );

  select
    coalesce(
      max(
        coverage.display_order
      ),
      -1
    ) + 1
  into
    next_display_order
  from public.client_tax_organizer_healthcare_coverages
    as coverage
  where coverage.organizer_id =
    requested_organizer_id;

  insert into
    public.client_tax_organizer_healthcare_coverages (
      organizer_id,
      provider_name,
      coverage_type,
      covered_person_name,
      policy_number,
      start_month,
      end_month,
      is_full_year_coverage,
      document_received,
      document_type,
      notes,
      record_status,
      display_order,
      created_at,
      updated_at
    )
  values (
    requested_organizer_id,

    trim(
      requested_provider_name
    ),

    requested_coverage_type,

    trim(
      requested_covered_person_name
    ),

    nullif(
      trim(
        requested_policy_number
      ),
      ''
    ),

    normalized_start_month,

    normalized_end_month,

    coalesce(
      requested_is_full_year_coverage,
      false
    ),

    coalesce(
      requested_document_received,
      false
    ),

    nullif(
      trim(
        requested_document_type
      ),
      ''
    ),

    nullif(
      trim(
        requested_notes
      ),
      ''
    ),

    case
      when required_fields_complete
      then 'complete'
      else 'draft'
    end,

    next_display_order,

    current_saved_at,

    current_saved_at
  )
  returning id
  into new_coverage_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      'in_progress'
        ::public.tax_organizer_section_status,

    progress_percentage =
      greatest(
        organizer_section.progress_percentage,
        case
          when required_fields_complete
          then 50
          else 25
        end
      ),

    started_at =
      coalesce(
        organizer_section.started_at,
        current_saved_at
      ),

    completed_at =
      null,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'healthcare';

  update public.client_tax_organizers
    as tax_organizer
  set
    status =
      case
        when tax_organizer.status =
          'not_started'
        then
          'in_progress'
            ::public.tax_organizer_status
        else
          tax_organizer.status
      end,

    current_section =
      'healthcare'
        ::public.tax_organizer_section_key,

    started_at =
      coalesce(
        tax_organizer.started_at,
        current_saved_at
      ),

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    coverage.id,

    coverage.organizer_id,

    coverage.provider_name,

    coverage.coverage_type,

    coverage.covered_person_name,

    coverage.policy_number,

    coverage.start_month,

    coverage.end_month,

    coverage.is_full_year_coverage,

    coverage.document_received,

    coverage.document_type,

    coverage.notes,

    coverage.record_status,

    coverage.display_order,

    coverage.created_at,

    coverage.updated_at

  from public.client_tax_organizer_healthcare_coverages
    as coverage

  where coverage.id =
    new_coverage_id;
end;
$$;


ALTER FUNCTION "public"."create_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_provider_name" "text", "requested_coverage_type" "text", "requested_covered_person_name" "text", "requested_policy_number" "text", "requested_start_month" integer, "requested_end_month" integer, "requested_is_full_year_coverage" boolean, "requested_document_received" boolean, "requested_document_type" "text", "requested_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_provider_name" "text", "requested_coverage_type" "text", "requested_covered_person_name" "text", "requested_policy_number" "text", "requested_start_month" integer, "requested_end_month" integer, "requested_is_full_year_coverage" boolean, "requested_document_received" boolean, "requested_document_type" "text", "requested_notes" "text") IS 'Creates a healthcare coverage record owned by the authenticated client.';



CREATE OR REPLACE FUNCTION "public"."create_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_type" "text", "requested_payer_name" "text", "requested_recipient_type" "text", "requested_notes" "text") RETURNS TABLE("income_source_id" "uuid", "organizer_id" "uuid", "income_type" "text", "payer_name" "text", "recipient_type" "text", "record_status" "text", "document_received" boolean, "notes" "text", "display_order" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  new_income_source_id uuid;
  next_display_order integer;
  current_saved_at timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if requested_income_type not in (
    'w2',
    '1099_nec',
    '1099_misc',
    '1099_k',
    '1099_int',
    '1099_div',
    '1099_r',
    'ssa_1099',
    '1099_g',
    'other'
  ) then
    raise exception
      'The selected income type is invalid.';
  end if;

  if nullif(
    trim(
      requested_payer_name
    ),
    ''
  ) is null then
    raise exception
      'The payer or employer name is required.';
  end if;

  if requested_recipient_type not in (
    'taxpayer',
    'spouse',
    'dependent',
    'joint'
  ) then
    raise exception
      'The selected recipient type is invalid.';
  end if;

  current_saved_at :=
    now();

  select
    coalesce(
      max(
        income_source.display_order
      ),
      -1
    ) + 1
  into
    next_display_order
  from public.client_tax_organizer_income_sources
    as income_source
  where income_source.organizer_id =
    requested_organizer_id;

  insert into
    public.client_tax_organizer_income_sources (
      organizer_id,
      income_type,
      payer_name,
      recipient_type,
      record_status,
      document_received,
      notes,
      display_order,
      created_at,
      updated_at
    )
  values (
    requested_organizer_id,

    requested_income_type,

    trim(
      requested_payer_name
    ),

    requested_recipient_type,

    'draft',

    false,

    nullif(
      trim(
        requested_notes
      ),
      ''
    ),

    next_display_order,

    current_saved_at,

    current_saved_at
  )
  returning id
  into new_income_source_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      'in_progress'
        ::public.tax_organizer_section_status,

    progress_percentage =
      greatest(
        organizer_section.progress_percentage,
        25
      ),

    started_at =
      coalesce(
        organizer_section.started_at,
        current_saved_at
      ),

    completed_at =
      null,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'income';

  update public.client_tax_organizers
    as tax_organizer
  set
    status =
      case
        when tax_organizer.status =
          'not_started'
        then 'in_progress'
          ::public.tax_organizer_status
        else tax_organizer.status
      end,

    current_section =
      'income'
        ::public.tax_organizer_section_key,

    started_at =
      coalesce(
        tax_organizer.started_at,
        current_saved_at
      ),

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    income_source.id,

    income_source.organizer_id,

    income_source.income_type,

    income_source.payer_name,

    income_source.recipient_type,

    income_source.record_status,

    income_source.document_received,

    income_source.notes,

    income_source.display_order,

    income_source.created_at,

    income_source.updated_at
  from public.client_tax_organizer_income_sources
    as income_source
  where income_source.id =
    new_income_source_id;
end;
$$;


ALTER FUNCTION "public"."create_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_type" "text", "requested_payer_name" "text", "requested_recipient_type" "text", "requested_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_type" "text", "requested_payer_name" "text", "requested_recipient_type" "text", "requested_notes" "text") IS 'Creates a common organizer income-source record owned by the authenticated client. Type-specific values are stored separately.';



CREATE OR REPLACE FUNCTION "public"."create_client_portal_account"("requested_client_id" "uuid", "requested_email" "text", "requested_invitation_token_hash" "text", "requested_invitation_expires_at" timestamp with time zone) RETURNS "public"."client_portal_accounts"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$declare
  current_user_id uuid;
  normalized_email text;
  existing_account public.client_portal_accounts;
  created_account public.client_portal_accounts;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
      and profile.role in (
        'administrator',
        'manager'
      )
  ) then
    raise exception
      'You are not authorized to create client portal invitations.';
  end if;

  if requested_client_id is null then
    raise exception
      'A client identifier is required.';
  end if;

  normalized_email :=
    lower(
      trim(
        coalesce(
          requested_email,
          ''
        )
      )
    );

  if normalized_email = '' then
    raise exception
      'A client email address is required.';
  end if;

  if requested_invitation_token_hash is null
    or trim(
      requested_invitation_token_hash
    ) = ''
  then
    raise exception
      'An invitation token hash is required.';
  end if;

  if requested_invitation_expires_at is null then
    raise exception
      'An invitation expiration date is required.';
  end if;

  if requested_invitation_expires_at <= now() then
    raise exception
      'The invitation expiration date must be in the future.';
  end if;

  if not exists (
    select 1
    from public.clients client
    where client.id =
      requested_client_id
  ) then
    raise exception
      'The selected client was not found.';
  end if;

  select account.*
  into existing_account
  from public.client_portal_accounts account
  where account.client_id =
    requested_client_id
  for update;

  if found then
    raise exception
      'A portal account already exists for this client.';
  end if;

  insert into public.client_portal_accounts (
    client_id,
    email,
    status,
    invitation_status,
    invitation_token_hash,
    invitation_sent_at,
    invitation_expires_at,
    failed_sign_in_attempts,
    created_at,
    updated_at
  )
  values (
    requested_client_id,
    normalized_email,
    'inactive',
    'pending',
    trim(
      requested_invitation_token_hash
    ),
    now(),
    requested_invitation_expires_at,
    0,
    now(),
    now()
  )
  returning *
  into created_account;

  insert into public.audit_logs (
    action,
    actor_id,
    entity_type,
    entity_id,
    metadata,
    old_values,
    new_values
  )
  values (
    'client_portal_invitation_created',
    current_user_id,
    'client_portal_account',
    created_account.id,
    jsonb_build_object(
      'client_id',
      requested_client_id,
      'email',
      normalized_email,
      'invitation_expires_at',
      requested_invitation_expires_at
    ),
    null,
    jsonb_build_object(
      'status',
      created_account.status,
      'invitation_status',
      created_account.invitation_status
    )
  );

  return created_account;
end;$$;


ALTER FUNCTION "public"."create_client_portal_account"("requested_client_id" "uuid", "requested_email" "text", "requested_invitation_token_hash" "text", "requested_invitation_expires_at" timestamp with time zone) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_number" bigint NOT NULL,
    "first_name" "text" NOT NULL,
    "middle_name" "text",
    "last_name" "text" NOT NULL,
    "preferred_name" "text",
    "email" "text",
    "phone" "text",
    "alternate_phone" "text",
    "address_line_1" "text",
    "address_line_2" "text",
    "city" "text",
    "state" "text",
    "postal_code" "text",
    "birth_date" "date",
    "status" "public"."client_status" DEFAULT 'active'::"public"."client_status" NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "clients_alternate_phone_length" CHECK ((("alternate_phone" IS NULL) OR ("length"("alternate_phone") <= 30))),
    CONSTRAINT "clients_birth_date_valid" CHECK ((("birth_date" IS NULL) OR ("birth_date" <= CURRENT_DATE))),
    CONSTRAINT "clients_email_length" CHECK ((("email" IS NULL) OR ("length"("email") <= 320))),
    CONSTRAINT "clients_phone_length" CHECK ((("phone" IS NULL) OR ("length"("phone") <= 30))),
    CONSTRAINT "clients_postal_code_length" CHECK ((("postal_code" IS NULL) OR ("length"("postal_code") <= 20)))
);

ALTER TABLE ONLY "public"."clients" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" OWNER TO "postgres";


COMMENT ON TABLE "public"."clients" IS 'Smith Enterprises client records. Direct SSN storage is intentionally excluded from the initial schema.';



CREATE OR REPLACE FUNCTION "public"."create_client_record"("requested_first_name" "text", "requested_middle_name" "text" DEFAULT NULL::"text", "requested_last_name" "text" DEFAULT NULL::"text", "requested_preferred_name" "text" DEFAULT NULL::"text", "requested_email" "text" DEFAULT NULL::"text", "requested_phone" "text" DEFAULT NULL::"text", "requested_alternate_phone" "text" DEFAULT NULL::"text", "requested_address_line_1" "text" DEFAULT NULL::"text", "requested_address_line_2" "text" DEFAULT NULL::"text", "requested_city" "text" DEFAULT NULL::"text", "requested_state" "text" DEFAULT NULL::"text", "requested_postal_code" "text" DEFAULT NULL::"text", "requested_birth_date" "date" DEFAULT NULL::"date", "requested_status" "public"."client_status" DEFAULT 'active'::"public"."client_status", "requested_notes" "text" DEFAULT NULL::"text") RETURNS "public"."clients"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare client_record public.clients;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_can_manage_records() then raise exception 'You are not authorized to create clients.';
end if;
if nullif(trim(requested_first_name), '') is null then raise exception 'First name is required.';
end if;
if nullif(trim(requested_last_name), '') is null then raise exception 'Last name is required.';
end if;
insert into public.clients (
    first_name,
    middle_name,
    last_name,
    preferred_name,
    email,
    phone,
    alternate_phone,
    address_line_1,
    address_line_2,
    city,
    state,
    postal_code,
    birth_date,
    status,
    notes,
    created_by,
    updated_by
  )
values (
    trim(requested_first_name),
    nullif(trim(requested_middle_name), ''),
    trim(requested_last_name),
    nullif(trim(requested_preferred_name), ''),
    nullif(lower(trim(requested_email)), ''),
    nullif(trim(requested_phone), ''),
    nullif(trim(requested_alternate_phone), ''),
    nullif(trim(requested_address_line_1), ''),
    nullif(trim(requested_address_line_2), ''),
    nullif(trim(requested_city), ''),
    nullif(upper(trim(requested_state)), ''),
    nullif(trim(requested_postal_code), ''),
    requested_birth_date,
    requested_status,
    nullif(trim(requested_notes), ''),
    auth.uid(),
    auth.uid()
  )
returning * into client_record;
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values
  )
values (
    auth.uid(),
    'client_created',
    'client',
    client_record.id,
    jsonb_build_object(
      'client_number',
      client_record.client_number,
      'first_name',
      client_record.first_name,
      'last_name',
      client_record.last_name,
      'status',
      client_record.status
    )
  );
return client_record;
end;
$$;


ALTER FUNCTION "public"."create_client_record"("requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_preferred_name" "text", "requested_email" "text", "requested_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_birth_date" "date", "requested_status" "public"."client_status", "requested_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_client_record"("requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_preferred_name" "text", "requested_email" "text", "requested_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_birth_date" "date", "requested_status" "public"."client_status", "requested_notes" "text") IS 'Creates a client and writes the corresponding audit event.';



CREATE OR REPLACE FUNCTION "public"."create_document_version"("requested_document_id" "uuid", "requested_original_file_name" "text", "requested_storage_bucket" "text", "requested_storage_path" "text", "requested_mime_type" "text", "requested_size_bytes" bigint, "requested_version_notes" "text" DEFAULT NULL::"text", "requested_file_hash" "text" DEFAULT NULL::"text", "requested_hash_algorithm" "text" DEFAULT 'SHA-256'::"text") RETURNS SETOF "public"."client_documents"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $_$
declare
  source_document public.client_documents;
  created_document public.client_documents;
  resolved_version_group_id uuid;
  next_version_number integer;
  normalized_file_hash text;
  normalized_hash_algorithm text;
begin
  if not public.current_user_can_manage_records() then
    raise exception
      'You are not authorized to create document versions.';
  end if;

  select document.*
  into source_document
  from public.client_documents as document
  where document.id = requested_document_id
    and document.archived_at is null;

  if not found then
    raise exception
      'The selected document could not be found.';
  end if;

  if requested_storage_bucket <> 'client-documents' then
    raise exception
      'The document storage bucket is invalid.';
  end if;

  if requested_size_bytes <= 0
    or requested_size_bytes > 26214400 then
    raise exception
      'The document must be between 1 byte and 25 MB.';
  end if;

  if nullif(trim(requested_original_file_name), '') is null then
    raise exception
      'The original document file name is required.';
  end if;

  if nullif(trim(requested_storage_path), '') is null then
    raise exception
      'The document storage path is required.';
  end if;

  if nullif(trim(requested_mime_type), '') is null then
    raise exception
      'The document MIME type is required.';
  end if;

  normalized_file_hash :=
    lower(nullif(trim(requested_file_hash), ''));

  normalized_hash_algorithm :=
    upper(
      coalesce(
        nullif(trim(requested_hash_algorithm), ''),
        'SHA-256'
      )
    );

  if normalized_file_hash is not null
    and normalized_hash_algorithm <> 'SHA-256' then
    raise exception
      'The requested document hash algorithm is not supported.';
  end if;

  if normalized_file_hash is not null
    and normalized_file_hash !~ '^[0-9a-f]{64}$' then
    raise exception
      'The SHA-256 document fingerprint must contain 64 hexadecimal characters.';
  end if;

  resolved_version_group_id :=
    source_document.version_group_id;

  -- Lock the root document so two users cannot create
  -- the same version number simultaneously.
  perform 1
  from public.client_documents
  where id = resolved_version_group_id
  for update;

  select coalesce(max(document.version_number), 0) + 1
  into next_version_number
  from public.client_documents as document
  where document.version_group_id =
    resolved_version_group_id;

  update public.client_documents
  set
    is_current_version = false,
    updated_at = now()
  where version_group_id =
    resolved_version_group_id
    and is_current_version = true;

  insert into public.client_documents (
    client_id,
    tax_return_id,
    category,
    status,
    original_file_name,
    storage_bucket,
    storage_path,
    mime_type,
    size_bytes,
    file_hash,
    hash_algorithm,
    description,
    uploaded_by,
    version_group_id,
    version_number,
    is_current_version,
    previous_version_id,
    version_notes
  )
  values (
    source_document.client_id,
    source_document.tax_return_id,
    source_document.category,
    'uploaded',
    trim(requested_original_file_name),
    requested_storage_bucket,
    requested_storage_path,
    requested_mime_type,
    requested_size_bytes,
    normalized_file_hash,
    normalized_hash_algorithm,
    source_document.description,
    auth.uid(),
    resolved_version_group_id,
    next_version_number,
    true,
    source_document.id,
    nullif(trim(requested_version_notes), '')
  )
  returning *
  into created_document;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata
  )
  values (
    auth.uid(),
    'document_version_created',
    'document',
    created_document.id,
    jsonb_build_object(
      'previous_document_id',
      source_document.id,
      'previous_version_number',
      source_document.version_number
    ),
    jsonb_build_object(
      'document_id',
      created_document.id,
      'version_group_id',
      created_document.version_group_id,
      'version_number',
      created_document.version_number,
      'is_current_version',
      created_document.is_current_version,
      'original_file_name',
      created_document.original_file_name,
      'file_hash',
      created_document.file_hash,
      'hash_algorithm',
      created_document.hash_algorithm,
      'version_notes',
      created_document.version_notes
    ),
    jsonb_build_object(
      'client_id',
      created_document.client_id,
      'tax_return_id',
      created_document.tax_return_id,
      'storage_bucket',
      created_document.storage_bucket,
      'storage_path',
      created_document.storage_path
    )
  );

  return next created_document;
end;
$_$;


ALTER FUNCTION "public"."create_document_version"("requested_document_id" "uuid", "requested_original_file_name" "text", "requested_storage_bucket" "text", "requested_storage_path" "text", "requested_mime_type" "text", "requested_size_bytes" bigint, "requested_version_notes" "text", "requested_file_hash" "text", "requested_hash_algorithm" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_organizer_evidence_source"("requested_organizer_id" "uuid", "requested_return_id" "uuid", "requested_document_id" "uuid", "requested_evidence_type" "text", "requested_title" "text", "requested_description" "text", "requested_confidence" "text", "requested_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS TABLE("evidence_id" "uuid", "organizer_id" "uuid", "return_id" "uuid", "document_id" "uuid", "evidence_type" "text", "title" "text", "description" "text", "confidence" "text", "verification_status" "text", "created_by" "uuid", "created_by_name" "text", "verified_by" "uuid", "verified_by_name" "text", "verified_at" timestamp with time zone, "metadata" "jsonb", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
#variable_conflict use_column
declare
  current_user_id uuid;
  normalized_evidence_type text;
  normalized_title text;
  normalized_description text;
  normalized_confidence text;
  saved_evidence
    public.organizer_evidence_sources;
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
      'You do not have permission to create evidence sources.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  normalized_evidence_type :=
    trim(
      coalesce(
        requested_evidence_type,
        ''
      )
    );

  normalized_title :=
    trim(
      coalesce(
        requested_title,
        ''
      )
    );

  normalized_description :=
    nullif(
      trim(
        coalesce(
          requested_description,
          ''
        )
      ),
      ''
    );

  normalized_confidence :=
    trim(
      coalesce(
        requested_confidence,
        'unverified'
      )
    );

  if normalized_evidence_type = '' then
    raise exception
      'An evidence type is required.';
  end if;

  if normalized_title = '' then
    raise exception
      'An evidence title is required.';
  end if;

  if normalized_confidence not in (
    'high',
    'medium',
    'low',
    'unverified'
  ) then
    raise exception
      'Unsupported evidence confidence: %',
      normalized_confidence;
  end if;

  if not exists (
    select 1
    from public.client_tax_organizers
      as organizer
    where organizer.id =
      requested_organizer_id
  ) then
    raise exception
      'The requested organizer was not found.';
  end if;

  insert into
  public.organizer_evidence_sources (
    organizer_id,
    return_id,
    document_id,
    evidence_type,
    title,
    description,
    confidence,
    verification_status,
    created_by,
    metadata
  )
  values (
    requested_organizer_id,
    requested_return_id,
    requested_document_id,
    normalized_evidence_type,
    normalized_title,
    normalized_description,
    normalized_confidence,
    'unverified',
    current_user_id,
    coalesce(
      requested_metadata,
      '{}'::jsonb
    )
  )
  returning *
  into saved_evidence;

  insert into
  public.organizer_evidence_verification_events (
    evidence_id,
    action,
    actor_id,
    new_confidence,
    new_status,
    metadata
  )
  values (
    saved_evidence.id,
    'created',
    current_user_id,
    saved_evidence.confidence,
    saved_evidence.verification_status,
    jsonb_build_object(
      'organizer_id',
      saved_evidence.organizer_id
    )
  );

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
    'organizer_evidence_source_created',
    'organizer_evidence_source',
    saved_evidence.id,
    jsonb_build_object(
      'evidence_type',
      saved_evidence.evidence_type,
      'title',
      saved_evidence.title,
      'confidence',
      saved_evidence.confidence,
      'verification_status',
      saved_evidence.verification_status,
      'document_id',
      saved_evidence.document_id
    ),
    jsonb_build_object(
      'organizer_id',
      saved_evidence.organizer_id,
      'return_id',
      saved_evidence.return_id
    )
  );

  return query
  select
    saved_evidence.id,
    saved_evidence.organizer_id,
    saved_evidence.return_id,
    saved_evidence.document_id,
    saved_evidence.evidence_type,
    saved_evidence.title,
    saved_evidence.description,
    saved_evidence.confidence,
    saved_evidence.verification_status,
    saved_evidence.created_by,
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
      profile.email,
      'Unknown Staff Member'
    ),
    saved_evidence.verified_by,
    null,
    saved_evidence.verified_at,
    saved_evidence.metadata,
    saved_evidence.created_at,
    saved_evidence.updated_at
  from public.profiles
    as profile
  where profile.id =
    current_user_id;
end;
$$;


ALTER FUNCTION "public"."create_organizer_evidence_source"("requested_organizer_id" "uuid", "requested_return_id" "uuid", "requested_document_id" "uuid", "requested_evidence_type" "text", "requested_title" "text", "requested_description" "text", "requested_confidence" "text", "requested_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_return_assignment_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
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


ALTER FUNCTION "public"."create_return_assignment_notification"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tax_returns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "tax_year" integer NOT NULL,
    "return_type" "public"."return_type" DEFAULT 'individual'::"public"."return_type" NOT NULL,
    "status" "public"."return_status" DEFAULT 'not_started'::"public"."return_status" NOT NULL,
    "assigned_preparer_id" "uuid",
    "assigned_reviewer_id" "uuid",
    "date_received" "date",
    "due_date" "date",
    "filed_date" "date",
    "accepted_date" "date",
    "preparation_fee" numeric(12,2) DEFAULT 0 NOT NULL,
    "discount_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "tax_form" "public"."tax_form_type" DEFAULT '1040'::"public"."tax_form_type" NOT NULL,
    "filing_status" "public"."filing_status" DEFAULT 'not_applicable'::"public"."filing_status" NOT NULL,
    "description" "text",
    "federal_return_required" boolean DEFAULT true NOT NULL,
    "state_return_required" boolean DEFAULT false NOT NULL,
    "local_return_required" boolean DEFAULT false NOT NULL,
    "extension_filed" boolean DEFAULT false NOT NULL,
    "extension_date" "date",
    "estimated_refund" numeric(12,2) DEFAULT 0 NOT NULL,
    "estimated_amount_due" numeric(12,2) DEFAULT 0 NOT NULL,
    "workflow_status" "public"."tax_return_workflow_status" DEFAULT 'intake'::"public"."tax_return_workflow_status" NOT NULL,
    "workflow_status_changed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "assigned_at" timestamp with time zone,
    "workflow_hold_reason" "text",
    "workflow_held_at" timestamp with time zone,
    "workflow_completed_at" timestamp with time zone,
    CONSTRAINT "tax_returns_discount_amount_valid" CHECK (("discount_amount" >= (0)::numeric)),
    CONSTRAINT "tax_returns_discount_not_over_fee" CHECK (("discount_amount" <= "preparation_fee")),
    CONSTRAINT "tax_returns_estimated_amount_due_valid" CHECK (("estimated_amount_due" >= (0)::numeric)),
    CONSTRAINT "tax_returns_estimated_refund_valid" CHECK (("estimated_refund" >= (0)::numeric)),
    CONSTRAINT "tax_returns_extension_fields_valid" CHECK ((("extension_filed" = false) OR ("extension_date" IS NOT NULL))),
    CONSTRAINT "tax_returns_preparation_fee_valid" CHECK (("preparation_fee" >= (0)::numeric)),
    CONSTRAINT "tax_returns_tax_year_valid" CHECK ((("tax_year" >= 2000) AND ("tax_year" <= 2100))),
    CONSTRAINT "tax_returns_workflow_hold_reason_length_check" CHECK ((("workflow_hold_reason" IS NULL) OR ("char_length"("workflow_hold_reason") <= 1000)))
);

ALTER TABLE ONLY "public"."tax_returns" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."tax_returns" OWNER TO "postgres";


COMMENT ON TABLE "public"."tax_returns" IS 'Tax-return workflow records associated with clients.';



COMMENT ON COLUMN "public"."tax_returns"."assigned_preparer_id" IS 'User assigned to prepare or manage the tax return.';



COMMENT ON COLUMN "public"."tax_returns"."workflow_status" IS 'Current office workflow stage for the tax return.';



COMMENT ON COLUMN "public"."tax_returns"."workflow_status_changed_at" IS 'Date and time the workflow status last changed.';



COMMENT ON COLUMN "public"."tax_returns"."assigned_at" IS 'Date and time the return was assigned to a preparer.';



COMMENT ON COLUMN "public"."tax_returns"."workflow_hold_reason" IS 'Reason the tax return workflow was placed on hold.';



COMMENT ON COLUMN "public"."tax_returns"."workflow_held_at" IS 'Date and time the tax return workflow was placed on hold.';



COMMENT ON COLUMN "public"."tax_returns"."workflow_completed_at" IS 'Date and time the tax return workflow was completed.';



CREATE OR REPLACE FUNCTION "public"."create_tax_return_record"("requested_client_id" "uuid", "requested_tax_year" integer, "requested_return_type" "public"."return_type", "requested_tax_form" "public"."tax_form_type", "requested_filing_status" "public"."filing_status", "requested_status" "public"."return_status", "requested_assigned_preparer_id" "uuid" DEFAULT NULL::"uuid", "requested_assigned_reviewer_id" "uuid" DEFAULT NULL::"uuid", "requested_date_received" "date" DEFAULT NULL::"date", "requested_due_date" "date" DEFAULT NULL::"date", "requested_filed_date" "date" DEFAULT NULL::"date", "requested_accepted_date" "date" DEFAULT NULL::"date", "requested_preparation_fee" numeric DEFAULT 0, "requested_discount_amount" numeric DEFAULT 0, "requested_description" "text" DEFAULT NULL::"text", "requested_federal_return_required" boolean DEFAULT true, "requested_state_return_required" boolean DEFAULT false, "requested_local_return_required" boolean DEFAULT false, "requested_extension_filed" boolean DEFAULT false, "requested_extension_date" "date" DEFAULT NULL::"date", "requested_estimated_refund" numeric DEFAULT 0, "requested_estimated_amount_due" numeric DEFAULT 0, "requested_notes" "text" DEFAULT NULL::"text") RETURNS "public"."tax_returns"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare return_record public.tax_returns;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_can_manage_records() then raise exception 'You are not authorized to create tax returns.';
end if;
if requested_tax_year < 2000
or requested_tax_year > 2100 then raise exception 'Tax year is invalid.';
end if;
if requested_preparation_fee < 0 then raise exception 'Preparation fee cannot be negative.';
end if;
if requested_discount_amount < 0 then raise exception 'Discount cannot be negative.';
end if;
if requested_discount_amount > requested_preparation_fee then raise exception 'Discount cannot exceed preparation fee.';
end if;
if requested_estimated_refund < 0
or requested_estimated_amount_due < 0 then raise exception 'Estimated tax amounts cannot be negative.';
end if;
if requested_extension_filed = true
and requested_extension_date is null then raise exception 'Extension date is required when an extension is filed.';
end if;
if not exists (
  select 1
  from public.clients
  where id = requested_client_id
) then raise exception 'Client record was not found.';
end if;
insert into public.tax_returns (
    client_id,
    tax_year,
    return_type,
    tax_form,
    filing_status,
    status,
    assigned_preparer_id,
    assigned_reviewer_id,
    date_received,
    due_date,
    filed_date,
    accepted_date,
    preparation_fee,
    discount_amount,
    description,
    federal_return_required,
    state_return_required,
    local_return_required,
    extension_filed,
    extension_date,
    estimated_refund,
    estimated_amount_due,
    notes,
    created_by,
    updated_by
  )
values (
    requested_client_id,
    requested_tax_year,
    requested_return_type,
    requested_tax_form,
    requested_filing_status,
    requested_status,
    requested_assigned_preparer_id,
    requested_assigned_reviewer_id,
    requested_date_received,
    requested_due_date,
    requested_filed_date,
    requested_accepted_date,
    requested_preparation_fee,
    requested_discount_amount,
    nullif(trim(requested_description), ''),
    requested_federal_return_required,
    requested_state_return_required,
    requested_local_return_required,
    requested_extension_filed,
    requested_extension_date,
    requested_estimated_refund,
    requested_estimated_amount_due,
    nullif(trim(requested_notes), ''),
    auth.uid(),
    auth.uid()
  )
returning * into return_record;
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values
  )
values (
    auth.uid(),
    'tax_return_created',
    'tax_return',
    return_record.id,
    jsonb_build_object(
      'client_id',
      return_record.client_id,
      'tax_year',
      return_record.tax_year,
      'return_type',
      return_record.return_type,
      'tax_form',
      return_record.tax_form,
      'status',
      return_record.status,
      'assigned_preparer_id',
      return_record.assigned_preparer_id
    )
  );
return return_record;
end;
$$;


ALTER FUNCTION "public"."create_tax_return_record"("requested_client_id" "uuid", "requested_tax_year" integer, "requested_return_type" "public"."return_type", "requested_tax_form" "public"."tax_form_type", "requested_filing_status" "public"."filing_status", "requested_status" "public"."return_status", "requested_assigned_preparer_id" "uuid", "requested_assigned_reviewer_id" "uuid", "requested_date_received" "date", "requested_due_date" "date", "requested_filed_date" "date", "requested_accepted_date" "date", "requested_preparation_fee" numeric, "requested_discount_amount" numeric, "requested_description" "text", "requested_federal_return_required" boolean, "requested_state_return_required" boolean, "requested_local_return_required" boolean, "requested_extension_filed" boolean, "requested_extension_date" "date", "requested_estimated_refund" numeric, "requested_estimated_amount_due" numeric, "requested_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_tax_return_record"("requested_client_id" "uuid", "requested_tax_year" integer, "requested_return_type" "public"."return_type", "requested_tax_form" "public"."tax_form_type", "requested_filing_status" "public"."filing_status", "requested_status" "public"."return_status", "requested_assigned_preparer_id" "uuid", "requested_assigned_reviewer_id" "uuid", "requested_date_received" "date", "requested_due_date" "date", "requested_filed_date" "date", "requested_accepted_date" "date", "requested_preparation_fee" numeric, "requested_discount_amount" numeric, "requested_description" "text", "requested_federal_return_required" boolean, "requested_state_return_required" boolean, "requested_local_return_required" boolean, "requested_extension_filed" boolean, "requested_extension_date" "date", "requested_estimated_refund" numeric, "requested_estimated_amount_due" numeric, "requested_notes" "text") IS 'Creates a tax return and corresponding audit event.';



CREATE OR REPLACE FUNCTION "public"."current_actor_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'pg_catalog', 'auth', 'public'
    AS $$
  select auth.uid();
$$;


ALTER FUNCTION "public"."current_actor_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."current_actor_id"() IS 'Returns the authenticated Supabase user ID for the current request, or NULL when no authenticated user exists.';



CREATE OR REPLACE FUNCTION "public"."current_client_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select portal_profile.client_id
  from public.client_portal_profiles as portal_profile
  where portal_profile.auth_user_id = auth.uid()
    and portal_profile.portal_status = 'active'
  limit 1;
$$;


ALTER FUNCTION "public"."current_client_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_client_portal_is_active"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select exists (
    select 1
    from public.client_portal_profiles as portal_profile
    where portal_profile.auth_user_id = auth.uid()
      and portal_profile.portal_status = 'active'
  );
$$;


ALTER FUNCTION "public"."current_client_portal_is_active"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_client_portal_profile_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select portal_profile.id
  from public.client_portal_profiles as portal_profile
  where portal_profile.auth_user_id = auth.uid()
  limit 1;
$$;


ALTER FUNCTION "public"."current_client_portal_profile_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_can_manage_records"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select coalesce(
    public.current_user_role() in (
      'administrator',
      'manager',
      'preparer',
      'reviewer',
      'receptionist'
    ),
    false
  );
$$;


ALTER FUNCTION "public"."current_user_can_manage_records"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_is_active"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select coalesce(
    (
      select profile.is_active
      from public.profiles as profile
      where profile.id = auth.uid()
    ),
    false
  );
$$;


ALTER FUNCTION "public"."current_user_is_active"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select coalesce(
    public.current_user_role() = 'administrator',
    false
  );
$$;


ALTER FUNCTION "public"."current_user_is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_role"() RETURNS "public"."app_role"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select profile.role
  from public.profiles as profile
  where profile.id = auth.uid()
    and profile.is_active = true;
$$;


ALTER FUNCTION "public"."current_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_client_organizer_business"("requested_organizer_id" "uuid", "requested_business_id" "uuid") RETURNS TABLE("deleted_business_id" "uuid", "success" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  deleted_business public.client_tax_organizer_businesses;
begin
  perform public.require_client_business_organizer_access(
    requested_organizer_id, true
  );

  delete from public.client_tax_organizer_businesses as business
  where business.id = requested_business_id
    and business.organizer_id = requested_organizer_id
  returning * into deleted_business;

  if not found then
    raise exception 'The requested business record was not found.';
  end if;

  perform public.refresh_client_business_organizer_progress(
    requested_organizer_id
  );

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id, old_values, metadata
  )
  values (
    auth.uid(),
    'client_business_deleted',
    'client_tax_organizer_business',
    deleted_business.id,
    to_jsonb(deleted_business),
    jsonb_build_object(
      'organizer_id', requested_organizer_id,
      'section_key', 'business'
    )
  );

  return query select deleted_business.id, true;
end;
$$;


ALTER FUNCTION "public"."delete_client_organizer_business"("requested_organizer_id" "uuid", "requested_business_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_dependent_id" "uuid") RETURNS TABLE("dependent_id" "uuid", "organizer_id" "uuid", "dependent_name" "text", "remaining_dependent_count" integer, "section_status" "public"."tax_organizer_section_status", "section_progress_percentage" integer, "organizer_progress_percentage" integer, "deleted_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  dependent_record
    public.client_tax_organizer_dependents;

  remaining_count integer;

  completed_section_count integer;
  total_section_count integer;
  calculated_organizer_progress integer;

  calculated_section_status
    public.tax_organizer_section_status;

  calculated_section_progress integer;

  current_deleted_at timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_dependent_id is null then
    raise exception
      'A dependent identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  select
    existing_dependent.*
  into
    dependent_record
  from public.client_tax_organizer_dependents
    as existing_dependent
  where existing_dependent.id =
      requested_dependent_id
    and existing_dependent.organizer_id =
      requested_organizer_id
  for update;

  if not found then
    raise exception
      'The requested dependent was not found.';
  end if;

  current_deleted_at :=
    now();

  delete from
    public.client_tax_organizer_dependents
      as deleted_dependent
  where deleted_dependent.id =
      requested_dependent_id
    and deleted_dependent.organizer_id =
      requested_organizer_id;

  /*
   * Dependent-level vault secrets are removed automatically
   * through the dependent_id foreign key with ON DELETE CASCADE.
   */

  select
    count(*)::integer
  into
    remaining_count
  from public.client_tax_organizer_dependents
    as remaining_dependent
  where remaining_dependent.organizer_id =
    requested_organizer_id;

  calculated_section_status :=
    case
      when remaining_count > 0
      then 'in_progress'
        ::public.tax_organizer_section_status
      else 'not_started'
        ::public.tax_organizer_section_status
    end;

  calculated_section_progress :=
    case
      when remaining_count > 0
      then 50
      else 0
    end;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      calculated_section_status,

    progress_percentage =
      calculated_section_progress,

    started_at =
      case
        when remaining_count > 0
        then coalesce(
          organizer_section.started_at,
          current_deleted_at
        )
        else null
      end,

    completed_at =
      null,

    last_saved_at =
      current_deleted_at,

    updated_at =
      current_deleted_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'dependents';

  select
    count(*) filter (
      where organizer_section.status =
        'completed'
    ),

    count(*)
  into
    completed_section_count,
    total_section_count
  from public.client_tax_organizer_sections
    as organizer_section
  where organizer_section.organizer_id =
    requested_organizer_id;

  calculated_organizer_progress :=
    case
      when total_section_count = 0
      then 0
      else round(
        (
          completed_section_count::numeric /
          total_section_count::numeric
        ) * 100
      )::integer
    end;

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'dependents'
        ::public.tax_organizer_section_key,

    progress_percentage =
      calculated_organizer_progress,

    last_saved_at =
      current_deleted_at,

    updated_at =
      current_deleted_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    requested_dependent_id,

    requested_organizer_id,

    concat_ws(
      ' ',
      dependent_record.first_name,
      dependent_record.last_name
    ),

    remaining_count,

    calculated_section_status,

    calculated_section_progress,

    calculated_organizer_progress,

    current_deleted_at;
end;
$$;


ALTER FUNCTION "public"."delete_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_dependent_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."delete_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_dependent_id" "uuid") IS 'Deletes a dependent from an editable organizer owned by the authenticated client. Associated dependent-level Secure Vault records are deleted through the dependent foreign-key cascade.';



CREATE OR REPLACE FUNCTION "public"."delete_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_coverage_id" "uuid") RETURNS TABLE("coverage_id" "uuid", "organizer_id" "uuid", "provider_name" "text", "remaining_coverage_count" integer, "deleted_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  coverage_record
    public.client_tax_organizer_healthcare_coverages;

  remaining_count integer;
  current_deleted_at timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_coverage_id is null then
    raise exception
      'A healthcare coverage identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  select
    coverage.*
  into
    coverage_record
  from public.client_tax_organizer_healthcare_coverages
    as coverage
  where coverage.id =
      requested_coverage_id
    and coverage.organizer_id =
      requested_organizer_id
  for update;

  if not found then
    raise exception
      'The requested healthcare coverage was not found.';
  end if;

  current_deleted_at :=
    now();

  delete from
    public.client_tax_organizer_healthcare_coverages
      as coverage
  where coverage.id =
      requested_coverage_id
    and coverage.organizer_id =
      requested_organizer_id;

  select
    count(*)::integer
  into
    remaining_count
  from public.client_tax_organizer_healthcare_coverages
    as remaining_coverage
  where remaining_coverage.organizer_id =
    requested_organizer_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      case
        when remaining_count = 0
        then
          'not_started'
            ::public.tax_organizer_section_status
        else
          'in_progress'
            ::public.tax_organizer_section_status
      end,

    progress_percentage =
      case
        when remaining_count = 0
        then 0
        else greatest(
          organizer_section.progress_percentage,
          25
        )
      end,

    started_at =
      case
        when remaining_count = 0
        then null
        else organizer_section.started_at
      end,

    completed_at =
      null,

    last_saved_at =
      current_deleted_at,

    updated_at =
      current_deleted_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'healthcare';

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'healthcare'
        ::public.tax_organizer_section_key,

    last_saved_at =
      current_deleted_at,

    updated_at =
      current_deleted_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    requested_coverage_id,

    requested_organizer_id,

    coverage_record.provider_name,

    remaining_count,

    current_deleted_at;
end;
$$;


ALTER FUNCTION "public"."delete_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_coverage_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."delete_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_coverage_id" "uuid") IS 'Deletes a healthcare coverage record owned by the authenticated client.';



CREATE OR REPLACE FUNCTION "public"."delete_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") RETURNS TABLE("income_source_id" "uuid", "organizer_id" "uuid", "payer_name" "text", "remaining_income_source_count" integer, "deleted_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  income_source_record
    public.client_tax_organizer_income_sources;

  remaining_count integer;
  current_deleted_at timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  select
    existing_income_source.*
  into
    income_source_record
  from public.client_tax_organizer_income_sources
    as existing_income_source
  where existing_income_source.id =
      requested_income_source_id
    and existing_income_source.organizer_id =
      requested_organizer_id
  for update;

  if not found then
    raise exception
      'The requested income source was not found.';
  end if;

  current_deleted_at :=
    now();

  delete from
    public.client_tax_organizer_income_sources
      as deleted_income_source
  where deleted_income_source.id =
      requested_income_source_id
    and deleted_income_source.organizer_id =
      requested_organizer_id;

  select
    count(*)::integer
  into
    remaining_count
  from public.client_tax_organizer_income_sources
    as remaining_income_source
  where remaining_income_source.organizer_id =
    requested_organizer_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      case
        when remaining_count = 0
        then 'not_started'
          ::public.tax_organizer_section_status
        else 'in_progress'
          ::public.tax_organizer_section_status
      end,

    progress_percentage =
      case
        when remaining_count = 0
        then 0
        else greatest(
          organizer_section.progress_percentage,
          25
        )
      end,

    started_at =
      case
        when remaining_count = 0
        then null
        else organizer_section.started_at
      end,

    completed_at =
      null,

    last_saved_at =
      current_deleted_at,

    updated_at =
      current_deleted_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'income';

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'income'
        ::public.tax_organizer_section_key,

    last_saved_at =
      current_deleted_at,

    updated_at =
      current_deleted_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    requested_income_source_id,

    requested_organizer_id,

    income_source_record.payer_name,

    remaining_count,

    current_deleted_at;
end;
$$;


ALTER FUNCTION "public"."delete_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."delete_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") IS 'Deletes an organizer income source owned by the authenticated client. Type-specific detail rows are removed through cascading foreign keys.';



CREATE OR REPLACE FUNCTION "public"."describe_tax_return_change"("old_record" "public"."tax_returns", "new_record" "public"."tax_returns") RETURNS "text"
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
    AS $$
declare
  change_messages text[] := array[]::text[];
begin
  if old_record.status is distinct from new_record.status then
    change_messages := array_append(
      change_messages,
      format(
        'Workflow status changed from %s to %s',
        replace(old_record.status::text, '_', ' '),
        replace(new_record.status::text, '_', ' ')
      )
    );
  end if;

  if old_record.assigned_preparer_id
      is distinct from
      new_record.assigned_preparer_id then
    change_messages := array_append(
      change_messages,
      case
        when new_record.assigned_preparer_id is null
          then 'Assigned preparer was cleared'
        when old_record.assigned_preparer_id is null
          then 'A preparer was assigned'
        else 'Assigned preparer was changed'
      end
    );
  end if;

  if old_record.assigned_reviewer_id
      is distinct from
      new_record.assigned_reviewer_id then
    change_messages := array_append(
      change_messages,
      case
        when new_record.assigned_reviewer_id is null
          then 'Assigned reviewer was cleared'
        when old_record.assigned_reviewer_id is null
          then 'A reviewer was assigned'
        else 'Assigned reviewer was changed'
      end
    );
  end if;

  if old_record.date_received
      is distinct from
      new_record.date_received then
    change_messages := array_append(
      change_messages,
      'Date received was updated'
    );
  end if;

  if old_record.due_date
      is distinct from
      new_record.due_date then
    change_messages := array_append(
      change_messages,
      'Due date was updated'
    );
  end if;

  if old_record.filed_date
      is distinct from
      new_record.filed_date then
    change_messages := array_append(
      change_messages,
      'Filed date was updated'
    );
  end if;

  if old_record.accepted_date
      is distinct from
      new_record.accepted_date then
    change_messages := array_append(
      change_messages,
      'Accepted date was updated'
    );
  end if;

  if old_record.preparation_fee
      is distinct from
      new_record.preparation_fee
     or old_record.discount_amount
      is distinct from
      new_record.discount_amount then
    change_messages := array_append(
      change_messages,
      'Return fees were updated'
    );
  end if;

  if old_record.description
      is distinct from
      new_record.description
     or old_record.notes
      is distinct from
      new_record.notes then
    change_messages := array_append(
      change_messages,
      'Return details were updated'
    );
  end if;

  if old_record.federal_return_required
      is distinct from
      new_record.federal_return_required
     or old_record.state_return_required
      is distinct from
      new_record.state_return_required
     or old_record.local_return_required
      is distinct from
      new_record.local_return_required
     or old_record.extension_filed
      is distinct from
      new_record.extension_filed
     or old_record.extension_date
      is distinct from
      new_record.extension_date then
    change_messages := array_append(
      change_messages,
      'Filing requirements were updated'
    );
  end if;

  if array_length(
    change_messages,
    1
  ) is null then
    return 'Tax return was updated';
  end if;

  return array_to_string(
    change_messages,
    '; '
  );
end;
$$;


ALTER FUNCTION "public"."describe_tax_return_change"("old_record" "public"."tax_returns", "new_record" "public"."tax_returns") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_matching_document_hash"("requested_client_id" "uuid", "requested_tax_return_id" "uuid", "requested_file_hash" "text") RETURNS TABLE("id" "uuid", "original_file_name" "text", "created_at" timestamp with time zone, "category" "text", "size_bytes" bigint)
    LANGUAGE "sql" STABLE
    SET "search_path" TO ''
    AS $$
select
    document.id,
    document.original_file_name,
    document.created_at,
    document.category,
    document.size_bytes
from public.client_documents document
where document.client_id = requested_client_id
and document.archived_at is null
and document.file_hash = requested_file_hash
and (
    requested_tax_return_id is null
    or document.tax_return_id = requested_tax_return_id
)
order by document.created_at desc;
$$;


ALTER FUNCTION "public"."find_matching_document_hash"("requested_client_id" "uuid", "requested_tax_return_id" "uuid", "requested_file_hash" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_payment_receipt_number"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
    next_number bigint;
begin
    next_number :=
        nextval('payment_receipt_sequence');

    return
        'RCP-'
        || to_char(current_date, 'YYYY')
        || '-'
        || lpad(next_number::text, 6, '0');
end;
$$;


ALTER FUNCTION "public"."generate_payment_receipt_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_active_vault_key_version"() RETURNS TABLE("key_version" integer, "algorithm" "text", "activated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  select
    vault_key.key_version,
    vault_key.algorithm,
    vault_key.activated_at
  from public.vault_key_versions
    as vault_key
  where vault_key.active = true
    and vault_key.retired_at is null
  order by
    vault_key.key_version desc
  limit 1;

  if not found then
    raise exception
      'No active Secure Vault encryption key version is configured.';
  end if;
end;
$$;


ALTER FUNCTION "public"."get_active_vault_key_version"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_active_vault_key_version"() IS 'Returns non-sensitive metadata for the single active Secure Vault encryption-key version. Actual encryption keys are never stored or returned by this function.';



CREATE OR REPLACE FUNCTION "public"."get_client_document_activity"("requested_client_id" "uuid", "requested_limit" integer DEFAULT 10) RETURNS TABLE("id" "uuid", "action" "text", "entity_type" "text", "entity_id" "uuid", "document_name" "text", "actor_name" "text", "occurred_at" timestamp with time zone, "description" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
    activity.id,
    activity.action,
    'document'::text as entity_type,
    activity.document_id as entity_id,
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
    activity.created_at as occurred_at,
    coalesce(
      nullif(activity.details, ''),
      case
        when activity.action = 'document_uploaded'
          then 'Uploaded "' ||
            document.original_file_name ||
            '".'

        when activity.action = 'document_archived'
          then 'Archived "' ||
            document.original_file_name ||
            '".'

        when activity.action = 'document_downloaded'
          then 'Downloaded "' ||
            document.original_file_name ||
            '".'

        when activity.action = 'document_viewed'
          then 'Viewed "' ||
            document.original_file_name ||
            '".'

        when activity.action = 'document_updated'
          then 'Updated "' ||
            document.original_file_name ||
            '".'

        when activity.action =
          'document_favorite_added'
          then 'Marked "' ||
            document.original_file_name ||
            '" as a favorite.'

        when activity.action =
          'document_favorite_removed'
          then 'Removed "' ||
            document.original_file_name ||
            '" from favorites.'

        else
          initcap(
            replace(
              activity.action,
              '_',
              ' '
            )
          ) ||
          ': ' ||
          document.original_file_name
      end
    ) as description
  from public.document_activity as activity
  inner join public.client_documents as document
    on document.id = activity.document_id
  left join public.profiles as profile
    on profile.id = activity.performed_by
  where activity.client_id =
    requested_client_id
  order by activity.created_at desc
  limit safe_limit;
end;
$$;


ALTER FUNCTION "public"."get_client_document_activity"("requested_client_id" "uuid", "requested_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_client_organizer_banking_information"("requested_organizer_id" "uuid") RETURNS TABLE("organizer_id" "uuid", "account_holder_name" "text", "bank_name" "text", "account_type" "text", "use_direct_deposit" boolean, "authorize_direct_debit" boolean, "has_routing_number" boolean, "routing_number_masked" "text", "has_bank_account_number" boolean, "bank_account_number_masked" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizers
      as tax_organizer
    where tax_organizer.id =
        requested_organizer_id
      and tax_organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  return query
  select
    requested_organizer_id
      as result_organizer_id,

    banking_record.account_holder_name,

    banking_record.bank_name,

    banking_record.account_type,

    banking_record.use_direct_deposit,

    banking_record.authorize_direct_debit,

    routing_secret.id
      is not null
      as result_has_routing_number,

    routing_secret.masked_value
      as result_routing_number_masked,

    account_secret.id
      is not null
      as result_has_bank_account_number,

    account_secret.masked_value
      as result_bank_account_number_masked,

    banking_record.created_at,

    banking_record.updated_at

  from (
    select
      stored_banking.account_holder_name,
      stored_banking.bank_name,
      stored_banking.account_type,
      stored_banking.use_direct_deposit,
      stored_banking.authorize_direct_debit,
      stored_banking.created_at,
      stored_banking.updated_at

    from
      public.client_tax_organizer_banking_information
        as stored_banking

    where stored_banking.organizer_id =
      requested_organizer_id

    union all

    select
      null::text,
      null::text,
      null::text,
      null::boolean,
      null::boolean,
      null::timestamptz,
      null::timestamptz

    where not exists (
      select 1
      from
        public.client_tax_organizer_banking_information
          as existing_banking
      where existing_banking.organizer_id =
        requested_organizer_id
    )
  ) as banking_record

  left join lateral (
    select
      stored_secret.id,
      stored_secret.masked_value

    from public.vault_secrets
      as stored_secret

    where stored_secret.client_id =
        current_client_id

      and stored_secret.organizer_id =
        requested_organizer_id

      and stored_secret.secret_type =
        'routing_number'

      and stored_secret.archived_at
        is null

    order by
      stored_secret.updated_at desc

    limit 1
  ) as routing_secret
    on true

  left join lateral (
    select
      stored_secret.id,
      stored_secret.masked_value

    from public.vault_secrets
      as stored_secret

    where stored_secret.client_id =
        current_client_id

      and stored_secret.organizer_id =
        requested_organizer_id

      and stored_secret.secret_type =
        'bank_account_number'

      and stored_secret.archived_at
        is null

    order by
      stored_secret.updated_at desc

    limit 1
  ) as account_secret
    on true

  limit 1;
end;
$$;


ALTER FUNCTION "public"."get_client_organizer_banking_information"("requested_organizer_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_client_organizer_banking_information"("requested_organizer_id" "uuid") IS 'Returns non-sensitive organizer banking preferences and masked Secure Vault status for the authenticated client.';



CREATE OR REPLACE FUNCTION "public"."get_client_organizer_business_response"("requested_organizer_id" "uuid") RETURNS TABLE("organizer_id" "uuid", "has_business_activity" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  perform public.require_client_business_organizer_access(
    requested_organizer_id, false
  );

  return query
  select
    requested_organizer_id,
    response.has_business_activity,
    response.created_at,
    response.updated_at
  from public.client_tax_organizer_business_responses as response
  where response.organizer_id = requested_organizer_id

  union all

  select
    requested_organizer_id,
    null::boolean,
    null::timestamptz,
    null::timestamptz
  where not exists (
    select 1
    from public.client_tax_organizer_business_responses as existing
    where existing.organizer_id = requested_organizer_id
  )
  limit 1;
end;
$$;


ALTER FUNCTION "public"."get_client_organizer_business_response"("requested_organizer_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_client_organizer_businesses"("requested_organizer_id" "uuid") RETURNS SETOF "public"."client_tax_organizer_businesses"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  perform public.require_client_business_organizer_access(
    requested_organizer_id, false
  );

  return query
  select business.*
  from public.client_tax_organizer_businesses as business
  where business.organizer_id = requested_organizer_id
  order by business.display_order, business.created_at, business.id;
end;
$$;


ALTER FUNCTION "public"."get_client_organizer_businesses"("requested_organizer_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_client_organizer_dependents"("requested_organizer_id" "uuid") RETURNS TABLE("dependent_id" "uuid", "organizer_id" "uuid", "first_name" "text", "middle_name" "text", "last_name" "text", "suffix" "text", "relationship" "text", "birth_date" "date", "is_full_time_student" boolean, "is_permanently_disabled" boolean, "lived_with_taxpayer_all_year" boolean, "months_lived_with_taxpayer" smallint, "us_citizen_or_resident" boolean, "claimed_by_another_taxpayer" boolean, "display_order" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizers
      as tax_organizer
    where tax_organizer.id =
        requested_organizer_id
      and tax_organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  return query
  select
    dependent_record.id,

    dependent_record.organizer_id,

    dependent_record.first_name,

    dependent_record.middle_name,

    dependent_record.last_name,

    dependent_record.suffix,

    dependent_record.relationship,

    dependent_record.birth_date,

    dependent_record.is_full_time_student,

    dependent_record.is_permanently_disabled,

    dependent_record.lived_with_taxpayer_all_year,

    dependent_record.months_lived_with_taxpayer,

    dependent_record.us_citizen_or_resident,

    dependent_record.claimed_by_another_taxpayer,

    dependent_record.display_order,

    dependent_record.created_at,

    dependent_record.updated_at
  from public.client_tax_organizer_dependents
    as dependent_record
  where dependent_record.organizer_id =
    requested_organizer_id
  order by
    dependent_record.display_order,
    dependent_record.created_at,
    dependent_record.id;
end;
$$;


ALTER FUNCTION "public"."get_client_organizer_dependents"("requested_organizer_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_client_organizer_dependents"("requested_organizer_id" "uuid") IS 'Returns non-sensitive dependents for a tax organizer owned by the authenticated client. Protected identifiers remain in the Secure Vault.';



CREATE OR REPLACE FUNCTION "public"."get_client_organizer_healthcare_coverages"("requested_organizer_id" "uuid") RETURNS TABLE("coverage_id" "uuid", "organizer_id" "uuid", "provider_name" "text", "coverage_type" "text", "covered_person_name" "text", "policy_number" "text", "start_month" integer, "end_month" integer, "is_full_year_coverage" boolean, "document_received" boolean, "document_type" "text", "notes" "text", "record_status" "text", "display_order" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizers
      as tax_organizer
    where tax_organizer.id =
        requested_organizer_id
      and tax_organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  return query
  select
    coverage.id,

    coverage.organizer_id,

    coverage.provider_name,

    coverage.coverage_type,

    coverage.covered_person_name,

    coverage.policy_number,

    coverage.start_month,

    coverage.end_month,

    coverage.is_full_year_coverage,

    coverage.document_received,

    coverage.document_type,

    coverage.notes,

    coverage.record_status,

    coverage.display_order,

    coverage.created_at,

    coverage.updated_at

  from public.client_tax_organizer_healthcare_coverages
    as coverage

  where coverage.organizer_id =
    requested_organizer_id

  order by
    coverage.display_order,
    coverage.created_at,
    coverage.id;
end;
$$;


ALTER FUNCTION "public"."get_client_organizer_healthcare_coverages"("requested_organizer_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_client_organizer_healthcare_coverages"("requested_organizer_id" "uuid") IS 'Returns healthcare coverage records owned by the authenticated client.';



CREATE OR REPLACE FUNCTION "public"."get_client_organizer_identity_information"("requested_organizer_id" "uuid") RETURNS TABLE("result_organizer_id" "uuid", "identification_type" "text", "identification_state" "text", "identification_issue_date" "date", "identification_expiration_date" "date", "citizenship_status" "text", "is_us_citizen" boolean, "has_government_photo_id" boolean, "has_identity_changed" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  identity_record
    public.client_tax_organizer_identity_information;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as profile
  where profile.auth_user_id =
      current_user_id
    and profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as organizer
  where organizer.id =
      requested_organizer_id
    and organizer.client_id =
      current_client_id;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  select
    identity.*
  into
    identity_record
  from public.client_tax_organizer_identity_information
    as identity
  where identity.organizer_id =
    requested_organizer_id;

  if not found then
    insert into public.client_tax_organizer_identity_information (
      organizer_id
    )
    values (
      requested_organizer_id
    )
    returning *
    into identity_record;
  end if;

  return query
  select
    identity_record.organizer_id,
    identity_record.identification_type,
    identity_record.identification_state,
    identity_record.identification_issue_date,
    identity_record.identification_expiration_date,
    identity_record.citizenship_status,
    identity_record.is_us_citizen,
    identity_record.has_government_photo_id,
    identity_record.has_identity_changed,
    identity_record.created_at,
    identity_record.updated_at;
end;
$$;


ALTER FUNCTION "public"."get_client_organizer_identity_information"("requested_organizer_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_client_organizer_income_1099_div_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") RETURNS TABLE("income_source_id" "uuid", "payer_identification_number" "text", "total_ordinary_dividends" numeric, "qualified_dividends" numeric, "total_capital_gain_distributions" numeric, "unrecaptured_section_1250_gain" numeric, "section_1202_gain" numeric, "collectibles_28_percent_rate_gain" numeric, "section_897_ordinary_dividends" numeric, "section_897_capital_gain" numeric, "nondividend_distributions" numeric, "federal_income_tax_withheld" numeric, "section_199a_dividends" numeric, "investment_expenses" numeric, "foreign_tax_paid" numeric, "foreign_country_or_us_possession" "text", "exempt_interest_dividends" numeric, "specified_private_activity_bond_interest_dividends" numeric, "state_code" "text", "state_identification_number" "text", "state_tax_withheld" numeric, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    join public.client_tax_organizers
      as tax_organizer
      on tax_organizer.id =
        income_source.organizer_id
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
      and income_source.income_type =
        '1099_div'
      and tax_organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested 1099-DIV income source was not found.';
  end if;

  return query
  select
    requested_income_source_id,

    details.payer_identification_number,
    details.total_ordinary_dividends,
    details.qualified_dividends,
    details.total_capital_gain_distributions,
    details.unrecaptured_section_1250_gain,
    details.section_1202_gain,
    details.collectibles_28_percent_rate_gain,
    details.section_897_ordinary_dividends,
    details.section_897_capital_gain,
    details.nondividend_distributions,
    details.federal_income_tax_withheld,
    details.section_199a_dividends,
    details.investment_expenses,
    details.foreign_tax_paid,
    details.foreign_country_or_us_possession,
    details.exempt_interest_dividends,
    details.specified_private_activity_bond_interest_dividends,
    details.state_code,
    details.state_identification_number,
    details.state_tax_withheld,
    details.created_at,
    details.updated_at

  from (
    select
      stored.payer_identification_number,
      stored.total_ordinary_dividends,
      stored.qualified_dividends,
      stored.total_capital_gain_distributions,
      stored.unrecaptured_section_1250_gain,
      stored.section_1202_gain,
      stored.collectibles_28_percent_rate_gain,
      stored.section_897_ordinary_dividends,
      stored.section_897_capital_gain,
      stored.nondividend_distributions,
      stored.federal_income_tax_withheld,
      stored.section_199a_dividends,
      stored.investment_expenses,
      stored.foreign_tax_paid,
      stored.foreign_country_or_us_possession,
      stored.exempt_interest_dividends,
      stored.specified_private_activity_bond_interest_dividends,
      stored.state_code,
      stored.state_identification_number,
      stored.state_tax_withheld,
      stored.created_at,
      stored.updated_at
    from public.client_tax_organizer_income_1099_div_details
      as stored
    where stored.income_source_id =
      requested_income_source_id

    union all

    select
      null::text,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::text,
      null::numeric,
      null::numeric,
      null::text,
      null::text,
      null::numeric,
      null::timestamptz,
      null::timestamptz

    where not exists (
      select 1
      from public.client_tax_organizer_income_1099_div_details
        as existing
      where existing.income_source_id =
        requested_income_source_id
    )
  ) as details

  limit 1;
end;
$$;


ALTER FUNCTION "public"."get_client_organizer_income_1099_div_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_client_organizer_income_1099_div_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") IS 'Returns Form 1099-DIV detail values for an income source owned by the authenticated active client portal user.';



CREATE OR REPLACE FUNCTION "public"."get_client_organizer_income_1099_int_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") RETURNS TABLE("income_source_id" "uuid", "payer_identification_number" "text", "interest_income" numeric, "early_withdrawal_penalty" numeric, "interest_on_us_savings_bonds_and_treasury_obligations" numeric, "federal_income_tax_withheld" numeric, "investment_expenses" numeric, "foreign_tax_paid" numeric, "foreign_country_or_us_possession" "text", "tax_exempt_interest" numeric, "specified_private_activity_bond_interest" numeric, "market_discount" numeric, "bond_premium" numeric, "bond_premium_on_treasury_obligations" numeric, "bond_premium_on_tax_exempt_bond" numeric, "state_code" "text", "state_identification_number" "text", "state_tax_withheld" numeric, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    join public.client_tax_organizers
      as tax_organizer
      on tax_organizer.id =
        income_source.organizer_id
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
      and income_source.income_type =
        '1099_int'
      and tax_organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested 1099-INT income source was not found.';
  end if;

  return query
  select
    requested_income_source_id,

    details.payer_identification_number,
    details.interest_income,
    details.early_withdrawal_penalty,
    details.interest_on_us_savings_bonds_and_treasury_obligations,
    details.federal_income_tax_withheld,
    details.investment_expenses,
    details.foreign_tax_paid,
    details.foreign_country_or_us_possession,
    details.tax_exempt_interest,
    details.specified_private_activity_bond_interest,
    details.market_discount,
    details.bond_premium,
    details.bond_premium_on_treasury_obligations,
    details.bond_premium_on_tax_exempt_bond,
    details.state_code,
    details.state_identification_number,
    details.state_tax_withheld,
    details.created_at,
    details.updated_at

  from (
    select
      stored.payer_identification_number,
      stored.interest_income,
      stored.early_withdrawal_penalty,
      stored.interest_on_us_savings_bonds_and_treasury_obligations,
      stored.federal_income_tax_withheld,
      stored.investment_expenses,
      stored.foreign_tax_paid,
      stored.foreign_country_or_us_possession,
      stored.tax_exempt_interest,
      stored.specified_private_activity_bond_interest,
      stored.market_discount,
      stored.bond_premium,
      stored.bond_premium_on_treasury_obligations,
      stored.bond_premium_on_tax_exempt_bond,
      stored.state_code,
      stored.state_identification_number,
      stored.state_tax_withheld,
      stored.created_at,
      stored.updated_at
    from public.client_tax_organizer_income_1099_int_details
      as stored
    where stored.income_source_id =
      requested_income_source_id

    union all

    select
      null::text,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::text,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::text,
      null::text,
      null::numeric,
      null::timestamptz,
      null::timestamptz

    where not exists (
      select 1
      from public.client_tax_organizer_income_1099_int_details
        as existing
      where existing.income_source_id =
        requested_income_source_id
    )
  ) as details

  limit 1;
end;
$$;


ALTER FUNCTION "public"."get_client_organizer_income_1099_int_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_client_organizer_income_1099_int_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") IS 'Returns Form 1099-INT detail values for an income source owned by the authenticated active client portal user.';



CREATE OR REPLACE FUNCTION "public"."get_client_organizer_income_sources"("requested_organizer_id" "uuid") RETURNS TABLE("income_source_id" "uuid", "organizer_id" "uuid", "income_type" "text", "payer_name" "text", "recipient_type" "text", "record_status" "text", "document_received" boolean, "notes" "text", "display_order" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizers
      as tax_organizer
    where tax_organizer.id =
        requested_organizer_id
      and tax_organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  return query
  select
    income_source.id,

    income_source.organizer_id,

    income_source.income_type,

    income_source.payer_name,

    income_source.recipient_type,

    income_source.record_status,

    income_source.document_received,

    income_source.notes,

    income_source.display_order,

    income_source.created_at,

    income_source.updated_at
  from public.client_tax_organizer_income_sources
    as income_source
  where income_source.organizer_id =
    requested_organizer_id
  order by
    income_source.display_order,
    income_source.created_at,
    income_source.id;
end;
$$;


ALTER FUNCTION "public"."get_client_organizer_income_sources"("requested_organizer_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_client_organizer_income_sources"("requested_organizer_id" "uuid") IS 'Returns all common organizer income-source records owned by the authenticated client.';



CREATE OR REPLACE FUNCTION "public"."get_client_organizer_income_w2_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") RETURNS TABLE("income_source_id" "uuid", "employer_identification_number" "text", "wages" numeric, "federal_income_tax_withheld" numeric, "social_security_wages" numeric, "social_security_tax_withheld" numeric, "medicare_wages" numeric, "medicare_tax_withheld" numeric, "state_code" "text", "state_wages" numeric, "state_income_tax_withheld" numeric, "local_wages" numeric, "local_income_tax_withheld" numeric, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    join public.client_tax_organizers
      as tax_organizer
      on tax_organizer.id =
        income_source.organizer_id
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
      and income_source.income_type =
        'w2'
      and tax_organizer.client_id =
        current_client_id
  ) then
    raise exception
      'The requested W-2 income source was not found.';
  end if;

  return query
  select
    requested_income_source_id,

    w2.employer_identification_number,

    w2.wages,

    w2.federal_income_tax_withheld,

    w2.social_security_wages,

    w2.social_security_tax_withheld,

    w2.medicare_wages,

    w2.medicare_tax_withheld,

    w2.state_code,

    w2.state_wages,

    w2.state_income_tax_withheld,

    w2.local_wages,

    w2.local_income_tax_withheld,

    w2.created_at,

    w2.updated_at

  from (
    select
      stored_w2.employer_identification_number,
      stored_w2.wages,
      stored_w2.federal_income_tax_withheld,
      stored_w2.social_security_wages,
      stored_w2.social_security_tax_withheld,
      stored_w2.medicare_wages,
      stored_w2.medicare_tax_withheld,
      stored_w2.state_code,
      stored_w2.state_wages,
      stored_w2.state_income_tax_withheld,
      stored_w2.local_wages,
      stored_w2.local_income_tax_withheld,
      stored_w2.created_at,
      stored_w2.updated_at
    from public.client_tax_organizer_income_w2_details
      as stored_w2
    where stored_w2.income_source_id =
      requested_income_source_id

    union all

    select
      null::text,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::text,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::timestamptz,
      null::timestamptz

    where not exists (
      select 1
      from public.client_tax_organizer_income_w2_details
        as existing_w2
      where existing_w2.income_source_id =
        requested_income_source_id
    )
  ) as w2

  limit 1;
end;
$$;


ALTER FUNCTION "public"."get_client_organizer_income_w2_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_client_organizer_income_w2_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") IS 'Returns non-sensitive W-2 detail values for an organizer income source owned by the authenticated client.';



CREATE OR REPLACE FUNCTION "public"."get_client_organizer_personal_information"("requested_organizer_id" "uuid") RETURNS TABLE("organizer_id" "uuid", "legal_first_name" "text", "legal_middle_name" "text", "legal_last_name" "text", "preferred_name" "text", "birth_date" "date", "filing_status" "text", "occupation" "text", "email" "text", "mobile_phone" "text", "alternate_phone" "text", "address_line_1" "text", "address_line_2" "text", "city" "text", "state" "text", "postal_code" "text", "address_changed_this_year" boolean, "marital_status_changed_this_year" boolean, "employer_changed_this_year" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
  current_client_id uuid;
  organizer_record public.client_tax_organizers;
  personal_record public.client_tax_organizer_personal_information;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    profile.client_id
  into
    current_client_id
  from public.client_portal_profiles as profile
  where profile.auth_user_id =
      current_user_id
    and profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    organizer.*
  into
    organizer_record
  from public.client_tax_organizers as organizer
  where organizer.id =
      requested_organizer_id
    and organizer.client_id =
      current_client_id;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  select
    personal.*
  into
    personal_record
  from public.client_tax_organizer_personal_information
    as personal
  where personal.organizer_id =
      requested_organizer_id;

  if not found then
    insert into public.client_tax_organizer_personal_information (
      organizer_id,
      legal_first_name,
      legal_middle_name,
      legal_last_name,
      preferred_name,
      birth_date,
      email,
      mobile_phone,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code
    )
    select
      organizer_record.id,
      client.first_name,
      client.middle_name,
      client.last_name,
      client.preferred_name,
      client.birth_date,
      client.email,
      client.phone,
      client.address_line_1,
      client.address_line_2,
      client.city,
      client.state,
      client.postal_code
    from public.clients as client
    where client.id =
      current_client_id
    returning *
    into personal_record;
  end if;

  return query
  select
    personal_record.organizer_id,
    personal_record.legal_first_name,
    personal_record.legal_middle_name,
    personal_record.legal_last_name,
    personal_record.preferred_name,
    personal_record.birth_date,
    personal_record.filing_status,
    personal_record.occupation,
    personal_record.email,
    personal_record.mobile_phone,
    personal_record.alternate_phone,
    personal_record.address_line_1,
    personal_record.address_line_2,
    personal_record.city,
    personal_record.state,
    personal_record.postal_code,
    personal_record.address_changed_this_year,
    personal_record.marital_status_changed_this_year,
    personal_record.employer_changed_this_year,
    personal_record.created_at,
    personal_record.updated_at;
end;
$$;


ALTER FUNCTION "public"."get_client_organizer_personal_information"("requested_organizer_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_client_portal_dashboard"() RETURNS TABLE("client_id" "uuid", "client_number" bigint, "first_name" "text", "preferred_name" "text", "current_return_id" "uuid", "current_tax_year" integer, "current_return_type" "public"."return_type", "current_tax_form" "public"."tax_form_type", "current_return_status" "public"."return_status", "current_return_updated_at" timestamp with time zone, "assigned_preparer_name" "text", "preparation_fee" numeric, "discount_amount" numeric, "total_payments" numeric, "outstanding_balance" numeric, "document_count" bigint, "recent_document_id" "uuid", "recent_document_name" "text", "recent_document_category" "text", "recent_document_status" "text", "recent_document_uploaded_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  resolved_client_id uuid;
begin
  resolved_client_id :=
    public.current_client_id();

  if resolved_client_id is null then
    raise exception
      'An active client portal profile was not found.'
      using errcode = 'P0001';
  end if;

  return query
  with current_return as (
    select
      tax_return.id,
      tax_return.client_id,
      tax_return.tax_year,
      tax_return.return_type,
      tax_return.tax_form,
      tax_return.status,
      tax_return.assigned_preparer_id,
      tax_return.preparation_fee,
      tax_return.discount_amount,
      tax_return.updated_at
    from public.tax_returns as tax_return
    where
      tax_return.client_id =
        resolved_client_id
    order by
      tax_return.tax_year desc,
      tax_return.updated_at desc,
      tax_return.created_at desc
    limit 1
  ),

  return_payments as (
    select
      payment.tax_return_id,

      coalesce(
        sum(payment.amount),
        0
      ) as total_payments
    from public.payments as payment
    inner join current_return
      on current_return.id =
        payment.tax_return_id
    where
      payment.client_id =
        resolved_client_id

      and payment.is_voided = false
    group by
      payment.tax_return_id
  ),

  client_document_summary as (
    select
      count(*) as document_count
    from public.client_documents as document
    where
      document.client_id =
        resolved_client_id

      and document.archived_at is null
  ),

  recent_document as (
    select
      document.id,
      document.original_file_name,
      document.category,
      document.status,
      document.created_at
    from public.client_documents as document
    where
      document.client_id =
        resolved_client_id

      and document.archived_at is null
    order by
      document.created_at desc
    limit 1
  )

  select
    client.id as client_id,
    client.client_number,
    client.first_name,
    client.preferred_name,

    current_return.id as current_return_id,
    current_return.tax_year as current_tax_year,
    current_return.return_type as current_return_type,
    current_return.tax_form as current_tax_form,
    current_return.status as current_return_status,
    current_return.updated_at
      as current_return_updated_at,

    coalesce(
      nullif(
        trim(preparer.display_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            preparer.first_name,
            preparer.last_name
          )
        ),
        ''
      )
    ) as assigned_preparer_name,

    coalesce(
      current_return.preparation_fee,
      0
    ) as preparation_fee,

    coalesce(
      current_return.discount_amount,
      0
    ) as discount_amount,

    coalesce(
      return_payments.total_payments,
      0
    ) as total_payments,

    greatest(
      coalesce(
        current_return.preparation_fee,
        0
      )
      -
      coalesce(
        current_return.discount_amount,
        0
      )
      -
      coalesce(
        return_payments.total_payments,
        0
      ),
      0
    ) as outstanding_balance,

    coalesce(
      client_document_summary.document_count,
      0
    ) as document_count,

    recent_document.id
      as recent_document_id,

    recent_document.original_file_name
      as recent_document_name,

    recent_document.category
      as recent_document_category,

    recent_document.status
      as recent_document_status,

    recent_document.created_at
      as recent_document_uploaded_at

  from public.clients as client

  left join current_return
    on current_return.client_id =
      client.id

  left join public.profiles as preparer
    on preparer.id =
      current_return.assigned_preparer_id

  left join return_payments
    on return_payments.tax_return_id =
      current_return.id

  cross join client_document_summary

  left join recent_document
    on true

  where
    client.id =
      resolved_client_id;
end;
$$;


ALTER FUNCTION "public"."get_client_portal_dashboard"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_client_portal_dashboard"() IS 'Returns the authenticated client portal user dashboard summary without exposing internal notes or administrative fields.';



CREATE OR REPLACE FUNCTION "public"."get_client_returns"() RETURNS TABLE("return_id" "uuid", "tax_year" integer, "return_type" "public"."return_type", "tax_form" "public"."tax_form_type", "status" "public"."return_status", "assigned_preparer_name" "text", "updated_at" timestamp with time zone, "preparation_fee" numeric, "discount_amount" numeric, "total_payments" numeric, "outstanding_balance" numeric, "document_count" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    tr.id as return_id,
    tr.tax_year,
    tr.return_type,
    tr.tax_form,
    tr.status,

    nullif(
      trim(
        concat_ws(
          ' ',
          p.first_name,
          p.last_name
        )
      ),
      ''
    ) as assigned_preparer_name,

    tr.updated_at,

    coalesce(
      tr.preparation_fee,
      0
    ) as preparation_fee,

    coalesce(
      tr.discount_amount,
      0
    ) as discount_amount,

    coalesce(
      (
        select sum(pay.amount)
        from public.payments pay
        where pay.tax_return_id = tr.id
          and pay.is_voided = false
      ),
      0
    ) as total_payments,

    greatest(
      coalesce(
        tr.preparation_fee,
        0
      )
      -
      coalesce(
        tr.discount_amount,
        0
      )
      -
      coalesce(
        (
          select sum(pay.amount)
          from public.payments pay
          where pay.tax_return_id = tr.id
            and pay.is_voided = false
        ),
        0
      ),
      0
    ) as outstanding_balance,

    (
      select count(*)
      from public.client_documents d
      where d.tax_return_id = tr.id
        and d.archived_at is null
        and d.is_current_version = true
    ) as document_count

  from public.tax_returns tr

  left join public.profiles p
    on p.id = tr.assigned_preparer_id

  where tr.client_id =
    public.current_client_id()

  order by
    tr.tax_year desc,
    tr.updated_at desc;
$$;


ALTER FUNCTION "public"."get_client_returns"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_client_tax_returns"("requested_client_id" "uuid") RETURNS TABLE("id" "uuid", "client_id" "uuid", "tax_year" integer, "return_type" "public"."return_type", "tax_form" "public"."tax_form_type", "filing_status" "public"."filing_status", "status" "public"."return_status", "assigned_preparer_id" "uuid", "assigned_preparer_name" "text", "assigned_reviewer_id" "uuid", "assigned_reviewer_name" "text", "date_received" "date", "due_date" "date", "filed_date" "date", "accepted_date" "date", "preparation_fee" numeric, "discount_amount" numeric, "net_fee" numeric, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$ begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
return query
select tax_return.id,
  tax_return.client_id,
  tax_return.tax_year,
  tax_return.return_type,
  tax_return.tax_form,
  tax_return.filing_status,
  tax_return.status,
  tax_return.assigned_preparer_id,
  coalesce(
    nullif(preparer.display_name, ''),
    nullif(
      concat_ws(
        ' ',
        preparer.first_name,
        preparer.last_name
      ),
      ''
    ),
    preparer.email
  ),
  tax_return.assigned_reviewer_id,
  coalesce(
    nullif(reviewer.display_name, ''),
    nullif(
      concat_ws(
        ' ',
        reviewer.first_name,
        reviewer.last_name
      ),
      ''
    ),
    reviewer.email
  ),
  tax_return.date_received,
  tax_return.due_date,
  tax_return.filed_date,
  tax_return.accepted_date,
  tax_return.preparation_fee,
  tax_return.discount_amount,
  (
    tax_return.preparation_fee - tax_return.discount_amount
  )::numeric,
  tax_return.created_at,
  tax_return.updated_at
from public.tax_returns as tax_return
  left join public.profiles as preparer on preparer.id = tax_return.assigned_preparer_id
  left join public.profiles as reviewer on reviewer.id = tax_return.assigned_reviewer_id
where tax_return.client_id = requested_client_id
order by tax_return.tax_year desc,
  tax_return.created_at desc;
end;
$$;


ALTER FUNCTION "public"."get_client_tax_returns"("requested_client_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_client_tax_returns"("requested_client_id" "uuid") IS 'Returns the complete tax-return history for one client.';



CREATE OR REPLACE FUNCTION "public"."get_current_access_status"() RETURNS TABLE("id" "uuid", "email" "text", "first_name" "text", "last_name" "text", "display_name" "text", "role" "public"."app_role", "is_active" boolean)
    LANGUAGE "sql" STABLE
    SET "search_path" TO ''
    AS $$
select profile.id,
  profile.email,
  profile.first_name,
  profile.last_name,
  profile.display_name,
  profile.role,
  profile.is_active
from public.profiles as profile
where profile.id = auth.uid();
$$;


ALTER FUNCTION "public"."get_current_access_status"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_current_access_status"() IS 'Returns the authenticated user profile and staff access status.';



CREATE OR REPLACE FUNCTION "public"."get_current_client_profile"() RETURNS TABLE("portal_profile_id" "uuid", "auth_user_id" "uuid", "client_id" "uuid", "client_number" bigint, "email" "text", "first_name" "text", "middle_name" "text", "last_name" "text", "preferred_name" "text", "phone" "text", "portal_status" "public"."client_portal_status", "invited_at" timestamp with time zone, "activated_at" timestamp with time zone, "last_login_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select
    portal_profile.id,
    portal_profile.auth_user_id,
    portal_profile.client_id,
    client.client_number,
    portal_profile.email,
    client.first_name,
    client.middle_name,
    client.last_name,
    client.preferred_name,
    client.phone,
    portal_profile.portal_status,
    portal_profile.invited_at,
    portal_profile.activated_at,
    portal_profile.last_login_at,
    portal_profile.created_at,
    portal_profile.updated_at
  from public.client_portal_profiles as portal_profile
  inner join public.clients as client
    on client.id = portal_profile.client_id
  where portal_profile.auth_user_id = auth.uid()
  limit 1;
$$;


ALTER FUNCTION "public"."get_current_client_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_attention_items"("requested_limit" integer DEFAULT 8) RETURNS TABLE("id" "uuid", "client_id" "uuid", "client_number" bigint, "client_name" "text", "tax_year" integer, "return_type" "public"."return_type", "tax_form" "public"."tax_form_type", "status" "public"."return_status", "assigned_preparer_name" "text", "due_date" "date", "net_fee" numeric, "updated_at" timestamp with time zone, "reason" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare safe_limit integer;
begin
  if auth.uid() is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then raise exception 'An active staff account is required.'; end if;

  safe_limit := least(greatest(coalesce(requested_limit, 8), 1), 25);

  return query
  with attention as (
    select
      tax_return.id,
      tax_return.client_id,
      client.client_number,
      concat_ws(' ', client.first_name, client.last_name) as client_name,
      tax_return.tax_year,
      tax_return.return_type,
      tax_return.tax_form,
      tax_return.status,
      coalesce(
        nullif(preparer.display_name, ''),
        nullif(concat_ws(' ', preparer.first_name, preparer.last_name), ''),
        preparer.email
      ) as assigned_preparer_name,
      tax_return.due_date,
      (tax_return.preparation_fee - tax_return.discount_amount)::numeric as net_fee,
      tax_return.updated_at,
      case
        when tax_return.due_date < current_date then 'overdue'
        when tax_return.due_date between current_date and current_date + 7 then 'due_soon'
        when tax_return.assigned_preparer_id is null then 'unassigned'
        else 'documents_pending'
      end as reason,
      case
        when tax_return.due_date < current_date then 1
        when tax_return.due_date between current_date and current_date + 7 then 2
        when tax_return.assigned_preparer_id is null then 3
        else 4
      end as priority
    from public.tax_returns as tax_return
    join public.clients as client on client.id = tax_return.client_id
    left join public.profiles as preparer on preparer.id = tax_return.assigned_preparer_id
    where tax_return.status not in ('completed', 'accepted')
      and (
        tax_return.due_date < current_date
        or tax_return.due_date between current_date and current_date + 7
        or tax_return.assigned_preparer_id is null
        or tax_return.status = 'documents_pending'
      )
  )
  select
    attention.id,
    attention.client_id,
    attention.client_number,
    attention.client_name,
    attention.tax_year,
    attention.return_type,
    attention.tax_form,
    attention.status,
    attention.assigned_preparer_name,
    attention.due_date,
    attention.net_fee,
    attention.updated_at,
    attention.reason
  from attention
  order by attention.priority, attention.due_date nulls last, attention.updated_at desc
  limit safe_limit;
end;
$$;


ALTER FUNCTION "public"."get_dashboard_attention_items"("requested_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_executive_metrics"() RETURNS TABLE("projected_revenue" numeric, "due_next_7_days" integer, "due_next_30_days" integer, "completed_this_week" integer, "completed_this_month" integer, "review_queue" integer)
    LANGUAGE "sql" STABLE
    AS $$

select

coalesce(
(
select sum(preparation_fee)
from tax_returns
where status <> 'completed'
),
0
) as projected_revenue,

coalesce(
(
select count(*)
from tax_returns
where
due_date between current_date
and current_date + interval '7 day'
and status <> 'completed'
),
0
) as due_next_7_days,

coalesce(
(
select count(*)
from tax_returns
where
due_date between current_date
and current_date + interval '30 day'
and status <> 'completed'
),
0
) as due_next_30_days,

coalesce(
(
select count(*)
from tax_returns
where
workflow_completed_at >= date_trunc('week', now())
),
0
) as completed_this_week,

coalesce(
(
select count(*)
from tax_returns
where
workflow_completed_at >= date_trunc('month', now())
),
0
) as completed_this_month,

coalesce(
(
select count(*)
from tax_returns
where workflow_status = 'review'
),
0
) as review_queue;

$$;


ALTER FUNCTION "public"."get_dashboard_executive_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_monthly_financials"() RETURNS TABLE("month_start" "date", "month_label" "text", "fees" numeric, "payments" numeric, "outstanding" numeric)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  return query
  with months as (
    select generate_series(
      date_trunc('month', current_date) - interval '5 months',
      date_trunc('month', current_date),
      interval '1 month'
    )::date as month_start
  ),
  return_fees as (
    select
      date_trunc('month', tax_return.date_received)::date as month_start,
      coalesce(sum(tax_return.preparation_fee - tax_return.discount_amount), 0)::numeric as fees
    from public.tax_returns as tax_return
    where tax_return.date_received >= date_trunc('month', current_date) - interval '5 months'
    group by 1
  ),
  payment_totals as (
    select
      date_trunc('month', payment.payment_date)::date as month_start,
      coalesce(sum(payment.amount), 0)::numeric as payments
    from public.payments as payment
    where payment.is_voided = false
      and payment.payment_date >= date_trunc('month', current_date) - interval '5 months'
    group by 1
  )
  select
    months.month_start,
    to_char(months.month_start, 'Mon YYYY') as month_label,
    coalesce(return_fees.fees, 0)::numeric as fees,
    coalesce(payment_totals.payments, 0)::numeric as payments,
    greatest(
      coalesce(return_fees.fees, 0) - coalesce(payment_totals.payments, 0),
      0
    )::numeric as outstanding
  from months
  left join return_fees using (month_start)
  left join payment_totals using (month_start)
  order by months.month_start;
end;
$$;


ALTER FUNCTION "public"."get_dashboard_monthly_financials"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_my_workload"() RETURNS TABLE("assigned_to_me" bigint, "review_assigned_to_me" bigint, "due_today" bigint, "due_this_week" bigint, "overdue" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  return query
  select
    count(*) filter (
      where tax_return.assigned_preparer_id = auth.uid()
        and tax_return.status not in ('completed', 'accepted')
    )::bigint as assigned_to_me,
    count(*) filter (
      where tax_return.assigned_reviewer_id = auth.uid()
        and tax_return.status not in ('completed', 'accepted')
    )::bigint as review_assigned_to_me,
    count(*) filter (
      where tax_return.assigned_preparer_id = auth.uid()
        and tax_return.status not in ('completed', 'accepted')
        and tax_return.due_date = current_date
    )::bigint as due_today,
    count(*) filter (
      where tax_return.assigned_preparer_id = auth.uid()
        and tax_return.status not in ('completed', 'accepted')
        and tax_return.due_date >= current_date
        and tax_return.due_date <= current_date + 7
    )::bigint as due_this_week,
    count(*) filter (
      where tax_return.assigned_preparer_id = auth.uid()
        and tax_return.status not in ('completed', 'accepted')
        and tax_return.due_date < current_date
    )::bigint as overdue
  from public.tax_returns as tax_return;
end;
$$;


ALTER FUNCTION "public"."get_dashboard_my_workload"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_priority_queue"("requested_limit" integer DEFAULT 25) RETURNS TABLE("id" "uuid", "return_id" "uuid", "client_id" "uuid", "client_name" "text", "tax_year" integer, "return_type" "text", "status" "text", "risk_score" integer, "risk_level" "text", "readiness_score" integer, "due_date" "date", "days_until_due" integer, "days_since_activity" integer, "assigned_preparer_name" "text", "assigned_reviewer_name" "text", "outstanding_balance" numeric, "recommended_action" "text", "action_route" "text", "risk_factors" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if auth.uid() is not null
    and not public.current_user_is_active()
  then
    raise exception
      'Your account is not authorized to view the dashboard priority queue.';
  end if;

  return query
  with document_summary as (
    select
      tax_return.id as tax_return_id,

      count(required_document.id)
        filter (
          where required_document.is_required = true
        )::integer as required_document_count,

      count(required_document.id)
        filter (
          where required_document.is_required = true
            and required_document.is_complete = true
        )::integer as completed_required_document_count,

      count(required_document.id)
        filter (
          where required_document.is_required = true
            and required_document.is_complete = false
        )::integer as incomplete_required_document_count

    from public.tax_returns as tax_return

    left join public.return_required_documents
      as required_document
      on required_document.tax_return_id =
        tax_return.id

    group by tax_return.id
  ),

  payment_summary as (
    select
      payment.tax_return_id,

      coalesce(
        sum(payment.amount)
          filter (
            where payment.is_voided = false
          ),
        0
      )::numeric as total_payments

    from public.payments as payment

    where payment.tax_return_id is not null

    group by payment.tax_return_id
  ),

  activity_summary as (
    select
      activity.return_id as tax_return_id,
      max(activity.occurred_at) as last_activity_at

    from public.tax_return_activity as activity

    group by activity.return_id
  ),

  return_base as (
    select
      tax_return.id,
      tax_return.id as return_id,
      client.id as client_id,

      concat(
        client.last_name,
        ', ',
        client.first_name
      )::text as client_name,

      tax_return.tax_year,
      tax_return.return_type::text as return_type,
      tax_return.workflow_status::text as status,
      tax_return.workflow_status,

      tax_return.date_received,
      tax_return.due_date,

      tax_return.assigned_preparer_id,
      tax_return.assigned_reviewer_id,

      coalesce(
        nullif(preparer.display_name, ''),
        concat_ws(
          ' ',
          preparer.first_name,
          preparer.last_name
        ),
        preparer.email
      )::text as assigned_preparer_name,

      coalesce(
        nullif(reviewer.display_name, ''),
        concat_ws(
          ' ',
          reviewer.first_name,
          reviewer.last_name
        ),
        reviewer.email
      )::text as assigned_reviewer_name,

      tax_return.preparation_fee,

      tax_return.discount_amount,

      tax_return.federal_return_required,
      tax_return.state_return_required,
      tax_return.local_return_required,

      coalesce(
        document_summary.required_document_count,
        0
      ) as required_document_count,

      coalesce(
        document_summary.completed_required_document_count,
        0
      ) as completed_required_document_count,

      coalesce(
        document_summary.incomplete_required_document_count,
        0
      ) as incomplete_required_document_count,

      coalesce(
        payment_summary.total_payments,
        0
      ) as total_payments,

      greatest(
        coalesce(tax_return.preparation_fee, 0)
        - coalesce(tax_return.discount_amount, 0)
        - coalesce(payment_summary.total_payments, 0),
        0
      )::numeric as outstanding_balance,

      case
        when tax_return.due_date is null
          then null

        else
          (
            tax_return.due_date
            - current_date
          )::integer
      end as days_until_due,

      (
        current_date
        - greatest(
            tax_return.updated_at,
            coalesce(
              activity_summary.last_activity_at,
              tax_return.updated_at
            )
          )::date
      )::integer as days_since_activity

    from public.tax_returns as tax_return

    inner join public.clients as client
      on client.id = tax_return.client_id

    left join public.profiles as preparer
      on preparer.id =
        tax_return.assigned_preparer_id

    left join public.profiles as reviewer
      on reviewer.id =
        tax_return.assigned_reviewer_id

    left join document_summary
      on document_summary.tax_return_id =
        tax_return.id

    left join payment_summary
      on payment_summary.tax_return_id =
        tax_return.id

    left join activity_summary
      on activity_summary.tax_return_id =
        tax_return.id

    where tax_return.workflow_status not in (
      'filed',
      'completed'
    )
  ),

  readiness_base as (
    select
      return_base.*,

      case
        when return_base.date_received is not null
          then 1
        else 0
      end as intake_check,

      case
        when return_base.required_document_count > 0
          and return_base.incomplete_required_document_count = 0
          then 1
        else 0
      end as document_check,

      case
        when return_base.assigned_preparer_id is not null
          then 1
        else 0
      end as preparer_check,

      case
        when return_base.workflow_status not in (
          'review',
          'signature_pending',
          'ready_to_file',
          'filed',
          'completed'
        )
          then 1

        when return_base.assigned_reviewer_id is not null
          then 1

        else 0
      end as reviewer_check,

      case
        when return_base.federal_return_required = true
          or return_base.state_return_required = true
          or return_base.local_return_required = true
          then 1
        else 0
      end as filing_check,

      case
        when return_base.preparation_fee is not null
          then 1
        else 0
      end as financial_check,

      case
        when return_base.workflow_status <> 'on_hold'
          then 1
        else 0
      end as workflow_check

    from return_base
  ),

  scored_returns as (
    select
      readiness_base.*,

      round(
        (
          (
            readiness_base.intake_check
            + readiness_base.document_check
            + readiness_base.preparer_check
            + readiness_base.reviewer_check
            + readiness_base.filing_check
            + readiness_base.financial_check
            + readiness_base.workflow_check
          )::numeric
          / 7::numeric
        ) * 100
      )::integer as readiness_score,

      least(
        100,

        (
          case
            when readiness_base.days_until_due < 0
              then 40

            when readiness_base.days_until_due between 0 and 3
              then 30

            when readiness_base.days_until_due between 4 and 7
              then 20

            else 0
          end

          +

          case
            when readiness_base.workflow_status = 'on_hold'
              then 25
            else 0
          end

          +

          case
            when readiness_base.required_document_count = 0
              or readiness_base.incomplete_required_document_count > 0
              then 15
            else 0
          end

          +

          case
            when readiness_base.assigned_preparer_id is null
              then 20
            else 0
          end

          +

          case
            when readiness_base.workflow_status in (
              'review',
              'signature_pending',
              'ready_to_file'
            )
              and readiness_base.assigned_reviewer_id is null
              then 10
            else 0
          end

          +

          case
            when readiness_base.days_since_activity > 14
              then 15

            when readiness_base.days_since_activity > 7
              then 8

            else 0
          end

          +

          case
            when readiness_base.outstanding_balance > 0
              then 5
            else 0
          end
        )
      )::integer as calculated_risk_score

    from readiness_base
  ),

  prioritized_returns as (
    select
      scored_returns.*,

      case
        when scored_returns.calculated_risk_score >= 60
          then 'critical'

        when scored_returns.calculated_risk_score >= 35
          then 'high'

        when scored_returns.calculated_risk_score >= 15
          then 'medium'

        else 'low'
      end::text as calculated_risk_level,

      case
        when scored_returns.workflow_status = 'on_hold'
          then 'Resolve return blocker'

        when scored_returns.days_until_due < 0
          then 'Complete overdue return immediately'

        when scored_returns.assigned_preparer_id is null
          then 'Assign preparer'

        when scored_returns.required_document_count = 0
          or scored_returns.incomplete_required_document_count > 0
          then 'Collect required documents'

        when scored_returns.days_until_due between 0 and 3
          then 'Prioritize before deadline'

        when scored_returns.workflow_status in (
          'review',
          'signature_pending',
          'ready_to_file'
        )
          and scored_returns.assigned_reviewer_id is null
          then 'Assign reviewer'

        when scored_returns.days_since_activity > 14
          then 'Follow up on inactive return'

        when scored_returns.outstanding_balance > 0
          then 'Review outstanding balance'

        else 'Continue processing'
      end::text as calculated_recommended_action

    from scored_returns
  )

  select
    prioritized_returns.id,
    prioritized_returns.return_id,
    prioritized_returns.client_id,
    prioritized_returns.client_name,
    prioritized_returns.tax_year,
    prioritized_returns.return_type,
    prioritized_returns.status,
    prioritized_returns.calculated_risk_score
      as risk_score,
    prioritized_returns.calculated_risk_level
      as risk_level,
    prioritized_returns.readiness_score,
    prioritized_returns.due_date,
    prioritized_returns.days_until_due,
    prioritized_returns.days_since_activity,
    prioritized_returns.assigned_preparer_name,
    prioritized_returns.assigned_reviewer_name,
    prioritized_returns.outstanding_balance,
    prioritized_returns.calculated_recommended_action
      as recommended_action,

    (
      '/returns/'
      || prioritized_returns.return_id::text
    )::text as action_route,

    (
      select coalesce(
        jsonb_agg(risk_factor.factor),
        '[]'::jsonb
      )

      from (
        values
          (
            case
              when prioritized_returns.days_until_due < 0
                then jsonb_build_object(
                  'type',
                  'overdue',
                  'label',
                  'Return overdue',
                  'description',
                  abs(
                    prioritized_returns.days_until_due
                  ) || ' day(s) overdue',
                  'points',
                  40
                )
            end
          ),

          (
            case
              when prioritized_returns.days_until_due
                between 0 and 7
                then jsonb_build_object(
                  'type',
                  'due_soon',
                  'label',
                  'Deadline approaching',
                  'description',
                  prioritized_returns.days_until_due
                    || ' day(s) remaining',
                  'points',
                  case
                    when prioritized_returns.days_until_due <= 3
                      then 30
                    else 20
                  end
                )
            end
          ),

          (
            case
              when prioritized_returns.required_document_count = 0
                or prioritized_returns.incomplete_required_document_count > 0
                then jsonb_build_object(
                  'type',
                  'missing_documents',
                  'label',
                  'Documents incomplete',
                  'description',
                  'Required tax documents must be reviewed or completed',
                  'points',
                  15
                )
            end
          ),

          (
            case
              when prioritized_returns.assigned_preparer_id is null
                then jsonb_build_object(
                  'type',
                  'missing_preparer',
                  'label',
                  'Preparer not assigned',
                  'description',
                  'This return needs an assigned preparer',
                  'points',
                  20
                )
            end
          ),

          (
            case
              when prioritized_returns.workflow_status in (
                'review',
                'signature_pending',
                'ready_to_file'
              )
                and prioritized_returns.assigned_reviewer_id is null
                then jsonb_build_object(
                  'type',
                  'missing_reviewer',
                  'label',
                  'Reviewer not assigned',
                  'description',
                  'This return needs an assigned reviewer',
                  'points',
                  10
                )
            end
          ),

          (
            case
              when prioritized_returns.workflow_status = 'on_hold'
                then jsonb_build_object(
                  'type',
                  'blocked',
                  'label',
                  'Return blocked',
                  'description',
                  'The return is currently on hold',
                  'points',
                  25
                )
            end
          ),

          (
            case
              when prioritized_returns.days_since_activity > 7
                then jsonb_build_object(
                  'type',
                  'inactive',
                  'label',
                  'Return inactive',
                  'description',
                  prioritized_returns.days_since_activity
                    || ' day(s) since the latest activity',
                  'points',
                  case
                    when prioritized_returns.days_since_activity > 14
                      then 15
                    else 8
                  end
                )
            end
          ),

          (
            case
              when prioritized_returns.outstanding_balance > 0
                then jsonb_build_object(
                  'type',
                  'unpaid_balance',
                  'label',
                  'Outstanding balance',
                  'description',
                  'A balance remains on this return',
                  'points',
                  5
                )
            end
          )
      ) as risk_factor(factor)

      where risk_factor.factor is not null
    ) as risk_factors

  from prioritized_returns

  order by
    prioritized_returns.calculated_risk_score desc,
    prioritized_returns.due_date asc nulls last,
    prioritized_returns.days_since_activity desc

  limit greatest(
    least(
      coalesce(requested_limit, 25),
      100
    ),
    1
  );
end;
$$;


ALTER FUNCTION "public"."get_dashboard_priority_queue"("requested_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_readiness_metrics"() RETURNS TABLE("active_returns" bigint, "readiness_eligible_returns" bigint, "ready_for_preparation" bigint, "needs_documents" bigint, "missing_preparer" bigint, "ready_for_review" bigint, "blocked_returns" bigint, "overdue_returns" bigint, "average_readiness_score" integer, "office_health_score" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.current_user_is_active() then
    raise exception
      'Your account is not authorized to view dashboard readiness metrics.';
  end if;

  return query
  with document_summary as (
    select
      tax_return.id as tax_return_id,

      count(required_document.id)
        filter (
          where required_document.is_required = true
        )::integer as required_document_count,

      count(required_document.id)
        filter (
          where required_document.is_required = true
            and required_document.is_complete = true
        )::integer as completed_required_document_count,

      count(required_document.id)
        filter (
          where required_document.is_required = true
            and required_document.is_complete = false
        )::integer as incomplete_required_document_count

    from public.tax_returns as tax_return

    left join public.return_required_documents
      as required_document
      on required_document.tax_return_id =
        tax_return.id

    group by tax_return.id
  ),

  readiness_base as (
    select
      tax_return.id,

      tax_return.workflow_status,

      tax_return.assigned_preparer_id,

      tax_return.assigned_reviewer_id,

      tax_return.date_received,

      tax_return.due_date,

      tax_return.preparation_fee,

      tax_return.federal_return_required,

      tax_return.state_return_required,

      tax_return.local_return_required,

      coalesce(
        document_summary.required_document_count,
        0
      ) as required_document_count,

      coalesce(
        document_summary.completed_required_document_count,
        0
      ) as completed_required_document_count,

      coalesce(
        document_summary.incomplete_required_document_count,
        0
      ) as incomplete_required_document_count,

      tax_return.workflow_status not in (
        'completed',
        'filed'
      ) as is_active,

      tax_return.workflow_status in (
        'intake',
        'documents_pending',
        'ready_for_preparation'
      ) as is_readiness_eligible,

      (
        tax_return.due_date is not null
        and tax_return.due_date < current_date
        and tax_return.workflow_status not in (
          'completed',
          'filed'
        )
      ) as is_overdue,

      case
        when tax_return.date_received is not null
          then 1
        else 0
      end as intake_check,

      case
        when
          coalesce(
            document_summary.required_document_count,
            0
          ) > 0
          and coalesce(
            document_summary.incomplete_required_document_count,
            0
          ) = 0
          then 1
        else 0
      end as document_check,

      case
        when tax_return.assigned_preparer_id is not null
          then 1
        else 0
      end as preparer_check,

      case
        when tax_return.workflow_status not in (
          'review',
          'signature_pending',
          'ready_to_file',
          'filed',
          'completed'
        )
          then 1

        when tax_return.assigned_reviewer_id is not null
          then 1

        else 0
      end as reviewer_check,

      case
        when
          tax_return.federal_return_required = true
          or tax_return.state_return_required = true
          or tax_return.local_return_required = true
          then 1
        else 0
      end as filing_check,

      case
        when tax_return.preparation_fee is not null
          then 1
        else 0
      end as financial_check,

      case
        when tax_return.workflow_status <> 'on_hold'
          then 1
        else 0
      end as workflow_check

    from public.tax_returns as tax_return

    left join document_summary
      on document_summary.tax_return_id =
        tax_return.id
  ),

  readiness_scored as (
    select
      readiness_base.*,

      round(
        (
          (
            readiness_base.intake_check
            + readiness_base.document_check
            + readiness_base.preparer_check
            + readiness_base.reviewer_check
            + readiness_base.filing_check
            + readiness_base.financial_check
            + readiness_base.workflow_check
          )::numeric
          / 7::numeric
        ) * 100
      )::integer as readiness_score,

      (
        readiness_base.date_received is not null

        and readiness_base.required_document_count > 0

        and readiness_base.incomplete_required_document_count = 0

        and readiness_base.assigned_preparer_id is not null

        and (
          readiness_base.federal_return_required = true
          or readiness_base.state_return_required = true
          or readiness_base.local_return_required = true
        )

        and readiness_base.preparation_fee is not null

        and readiness_base.workflow_status <> 'on_hold'
      ) as is_ready_for_preparation

    from readiness_base
  ),

  metric_totals as (
    select
      count(*)
        filter (
          where readiness_scored.is_active = true
        )::bigint as active_returns,

      count(*)
        filter (
          where readiness_scored.is_active = true
            and readiness_scored.is_readiness_eligible = true
        )::bigint as readiness_eligible_returns,

      count(*)
        filter (
          where readiness_scored.is_active = true

            and readiness_scored.is_readiness_eligible = true

            and readiness_scored.is_ready_for_preparation = true
        )::bigint as ready_for_preparation,

      count(*)
        filter (
          where readiness_scored.is_active = true

            and (
              readiness_scored.required_document_count = 0

              or readiness_scored.incomplete_required_document_count > 0
            )
        )::bigint as needs_documents,

      count(*)
        filter (
          where readiness_scored.is_active = true

            and readiness_scored.assigned_preparer_id is null
        )::bigint as missing_preparer,

      count(*)
        filter (
          where readiness_scored.workflow_status = 'review'
        )::bigint as ready_for_review,

      count(*)
        filter (
          where readiness_scored.workflow_status = 'on_hold'
        )::bigint as blocked_returns,

      count(*)
        filter (
          where readiness_scored.is_overdue = true
        )::bigint as overdue_returns,

      coalesce(
        round(
          avg(readiness_scored.readiness_score)
            filter (
              where readiness_scored.is_active = true
            )
        ),
        100
      )::integer as average_readiness_score

    from readiness_scored
  )

  select
    metric_totals.active_returns,

    metric_totals.readiness_eligible_returns,

    metric_totals.ready_for_preparation,

    metric_totals.needs_documents,

    metric_totals.missing_preparer,

    metric_totals.ready_for_review,

    metric_totals.blocked_returns,

    metric_totals.overdue_returns,

    metric_totals.average_readiness_score,

    case
      when metric_totals.active_returns = 0 then 100

      else greatest(
        0,
        least(
          100,
          round(
            (
              metric_totals.average_readiness_score * 0.70
            )
            +
            (
              (
                1
                -
                (
                  metric_totals.blocked_returns::numeric
                  /
                  metric_totals.active_returns::numeric
                )
              ) * 15
            )
            +
            (
              (
                1
                -
                (
                  metric_totals.overdue_returns::numeric
                  /
                  metric_totals.active_returns::numeric
                )
              ) * 15
            )
          )::integer
        )
      )
    end as office_health_score

  from metric_totals;
end;
$$;


ALTER FUNCTION "public"."get_dashboard_readiness_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_recent_returns"("requested_limit" integer DEFAULT 8) RETURNS TABLE("id" "uuid", "client_id" "uuid", "client_number" bigint, "client_name" "text", "tax_year" integer, "return_type" "public"."return_type", "tax_form" "public"."tax_form_type", "status" "public"."return_status", "assigned_preparer_name" "text", "due_date" "date", "net_fee" numeric, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare safe_limit integer;
begin
  if auth.uid() is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then raise exception 'An active staff account is required.'; end if;

  safe_limit := least(greatest(coalesce(requested_limit, 8), 1), 25);

  return query
  select
    tax_return.id,
    tax_return.client_id,
    client.client_number,
    concat_ws(' ', client.first_name, client.last_name),
    tax_return.tax_year,
    tax_return.return_type,
    tax_return.tax_form,
    tax_return.status,
    coalesce(
      nullif(preparer.display_name, ''),
      nullif(concat_ws(' ', preparer.first_name, preparer.last_name), ''),
      preparer.email
    ),
    tax_return.due_date,
    (tax_return.preparation_fee - tax_return.discount_amount)::numeric,
    tax_return.updated_at
  from public.tax_returns as tax_return
  join public.clients as client on client.id = tax_return.client_id
  left join public.profiles as preparer on preparer.id = tax_return.assigned_preparer_id
  order by tax_return.updated_at desc
  limit safe_limit;
end;
$$;


ALTER FUNCTION "public"."get_dashboard_recent_returns"("requested_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_smart_recommendations"("requested_limit" integer DEFAULT 12) RETURNS TABLE("id" "text", "return_id" "uuid", "client_id" "uuid", "client_name" "text", "tax_year" integer, "return_type" "public"."return_type", "recommendation_type" "text", "title" "text", "explanation" "text", "priority" "text", "readiness_score" integer, "due_date" "date", "action_route" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.current_user_is_active() then
    raise exception
      'Your account is not authorized to view dashboard recommendations.';
  end if;

  return query
  with document_summary as (
    select
      tax_return.id as tax_return_id,

      count(required_document.id)
        filter (
          where required_document.is_required = true
        )::integer as required_document_count,

      count(required_document.id)
        filter (
          where required_document.is_required = true
            and required_document.is_complete = true
        )::integer as completed_required_document_count,

      count(required_document.id)
        filter (
          where required_document.is_required = true
            and required_document.is_complete = false
        )::integer as incomplete_required_document_count

    from public.tax_returns as tax_return

    left join public.return_required_documents
      as required_document
      on required_document.tax_return_id =
        tax_return.id

    group by tax_return.id
  ),

  readiness_base as (
    select
      tax_return.id as return_id,

      tax_return.client_id,

      concat_ws(
        ' ',
        client.first_name,
        client.last_name
      ) as client_name,

      tax_return.tax_year,

      tax_return.return_type,

      tax_return.workflow_status,

      tax_return.assigned_preparer_id,

      tax_return.assigned_reviewer_id,

      tax_return.date_received,

      tax_return.due_date,

      tax_return.preparation_fee,

      tax_return.federal_return_required,

      tax_return.state_return_required,

      tax_return.local_return_required,

      tax_return.updated_at,

      coalesce(
        document_summary.required_document_count,
        0
      ) as required_document_count,

      coalesce(
        document_summary.completed_required_document_count,
        0
      ) as completed_required_document_count,

      coalesce(
        document_summary.incomplete_required_document_count,
        0
      ) as incomplete_required_document_count,

      case
        when tax_return.date_received is not null
          then 1
        else 0
      end as intake_check,

      case
        when
          coalesce(
            document_summary.required_document_count,
            0
          ) > 0
          and coalesce(
            document_summary.incomplete_required_document_count,
            0
          ) = 0
          then 1
        else 0
      end as document_check,

      case
        when tax_return.assigned_preparer_id is not null
          then 1
        else 0
      end as preparer_check,

      case
        when tax_return.workflow_status not in (
          'review',
          'signature_pending',
          'ready_to_file',
          'filed',
          'completed'
        )
          then 1

        when tax_return.assigned_reviewer_id is not null
          then 1

        else 0
      end as reviewer_check,

      case
        when
          tax_return.federal_return_required = true
          or tax_return.state_return_required = true
          or tax_return.local_return_required = true
          then 1
        else 0
      end as filing_check,

      case
        when tax_return.preparation_fee is not null
          then 1
        else 0
      end as financial_check,

      case
        when tax_return.workflow_status <> 'on_hold'
          then 1
        else 0
      end as workflow_check

    from public.tax_returns as tax_return

    inner join public.clients as client
      on client.id = tax_return.client_id

    left join document_summary
      on document_summary.tax_return_id =
        tax_return.id

    where tax_return.workflow_status not in (
      'filed',
      'completed'
    )
  ),

  readiness_scored as (
    select
      readiness_base.*,

      round(
        (
          (
            readiness_base.intake_check
            + readiness_base.document_check
            + readiness_base.preparer_check
            + readiness_base.reviewer_check
            + readiness_base.filing_check
            + readiness_base.financial_check
            + readiness_base.workflow_check
          )::numeric
          / 7::numeric
        ) * 100
      )::integer as readiness_score,

      (
        readiness_base.date_received is not null

        and readiness_base.required_document_count > 0

        and readiness_base.incomplete_required_document_count = 0

        and readiness_base.assigned_preparer_id is not null

        and (
          readiness_base.federal_return_required = true
          or readiness_base.state_return_required = true
          or readiness_base.local_return_required = true
        )

        and readiness_base.preparation_fee is not null

        and readiness_base.workflow_status <> 'on_hold'
      ) as is_ready_for_preparation

    from readiness_base
  ),

  recommendation_candidates as (
    /*
     * Critical: returns that are blocked.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':resolve-blocker'
      ) as id,

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'resolve_blocker'::text
        as recommendation_type,

      'Resolve blocked return'::text
        as title,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return is currently on hold and cannot advance.'
      ) as explanation,

      'critical'::text as priority,

      1 as priority_rank,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ) as action_route,

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.workflow_status =
      'on_hold'

    union all

    /*
     * Critical: active returns that are overdue.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':overdue'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'due_date'::text,

      'Address overdue return'::text,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return was due on ',
        to_char(
          readiness_scored.due_date,
          'Mon DD, YYYY'
        ),
        '.'
      ),

      'critical'::text,

      2,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.due_date is not null
      and readiness_scored.due_date < current_date

    union all

    /*
     * High: required-document checklist is missing or incomplete.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':collect-documents'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'collect_documents'::text,

      case
        when
          readiness_scored.required_document_count = 0
          then 'Create required-document checklist'

        when
          readiness_scored.incomplete_required_document_count = 1
          then 'Collect final required document'

        else 'Collect missing required documents'
      end,

      case
        when
          readiness_scored.required_document_count = 0
          then concat(
            readiness_scored.client_name,
            '''s ',
            readiness_scored.tax_year,
            ' return does not have a required-document checklist.'
          )

        when
          readiness_scored.incomplete_required_document_count = 1
          then concat(
            readiness_scored.client_name,
            '''s ',
            readiness_scored.tax_year,
            ' return is missing one required document.'
          )

        else concat(
          readiness_scored.client_name,
          '''s ',
          readiness_scored.tax_year,
          ' return is missing ',
          readiness_scored.incomplete_required_document_count,
          ' required documents.'
        )
      end,

      'high'::text,

      3,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.workflow_status in (
      'intake',
      'documents_pending',
      'ready_for_preparation'
    )
      and (
        readiness_scored.required_document_count = 0
        or readiness_scored.incomplete_required_document_count > 0
      )

    union all

    /*
     * High: active returns without a preparer.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':assign-preparer'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'assign_preparer'::text,

      'Assign a preparer'::text,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return does not have an assigned preparer.'
      ),

      'high'::text,

      4,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.assigned_preparer_id
      is null

    union all

    /*
     * Medium: readiness requirements are complete.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':begin-preparation'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'begin_preparation'::text,

      'Begin return preparation'::text,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return has satisfied its readiness requirements and can move into preparation.'
      ),

      'medium'::text,

      5,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.workflow_status in (
      'intake',
      'documents_pending',
      'ready_for_preparation'
    )
      and readiness_scored.is_ready_for_preparation =
        true

    union all

    /*
     * Medium: review-stage returns without a reviewer.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':assign-reviewer'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'assign_reviewer'::text,

      'Assign a reviewer'::text,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return is ready for review but has no assigned reviewer.'
      ),

      'medium'::text,

      6,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.workflow_status =
      'review'
      and readiness_scored.assigned_reviewer_id
        is null

    union all

    /*
     * Low: review-stage returns that already have a reviewer.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':review-return'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'review_return'::text,

      'Complete return review'::text,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return is assigned and waiting in the review queue.'
      ),

      'low'::text,

      7,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.workflow_status =
      'review'
      and readiness_scored.assigned_reviewer_id
        is not null

    union all

    /*
     * Low: returns due within seven days.
     */
    select
      concat(
        readiness_scored.return_id::text,
        ':due-soon'
      ),

      readiness_scored.return_id,

      readiness_scored.client_id,

      readiness_scored.client_name,

      readiness_scored.tax_year,

      readiness_scored.return_type,

      'due_date'::text,

      'Return due soon'::text,

      concat(
        readiness_scored.client_name,
        '''s ',
        readiness_scored.tax_year,
        ' return is due on ',
        to_char(
          readiness_scored.due_date,
          'Mon DD, YYYY'
        ),
        '.'
      ),

      'low'::text,

      8,

      readiness_scored.readiness_score,

      readiness_scored.due_date,

      concat(
        '/returns/',
        readiness_scored.return_id::text
      ),

      readiness_scored.updated_at

    from readiness_scored

    where readiness_scored.due_date
      between current_date
      and current_date + 7
  )

  select
    recommendation_candidates.id,

    recommendation_candidates.return_id,

    recommendation_candidates.client_id,

    recommendation_candidates.client_name,

    recommendation_candidates.tax_year,

    recommendation_candidates.return_type,

    recommendation_candidates.recommendation_type,

    recommendation_candidates.title,

    recommendation_candidates.explanation,

    recommendation_candidates.priority,

    recommendation_candidates.readiness_score,

    recommendation_candidates.due_date,

    recommendation_candidates.action_route

  from recommendation_candidates

  order by
    recommendation_candidates.priority_rank,
    recommendation_candidates.due_date
      nulls last,
    recommendation_candidates.updated_at,
    recommendation_candidates.client_name

  limit greatest(
    1,
    least(
      coalesce(requested_limit, 12),
      50
    )
  );
end;
$$;


ALTER FUNCTION "public"."get_dashboard_smart_recommendations"("requested_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_staff_workload"() RETURNS TABLE("staff_id" "uuid", "staff_name" "text", "assigned_returns" bigint, "overdue_returns" bigint, "awaiting_review_returns" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  return query
  with staff as (
    select
      profile.id,
      coalesce(
        nullif(profile.display_name, ''),
        nullif(concat_ws(' ', profile.first_name, profile.last_name), ''),
        profile.email
      ) as staff_name
    from public.profiles as profile
    where profile.is_active = true
      and profile.role in ('administrator', 'manager', 'preparer', 'reviewer')
  )
  select
    staff.id,
    staff.staff_name,
    count(tax_return.id) filter (
      where tax_return.assigned_preparer_id = staff.id
        and tax_return.status not in ('completed', 'accepted')
    )::bigint as assigned_returns,
    count(tax_return.id) filter (
      where tax_return.assigned_preparer_id = staff.id
        and tax_return.status not in ('completed', 'accepted')
        and tax_return.due_date < current_date
    )::bigint as overdue_returns,
    count(tax_return.id) filter (
      where tax_return.assigned_reviewer_id = staff.id
        and tax_return.status in ('ready_for_review', 'under_review')
    )::bigint as awaiting_review_returns
  from staff
  left join public.tax_returns as tax_return
    on tax_return.assigned_preparer_id = staff.id
    or tax_return.assigned_reviewer_id = staff.id
  group by staff.id, staff.staff_name
  having
    count(tax_return.id) filter (
      where tax_return.assigned_preparer_id = staff.id
        and tax_return.status not in ('completed', 'accepted')
    ) > 0
    or count(tax_return.id) filter (
      where tax_return.assigned_reviewer_id = staff.id
        and tax_return.status in ('ready_for_review', 'under_review')
    ) > 0
  order by assigned_returns desc, overdue_returns desc, staff.staff_name
  limit 10;
end;
$$;


ALTER FUNCTION "public"."get_dashboard_staff_workload"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_status_metrics"() RETURNS TABLE("status" "public"."return_status", "status_label" "text", "return_count" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  return query
  select
    tax_return.status,
    initcap(replace(tax_return.status::text, '_', ' ')) as status_label,
    count(*)::bigint as return_count
  from public.tax_returns as tax_return
  group by tax_return.status
  order by count(*) desc, tax_return.status::text;
end;
$$;


ALTER FUNCTION "public"."get_dashboard_status_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_summary"() RETURNS TABLE("active_clients" bigint, "total_returns" bigint, "open_returns" bigint, "completed_returns" bigint, "in_progress_returns" bigint, "awaiting_review_returns" bigint, "documents_pending" bigint, "upcoming_deadlines" bigint, "overdue_returns" bigint, "unassigned_returns" bigint, "total_fees" numeric, "total_payments" numeric, "outstanding_balance" numeric, "workflow_intake" bigint, "workflow_documents_pending" bigint, "workflow_ready_for_preparation" bigint, "workflow_in_preparation" bigint, "workflow_review" bigint, "workflow_signature_pending" bigint, "workflow_ready_to_file" bigint, "workflow_filed" bigint, "workflow_completed" bigint, "workflow_on_hold" bigint)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  return query
  with client_totals as (
    select
      count(*) filter (
        where client.status = 'active'
      )::bigint as active_clients
    from public.clients as client
  ),

  return_totals as (
    select
      count(*)::bigint as total_returns,

      count(*) filter (
        where tax_return.status not in (
          'completed',
          'accepted'
        )
      )::bigint as open_returns,

      count(*) filter (
        where tax_return.status in (
          'completed',
          'accepted'
        )
      )::bigint as completed_returns,

      count(*) filter (
        where tax_return.status = 'in_progress'
      )::bigint as in_progress_returns,

      count(*) filter (
        where tax_return.status in (
          'ready_for_review',
          'under_review'
        )
      )::bigint as awaiting_review_returns,

      count(*) filter (
        where tax_return.status = 'documents_pending'
      )::bigint as documents_pending,

      count(*) filter (
        where tax_return.due_date >= current_date
          and tax_return.due_date <= current_date + 7
          and tax_return.status not in (
            'completed',
            'accepted'
          )
      )::bigint as upcoming_deadlines,

      count(*) filter (
        where tax_return.due_date < current_date
          and tax_return.status not in (
            'completed',
            'accepted'
          )
      )::bigint as overdue_returns,

      count(*) filter (
        where tax_return.assigned_preparer_id is null
          and tax_return.status not in (
            'completed',
            'accepted'
          )
      )::bigint as unassigned_returns,

      coalesce(
        sum(
          tax_return.preparation_fee -
          tax_return.discount_amount
        ),
        0
      )::numeric as total_fees,

      count(*) filter (
        where coalesce(
          tax_return.workflow_status,
          'intake'
        ) = 'intake'
      )::bigint as workflow_intake,

      count(*) filter (
        where tax_return.workflow_status =
          'documents_pending'
      )::bigint as workflow_documents_pending,

      count(*) filter (
        where tax_return.workflow_status =
          'ready_for_preparation'
      )::bigint as workflow_ready_for_preparation,

      count(*) filter (
        where tax_return.workflow_status =
          'in_preparation'
      )::bigint as workflow_in_preparation,

      count(*) filter (
        where tax_return.workflow_status =
          'review'
      )::bigint as workflow_review,

      count(*) filter (
        where tax_return.workflow_status =
          'signature_pending'
      )::bigint as workflow_signature_pending,

      count(*) filter (
        where tax_return.workflow_status =
          'ready_to_file'
      )::bigint as workflow_ready_to_file,

      count(*) filter (
        where tax_return.workflow_status =
          'filed'
      )::bigint as workflow_filed,

      count(*) filter (
        where tax_return.workflow_status =
          'completed'
      )::bigint as workflow_completed,

      count(*) filter (
        where tax_return.workflow_status =
          'on_hold'
      )::bigint as workflow_on_hold

    from public.tax_returns as tax_return
  ),

  payment_totals as (
    select
      coalesce(
        sum(payment.amount) filter (
          where payment.is_voided = false
        ),
        0
      )::numeric as total_payments
    from public.payments as payment
  )

  select
    client_totals.active_clients,
    return_totals.total_returns,
    return_totals.open_returns,
    return_totals.completed_returns,
    return_totals.in_progress_returns,
    return_totals.awaiting_review_returns,
    return_totals.documents_pending,
    return_totals.upcoming_deadlines,
    return_totals.overdue_returns,
    return_totals.unassigned_returns,
    return_totals.total_fees,
    payment_totals.total_payments,

    greatest(
      return_totals.total_fees -
      payment_totals.total_payments,
      0
    )::numeric as outstanding_balance,

    return_totals.workflow_intake,
    return_totals.workflow_documents_pending,
    return_totals.workflow_ready_for_preparation,
    return_totals.workflow_in_preparation,
    return_totals.workflow_review,
    return_totals.workflow_signature_pending,
    return_totals.workflow_ready_to_file,
    return_totals.workflow_filed,
    return_totals.workflow_completed,
    return_totals.workflow_on_hold

  from client_totals
  cross join return_totals
  cross join payment_totals;
end;
$$;


ALTER FUNCTION "public"."get_dashboard_summary"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_dashboard_summary"() IS 'Returns dashboard totals and workflow-stage counts for active authenticated staff.';



CREATE OR REPLACE FUNCTION "public"."get_document_analysis_jobs"("requested_document_id" "uuid") RETURNS TABLE("job_id" "uuid", "document_id" "uuid", "organizer_id" "uuid", "evidence_id" "uuid", "provider_key" "text", "provider_name" "text", "status" "text", "requested_by" "uuid", "requested_by_name" "text", "requested_at" timestamp with time zone, "queued_at" timestamp with time zone, "processing_started_at" timestamp with time zone, "completed_at" timestamp with time zone, "failed_at" timestamp with time zone, "attempt_count" integer, "max_attempts" integer, "failure_code" "text", "failure_message" "text", "result_id" "uuid", "document_type" "text", "overall_confidence" numeric, "requires_staff_review" boolean, "review_outcome" "text", "reviewed_by_name" "text", "reviewed_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
#variable_conflict use_column
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  return query
  select
    job.id,
    job.document_id,
    job.organizer_id,
    job.evidence_id,
    provider.provider_key,
    provider.display_name,
    job.status,
    job.requested_by,
    coalesce(
      nullif(trim(requested_profile.display_name), ''),
      nullif(trim(concat_ws(
        ' ',
        requested_profile.first_name,
        requested_profile.last_name
      )), ''),
      requested_profile.email,
      'Unknown Staff Member'
    ),
    job.requested_at,
    job.queued_at,
    job.processing_started_at,
    job.completed_at,
    job.failed_at,
    job.attempt_count,
    job.max_attempts,
    job.failure_code,
    job.failure_message,
    result.id,
    result.document_type,
    result.overall_confidence,
    result.requires_staff_review,
    result.review_outcome,
    coalesce(
      nullif(trim(reviewed_profile.display_name), ''),
      reviewed_profile.email
    ),
    result.reviewed_at
  from public.document_analysis_jobs as job
  join public.document_analysis_providers as provider
    on provider.id = job.provider_id
  left join public.profiles as requested_profile
    on requested_profile.id = job.requested_by
  left join public.document_analysis_results as result
    on result.job_id = job.id
  left join public.profiles as reviewed_profile
    on reviewed_profile.id = result.reviewed_by
  where job.document_id = requested_document_id
  order by job.created_at desc;
end;
$$;


ALTER FUNCTION "public"."get_document_analysis_jobs"("requested_document_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_executive_financial_analytics"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$declare
  current_user_id uuid := auth.uid();
  
  today_date date := current_date;
  year_start date := date_trunc('year', current_date)::date;
  result jsonb;
begin
  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  if not public.can_view_executive_financial_analytics() then
    raise exception 'You are not authorized to view executive financial analytics.';
  end if;

  with
  active_payments as (
    select
      payment.id,
      payment.tax_return_id,
      payment.amount,
      payment.payment_date,
      payment.payment_method
    from public.payments payment
    where payment.is_voided = false
  ),
  return_financials as (
    select
      tax_return.id,
      tax_return.assigned_preparer_id,
      greatest(
        coalesce(tax_return.preparation_fee, 0) -
        coalesce(tax_return.discount_amount, 0),
        0
      ) as net_fee,
      coalesce(sum(active_payment.amount), 0) as total_paid
    from public.tax_returns tax_return
    left join active_payments active_payment
      on active_payment.tax_return_id = tax_return.id
    group by
      tax_return.id,
      tax_return.assigned_preparer_id,
      tax_return.preparation_fee,
      tax_return.discount_amount
  ),
  period_metrics as (
    select
      coalesce(sum(amount) filter (
        where payment_date = today_date
      ), 0) as today_revenue,
      count(*) filter (
        where payment_date = today_date
      ) as today_count,

      coalesce(sum(amount) filter (
        where payment_date = today_date - 1
      ), 0) as yesterday_revenue,

      coalesce(sum(amount) filter (
        where payment_date between today_date - 6 and today_date
      ), 0) as last_7_days_revenue,

      coalesce(sum(amount) filter (
        where payment_date between today_date - 13 and today_date - 7
      ), 0) as previous_7_days_revenue,

      coalesce(sum(amount) filter (
        where payment_date between today_date - 29 and today_date
      ), 0) as last_30_days_revenue,

      coalesce(sum(amount) filter (
        where payment_date >= year_start
          and payment_date <= today_date
      ), 0) as year_to_date_revenue
    from active_payments
  ),
  collection_metrics as (
    select
      coalesce(sum(net_fee), 0) as total_fees,
      coalesce(sum(total_paid), 0) as total_collected,
      coalesce(sum(greatest(net_fee - total_paid, 0)), 0) as outstanding,
      count(*) filter (
        where greatest(net_fee - total_paid, 0) > 0
      ) as returns_awaiting_payment
    from return_financials
  ),
  payment_methods as (
    select
      payment_method,
      count(*) as payment_count,
      coalesce(sum(amount), 0) as total_amount
    from active_payments
    group by payment_method
  ),
  preparer_metrics as (
    select
      profile.id as preparer_id,
      coalesce(
        nullif(trim(profile.display_name), ''),
        nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''),
        profile.email,
        'Unassigned'
      ) as preparer_name,
      count(return_financial.id) as return_count,
      coalesce(sum(return_financial.net_fee), 0) as total_fees,
      coalesce(sum(return_financial.total_paid), 0) as total_collected,
      coalesce(
        sum(
          greatest(
            return_financial.net_fee - return_financial.total_paid,
            0
          )
        ),
        0
      ) as outstanding
    from public.profiles profile
    join return_financials return_financial
      on return_financial.assigned_preparer_id = profile.id
    where profile.role in ('administrator', 'manager', 'preparer')
    group by
      profile.id,
      profile.display_name,
      profile.first_name,
      profile.last_name,
      profile.email
    order by total_collected desc, total_fees desc
    limit 5
  ),
  daily_snapshot as (
    select
      (
        select count(*)
        from public.tax_returns tax_return
        where (
          tax_return.workflow_completed_at::date = today_date
          or (
            tax_return.workflow_completed_at is null
            and tax_return.status = 'completed'
            and tax_return.updated_at::date = today_date
          )
        )
      ) as returns_completed_today,

      (
        select count(*)
        from public.tax_returns tax_return
        where tax_return.filed_date = today_date
      ) as returns_filed_today,

      (
        select count(*)
        from public.clients client
        where client.created_at::date = today_date
      ) as new_clients_today
  )
  select jsonb_build_object(
    'periods',
    jsonb_build_object(
      'todayRevenue', period.today_revenue,
      'todayPaymentCount', period.today_count,
      'yesterdayRevenue', period.yesterday_revenue,
      'last7DaysRevenue', period.last_7_days_revenue,
      'previous7DaysRevenue', period.previous_7_days_revenue,
      'last30DaysRevenue', period.last_30_days_revenue,
      'yearToDateRevenue', period.year_to_date_revenue,
      'averageDailyRevenue',
        case
          when today_date < year_start then 0
          else round(
            period.year_to_date_revenue /
            greatest((today_date - year_start) + 1, 1),
            2
          )
        end
    ),
    'collection',
    jsonb_build_object(
      'totalFees', collection.total_fees,
      'totalCollected', collection.total_collected,
      'outstandingReceivables', collection.outstanding,
      'returnsAwaitingPayment', collection.returns_awaiting_payment,
      'collectionRate',
        case
          when collection.total_fees <= 0 then 0
          else round(
            (collection.total_collected / collection.total_fees) * 100,
            1
          )
        end
    ),
    'paymentMethods',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'paymentMethod', method.payment_method,
            'paymentCount', method.payment_count,
            'totalAmount', method.total_amount
          )
          order by method.total_amount desc
        )
        from payment_methods method
      ),
      '[]'::jsonb
    ),
    'preparers',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'preparerId', preparer.preparer_id,
            'preparerName', preparer.preparer_name,
            'returnCount', preparer.return_count,
            'totalFees', preparer.total_fees,
            'totalCollected', preparer.total_collected,
            'outstandingReceivables', preparer.outstanding,
            'collectionRate',
              case
                when preparer.total_fees <= 0 then 0
                else round(
                  (preparer.total_collected / preparer.total_fees) * 100,
                  1
                )
              end
          )
          order by preparer.total_collected desc
        )
        from preparer_metrics preparer
      ),
      '[]'::jsonb
    ),
    'dailySnapshot',
    jsonb_build_object(
      'returnsCompletedToday', snapshot.returns_completed_today,
      'paymentsReceivedToday', period.today_count,
      'revenueToday', period.today_revenue,
      'returnsAwaitingPayment', collection.returns_awaiting_payment,
      'returnsFiledToday', snapshot.returns_filed_today,
      'newClientsToday', snapshot.new_clients_today
    ),
    'generatedAt',
    now()
  )
  into result
  from period_metrics period
  cross join collection_metrics collection
  cross join daily_snapshot snapshot;

  return result;
end;$$;


ALTER FUNCTION "public"."get_executive_financial_analytics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_unread_document_notification_count"() RETURNS bigint
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select count(*)::bigint
  from public.document_notifications as notification
  where notification.recipient_user_id = auth.uid()
    and notification.read_at is null
    and notification.archived_at is null
    and public.current_user_is_active();
$$;


ALTER FUNCTION "public"."get_my_unread_document_notification_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_office_payment_summary"() RETURNS TABLE("payments_today" numeric, "payment_count_today" bigint, "payments_this_month" numeric, "payment_count_this_month" bigint, "outstanding_receivables" numeric, "returns_with_balance" bigint, "voided_payments_total" numeric, "voided_payment_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  return query
  with active_payments as (
    select
      payment.amount,
      payment.payment_date
    from public.payments payment
    where payment.is_voided = false
  ),
  return_balances as (
    select
      tax_return.id,
      greatest(
        coalesce(tax_return.preparation_fee, 0)
        - coalesce(tax_return.discount_amount, 0)
        - coalesce(
            sum(
              case
                when payment.is_voided = false
                  then payment.amount
                else 0
              end
            ),
            0
          ),
        0
      ) as outstanding_balance
    from public.tax_returns tax_return
    left join public.payments payment
      on payment.tax_return_id = tax_return.id
    group by
      tax_return.id,
      tax_return.preparation_fee,
      tax_return.discount_amount
  ),
  voided_payments as (
    select
      coalesce(sum(payment.amount), 0) as total_amount,
      count(*) as payment_count
    from public.payments payment
    where payment.is_voided = true
  )
  select
    coalesce(
      (
        select sum(active_payment.amount)
        from active_payments active_payment
        where active_payment.payment_date =
          current_date
      ),
      0
    ) as payments_today,

    (
      select count(*)
      from active_payments active_payment
      where active_payment.payment_date =
        current_date
    ) as payment_count_today,

    coalesce(
      (
        select sum(active_payment.amount)
        from active_payments active_payment
        where active_payment.payment_date >=
          date_trunc(
            'month',
            current_date
          )::date
          and active_payment.payment_date <
            (
              date_trunc(
                'month',
                current_date
              )
              + interval '1 month'
            )::date
      ),
      0
    ) as payments_this_month,

    (
      select count(*)
      from active_payments active_payment
      where active_payment.payment_date >=
        date_trunc(
          'month',
          current_date
        )::date
        and active_payment.payment_date <
          (
            date_trunc(
              'month',
              current_date
            )
            + interval '1 month'
          )::date
    ) as payment_count_this_month,

    coalesce(
      (
        select sum(
          return_balance.outstanding_balance
        )
        from return_balances return_balance
      ),
      0
    ) as outstanding_receivables,

    (
      select count(*)
      from return_balances return_balance
      where return_balance.outstanding_balance > 0
    ) as returns_with_balance,

    (
      select voided_payment.total_amount
      from voided_payments voided_payment
    ) as voided_payments_total,

    (
      select voided_payment.payment_count
      from voided_payments voided_payment
    ) as voided_payment_count;
end;
$$;


ALTER FUNCTION "public"."get_office_payment_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_or_create_client_tax_organizer"("requested_tax_year" integer) RETURNS TABLE("organizer_id" "uuid", "client_id" "uuid", "tax_year" integer, "organizer_status" "public"."tax_organizer_status", "current_section" "public"."tax_organizer_section_key", "progress_percentage" integer, "started_at" timestamp with time zone, "last_saved_at" timestamp with time zone, "submitted_at" timestamp with time zone, "reviewed_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "sections" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
  current_client_id uuid;
  organizer_record public.client_tax_organizers;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_tax_year is null then
    raise exception
      'A tax year is required.';
  end if;

  if requested_tax_year < 2000
    or requested_tax_year > 2100
  then
    raise exception
      'The selected tax year is invalid.';
  end if;

  select
    profile.client_id
  into
    current_client_id
  from public.client_portal_profiles as profile
  where profile.auth_user_id =
      current_user_id
    and profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    organizer.*
  into
    organizer_record
  from public.client_tax_organizers as organizer
  where organizer.client_id =
      current_client_id
    and organizer.tax_year =
      requested_tax_year
  for update;

  if not found then
    insert into public.client_tax_organizers (
      client_id,
      tax_year,
      status,
      current_section,
      progress_percentage,
      started_at,
      last_saved_at
    )
    values (
      current_client_id,
      requested_tax_year,
      'in_progress',
      'personal',
      0,
      now(),
      now()
    )
    returning *
    into organizer_record;

  elsif organizer_record.status =
    'not_started'
  then
    update public.client_tax_organizers
      as organizer
    set
      status =
        'in_progress',

      started_at =
        coalesce(
          organizer.started_at,
          now()
        ),

      last_saved_at =
        now(),

      updated_at =
        now()
    where organizer.id =
      organizer_record.id
    returning organizer.*
    into organizer_record;
  end if;

  insert into public.client_tax_organizer_sections (
    organizer_id,
    section_key,
    status,
    progress_percentage
  )
  select
    organizer_record.id,
    section_definition.section_key,
    'not_started',
    0
  from (
    values
      (
        'personal'
          ::public.tax_organizer_section_key
      ),
      (
        'identity'
          ::public.tax_organizer_section_key
      ),
      (
        'banking'
          ::public.tax_organizer_section_key
      ),
      (
        'dependents'
          ::public.tax_organizer_section_key
      ),
      (
        'income'
          ::public.tax_organizer_section_key
      ),
      (
        'business'
          ::public.tax_organizer_section_key
      ),
      (
        'rental'
          ::public.tax_organizer_section_key
      ),
      (
        'healthcare'
          ::public.tax_organizer_section_key
      ),
      (
        'education'
          ::public.tax_organizer_section_key
      ),
      (
        'deductions'
          ::public.tax_organizer_section_key
      ),
      (
        'documents'
          ::public.tax_organizer_section_key
      ),
      (
        'review'
          ::public.tax_organizer_section_key
      ),
      (
        'signature'
          ::public.tax_organizer_section_key
      )
  ) as section_definition(
    section_key
  )
  on conflict on constraint
    client_tax_organizer_sections_unique
  do nothing;

  return query
  select
    organizer_record.id,
    organizer_record.client_id,
    organizer_record.tax_year,
    organizer_record.status,
    organizer_record.current_section,
    organizer_record.progress_percentage,
    organizer_record.started_at,
    organizer_record.last_saved_at,
    organizer_record.submitted_at,
    organizer_record.reviewed_at,
    organizer_record.created_at,
    organizer_record.updated_at,

    coalesce(
      (
        select
          jsonb_agg(
            jsonb_build_object(
              'id',
              organizer_section.id,

              'organizer_id',
              organizer_section.organizer_id,

              'section_key',
              organizer_section.section_key,

              'status',
              organizer_section.status,

              'progress_percentage',
              organizer_section.progress_percentage,

              'started_at',
              organizer_section.started_at,

              'completed_at',
              organizer_section.completed_at,

              'last_saved_at',
              organizer_section.last_saved_at,

              'created_at',
              organizer_section.created_at,

              'updated_at',
              organizer_section.updated_at
            )
            order by
              case organizer_section.section_key
                when 'personal' then 1
                when 'identity' then 2
                when 'banking' then 3
                when 'dependents' then 4
                when 'income' then 5
                when 'business' then 6
                when 'rental' then 7
                when 'healthcare' then 8
                when 'education' then 9
                when 'deductions' then 10
                when 'documents' then 11
                when 'review' then 12
                when 'signature' then 13
              end
          )
        from public.client_tax_organizer_sections
          as organizer_section
        where organizer_section.organizer_id =
          organizer_record.id
      ),
      '[]'::jsonb
    );
end;
$$;


ALTER FUNCTION "public"."get_or_create_client_tax_organizer"("requested_tax_year" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_organizer_review_checklist"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid") RETURNS TABLE("definition_id" "uuid", "definition_name" "text", "checklist_version" integer, "item_id" "uuid", "item_key" "text", "item_label" "text", "item_description" "text", "is_required" boolean, "display_order" integer, "is_completed" boolean, "completed_by" "uuid", "completed_by_name" "text", "completed_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
$$;


ALTER FUNCTION "public"."get_organizer_review_checklist"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_organizer_review_timeline"("requested_organizer_id" "uuid", "requested_subject_type" "text", "requested_subject_id" "uuid") RETURNS TABLE("entry_id" "uuid", "organizer_id" "uuid", "section_key" "text", "subject_type" "text", "subject_id" "uuid", "event_type" "text", "note_text" "text", "actor_id" "uuid", "actor_name" "text", "metadata" "jsonb", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
#variable_conflict use_column
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  if requested_organizer_id is null then
    raise exception 'An organizer identifier is required.';
  end if;

  if trim(coalesce(requested_subject_type, '')) = '' then
    raise exception 'A timeline subject type is required.';
  end if;

  if requested_subject_id is null then
    raise exception 'A timeline subject identifier is required.';
  end if;

  return query
  select
    entry.id,
    entry.organizer_id,
    entry.section_key,
    entry.subject_type,
    entry.subject_id,
    entry.event_type,
    entry.note_text,
    entry.actor_id,
    case
      when entry.actor_id is null then 'System'
      else coalesce(
        nullif(trim(profile.display_name), ''),
        nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''),
        profile.email,
        'Unknown Staff Member'
      )
    end,
    entry.metadata,
    entry.created_at
  from public.organizer_review_timeline_entries as entry
  left join public.profiles as profile on profile.id = entry.actor_id
  where entry.organizer_id = requested_organizer_id
    and entry.subject_type = trim(requested_subject_type)
    and entry.subject_id = requested_subject_id
  order by entry.created_at desc, entry.id desc;
end;
$$;


ALTER FUNCTION "public"."get_organizer_review_timeline"("requested_organizer_id" "uuid", "requested_subject_type" "text", "requested_subject_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_organizer_subject_evidence"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid") RETURNS TABLE("evidence_id" "uuid", "organizer_id" "uuid", "return_id" "uuid", "document_id" "uuid", "evidence_type" "text", "title" "text", "description" "text", "confidence" "text", "verification_status" "text", "created_by" "uuid", "created_by_name" "text", "verified_by" "uuid", "verified_by_name" "text", "verified_at" timestamp with time zone, "metadata" "jsonb", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "link_id" "uuid", "field_key" "text", "link_type" "text", "link_notes" "text", "linked_by" "uuid", "linked_by_name" "text", "linked_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
      'Organizer and subject identifiers are required.';
  end if;

  return query
  select
    evidence.id,
    evidence.organizer_id,
    evidence.return_id,
    evidence.document_id,
    evidence.evidence_type,
    evidence.title,
    evidence.description,
    evidence.confidence,
    evidence.verification_status,
    evidence.created_by,
    coalesce(
      nullif(
        trim(created_profile.display_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            created_profile.first_name,
            created_profile.last_name
          )
        ),
        ''
      ),
      created_profile.email,
      'Unknown Staff Member'
    ),
    evidence.verified_by,
    case
      when evidence.verified_by is null
        then null
      else coalesce(
        nullif(
          trim(verified_profile.display_name),
          ''
        ),
        nullif(
          trim(
            concat_ws(
              ' ',
              verified_profile.first_name,
              verified_profile.last_name
            )
          ),
          ''
        ),
        verified_profile.email
      )
    end,
    evidence.verified_at,
    evidence.metadata,
    evidence.created_at,
    evidence.updated_at,
    link.id,
    link.field_key,
    link.link_type,
    link.notes,
    link.linked_by,
    case
      when link.linked_by is null
        then null
      else coalesce(
        nullif(
          trim(linked_profile.display_name),
          ''
        ),
        nullif(
          trim(
            concat_ws(
              ' ',
              linked_profile.first_name,
              linked_profile.last_name
            )
          ),
          ''
        ),
        linked_profile.email
      )
    end,
    link.linked_at
  from public.organizer_evidence_links
    as link
  join public.organizer_evidence_sources
    as evidence
    on evidence.id =
      link.evidence_id
  left join public.profiles
    as created_profile
    on created_profile.id =
      evidence.created_by
  left join public.profiles
    as verified_profile
    on verified_profile.id =
      evidence.verified_by
  left join public.profiles
    as linked_profile
    on linked_profile.id =
      link.linked_by
  where link.organizer_id =
      requested_organizer_id
    and link.section_key =
      trim(
        requested_section_key
      )
    and link.subject_type =
      trim(
        requested_subject_type
      )
    and link.subject_id =
      requested_subject_id
  order by
    evidence.created_at desc,
    link.linked_at desc;
end;
$$;


ALTER FUNCTION "public"."get_organizer_subject_evidence"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_payment_receipt"("requested_payment_id" "uuid") RETURNS TABLE("payment_id" "uuid", "tax_return_id" "uuid", "client_id" "uuid", "client_number" bigint, "client_name" "text", "tax_year" integer, "return_type" "public"."return_type", "amount" numeric, "payment_date" "date", "payment_method" "public"."payment_method", "reference_number" "text", "notes" "text", "receipt_number" "text", "receipt_issued_at" timestamp with time zone, "receipt_issued_by" "uuid", "receipt_issued_by_name" "text", "created_by" "uuid", "created_by_name" "text", "is_voided" boolean, "voided_at" timestamp with time zone, "voided_by" "uuid", "voided_by_name" "text", "void_reason" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_payment_id is null then
    raise exception
      'A payment identifier is required.';
  end if;

  if not exists (
    select 1
    from public.payments payment
    where payment.id = requested_payment_id
  ) then
    raise exception
      'The selected payment was not found.';
  end if;

  return query
  select
    payment.id as payment_id,
    payment.tax_return_id,
    payment.client_id,
    client.client_number,

    concat_ws(
      ' ',
      client.first_name,
      nullif(client.middle_name, ''),
      client.last_name
    ) as client_name,

    tax_return.tax_year,
    tax_return.return_type,
    payment.amount,
    payment.payment_date,
    payment.payment_method,
    payment.reference_number,
    payment.notes,
    payment.receipt_number,
    payment.receipt_issued_at,
    payment.receipt_issued_by,

    coalesce(
      receipt_issuer.display_name,
      nullif(
        concat_ws(
          ' ',
          receipt_issuer.first_name,
          receipt_issuer.last_name
        ),
        ''
      ),
      receipt_issuer.email,
      'Smith Enterprises staff'
    ) as receipt_issued_by_name,

    payment.created_by,

    coalesce(
      creator.display_name,
      nullif(
        concat_ws(
          ' ',
          creator.first_name,
          creator.last_name
        ),
        ''
      ),
      creator.email,
      'Smith Enterprises staff'
    ) as created_by_name,

    payment.is_voided,
    payment.voided_at,
    payment.voided_by,

    case
      when payment.voided_by is null then
        null
      else
        coalesce(
          voider.display_name,
          nullif(
            concat_ws(
              ' ',
              voider.first_name,
              voider.last_name
            ),
            ''
          ),
          voider.email,
          'Smith Enterprises staff'
        )
    end as voided_by_name,

    payment.void_reason,
    payment.created_at,
    payment.updated_at

  from public.payments payment

  join public.clients client
    on client.id = payment.client_id

  join public.tax_returns tax_return
    on tax_return.id = payment.tax_return_id

  left join public.profiles receipt_issuer
    on receipt_issuer.id =
      payment.receipt_issued_by

  left join public.profiles creator
    on creator.id =
      payment.created_by

  left join public.profiles voider
    on voider.id =
      payment.voided_by

  where payment.id =
    requested_payment_id;
end;
$$;


ALTER FUNCTION "public"."get_payment_receipt"("requested_payment_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_payment_receipt"("requested_payment_id" "uuid") IS 'Returns complete client, tax return, payment, receipt, and void details for one payment.';



CREATE OR REPLACE FUNCTION "public"."get_recent_dashboard_activity"("requested_limit" integer DEFAULT 8) RETURNS TABLE("id" bigint, "action" "text", "entity_type" "text", "entity_id" "uuid", "actor_name" "text", "occurred_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare safe_limit integer;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
safe_limit := least(
  greatest(
    coalesce(requested_limit, 8),
    1
  ),
  25
);
return query
select audit.id,
  audit.action,
  audit.entity_type,
  audit.entity_id,
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
  audit.created_at as occurred_at
from public.audit_logs as audit
  left join public.profiles as profile on profile.id = audit.actor_id
order by audit.created_at desc
limit safe_limit;
end;
$$;


ALTER FUNCTION "public"."get_recent_dashboard_activity"("requested_limit" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_recent_dashboard_activity"("requested_limit" integer) IS 'Returns sanitized recent audit activity for the application dashboard.';



CREATE OR REPLACE FUNCTION "public"."get_recent_office_payments"("requested_limit" integer DEFAULT 25) RETURNS TABLE("payment_id" "uuid", "tax_return_id" "uuid", "client_id" "uuid", "client_number" bigint, "client_name" "text", "tax_year" integer, "return_type" "public"."return_type", "tax_form" "public"."tax_form_type", "amount" numeric, "payment_date" "date", "payment_method" "public"."payment_method", "reference_number" "text", "receipt_number" "text", "is_voided" boolean, "voided_at" timestamp with time zone, "void_reason" "text", "created_by" "uuid", "created_by_name" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
  normalized_limit integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  normalized_limit :=
    least(
      greatest(
        coalesce(requested_limit, 25),
        1
      ),
      100
    );

  return query
  select
    payment.id as payment_id,
    tax_return.id as tax_return_id,
    client.id as client_id,
    client.client_number,
    trim(
      concat_ws(
        ' ',
        client.first_name,
        client.last_name
      )
    ) as client_name,
    tax_return.tax_year,
    tax_return.return_type,
    tax_return.tax_form,
    payment.amount,
    payment.payment_date,
    payment.payment_method,
    payment.reference_number,
    payment.receipt_number,
    payment.is_voided,
    payment.voided_at,
    payment.void_reason,
    payment.created_by,
    coalesce(
      creator.display_name,
      'System'
    ) as created_by_name,
    payment.created_at
  from public.payments payment
  inner join public.tax_returns tax_return
    on tax_return.id =
      payment.tax_return_id
  inner join public.clients client
    on client.id =
      payment.client_id
  left join public.profiles creator
    on creator.id =
      payment.created_by
  order by
    payment.payment_date desc,
    payment.created_at desc
  limit normalized_limit;
end;
$$;


ALTER FUNCTION "public"."get_recent_office_payments"("requested_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_return_payment_summary"("requested_return_id" "uuid") RETURNS TABLE("preparation_fee" numeric, "discount_amount" numeric, "net_fee" numeric, "total_paid" numeric, "outstanding_balance" numeric, "payment_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  return query
  select
    coalesce(
      tax_return.preparation_fee,
      0
    ) as preparation_fee,

    coalesce(
      tax_return.discount_amount,
      0
    ) as discount_amount,

    greatest(
      coalesce(
        tax_return.preparation_fee,
        0
      ) -
      coalesce(
        tax_return.discount_amount,
        0
      ),
      0
    ) as net_fee,

    coalesce(
      sum(payment.amount)
        filter (
          where payment.is_voided = false
        ),
      0
    ) as total_paid,

    greatest(
      (
        coalesce(
          tax_return.preparation_fee,
          0
        ) -
        coalesce(
          tax_return.discount_amount,
          0
        )
      ) -
      coalesce(
        sum(payment.amount)
          filter (
            where payment.is_voided = false
          ),
        0
      ),
      0
    ) as outstanding_balance,

    count(payment.id)
      filter (
        where payment.is_voided = false
      ) as payment_count

  from public.tax_returns tax_return
  left join public.payments payment
    on payment.tax_return_id =
      tax_return.id

  where tax_return.id =
    requested_return_id

  group by
    tax_return.id,
    tax_return.preparation_fee,
    tax_return.discount_amount;
end;
$$;


ALTER FUNCTION "public"."get_return_payment_summary"("requested_return_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_return_payments"("requested_return_id" "uuid") RETURNS TABLE("id" "uuid", "tax_return_id" "uuid", "client_id" "uuid", "amount" numeric, "payment_date" "date", "payment_method" "public"."payment_method", "reference_number" "text", "notes" "text", "receipt_number" "text", "receipt_issued_at" timestamp with time zone, "receipt_issued_by" "uuid", "is_voided" boolean, "voided_at" timestamp with time zone, "voided_by" "uuid", "void_reason" "text", "created_by" "uuid", "created_by_name" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_return_id is null then
    raise exception
      'A tax-return identifier is required.';
  end if;

  if not exists (
    select 1
    from public.tax_returns tax_return
    where tax_return.id = requested_return_id
  ) then
    raise exception
      'The selected tax return was not found.';
  end if;

  return query
  select
    payment.id,
    payment.tax_return_id,
    payment.client_id,
    payment.amount,
    payment.payment_date,
    payment.payment_method,
    payment.reference_number,
    payment.notes,
    payment.receipt_number,
    payment.receipt_issued_at,
    payment.receipt_issued_by,
    payment.is_voided,
    payment.voided_at,
    payment.voided_by,
    payment.void_reason,
    payment.created_by,

    coalesce(
      creator.display_name,
      nullif(
        concat_ws(
          ' ',
          creator.first_name,
          creator.last_name
        ),
        ''
      ),
      creator.email,
      'System'
    ) as created_by_name,

    payment.created_at,
    payment.updated_at

  from public.payments payment

  left join public.profiles creator
    on creator.id = payment.created_by

  where payment.tax_return_id =
    requested_return_id

  order by
    payment.payment_date desc,
    payment.created_at desc;
end;
$$;


ALTER FUNCTION "public"."get_return_payments"("requested_return_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_return_staff_options"() RETURNS TABLE("id" "uuid", "display_name" "text", "email" "text", "role" "public"."app_role")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$ begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
return query
select profile.id,
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
    profile.email
  ) as display_name,
  profile.email,
  profile.role
from public.profiles as profile
where profile.is_active = true
  and profile.role in (
    'administrator',
    'manager',
    'preparer',
    'reviewer'
  )
order by display_name,
  profile.email;
end;
$$;


ALTER FUNCTION "public"."get_return_staff_options"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_return_staff_options"() IS 'Returns active preparer and reviewer assignment options.';



CREATE OR REPLACE FUNCTION "public"."get_return_workflow_history"("requested_return_id" "uuid") RETURNS TABLE("id" "uuid", "tax_return_id" "uuid", "client_id" "uuid", "event_type" "text", "event_label" "text", "event_description" "text", "event_data" "jsonb", "actor_user_id" "uuid", "actor_name" "text", "occurred_at" timestamp with time zone, "created_at" timestamp with time zone, "is_client_visible" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if auth.uid() is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_return_id is null then
    raise exception
      'A tax-return identifier is required.';
  end if;

  if not exists (
    select 1
    from public.tax_returns tax_return
    where tax_return.id = requested_return_id
  ) then
    raise exception
      'The selected tax return was not found.';
  end if;

  return query
  select
    history.id,
    history.tax_return_id,
    history.client_id,
    history.event_type,
    history.event_label,
    history.event_description,
    history.event_data,
    history.actor_user_id,

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
      profile.email,
      'System'
    ) as actor_name,

    history.occurred_at,
    history.created_at,
    history.is_client_visible
  from public.return_workflow_history history
  left join public.profiles profile
    on profile.id =
      history.actor_user_id
  where history.tax_return_id =
    requested_return_id
  order by
    history.occurred_at desc,
    history.created_at desc;
end;
$$;


ALTER FUNCTION "public"."get_return_workflow_history"("requested_return_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_return_workspace_summary"("p_return_id" "uuid") RETURNS TABLE("return_id" "uuid", "client_id" "uuid", "client_name" "text", "tax_year" integer, "return_type" "text", "status" "text", "assigned_preparer" "text", "assigned_reviewer" "text", "due_date" "date", "estimated_amount_due" numeric, "payments_received" numeric, "outstanding_balance" numeric, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "workflow_percent" integer)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$

select

    r.id as return_id,

    c.id as client_id,

    trim(
        concat_ws(
            ' ',
            c.first_name,
            c.last_name
        )
    ) as client_name,

    r.tax_year,

    r.return_type::text,

    r.status::text,

    prep.display_name as assigned_preparer,

    rev.display_name as assigned_reviewer,

    r.due_date,

    coalesce(
        r.estimated_amount_due,
        0
    ) as estimated_amount_due,

    coalesce(
        (
            select
                sum(p.amount)
            from payments p
            where
                p.tax_return_id = r.id
                and p.is_voided = false
        ),
        0
    ) as payments_received,

    coalesce(
        r.estimated_amount_due,
        0
    )
    -
    coalesce(
        (
            select
                sum(p.amount)
            from payments p
            where
                p.tax_return_id = r.id
                and p.is_voided = false
        ),
        0
    ) as outstanding_balance,

    r.created_at,

    r.updated_at,

    case r.status::text

        when 'not_started'
            then 5

        when 'documents_pending'
            then 15

        when 'in_progress'
            then 50

        when 'ready_for_review'
            then 70

        when 'under_review'
            then 80

        when 'ready_to_file'
            then 90

        when 'filed'
            then 95

        when 'accepted'
            then 100

        when 'completed'
            then 100

        when 'rejected'
            then 0

        when 'on_hold'
            then 25

        else 0

    end as workflow_percent

from tax_returns r

join clients c
    on c.id = r.client_id

left join profiles prep
    on prep.id = r.assigned_preparer_id

left join profiles rev
    on rev.id = r.assigned_reviewer_id

where r.id = p_return_id;

$$;


ALTER FUNCTION "public"."get_return_workspace_summary"("p_return_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_staff_client_organizer_workspace"("requested_client_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  current_user_id uuid;

  selected_organizer
    public.client_tax_organizers;

  assigned_preparer_id uuid;
  assigned_preparer_name text;

  income_source_count integer := 0;
  income_reviewed_count integer := 0;
  income_follow_up_count integer := 0;
  income_returned_count integer := 0;
  income_pending_count integer := 0;

  income_review_status text;
  income_review_percentage integer := 0;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles
      as profile
    where profile.id =
        current_user_id
      and profile.is_active =
        true
  ) then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_client_id is null then
    raise exception
      'A client identifier is required.';
  end if;

  if not exists (
    select 1
    from public.clients
      as client
    where client.id =
      requested_client_id
  ) then
    raise exception
      'The selected client was not found.';
  end if;

  select organizer.*
  into selected_organizer
  from public.client_tax_organizers
    as organizer
  where organizer.client_id =
    requested_client_id
  order by
    organizer.tax_year desc,
    organizer.updated_at desc,
    organizer.created_at desc
  limit 1;

  if not found then
    return jsonb_build_object(
      'hasOrganizer',
        false,

      'organizer',
        null,

      'assignment',
        null,

      'reviewSummary',
        jsonb_build_object(
          'incomeSourceCount',
            0,

          'reviewedCount',
            0,

          'needsFollowUpCount',
            0,

          'returnedToClientCount',
            0,

          'pendingCount',
            0,

          'reviewPercentage',
            0
        ),

      'sections',
        jsonb_build_array(
          jsonb_build_object(
            'key',
              'income',

            'label',
              'Income',

            'status',
              'not_started',

            'isImplemented',
              true
          ),

          jsonb_build_object(
            'key',
              'dependents',

            'label',
              'Dependents',

            'status',
              'not_started',

            'isImplemented',
              true
          ),

          jsonb_build_object(
            'key',
              'healthcare',

            'label',
              'Healthcare',

            'status',
              'not_started',

            'isImplemented',
              true
          ),

          jsonb_build_object(
            'key',
              'deductions',

            'label',
              'Deductions',

            'status',
              'not_started',

            'isImplemented',
              false
          ),

          jsonb_build_object(
            'key',
              'credits',

            'label',
              'Credits',

            'status',
              'not_started',

            'isImplemented',
              false
          )
        )
    );
  end if;

  select
    tax_return.assigned_preparer_id,

    coalesce(
      nullif(
        trim(
          preparer.display_name
        ),
        ''
      ),

      nullif(
        trim(
          concat_ws(
            ' ',
            preparer.first_name,
            preparer.last_name
          )
        ),
        ''
      ),

      preparer.email
    )

  into
    assigned_preparer_id,
    assigned_preparer_name

  from public.tax_returns
    as tax_return

  left join public.profiles
    as preparer
    on preparer.id =
      tax_return.assigned_preparer_id

  where tax_return.client_id =
      requested_client_id
    and tax_return.tax_year =
      selected_organizer.tax_year

  order by
    tax_return.updated_at desc,
    tax_return.created_at desc

  limit 1;

  select
    count(*)::integer,

    count(*) filter (
      where coalesce(
        income_review.review_status,
        'pending'
      ) =
        'reviewed'
    )::integer,

    count(*) filter (
      where coalesce(
        income_review.review_status,
        'pending'
      ) =
        'needs_follow_up'
    )::integer,

    count(*) filter (
      where coalesce(
        income_review.review_status,
        'pending'
      ) =
        'returned_to_client'
    )::integer,

    count(*) filter (
      where coalesce(
        income_review.review_status,
        'pending'
      ) =
        'pending'
    )::integer

  into
    income_source_count,
    income_reviewed_count,
    income_follow_up_count,
    income_returned_count,
    income_pending_count

  from public.client_tax_organizer_income_sources
    as income_source

  left join
    public.client_tax_organizer_income_reviews
      as income_review
    on income_review.income_source_id =
      income_source.id

  where income_source.organizer_id =
    selected_organizer.id;

  if income_source_count > 0 then
    income_review_percentage :=
      round(
        (
          income_reviewed_count::numeric /
          income_source_count::numeric
        ) *
        100
      )::integer;
  end if;

  income_review_status :=
    case
      when income_source_count = 0
        then 'not_started'

      when income_returned_count > 0
        then 'returned_to_client'

      when income_follow_up_count > 0
        then 'needs_follow_up'

      when income_reviewed_count =
        income_source_count
        then 'reviewed'

      else 'in_progress'
    end;

  return jsonb_build_object(
    'hasOrganizer',
      true,

    'organizer',
      jsonb_build_object(
        'organizerId',
          selected_organizer.id,

        'clientId',
          selected_organizer.client_id,

        'taxYear',
          selected_organizer.tax_year,

        'status',
          selected_organizer.status,

        'currentSection',
          selected_organizer.current_section,

        'progressPercentage',
          selected_organizer.progress_percentage,

        'startedAt',
          selected_organizer.started_at,

        'submittedAt',
          selected_organizer.submitted_at,

        'lastSavedAt',
          selected_organizer.last_saved_at,

        'updatedAt',
          selected_organizer.updated_at
      ),

    'assignment',
      jsonb_build_object(
        'preparerId',
          assigned_preparer_id,

        'preparerName',
          assigned_preparer_name
      ),

    'reviewSummary',
      jsonb_build_object(
        'incomeSourceCount',
          income_source_count,

        'reviewedCount',
          income_reviewed_count,

        'needsFollowUpCount',
          income_follow_up_count,

        'returnedToClientCount',
          income_returned_count,

        'pendingCount',
          income_pending_count,

        'reviewPercentage',
          income_review_percentage
      ),

    'sections',
      jsonb_build_array(
        jsonb_build_object(
          'key',
            'income',

          'label',
            'Income',

          'status',
            income_review_status,

          'isImplemented',
            true
        ),

        jsonb_build_object(
          'key',
            'dependents',

          'label',
            'Dependents',

          'status',
            'pending',

          'isImplemented',
            true
        ),

        jsonb_build_object(
          'key',
            'healthcare',

          'label',
            'Healthcare',

          'status',
            'pending',

          'isImplemented',
            true
        ),

        jsonb_build_object(
          'key',
            'deductions',

          'label',
            'Deductions',

          'status',
            'not_started',

          'isImplemented',
            false
        ),

        jsonb_build_object(
          'key',
            'credits',

          'label',
            'Credits',

          'status',
            'not_started',

          'isImplemented',
            false
        )
      )
  );
end;
$$;


ALTER FUNCTION "public"."get_staff_client_organizer_workspace"("requested_client_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_staff_client_organizer_workspace"("requested_client_id" "uuid") IS 'Returns the latest organizer, matching preparer assignment, and live Income review summary for a staff Client Details workspace card.';



CREATE OR REPLACE FUNCTION "public"."get_staff_dependent_review"("requested_dependent_id" "uuid") RETURNS TABLE("review_id" "uuid", "dependent_id" "uuid", "review_status" "text", "internal_notes" "text", "reviewed_by" "uuid", "reviewed_by_name" "text", "reviewed_at" timestamp with time zone, "follow_up_requested_at" timestamp with time zone, "returned_to_client_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
#variable_conflict use_column
declare
  selected_dependent public.client_tax_organizer_dependents;
begin
  if auth.uid() is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;
  if requested_dependent_id is null then raise exception 'A dependent identifier is required.'; end if;

  select d.* into selected_dependent
  from public.client_tax_organizer_dependents d
  where d.id = requested_dependent_id;
  if not found then raise exception 'The selected dependent was not found.'; end if;

  return query
  select r.id, selected_dependent.id, coalesce(r.review_status,'pending'),
    coalesce(r.internal_notes,''), r.reviewed_by,
    case when r.reviewed_by is null then null else coalesce(
      nullif(trim(p.display_name),''),
      nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''), p.email) end,
    r.reviewed_at, r.follow_up_requested_at, r.returned_to_client_at,
    coalesce(r.updated_at, selected_dependent.updated_at)
  from (select 1) x
  left join public.client_tax_organizer_dependent_reviews r
    on r.dependent_id = selected_dependent.id
  left join public.profiles p on p.id = r.reviewed_by;
end;
$$;


ALTER FUNCTION "public"."get_staff_dependent_review"("requested_dependent_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_staff_income_review"("requested_client_id" "uuid", "requested_tax_year" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  current_user_id uuid;
  staff_profile public.profiles;
  organizer_record public.client_tax_organizers;
  income_sources jsonb;
  income_source_count integer;
  completed_source_count integer;
  needs_review_source_count integer;
  missing_document_count integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  select profile.*
  into staff_profile
  from public.profiles as profile
  where profile.id = current_user_id
    and profile.is_active = true
  limit 1;

  if not found then
    raise exception 'An active staff profile is required.';
  end if;

  if requested_client_id is null then
    raise exception 'A client identifier is required.';
  end if;

  if requested_tax_year is null
    or requested_tax_year < 1900
    or requested_tax_year > 2200
  then
    raise exception 'A valid tax year is required.';
  end if;

  select organizer.*
  into organizer_record
  from public.client_tax_organizers as organizer
  where organizer.client_id = requested_client_id
    and organizer.tax_year = requested_tax_year
  order by organizer.created_at desc
  limit 1;

  if not found then
    raise exception 'The requested tax organizer was not found.';
  end if;

  select
    count(*)::integer,
    count(*) filter (
      where source.record_status = 'complete'
    )::integer,
    count(*) filter (
      where source.record_status = 'needs_review'
    )::integer,
    count(*) filter (
      where not source.document_received
    )::integer
  into
    income_source_count,
    completed_source_count,
    needs_review_source_count,
    missing_document_count
  from public.client_tax_organizer_income_sources as source
  where source.organizer_id = organizer_record.id;

  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'incomeSourceId', source.id,
          'organizerId', source.organizer_id,
          'incomeType', source.income_type,
          'payerName', source.payer_name,
          'recipientType', source.recipient_type,
          'recordStatus', source.record_status,
          'documentReceived', source.document_received,
          'notes', coalesce(source.notes, ''),
          'displayOrder', source.display_order,
          'createdAt', source.created_at,
          'updatedAt', source.updated_at,
          'reviewStatus',
            coalesce(
              income_review.review_status,
              'pending'
            ),
          'internalNotes',
            coalesce(
              income_review.internal_notes,
              ''
            ),
          'reviewedBy',
            income_review.reviewed_by,
          'reviewedByName',
            case
              when income_review.reviewed_by is null
                then null
              else coalesce(
                nullif(trim(reviewed_profile.display_name), ''),
                nullif(
                  trim(
                    concat_ws(
                      ' ',
                      reviewed_profile.first_name,
                      reviewed_profile.last_name
                    )
                  ),
                  ''
                ),
                reviewed_profile.email
              )
            end,
          'reviewedAt',
            income_review.reviewed_at,
          'followUpRequestedAt',
            income_review.follow_up_requested_at,
          'returnedToClientAt',
            income_review.returned_to_client_at,
          'reviewUpdatedAt',
            income_review.updated_at,
          'hasRequiredPrimaryAmount',
            case
              when source.income_type = 'w2'
                then w2.wages is not null
              when source.income_type = '1099_int'
                then details_1099_int.interest_income is not null
              when source.income_type = '1099_div'
                then details_1099_div.total_ordinary_dividends is not null
              else source.record_status = 'complete'
            end,
          'w2Details',
            case
              when w2.income_source_id is null then null
              else jsonb_build_object(
                'employerIdentificationNumber', w2.employer_identification_number,
                'wages', w2.wages,
                'federalIncomeTaxWithheld', w2.federal_income_tax_withheld,
                'socialSecurityWages', w2.social_security_wages,
                'socialSecurityTaxWithheld', w2.social_security_tax_withheld,
                'medicareWages', w2.medicare_wages,
                'medicareTaxWithheld', w2.medicare_tax_withheld,
                'stateCode', w2.state_code,
                'stateWages', w2.state_wages,
                'stateIncomeTaxWithheld', w2.state_income_tax_withheld,
                'localWages', w2.local_wages,
                'localIncomeTaxWithheld', w2.local_income_tax_withheld,
                'createdAt', w2.created_at,
                'updatedAt', w2.updated_at
              )
            end,
          'details1099Int',
            case
              when details_1099_int.income_source_id is null then null
              else jsonb_build_object(
                'payerIdentificationNumber', details_1099_int.payer_identification_number,
                'interestIncome', details_1099_int.interest_income,
                'earlyWithdrawalPenalty', details_1099_int.early_withdrawal_penalty,
                'interestOnUsSavingsBondsAndTreasuryObligations',
                  details_1099_int.interest_on_us_savings_bonds_and_treasury_obligations,
                'federalIncomeTaxWithheld', details_1099_int.federal_income_tax_withheld,
                'investmentExpenses', details_1099_int.investment_expenses,
                'foreignTaxPaid', details_1099_int.foreign_tax_paid,
                'foreignCountryOrUsPossession',
                  details_1099_int.foreign_country_or_us_possession,
                'taxExemptInterest', details_1099_int.tax_exempt_interest,
                'specifiedPrivateActivityBondInterest',
                  details_1099_int.specified_private_activity_bond_interest,
                'marketDiscount', details_1099_int.market_discount,
                'bondPremium', details_1099_int.bond_premium,
                'bondPremiumOnTreasuryObligations',
                  details_1099_int.bond_premium_on_treasury_obligations,
                'bondPremiumOnTaxExemptBond',
                  details_1099_int.bond_premium_on_tax_exempt_bond,
                'stateCode', details_1099_int.state_code,
                'stateIdentificationNumber',
                  details_1099_int.state_identification_number,
                'stateTaxWithheld', details_1099_int.state_tax_withheld,
                'createdAt', details_1099_int.created_at,
                'updatedAt', details_1099_int.updated_at
              )
            end,
          'details1099Div',
            case
              when details_1099_div.income_source_id is null then null
              else jsonb_build_object(
                'payerIdentificationNumber', details_1099_div.payer_identification_number,
                'totalOrdinaryDividends', details_1099_div.total_ordinary_dividends,
                'qualifiedDividends', details_1099_div.qualified_dividends,
                'totalCapitalGainDistributions',
                  details_1099_div.total_capital_gain_distributions,
                'unrecapturedSection1250Gain',
                  details_1099_div.unrecaptured_section_1250_gain,
                'section1202Gain', details_1099_div.section_1202_gain,
                'collectibles28PercentRateGain',
                  details_1099_div.collectibles_28_percent_rate_gain,
                'section897OrdinaryDividends',
                  details_1099_div.section_897_ordinary_dividends,
                'section897CapitalGain', details_1099_div.section_897_capital_gain,
                'nondividendDistributions',
                  details_1099_div.nondividend_distributions,
                'federalIncomeTaxWithheld',
                  details_1099_div.federal_income_tax_withheld,
                'section199aDividends', details_1099_div.section_199a_dividends,
                'investmentExpenses', details_1099_div.investment_expenses,
                'foreignTaxPaid', details_1099_div.foreign_tax_paid,
                'foreignCountryOrUsPossession',
                  details_1099_div.foreign_country_or_us_possession,
                'exemptInterestDividends',
                  details_1099_div.exempt_interest_dividends,
                'specifiedPrivateActivityBondInterestDividends',
                  details_1099_div.specified_private_activity_bond_interest_dividends,
                'stateCode', details_1099_div.state_code,
                'stateIdentificationNumber',
                  details_1099_div.state_identification_number,
                'stateTaxWithheld', details_1099_div.state_tax_withheld,
                'createdAt', details_1099_div.created_at,
                'updatedAt', details_1099_div.updated_at
              )
            end
        )
        order by source.display_order, source.created_at, source.id
      ),
      '[]'::jsonb
    )
  into income_sources
  from public.client_tax_organizer_income_sources as source
  left join public.client_tax_organizer_income_w2_details as w2
    on w2.income_source_id = source.id
  left join public.client_tax_organizer_income_1099_int_details as details_1099_int
    on details_1099_int.income_source_id = source.id
  left join public.client_tax_organizer_income_1099_div_details as details_1099_div
    on details_1099_div.income_source_id = source.id
  left join public.client_tax_organizer_income_reviews as income_review
    on income_review.income_source_id = source.id
  left join public.profiles as reviewed_profile
    on reviewed_profile.id = income_review.reviewed_by
  where source.organizer_id = organizer_record.id;

  return jsonb_build_object(
    'organizer',
      jsonb_build_object(
        'organizerId', organizer_record.id,
        'clientId', organizer_record.client_id,
        'taxYear', organizer_record.tax_year,
        'status', organizer_record.status,
        'currentSection', organizer_record.current_section,
        'progressPercentage', organizer_record.progress_percentage,
        'startedAt', organizer_record.started_at,
        'submittedAt', organizer_record.submitted_at,
        'lastSavedAt', organizer_record.last_saved_at,
        'createdAt', organizer_record.created_at,
        'updatedAt', organizer_record.updated_at
      ),
    'reviewer',
      jsonb_build_object(
        'staffId', staff_profile.id,
        'displayName',
          coalesce(
            nullif(trim(staff_profile.display_name), ''),
            nullif(
              trim(
                concat_ws(
                  ' ',
                  staff_profile.first_name,
                  staff_profile.last_name
                )
              ),
              ''
            ),
            staff_profile.email
          ),
        'role', staff_profile.role
      ),
    'summary',
      jsonb_build_object(
        'incomeSourceCount', coalesce(income_source_count, 0),
        'completedSourceCount', coalesce(completed_source_count, 0),
        'needsReviewSourceCount', coalesce(needs_review_source_count, 0),
        'missingDocumentCount', coalesce(missing_document_count, 0),
        'readySourceCount',
          greatest(
            coalesce(completed_source_count, 0)
            - coalesce(missing_document_count, 0),
            0
          )
      ),
    'incomeSources', income_sources
  );
end;
$$;


ALTER FUNCTION "public"."get_staff_income_review"("requested_client_id" "uuid", "requested_tax_year" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_staff_income_review"("requested_client_id" "uuid", "requested_tax_year" integer) IS 'Returns a unified staff-only Income organizer review payload containing W-2, 1099-INT, 1099-DIV, and staff review-state records for the requested client and tax year.';



CREATE OR REPLACE FUNCTION "public"."get_staff_organizer_dependents_review"("requested_client_id" "uuid", "requested_tax_year" integer) RETURNS TABLE("organizer_id" "uuid", "dependent_id" "uuid", "first_name" "text", "middle_name" "text", "last_name" "text", "suffix" "text", "relationship" "text", "birth_date" "date", "is_full_time_student" boolean, "is_permanently_disabled" boolean, "lived_with_taxpayer_all_year" boolean, "months_lived_with_taxpayer" smallint, "us_citizen_or_resident" boolean, "claimed_by_another_taxpayer" boolean, "display_order" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  requested_organizer_id uuid;
begin
  if auth.uid() is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_client_id is null then
    raise exception
      'A client identifier is required.';
  end if;

  if requested_tax_year is null
    or requested_tax_year < 1900
    or requested_tax_year > 2200
  then
    raise exception
      'A valid tax year is required.';
  end if;

  if not exists (
    select 1
    from public.clients
      as client
    where client.id =
      requested_client_id
  ) then
    raise exception
      'The requested client was not found.';
  end if;

  select
    organizer.id
  into
    requested_organizer_id
  from public.client_tax_organizers
    as organizer
  where organizer.client_id =
      requested_client_id
    and organizer.tax_year =
      requested_tax_year
  order by
    organizer.updated_at desc
  limit 1;

  if requested_organizer_id is null then
    raise exception
      'No tax organizer was found for the requested client and tax year.';
  end if;

  return query
  select
    dependent.organizer_id,
    dependent.id,
    dependent.first_name,
    dependent.middle_name,
    dependent.last_name,
    dependent.suffix,
    dependent.relationship,
    dependent.birth_date,
    dependent.is_full_time_student,
    dependent.is_permanently_disabled,
    dependent.lived_with_taxpayer_all_year,
    dependent.months_lived_with_taxpayer,
    dependent.us_citizen_or_resident,
    dependent.claimed_by_another_taxpayer,
    dependent.display_order,
    dependent.created_at,
    dependent.updated_at
  from public.client_tax_organizer_dependents
    as dependent
  where dependent.organizer_id =
    requested_organizer_id
  order by
    dependent.display_order,
    dependent.created_at,
    dependent.id;
end;
$$;


ALTER FUNCTION "public"."get_staff_organizer_dependents_review"("requested_client_id" "uuid", "requested_tax_year" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_staff_organizer_dependents_review"("requested_client_id" "uuid", "requested_tax_year" integer) IS 'Returns staff-safe dependent identity and eligibility information for one client organizer and tax year. Social Security numbers and Secure Vault values are excluded.';



CREATE OR REPLACE FUNCTION "public"."get_staff_organizer_healthcare_review"("requested_client_id" "uuid", "requested_tax_year" integer) RETURNS TABLE("organizer_id" "uuid", "coverage_id" "uuid", "provider_name" "text", "coverage_type" "text", "covered_person_name" "text", "policy_number" "text", "start_month" integer, "end_month" integer, "is_full_year_coverage" boolean, "document_received" boolean, "document_type" "text", "notes" "text", "record_status" "text", "display_order" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  requested_organizer_id uuid;
begin
  if auth.uid() is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_client_id is null then
    raise exception
      'A client identifier is required.';
  end if;

  if requested_tax_year is null
    or requested_tax_year < 1900
    or requested_tax_year > 2200
  then
    raise exception
      'A valid tax year is required.';
  end if;

  if not exists (
    select 1
    from public.clients
      as client
    where client.id =
      requested_client_id
  ) then
    raise exception
      'The requested client was not found.';
  end if;

  select
    organizer.id
  into
    requested_organizer_id
  from public.client_tax_organizers
    as organizer
  where organizer.client_id =
      requested_client_id
    and organizer.tax_year =
      requested_tax_year
  order by
    organizer.updated_at desc
  limit 1;

  if requested_organizer_id is null then
    raise exception
      'No tax organizer was found for the requested client and tax year.';
  end if;

  return query
  select
    coverage.organizer_id,
    coverage.id,
    coverage.provider_name,
    coverage.coverage_type,
    coverage.covered_person_name,
    coverage.policy_number,
    coverage.start_month,
    coverage.end_month,
    coverage.is_full_year_coverage,
    coverage.document_received,
    coverage.document_type,
    coverage.notes,
    coverage.record_status,
    coverage.display_order,
    coverage.created_at,
    coverage.updated_at
  from public.client_tax_organizer_healthcare_coverages
    as coverage
  where coverage.organizer_id =
    requested_organizer_id
  order by
    coverage.display_order,
    coverage.created_at,
    coverage.id;
end;
$$;


ALTER FUNCTION "public"."get_staff_organizer_healthcare_review"("requested_client_id" "uuid", "requested_tax_year" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_staff_organizer_healthcare_review"("requested_client_id" "uuid", "requested_tax_year" integer) IS 'Returns staff-visible healthcare organizer records for one client and tax year. Secure Vault values are excluded.';



CREATE OR REPLACE FUNCTION "public"."get_staff_organizer_income_review"("requested_client_id" "uuid", "requested_tax_year" integer) RETURNS TABLE("organizer_id" "uuid", "income_source_id" "uuid", "income_type" "text", "payer_name" "text", "recipient_type" "text", "record_status" "text", "document_received" boolean, "notes" "text", "display_order" integer, "employer_identification_number" "text", "wages" numeric, "federal_income_tax_withheld" numeric, "social_security_wages" numeric, "social_security_tax_withheld" numeric, "medicare_wages" numeric, "medicare_tax_withheld" numeric, "state_code" "text", "state_wages" numeric, "state_income_tax_withheld" numeric, "local_wages" numeric, "local_income_tax_withheld" numeric, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  requested_organizer_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  if requested_client_id is null then
    raise exception 'A client identifier is required.';
  end if;

  if requested_tax_year is null
    or requested_tax_year < 1900
    or requested_tax_year > 2200
  then
    raise exception 'A valid tax year is required.';
  end if;

  if not exists (
    select 1
    from public.clients as client
    where client.id = requested_client_id
  ) then
    raise exception 'The requested client was not found.';
  end if;

  select organizer.id
  into requested_organizer_id
  from public.client_tax_organizers as organizer
  where organizer.client_id = requested_client_id
    and organizer.tax_year = requested_tax_year
  order by organizer.updated_at desc
  limit 1;

  if requested_organizer_id is null then
    raise exception
      'No tax organizer was found for the requested client and tax year.';
  end if;

  return query
  select
    income.organizer_id,
    income.id,
    income.income_type,
    income.payer_name,
    income.recipient_type,
    income.record_status,
    income.document_received,
    income.notes,
    income.display_order,
    w2.employer_identification_number,
    w2.wages,
    w2.federal_income_tax_withheld,
    w2.social_security_wages,
    w2.social_security_tax_withheld,
    w2.medicare_wages,
    w2.medicare_tax_withheld,
    w2.state_code,
    w2.state_wages,
    w2.state_income_tax_withheld,
    w2.local_wages,
    w2.local_income_tax_withheld,
    income.created_at,
    greatest(
      income.updated_at,
      coalesce(w2.updated_at, income.updated_at)
    ) as updated_at
  from public.client_tax_organizer_income_sources as income
  left join public.client_tax_organizer_income_w2_details as w2
    on w2.income_source_id = income.id
  where income.organizer_id = requested_organizer_id
  order by
    income.display_order,
    income.created_at,
    income.id;
end;
$$;


ALTER FUNCTION "public"."get_staff_organizer_income_review"("requested_client_id" "uuid", "requested_tax_year" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_staff_organizer_income_review"("requested_client_id" "uuid", "requested_tax_year" integer) IS 'Returns staff-visible organizer income records and W-2 detail values for one client and tax year. Employee SSNs and Secure Vault values are excluded.';



CREATE OR REPLACE FUNCTION "public"."get_staff_organizer_summary"("requested_client_id" "uuid", "requested_tax_year" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  organizer_record
    public.client_tax_organizers%rowtype;

  client_record
    public.clients%rowtype;

  section_payload jsonb;
  overview_payload jsonb;
begin
  if auth.uid() is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_client_id is null then
    raise exception
      'A client identifier is required.';
  end if;

  if requested_tax_year is null
    or requested_tax_year < 1900
    or requested_tax_year > 2200
  then
    raise exception
      'A valid tax year is required.';
  end if;

  select
    client.*
  into
    client_record
  from public.clients
    as client
  where client.id =
    requested_client_id
  limit 1;

  if not found then
    raise exception
      'The requested client was not found.';
  end if;

  select
    organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as organizer
  where organizer.client_id =
      requested_client_id
    and organizer.tax_year =
      requested_tax_year
  order by organizer.updated_at desc
  limit 1;

  if not found then
    raise exception
      'No tax organizer was found for the requested client and tax year.';
  end if;

  with
  dependent_metrics as (
    select
      count(*)::integer
        as record_count,

      count(*)::integer
        as completed_record_count,

      count(*) filter (
        where dependent.claimed_by_another_taxpayer
          or (
            not dependent.lived_with_taxpayer_all_year
            and dependent.months_lived_with_taxpayer < 12
          )
          or (
            dependent.is_full_time_student
            and extract(
              year
              from age(
                make_date(
                  requested_tax_year,
                  12,
                  31
                ),
                dependent.birth_date
              )
            ) >= 19
          )
      )::integer
        as issue_count,

      max(
        dependent.updated_at
      )
        as last_updated_at

    from public.client_tax_organizer_dependents
      as dependent

    where dependent.organizer_id =
      organizer_record.id
  ),

  income_metrics as (
    select
      count(*)::integer
        as record_count,

      count(*) filter (
        where income.record_status =
          'complete'
      )::integer
        as completed_record_count,

      count(*) filter (
        where not income.document_received
      )::integer
        as missing_document_count,

      (
        count(*) filter (
          where income.record_status <>
            'complete'
        )
        +
        count(*) filter (
          where not income.document_received
        )
      )::integer
        as issue_count,

      count(*) filter (
        where income.record_status =
            'needs_review'
          or not income.document_received
      )::integer
        as blocking_issue_count,

      max(
        income.updated_at
      )
        as last_updated_at

    from public.client_tax_organizer_income_sources
      as income

    where income.organizer_id =
      organizer_record.id
  ),

  healthcare_metrics as (
    select
      count(*)::integer
        as record_count,

      count(*) filter (
        where coverage.record_status =
          'complete'
      )::integer
        as completed_record_count,

      count(*) filter (
        where not coverage.document_received
      )::integer
        as missing_document_count,

      (
        count(*) filter (
          where coverage.record_status <>
            'complete'
        )
        +
        count(*) filter (
          where not coverage.document_received
        )
      )::integer
        as issue_count,

      count(*) filter (
        where coverage.record_status =
            'needs_review'
          or (
            coverage.coverage_type =
              'marketplace'
            and not coverage.document_received
          )
      )::integer
        as blocking_issue_count,

      max(
        coverage.updated_at
      )
        as last_updated_at

    from public.client_tax_organizer_healthcare_coverages
      as coverage

    where coverage.organizer_id =
      organizer_record.id
  ),

  section_rows as (
    select
      'dependents'::text
        as section_key,

      'Dependents'::text
        as section_title,

      coalesce(
        organizer_section.status::text,
        case
          when dependent_metrics.record_count = 0
          then 'not_started'
          when dependent_metrics.issue_count > 0
          then 'in_progress'
          else 'completed'
        end
      )
        as section_status,

      case
        when dependent_metrics.record_count = 0
        then 'not_started'
        when dependent_metrics.issue_count > 0
        then 'in_progress'
        else 'complete'
      end
        as health_level,

      coalesce(
        organizer_section.progress_percentage,
        case
          when dependent_metrics.record_count = 0
          then 0
          else 100
        end
      )::integer
        as progress_percentage,

      dependent_metrics.record_count,
      dependent_metrics.completed_record_count,

      0::integer
        as missing_document_count,

      dependent_metrics.issue_count,

      0::integer
        as blocking_issue_count,

      coalesce(
        dependent_metrics.last_updated_at,
        organizer_section.updated_at
      )
        as last_updated_at,

      (
        dependent_metrics.record_count > 0
      )
        as is_ready_for_review,

      case
        when dependent_metrics.issue_count > 0
        then jsonb_build_array(
          jsonb_build_object(
            'issueId',
              'staff-dependents-review',
            'sectionKey',
              'dependents',
            'severity',
              'warning',
            'title',
              'Dependent information requires review',
            'description',
              dependent_metrics.issue_count::text
              || case
                  when dependent_metrics.issue_count = 1
                  then ' dependent item requires staff review.'
                  else ' dependent items require staff review.'
                end,
            'recordId',
              null,
            'fieldKey',
              null,
            'actionLabel',
              'Review Dependents',
            'actionPath',
              null
          )
        )
        else '[]'::jsonb
      end
        as issues

    from dependent_metrics

    left join public.client_tax_organizer_sections
      as organizer_section
      on organizer_section.organizer_id =
          organizer_record.id
        and organizer_section.section_key::text =
          'dependents'

    union all

    select
      'income'::text,
      'Income'::text,

      coalesce(
        organizer_section.status::text,
        case
          when income_metrics.record_count = 0
          then 'not_started'
          when income_metrics.blocking_issue_count > 0
          then 'needs_review'
          when income_metrics.completed_record_count =
            income_metrics.record_count
          then 'completed'
          else 'in_progress'
        end
      ),

      case
        when income_metrics.record_count = 0
        then 'not_started'
        when income_metrics.blocking_issue_count > 0
        then 'needs_attention'
        when income_metrics.completed_record_count =
          income_metrics.record_count
        then 'complete'
        else 'in_progress'
      end,

      coalesce(
        organizer_section.progress_percentage,
        case
          when income_metrics.record_count = 0
          then 0
          else round(
            (
              income_metrics.completed_record_count::numeric
              /
              income_metrics.record_count::numeric
            ) * 100
          )::integer
        end
      )::integer,

      income_metrics.record_count,
      income_metrics.completed_record_count,
      income_metrics.missing_document_count,
      income_metrics.issue_count,
      income_metrics.blocking_issue_count,

      coalesce(
        income_metrics.last_updated_at,
        organizer_section.updated_at
      ),

      (
        income_metrics.record_count > 0
        and income_metrics.completed_record_count =
          income_metrics.record_count
        and income_metrics.blocking_issue_count = 0
      ),

      (
        case
          when income_metrics.missing_document_count > 0
          then jsonb_build_array(
            jsonb_build_object(
              'issueId',
                'staff-income-missing-documents',
              'sectionKey',
                'income',
              'severity',
                'blocking',
              'title',
                'Income documents are missing',
              'description',
                income_metrics.missing_document_count::text
                || case
                    when income_metrics.missing_document_count = 1
                    then ' income record is missing its supporting document.'
                    else ' income records are missing supporting documents.'
                  end,
              'recordId',
                null,
              'fieldKey',
                'document_received',
              'actionLabel',
                'Review Income',
              'actionPath',
                null
            )
          )
          else '[]'::jsonb
        end
        ||
        case
          when (
            income_metrics.record_count
            -
            income_metrics.completed_record_count
          ) > 0
          then jsonb_build_array(
            jsonb_build_object(
              'issueId',
                'staff-income-incomplete-records',
              'sectionKey',
                'income',
              'severity',
                'warning',
              'title',
                'Income records are incomplete',
              'description',
                (
                  income_metrics.record_count
                  -
                  income_metrics.completed_record_count
                )::text
                || case
                    when (
                      income_metrics.record_count
                      -
                      income_metrics.completed_record_count
                    ) = 1
                    then ' income record requires completion or review.'
                    else ' income records require completion or review.'
                  end,
              'recordId',
                null,
              'fieldKey',
                'record_status',
              'actionLabel',
                'Review Income',
              'actionPath',
                null
            )
          )
          else '[]'::jsonb
        end
      )

    from income_metrics

    left join public.client_tax_organizer_sections
      as organizer_section
      on organizer_section.organizer_id =
          organizer_record.id
        and organizer_section.section_key::text =
          'income'

    union all

    select
      'healthcare'::text,
      'Healthcare'::text,

      coalesce(
        organizer_section.status::text,
        case
          when healthcare_metrics.record_count = 0
          then 'not_started'
          when healthcare_metrics.blocking_issue_count > 0
          then 'needs_review'
          when healthcare_metrics.completed_record_count =
            healthcare_metrics.record_count
          then 'completed'
          else 'in_progress'
        end
      ),

      case
        when healthcare_metrics.record_count = 0
        then 'not_started'
        when healthcare_metrics.blocking_issue_count > 0
        then 'needs_attention'
        when healthcare_metrics.completed_record_count =
          healthcare_metrics.record_count
        then 'complete'
        else 'in_progress'
      end,

      coalesce(
        organizer_section.progress_percentage,
        case
          when healthcare_metrics.record_count = 0
          then 0
          else round(
            (
              healthcare_metrics.completed_record_count::numeric
              /
              healthcare_metrics.record_count::numeric
            ) * 100
          )::integer
        end
      )::integer,

      healthcare_metrics.record_count,
      healthcare_metrics.completed_record_count,
      healthcare_metrics.missing_document_count,
      healthcare_metrics.issue_count,
      healthcare_metrics.blocking_issue_count,

      coalesce(
        healthcare_metrics.last_updated_at,
        organizer_section.updated_at
      ),

      (
        healthcare_metrics.record_count > 0
        and healthcare_metrics.completed_record_count =
          healthcare_metrics.record_count
        and healthcare_metrics.blocking_issue_count = 0
      ),

      (
        case
          when healthcare_metrics.missing_document_count > 0
          then jsonb_build_array(
            jsonb_build_object(
              'issueId',
                'staff-healthcare-missing-documents',
              'sectionKey',
                'healthcare',
              'severity',
                case
                  when healthcare_metrics.blocking_issue_count > 0
                  then 'blocking'
                  else 'warning'
                end,
              'title',
                'Healthcare documents are missing',
              'description',
                healthcare_metrics.missing_document_count::text
                || case
                    when healthcare_metrics.missing_document_count = 1
                    then ' healthcare record is missing its supporting document.'
                    else ' healthcare records are missing supporting documents.'
                  end,
              'recordId',
                null,
              'fieldKey',
                'document_received',
              'actionLabel',
                'Review Healthcare',
              'actionPath',
                null
            )
          )
          else '[]'::jsonb
        end
        ||
        case
          when (
            healthcare_metrics.record_count
            -
            healthcare_metrics.completed_record_count
          ) > 0
          then jsonb_build_array(
            jsonb_build_object(
              'issueId',
                'staff-healthcare-incomplete-records',
              'sectionKey',
                'healthcare',
              'severity',
                'warning',
              'title',
                'Healthcare coverage requires review',
              'description',
                (
                  healthcare_metrics.record_count
                  -
                  healthcare_metrics.completed_record_count
                )::text
                || case
                    when (
                      healthcare_metrics.record_count
                      -
                      healthcare_metrics.completed_record_count
                    ) = 1
                    then ' healthcare record requires completion or review.'
                    else ' healthcare records require completion or review.'
                  end,
              'recordId',
                null,
              'fieldKey',
                'record_status',
              'actionLabel',
                'Review Healthcare',
              'actionPath',
                null
            )
          )
          else '[]'::jsonb
        end
      )

    from healthcare_metrics

    left join public.client_tax_organizer_sections
      as organizer_section
      on organizer_section.organizer_id =
          organizer_record.id
        and organizer_section.section_key::text =
          'healthcare'
  ),

  section_summary as (
    select
      jsonb_agg(
        jsonb_build_object(
          'sectionKey',
            section_key,
          'sectionTitle',
            section_title,
          'sectionStatus',
            section_status,
          'healthLevel',
            health_level,
          'progressPercentage',
            progress_percentage,
          'recordCount',
            record_count,
          'completedRecordCount',
            completed_record_count,
          'missingDocumentCount',
            missing_document_count,
          'issueCount',
            issue_count,
          'blockingIssueCount',
            blocking_issue_count,
          'lastUpdatedAt',
            last_updated_at,
          'isReadyForReview',
            is_ready_for_review,
          'issues',
            issues
        )
        order by
          case section_key
            when 'dependents' then 1
            when 'income' then 2
            when 'healthcare' then 3
            else 99
          end
      )
        as sections,

      count(*)::integer
        as total_section_count,

      count(*) filter (
        where health_level =
          'complete'
      )::integer
        as completed_section_count,

      count(*) filter (
        where health_level =
          'in_progress'
      )::integer
        as in_progress_section_count,

      count(*) filter (
        where health_level =
          'needs_attention'
      )::integer
        as needs_attention_section_count,

      coalesce(
        sum(
          missing_document_count
        ),
        0
      )::integer
        as missing_document_count,

      coalesce(
        sum(
          issue_count
        ),
        0
      )::integer
        as total_issue_count,

      coalesce(
        sum(
          blocking_issue_count
        ),
        0
      )::integer
        as blocking_issue_count,

      max(
        last_updated_at
      )
        as last_updated_at,

      bool_and(
        is_ready_for_review
      )
        as is_ready_for_review

    from section_rows
  )

  select
    section_summary.sections
  into
    section_payload
  from section_summary;

  with
  section_rows as (
    select
      section_element
    from jsonb_array_elements(
      section_payload
    )
      as section_element
  ),

  summary as (
    select
      count(*)::integer
        as total_section_count,

      count(*) filter (
        where section_element ->>
          'healthLevel' =
          'complete'
      )::integer
        as completed_section_count,

      count(*) filter (
        where section_element ->>
          'healthLevel' =
          'in_progress'
      )::integer
        as in_progress_section_count,

      count(*) filter (
        where section_element ->>
          'healthLevel' =
          'needs_attention'
      )::integer
        as needs_attention_section_count,

      coalesce(
        sum(
          (
            section_element ->>
              'missingDocumentCount'
          )::integer
        ),
        0
      )::integer
        as missing_document_count,

      coalesce(
        sum(
          (
            section_element ->>
              'issueCount'
          )::integer
        ),
        0
      )::integer
        as total_issue_count,

      coalesce(
        sum(
          (
            section_element ->>
              'blockingIssueCount'
          )::integer
        ),
        0
      )::integer
        as blocking_issue_count,

      max(
        nullif(
          section_element ->>
            'lastUpdatedAt',
          ''
        )::timestamptz
      )
        as last_updated_at,

      bool_and(
        (
          section_element ->>
            'isReadyForReview'
        )::boolean
      )
        as is_ready_for_review

    from section_rows
  )

  select
    jsonb_build_object(
      'organizerId',
        organizer_record.id,
      'clientId',
        organizer_record.client_id,
      'taxYear',
        organizer_record.tax_year,
      'organizerStatus',
        organizer_record.status::text,
      'currentSection',
        organizer_record.current_section::text,
      'overallProgressPercentage',
        organizer_record.progress_percentage,
      'totalSectionCount',
        summary.total_section_count,
      'completedSectionCount',
        summary.completed_section_count,
      'inProgressSectionCount',
        summary.in_progress_section_count,
      'needsAttentionSectionCount',
        summary.needs_attention_section_count,
      'missingDocumentCount',
        summary.missing_document_count,
      'totalIssueCount',
        summary.total_issue_count,
      'blockingIssueCount',
        summary.blocking_issue_count,
      'isReadyForReview',
        coalesce(
          summary.is_ready_for_review,
          false
        ),
      'lastUpdatedAt',
        greatest(
          organizer_record.updated_at,
          coalesce(
            summary.last_updated_at,
            organizer_record.updated_at
          )
        ),
      'client',
        jsonb_build_object(
          'clientId',
            client_record.id,
          'clientNumber',
            client_record.client_number::text,
          'clientName',
            trim(
              concat_ws(
                ' ',
                client_record.first_name,
                client_record.last_name
              )
            ),
          'email',
            client_record.email,
          'phone',
            client_record.phone
        ),
      'sections',
        section_payload
    )
  into
    overview_payload
  from summary;

  return overview_payload;
end;
$$;


ALTER FUNCTION "public"."get_staff_organizer_summary"("requested_client_id" "uuid", "requested_tax_year" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_staff_organizer_summary"("requested_client_id" "uuid", "requested_tax_year" integer) IS 'Returns a live staff-facing organizer review summary for one client and tax year. Sensitive Secure Vault values are not included.';



CREATE OR REPLACE FUNCTION "public"."get_staff_workload_summary"() RETURNS TABLE("staff_id" "uuid", "display_name" "text", "role" "text", "assigned_preparation" integer, "assigned_review" integer, "in_preparation" integer, "awaiting_review" integer, "overdue" integer, "due_next_seven_days" integer, "on_hold" integer)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  return query
  select
    profile.id as staff_id,

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
      profile.email
    )::text as display_name,

    profile.role::text as role,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where tax_return.assigned_preparer_id = profile.id
        and tax_return.workflow_status <> 'completed'
    ) as assigned_preparation,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where tax_return.assigned_reviewer_id = profile.id
        and tax_return.workflow_status <> 'completed'
    ) as assigned_review,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where tax_return.assigned_preparer_id = profile.id
        and tax_return.workflow_status = 'in_preparation'
    ) as in_preparation,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where tax_return.assigned_reviewer_id = profile.id
        and tax_return.workflow_status = 'review'
    ) as awaiting_review,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where (
          tax_return.assigned_preparer_id = profile.id
          or tax_return.assigned_reviewer_id = profile.id
        )
        and tax_return.due_date < current_date
        and tax_return.workflow_status <> 'completed'
    ) as overdue,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where (
          tax_return.assigned_preparer_id = profile.id
          or tax_return.assigned_reviewer_id = profile.id
        )
        and tax_return.due_date between current_date
          and current_date + 7
        and tax_return.workflow_status <> 'completed'
    ) as due_next_seven_days,

    (
      select count(*)::integer
      from public.tax_returns as tax_return
      where (
          tax_return.assigned_preparer_id = profile.id
          or tax_return.assigned_reviewer_id = profile.id
        )
        and tax_return.workflow_status = 'on_hold'
    ) as on_hold

  from public.profiles as profile
  where profile.is_active = true
    and profile.role in (
      'administrator',
      'manager',
      'preparer',
      'reviewer'
    )
  order by
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
      profile.email
    );
end;
$$;


ALTER FUNCTION "public"."get_staff_workload_summary"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_staff_workload_summary"() IS 'Returns preparation, review, deadline, and hold workload metrics for active staff.';



CREATE OR REPLACE FUNCTION "public"."get_tax_return_activity"("requested_return_id" "uuid", "requested_limit" integer DEFAULT 25) RETURNS TABLE("id" "uuid", "action" "text", "actor_id" "uuid", "actor_name" "text", "occurred_at" timestamp with time zone)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  select
    activity.id,
    activity.action,
    activity.actor_id,
    coalesce(
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
      profile.display_name,
      profile.email,
      auth_user.email,
      'System'
    ) as actor_name,
    activity.occurred_at
  from public.tax_return_activity
    as activity
  left join public.profiles
    as profile
    on profile.id =
      activity.actor_id
  left join auth.users
    as auth_user
    on auth_user.id =
      activity.actor_id
  where activity.return_id =
    requested_return_id
  order by
    activity.occurred_at desc
  limit greatest(
    least(
      coalesce(
        requested_limit,
        25
      ),
      100
    ),
    1
  );
$$;


ALTER FUNCTION "public"."get_tax_return_activity"("requested_return_id" "uuid", "requested_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_tax_return_details"("requested_return_id" "uuid") RETURNS TABLE("id" "uuid", "client_id" "uuid", "client_number" bigint, "client_first_name" "text", "client_middle_name" "text", "client_last_name" "text", "client_preferred_name" "text", "client_email" "text", "client_phone" "text", "tax_year" integer, "return_type" "public"."return_type", "tax_form" "public"."tax_form_type", "filing_status" "public"."filing_status", "status" "public"."return_status", "description" "text", "assigned_preparer_id" "uuid", "assigned_preparer_name" "text", "assigned_preparer_email" "text", "assigned_reviewer_id" "uuid", "assigned_reviewer_name" "text", "assigned_reviewer_email" "text", "date_received" "date", "due_date" "date", "filed_date" "date", "accepted_date" "date", "federal_return_required" boolean, "state_return_required" boolean, "local_return_required" boolean, "extension_filed" boolean, "extension_date" "date", "preparation_fee" numeric, "discount_amount" numeric, "net_fee" numeric, "estimated_refund" numeric, "estimated_amount_due" numeric, "notes" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$ begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_is_active() then raise exception 'An active staff account is required.';
end if;
return query
select tax_return.id,
  tax_return.client_id,
  client.client_number,
  client.first_name,
  client.middle_name,
  client.last_name,
  client.preferred_name,
  client.email,
  client.phone,
  tax_return.tax_year,
  tax_return.return_type,
  tax_return.tax_form,
  tax_return.filing_status,
  tax_return.status,
  tax_return.description,
  tax_return.assigned_preparer_id,
  coalesce(
    nullif(preparer.display_name, ''),
    nullif(
      concat_ws(
        ' ',
        preparer.first_name,
        preparer.last_name
      ),
      ''
    ),
    preparer.email
  ) as assigned_preparer_name,
  preparer.email as assigned_preparer_email,
  tax_return.assigned_reviewer_id,
  coalesce(
    nullif(reviewer.display_name, ''),
    nullif(
      concat_ws(
        ' ',
        reviewer.first_name,
        reviewer.last_name
      ),
      ''
    ),
    reviewer.email
  ) as assigned_reviewer_name,
  reviewer.email as assigned_reviewer_email,
  tax_return.date_received,
  tax_return.due_date,
  tax_return.filed_date,
  tax_return.accepted_date,
  tax_return.federal_return_required,
  tax_return.state_return_required,
  tax_return.local_return_required,
  tax_return.extension_filed,
  tax_return.extension_date,
  tax_return.preparation_fee,
  tax_return.discount_amount,
  (
    tax_return.preparation_fee - tax_return.discount_amount
  )::numeric as net_fee,
  tax_return.estimated_refund,
  tax_return.estimated_amount_due,
  tax_return.notes,
  tax_return.created_at,
  tax_return.updated_at
from public.tax_returns as tax_return
  join public.clients as client on client.id = tax_return.client_id
  left join public.profiles as preparer on preparer.id = tax_return.assigned_preparer_id
  left join public.profiles as reviewer on reviewer.id = tax_return.assigned_reviewer_id
where tax_return.id = requested_return_id;
end;
$$;


ALTER FUNCTION "public"."get_tax_return_details"("requested_return_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_tax_return_details"("requested_return_id" "uuid") IS 'Returns a tax return with client and staff assignment details for active staff.';



CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    display_name,
    role,
    is_active
  )
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    'read_only',
    false
  );

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_accepted_security_notice"("requested_notice_version" "text") RETURNS boolean
    LANGUAGE "sql" STABLE
    SET "search_path" TO ''
    AS $$
select exists (
    select 1
    from public.security_acknowledgments
    where user_id = auth.uid()
      and notice_version = requested_notice_version
  );
$$;


ALTER FUNCTION "public"."has_accepted_security_notice"("requested_notice_version" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_row_version"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
begin
  new.row_version := coalesce(old.row_version, 0) + 1;

  return new;
end;
$$;


ALTER FUNCTION "public"."increment_row_version"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."increment_row_version"() IS 'Increments row_version before a row update for optimistic concurrency control.';



CREATE OR REPLACE FUNCTION "public"."initialize_document_version"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  if new.version_group_id is null then
    new.version_group_id := new.id;
  end if;

  if new.version_number is null then
    new.version_number := 1;
  end if;

  if new.is_current_version is null then
    new.is_current_version := true;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."initialize_document_version"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."initialize_platform_record"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
declare
  current_timestamp_value timestamptz := statement_timestamp();
begin
  new.created_at :=
    coalesce(
      new.created_at,
      current_timestamp_value
    );

  new.updated_at :=
    coalesce(
      new.updated_at,
      new.created_at,
      current_timestamp_value
    );

  new.row_version :=
    greatest(
      coalesce(new.row_version, 1),
      1
    );

  return new;
end;
$$;


ALTER FUNCTION "public"."initialize_platform_record"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."initialize_platform_record"() IS 'Initializes created_at, updated_at, and row_version before a row insert.';



CREATE OR REPLACE FUNCTION "public"."initialize_required_documents"("requested_return_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  selected_return public.tax_returns%rowtype;
  inserted_count integer := 0;
begin
  if not public.current_user_can_manage_records() then
    raise exception 'You are not authorized to initialize required documents.';
  end if;

  select *
  into selected_return
  from public.tax_returns
  where id = requested_return_id;

  if not found then
    raise exception 'Tax return not found.';
  end if;

  insert into public.return_required_documents (
    tax_return_id,
    template_id,
    name,
    description,
    category,
    is_required,
    sort_order,
    created_by,
    updated_by
  )
  select
    selected_return.id,
    template.id,
    template.name,
    template.description,
    template.category,
    template.is_required,
    template.sort_order,
    auth.uid(),
    auth.uid()
  from public.required_document_templates as template
  where template.is_active = true
    and (
      template.return_type is null
      or template.return_type = selected_return.return_type
    )
    and (
      template.tax_form is null
      or template.tax_form = selected_return.tax_form
    )
  on conflict (tax_return_id, template_id)
  where template_id is not null
  do nothing;

  get diagnostics inserted_count = row_count;

  return inserted_count;
end;
$$;


ALTER FUNCTION "public"."initialize_required_documents"("requested_return_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_valid_return_status_transition"("current_status" "public"."return_status", "requested_status" "public"."return_status") RETURNS boolean
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO ''
    AS $$
select current_status = requested_status
  or (
    current_status = 'not_started'
    and requested_status in (
      'documents_pending',
      'in_progress',
      'on_hold'
    )
  )
  or (
    current_status = 'documents_pending'
    and requested_status in (
      'not_started',
      'in_progress',
      'on_hold'
    )
  )
  or (
    current_status = 'in_progress'
    and requested_status in (
      'documents_pending',
      'ready_for_review',
      'on_hold'
    )
  )
  or (
    current_status = 'ready_for_review'
    and requested_status in (
      'in_progress',
      'under_review',
      'on_hold'
    )
  )
  or (
    current_status = 'under_review'
    and requested_status in (
      'in_progress',
      'ready_for_review',
      'ready_to_file',
      'on_hold'
    )
  )
  or (
    current_status = 'ready_to_file'
    and requested_status in (
      'under_review',
      'filed',
      'on_hold'
    )
  )
  or (
    current_status = 'filed'
    and requested_status in (
      'accepted',
      'rejected',
      'ready_to_file',
      'on_hold'
    )
  )
  or (
    current_status = 'rejected'
    and requested_status in (
      'in_progress',
      'ready_for_review',
      'ready_to_file',
      'filed',
      'on_hold'
    )
  )
  or (
    current_status = 'accepted'
    and requested_status in ('completed', 'rejected')
  )
  or (
    current_status = 'completed'
    and requested_status in (
      'accepted',
      'in_progress'
    )
  )
  or (
    current_status = 'on_hold'
    and requested_status in (
      'documents_pending',
      'in_progress',
      'ready_for_review',
      'under_review',
      'ready_to_file',
      'filed'
    )
  );
$$;


ALTER FUNCTION "public"."is_valid_return_status_transition"("current_status" "public"."return_status", "requested_status" "public"."return_status") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_valid_return_status_transition"("current_status" "public"."return_status", "requested_status" "public"."return_status") IS 'Returns true when the requested tax-return workflow transition is allowed.';



CREATE OR REPLACE FUNCTION "public"."link_organizer_evidence"("requested_evidence_id" "uuid", "requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_field_key" "text", "requested_link_type" "text", "requested_notes" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $_$
declare
  current_user_id uuid;
  normalized_section_key text;
  normalized_subject_type text;
  normalized_field_key text;
  normalized_link_type text;
  normalized_notes text;
  saved_link
    public.organizer_evidence_links;
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
      'You do not have permission to link evidence.';
  end if;

  if requested_evidence_id is null
    or requested_organizer_id is null
    or requested_subject_id is null then
    raise exception
      'Evidence, organizer, and subject identifiers are required.';
  end if;

  normalized_section_key :=
    trim(
      coalesce(
        requested_section_key,
        ''
      )
    );

  normalized_subject_type :=
    trim(
      coalesce(
        requested_subject_type,
        ''
      )
    );

  normalized_field_key :=
    nullif(
      trim(
        coalesce(
          requested_field_key,
          ''
        )
      ),
      ''
    );

  normalized_link_type :=
    trim(
      coalesce(
        requested_link_type,
        'supports'
      )
    );

  normalized_notes :=
    nullif(
      trim(
        coalesce(
          requested_notes,
          ''
        )
      ),
      ''
    );

  if normalized_section_key = ''
    or normalized_subject_type = '' then
    raise exception
      'Section and subject type are required.';
  end if;

  if normalized_field_key is not null
    and normalized_field_key !~ '^[a-z][a-z0-9_]*$' then
    raise exception
      'The field key must use lowercase snake_case.';
  end if;

  if normalized_link_type not in (
    'supports',
    'contradicts',
    'replaces',
    'reference'
  ) then
    raise exception
      'Unsupported evidence link type: %',
      normalized_link_type;
  end if;

  if not exists (
    select 1
    from public.organizer_evidence_sources
      as evidence
    where evidence.id =
        requested_evidence_id
      and evidence.organizer_id =
        requested_organizer_id
  ) then
    raise exception
      'The evidence source was not found for this organizer.';
  end if;

  insert into
  public.organizer_evidence_links (
    evidence_id,
    organizer_id,
    section_key,
    subject_type,
    subject_id,
    field_key,
    link_type,
    notes,
    linked_by
  )
  values (
    requested_evidence_id,
    requested_organizer_id,
    normalized_section_key,
    normalized_subject_type,
    requested_subject_id,
    normalized_field_key,
    normalized_link_type,
    normalized_notes,
    current_user_id
  )
  on conflict (
    evidence_id,
    section_key,
    subject_type,
    subject_id,
    field_key,
    link_type
  )
  do update set
    notes =
      excluded.notes,
    linked_by =
      current_user_id,
    linked_at =
      timezone(
        'utc',
        now()
      )
  returning *
  into saved_link;

  insert into
  public.organizer_evidence_verification_events (
    evidence_id,
    action,
    actor_id,
    note,
    metadata
  )
  values (
    requested_evidence_id,
    'link_added',
    current_user_id,
    normalized_notes,
    jsonb_build_object(
      'link_id',
      saved_link.id,
      'organizer_id',
      requested_organizer_id,
      'section_key',
      normalized_section_key,
      'subject_type',
      normalized_subject_type,
      'subject_id',
      requested_subject_id,
      'field_key',
      normalized_field_key,
      'link_type',
      normalized_link_type
    )
  );

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
    'organizer_evidence_link_added',
    'organizer_evidence_link',
    saved_link.id,
    jsonb_build_object(
      'evidence_id',
      requested_evidence_id,
      'section_key',
      normalized_section_key,
      'subject_type',
      normalized_subject_type,
      'subject_id',
      requested_subject_id,
      'field_key',
      normalized_field_key,
      'link_type',
      normalized_link_type
    ),
    jsonb_build_object(
      'organizer_id',
      requested_organizer_id
    )
  );

  return saved_link.id;
end;
$_$;


ALTER FUNCTION "public"."link_organizer_evidence"("requested_evidence_id" "uuid", "requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_field_key" "text", "requested_link_type" "text", "requested_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_client_documents"("requested_client_id" "uuid", "requested_tax_return_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "uuid", "client_id" "uuid", "tax_return_id" "uuid", "category" "text", "status" "text", "original_file_name" "text", "storage_bucket" "text", "storage_path" "text", "mime_type" "text", "size_bytes" bigint, "file_hash" "text", "hash_algorithm" "text", "description" "text", "uploaded_by" "uuid", "uploaded_by_name" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "is_favorite" boolean, "version_group_id" "uuid", "version_number" integer, "is_current_version" boolean, "previous_version_id" "uuid", "version_notes" "text", "review_status" "text", "review_requested_by" "uuid", "review_requested_at" timestamp with time zone, "reviewed_by" "uuid", "reviewed_by_name" "text", "reviewed_at" timestamp with time zone, "review_comments" "text", "assigned_reviewer_id" "uuid", "assigned_reviewer_name" "text", "review_due_at" timestamp with time zone)
    LANGUAGE "sql" STABLE
    SET "search_path" TO ''
    AS $$
  select
    document.id,
    document.client_id,
    document.tax_return_id,
    document.category,
    document.status,
    document.original_file_name,
    document.storage_bucket,
    document.storage_path,
    document.mime_type,
    document.size_bytes,
    document.file_hash,
    document.hash_algorithm,
    document.description,
    document.uploaded_by,
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
    ) as uploaded_by_name,
    document.created_at,
    document.updated_at,
    document.is_favorite,
    document.version_group_id,
    document.version_number,
    document.is_current_version,
    document.previous_version_id,
    document.version_notes,
    document.review_status::text,
    document.review_requested_by,
    document.review_requested_at,
    document.reviewed_by,
    document.reviewed_by_name,
    document.reviewed_at,
    document.review_comments,
    document.assigned_reviewer_id,
    document.assigned_reviewer_name,
    document.review_due_at
  from public.client_documents as document
  join public.profiles as profile
    on profile.id = document.uploaded_by
  where document.client_id = requested_client_id
    and document.archived_at is null
    and document.is_current_version = true
    and (
      requested_tax_return_id is null
      or document.tax_return_id =
        requested_tax_return_id
    )
  order by document.created_at desc;
$$;


ALTER FUNCTION "public"."list_client_documents"("requested_client_id" "uuid", "requested_tax_return_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_document_reviewers"() RETURNS TABLE("id" "uuid", "display_name" "text", "email" "text", "role" "public"."app_role")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  return query
  select
    profile.id,
    coalesce(
      nullif(trim(profile.display_name), ''),
      nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''),
      profile.email
    ) as display_name,
    profile.email,
    profile.role
  from public.profiles as profile
  where profile.is_active = true
    and profile.role in (
      'administrator'::public.app_role,
      'manager'::public.app_role,
      'reviewer'::public.app_role
    )
  order by
    case profile.role
      when 'reviewer'::public.app_role then 1
      when 'manager'::public.app_role then 2
      when 'administrator'::public.app_role then 3
      else 4
    end,
    display_name;
end;
$$;


ALTER FUNCTION "public"."list_document_reviewers"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_document_versions"("requested_document_id" "uuid") RETURNS TABLE("id" "uuid", "client_id" "uuid", "tax_return_id" "uuid", "category" "text", "status" "text", "original_file_name" "text", "storage_bucket" "text", "storage_path" "text", "mime_type" "text", "size_bytes" bigint, "file_hash" "text", "hash_algorithm" "text", "description" "text", "uploaded_by" "uuid", "uploaded_by_name" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "archived_at" timestamp with time zone, "version_group_id" "uuid", "version_number" integer, "is_current_version" boolean, "previous_version_id" "uuid", "version_notes" "text", "is_favorite" boolean)
    LANGUAGE "sql" STABLE
    SET "search_path" TO ''
    AS $$
  with selected_document as (
    select document.version_group_id
    from public.client_documents as document
    where document.id = requested_document_id
  )
  select
    document.id,
    document.client_id,
    document.tax_return_id,
    document.category,
    document.status,
    document.original_file_name,
    document.storage_bucket,
    document.storage_path,
    document.mime_type,
    document.size_bytes,
    document.file_hash,
    document.hash_algorithm,
    document.description,
    document.uploaded_by,
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
    ) as uploaded_by_name,
    document.created_at,
    document.updated_at,
    document.archived_at,
    document.version_group_id,
    document.version_number,
    document.is_current_version,
    document.previous_version_id,
    document.version_notes,
    document.is_favorite
  from public.client_documents as document
  join selected_document
    on selected_document.version_group_id =
      document.version_group_id
  join public.profiles as profile
    on profile.id = document.uploaded_by
  order by document.version_number desc;
$$;


ALTER FUNCTION "public"."list_document_versions"("requested_document_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_my_assigned_document_reviews"() RETURNS TABLE("document_id" "uuid", "client_id" "uuid", "client_number" bigint, "client_name" "text", "tax_return_id" "uuid", "tax_year" integer, "return_type" "text", "original_file_name" "text", "category" "text", "review_status" "text", "review_requested_by" "uuid", "review_requested_by_name" "text", "review_requested_at" timestamp with time zone, "assigned_reviewer_id" "uuid", "assigned_reviewer_name" "text", "review_due_at" timestamp with time zone, "uploaded_by" "uuid", "uploaded_by_name" "text", "created_at" timestamp with time zone, "priority_code" "text", "days_until_due" integer)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  current_profile public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  select *
  into current_profile
  from public.profiles
  where id = auth.uid()
    and is_active = true;

  if not found then
    raise exception 'An active staff account is required.';
  end if;

  if current_profile.role not in (
    'administrator'::public.app_role,
    'manager'::public.app_role,
    'reviewer'::public.app_role
  ) then
    raise exception
      'Your role is not permitted to access the document review queue.';
  end if;

  return query
  select
    document.id as document_id,
    document.client_id,
    client.client_number,

    coalesce(
      nullif(
        trim(client.preferred_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            client.first_name,
            client.middle_name,
            client.last_name
          )
        ),
        ''
      ),
      concat(
        'Client ',
        client.client_number::text
      )
    ) as client_name,

    document.tax_return_id,
    tax_return.tax_year,
    tax_return.return_type::text,

    document.original_file_name,
    document.category,
    document.review_status,

    document.review_requested_by,

    coalesce(
      nullif(
        trim(requester.display_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            requester.first_name,
            requester.last_name
          )
        ),
        ''
      ),
      requester.email
    ) as review_requested_by_name,

    document.review_requested_at,
    document.assigned_reviewer_id,
    document.assigned_reviewer_name,
    document.review_due_at,

    document.uploaded_by,

    coalesce(
      nullif(
        trim(uploader.display_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            uploader.first_name,
            uploader.last_name
          )
        ),
        ''
      ),
      uploader.email
    ) as uploaded_by_name,

    document.created_at,

    case
      when document.review_due_at is null then
        'no_due_date'

      when document.review_due_at < current_date then
        'overdue'

      when document.review_due_at < current_date + interval '1 day' then
        'due_today'

      when document.review_due_at < current_date + interval '8 days' then
        'due_this_week'

      else
        'upcoming'
    end as priority_code,

    case
      when document.review_due_at is null then
        null

      else
        (
          document.review_due_at::date -
          current_date
        )::integer
    end as days_until_due

  from public.client_documents as document

  join public.clients as client
    on client.id = document.client_id

  left join public.tax_returns as tax_return
    on tax_return.id = document.tax_return_id

  left join public.profiles as requester
    on requester.id = document.review_requested_by

  left join public.profiles as uploader
    on uploader.id = document.uploaded_by

  where document.archived_at is null
    and document.is_current_version = true
    and document.review_status = 'pending_review'
    and document.assigned_reviewer_id = auth.uid()

  order by
    case
      when document.review_due_at is not null
        and document.review_due_at < current_date
        then 0

      when document.review_due_at is not null
        and document.review_due_at <
          current_date + interval '1 day'
        then 1

      when document.review_due_at is not null
        and document.review_due_at <
          current_date + interval '8 days'
        then 2

      when document.review_due_at is not null
        then 3

      else 4
    end,

    document.review_due_at asc nulls last,
    document.review_requested_at asc nulls last,
    document.created_at asc;
end;
$$;


ALTER FUNCTION "public"."list_my_assigned_document_reviews"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."list_my_assigned_document_reviews"() IS 'Returns pending document reviews assigned to the authenticated administrator, manager, or reviewer.';



CREATE OR REPLACE FUNCTION "public"."list_my_document_notifications"("p_limit" integer DEFAULT 20) RETURNS TABLE("id" "uuid", "notification_type" "text", "title" "text", "message" "text", "document_id" "uuid", "client_id" "uuid", "tax_return_id" "uuid", "metadata" "jsonb", "read_at" timestamp with time zone, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  safe_limit integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  safe_limit := least(greatest(coalesce(p_limit, 20), 1), 100);

  return query
  select
    notification.id,
    notification.notification_type,
    notification.title,
    notification.message,
    notification.document_id,
    notification.client_id,
    notification.tax_return_id,
    notification.metadata,
    notification.read_at,
    notification.created_at
  from public.document_notifications as notification
  where notification.recipient_user_id = auth.uid()
    and notification.archived_at is null
  order by notification.created_at desc
  limit safe_limit;
end;
$$;


ALTER FUNCTION "public"."list_my_document_notifications"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_organizer_available_documents"("requested_organizer_id" "uuid") RETURNS TABLE("document_id" "uuid", "client_id" "uuid", "tax_return_id" "uuid", "tax_year" integer, "category" "text", "document_status" "text", "original_file_name" "text", "storage_bucket" "text", "storage_path" "text", "mime_type" "text", "size_bytes" bigint, "description" "text", "uploaded_by" "uuid", "uploaded_by_name" "text", "uploaded_at" timestamp with time zone, "review_status" "text", "reviewed_by" "uuid", "reviewed_by_name" "text", "reviewed_at" timestamp with time zone, "evidence_id" "uuid", "evidence_type" "text", "evidence_confidence" "text", "evidence_verification_status" "text", "is_registered_as_evidence" boolean)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
#variable_conflict use_column
declare
  selected_organizer
    public.client_tax_organizers;
begin
  if auth.uid() is null then
    raise exception
      'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception
      'An active staff account is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select organizer.*
  into selected_organizer
  from public.client_tax_organizers
    as organizer
  where organizer.id =
    requested_organizer_id;

  if not found then
    raise exception
      'The requested organizer was not found.';
  end if;

  return query
  select
    document.id,
    document.client_id,
    document.tax_return_id,
    tax_return.tax_year,
    document.category,
    document.status,
    document.original_file_name,
    document.storage_bucket,
    document.storage_path,
    document.mime_type,
    document.size_bytes,
    document.description,
    document.uploaded_by,
    coalesce(
      nullif(
        trim(uploaded_profile.display_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            uploaded_profile.first_name,
            uploaded_profile.last_name
          )
        ),
        ''
      ),
      uploaded_profile.email,
      'Unknown User'
    ),
    document.created_at,
    document.review_status::text,
    document.reviewed_by,
    coalesce(
      nullif(
        trim(document.reviewed_by_name),
        ''
      ),
      nullif(
        trim(reviewed_profile.display_name),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            reviewed_profile.first_name,
            reviewed_profile.last_name
          )
        ),
        ''
      ),
      reviewed_profile.email
    ),
    document.reviewed_at,
    evidence.id,
    evidence.evidence_type,
    evidence.confidence,
    evidence.verification_status,
    evidence.id is not null
  from public.client_documents
    as document
  left join public.tax_returns
    as tax_return
    on tax_return.id =
      document.tax_return_id
  join public.profiles
    as uploaded_profile
    on uploaded_profile.id =
      document.uploaded_by
  left join public.profiles
    as reviewed_profile
    on reviewed_profile.id =
      document.reviewed_by
  left join public.organizer_evidence_sources
    as evidence
    on evidence.organizer_id =
      selected_organizer.id
    and evidence.document_id =
      document.id
  where document.client_id =
      selected_organizer.client_id
    and document.archived_at is null
    and document.is_current_version =
      true
    and (
      document.tax_return_id is null
      or (
        tax_return.client_id =
          selected_organizer.client_id
        and tax_return.tax_year =
          selected_organizer.tax_year
      )
    )
  order by
    document.created_at desc,
    document.id;
end;
$$;


ALTER FUNCTION "public"."list_organizer_available_documents"("requested_organizer_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_required_documents"("requested_return_id" "uuid") RETURNS TABLE("id" "uuid", "tax_return_id" "uuid", "template_id" "uuid", "name" "text", "description" "text", "category" "text", "is_required" boolean, "is_complete" boolean, "matched_document_id" "uuid", "matched_document_name" "text", "completed_at" timestamp with time zone, "completed_by" "uuid", "completed_by_name" "text", "notes" "text", "sort_order" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if not public.current_user_is_active() then
    raise exception 'Your account is not authorized to view required documents.';
  end if;

  return query
  select
    item.id,
    item.tax_return_id,
    item.template_id,
    item.name,
    item.description,
    item.category,
    item.is_required,
    item.is_complete,
    item.matched_document_id,
    document.original_file_name as matched_document_name,
    item.completed_at,
    item.completed_by,
    coalesce(
      completed_profile.display_name,
      trim(
        concat_ws(
          ' ',
          completed_profile.first_name,
          completed_profile.last_name
        )
      ),
      completed_profile.email
    ) as completed_by_name,
    item.notes,
    item.sort_order,
    item.created_at,
    item.updated_at
  from public.return_required_documents as item
  left join public.client_documents as document
    on document.id = item.matched_document_id
  left join public.profiles as completed_profile
    on completed_profile.id = item.completed_by
  where item.tax_return_id = requested_return_id
  order by
    item.is_required desc,
    item.sort_order,
    item.name;
end;
$$;


ALTER FUNCTION "public"."list_required_documents"("requested_return_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_return_workflow"("requested_return_id" "uuid", "requested_event_type" "text", "requested_event_label" "text", "requested_event_description" "text" DEFAULT NULL::"text", "requested_is_client_visible" boolean DEFAULT true, "requested_event_data" "jsonb" DEFAULT '{}'::"jsonb", "requested_occurred_at" timestamp with time zone DEFAULT "now"()) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
  return_client_id uuid;
  workflow_history_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
  ) then
    raise exception 'An active staff account is required.';
  end if;

  if requested_return_id is null then
    raise exception 'A tax return ID is required.';
  end if;

  if nullif(trim(requested_event_type), '') is null then
    raise exception 'An event type is required.';
  end if;

  if nullif(trim(requested_event_label), '') is null then
    raise exception 'An event label is required.';
  end if;

  if requested_event_data is null then
    requested_event_data := '{}'::jsonb;
  end if;

  if jsonb_typeof(requested_event_data) <> 'object' then
    raise exception 'Event data must be a JSON object.';
  end if;

  select tax_return.client_id
  into return_client_id
  from public.tax_returns tax_return
  where tax_return.id = requested_return_id;

  if return_client_id is null then
    raise exception 'Tax return not found.';
  end if;

  insert into public.return_workflow_history (
    tax_return_id,
    client_id,
    event_type,
    event_label,
    event_description,
    actor_user_id,
    is_client_visible,
    event_data,
    occurred_at
  )
  values (
    requested_return_id,
    return_client_id,
    lower(trim(requested_event_type)),
    trim(requested_event_label),
    nullif(trim(requested_event_description), ''),
    current_user_id,
    requested_is_client_visible,
    requested_event_data,
    coalesce(
      requested_occurred_at,
      now()
    )
  )
  returning id
  into workflow_history_id;

  return workflow_history_id;
end;
$$;


ALTER FUNCTION "public"."log_return_workflow"("requested_return_id" "uuid", "requested_event_type" "text", "requested_event_label" "text", "requested_event_description" "text", "requested_is_client_visible" boolean, "requested_event_data" "jsonb", "requested_occurred_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_all_document_notifications_read"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  affected_rows integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  update public.document_notifications
  set read_at = now()
  where recipient_user_id = auth.uid()
    and read_at is null
    and archived_at is null;

  get diagnostics affected_rows = row_count;
  return affected_rows;
end;
$$;


ALTER FUNCTION "public"."mark_all_document_notifications_read"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_dependent_review_complete"("requested_dependent_id" "uuid") RETURNS TABLE("review_id" "uuid", "dependent_id" "uuid", "review_status" "text", "internal_notes" "text", "reviewed_by" "uuid", "reviewed_by_name" "text", "reviewed_at" timestamp with time zone, "follow_up_requested_at" timestamp with time zone, "returned_to_client_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  d public.client_tax_organizer_dependents;
  r public.client_tax_organizer_dependent_reviews;
begin
  if uid is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then raise exception 'An active staff account is required.'; end if;
  if not public.current_user_can_manage_records() then raise exception 'You do not have permission to manage dependent reviews.'; end if;
  if requested_dependent_id is null then raise exception 'A dependent identifier is required.'; end if;
  select x.* into d from public.client_tax_organizer_dependents x where x.id=requested_dependent_id;
  if not found then raise exception 'The selected dependent was not found.'; end if;

  insert into public.client_tax_organizer_dependent_reviews
    (dependent_id,review_status,reviewed_by,reviewed_at,created_by,updated_by)
  values(d.id,'reviewed',uid,timezone('utc',now()),uid,uid)
  on conflict (dependent_id) do update set
    review_status='reviewed',reviewed_by=uid,reviewed_at=timezone('utc',now()),
    follow_up_requested_by=null,follow_up_requested_at=null,
    returned_to_client_by=null,returned_to_client_at=null,updated_by=uid
  returning * into r;

  insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_values,metadata)
  values(uid,'dependent_review_marked_complete','client_tax_organizer_dependent_review',r.id,
    jsonb_build_object('dependent_id',r.dependent_id,'review_status',r.review_status),
    jsonb_build_object('organizer_id',d.organizer_id));

  return query select r.id,r.dependent_id,r.review_status,r.internal_notes,r.reviewed_by,
    coalesce(nullif(trim(p.display_name),''),nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),p.email),
    r.reviewed_at,r.follow_up_requested_at,r.returned_to_client_at,r.updated_at
  from public.profiles p where p.id=uid;
end;
$$;


ALTER FUNCTION "public"."mark_dependent_review_complete"("requested_dependent_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_dependent_review_needs_followup"("requested_dependent_id" "uuid", "requested_internal_notes" "text" DEFAULT NULL::"text") RETURNS TABLE("review_id" "uuid", "dependent_id" "uuid", "review_status" "text", "internal_notes" "text", "reviewed_by" "uuid", "reviewed_by_name" "text", "reviewed_at" timestamp with time zone, "follow_up_requested_at" timestamp with time zone, "returned_to_client_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  d public.client_tax_organizer_dependents;
  r public.client_tax_organizer_dependent_reviews;
  notes text := trim(coalesce(requested_internal_notes,''));
begin
  if uid is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then raise exception 'An active staff account is required.'; end if;
  if not public.current_user_can_manage_records() then raise exception 'You do not have permission to manage dependent reviews.'; end if;
  if requested_dependent_id is null then raise exception 'A dependent identifier is required.'; end if;
  if notes = '' then raise exception 'A follow-up note is required.'; end if;
  if char_length(notes) > 10000 then raise exception 'The internal note cannot exceed 10,000 characters.'; end if;
  select x.* into d from public.client_tax_organizer_dependents x where x.id=requested_dependent_id;
  if not found then raise exception 'The selected dependent was not found.'; end if;

  insert into public.client_tax_organizer_dependent_reviews
    (dependent_id,review_status,internal_notes,follow_up_requested_by,
     follow_up_requested_at,created_by,updated_by)
  values(d.id,'needs_follow_up',notes,uid,timezone('utc',now()),uid,uid)
  on conflict (dependent_id) do update set
    review_status='needs_follow_up',internal_notes=notes,reviewed_by=null,reviewed_at=null,
    follow_up_requested_by=uid,follow_up_requested_at=timezone('utc',now()),
    returned_to_client_by=null,returned_to_client_at=null,updated_by=uid
  returning * into r;

  insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_values,metadata)
  values(uid,'dependent_review_needs_follow_up','client_tax_organizer_dependent_review',r.id,
    jsonb_build_object('dependent_id',r.dependent_id,'review_status',r.review_status,'internal_notes',r.internal_notes),
    jsonb_build_object('organizer_id',d.organizer_id));

  return query select r.id,r.dependent_id,r.review_status,r.internal_notes,uid,
    coalesce(nullif(trim(p.display_name),''),nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),p.email),
    r.reviewed_at,r.follow_up_requested_at,r.returned_to_client_at,r.updated_at
  from public.profiles p where p.id=uid;
end;
$$;


ALTER FUNCTION "public"."mark_dependent_review_needs_followup"("requested_dependent_id" "uuid", "requested_internal_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_document_notification_read"("p_notification_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  update public.document_notifications
  set read_at = coalesce(read_at, now())
  where id = p_notification_id
    and recipient_user_id = auth.uid()
    and archived_at is null;

  if not found then
    raise exception 'Notification not found.';
  end if;
end;
$$;


ALTER FUNCTION "public"."mark_document_notification_read"("p_notification_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_income_review_complete"("requested_income_source_id" "uuid") RETURNS TABLE("review_id" "uuid", "income_source_id" "uuid", "review_status" "text", "internal_notes" "text", "reviewed_by" "uuid", "reviewed_by_name" "text", "reviewed_at" timestamp with time zone, "follow_up_requested_at" timestamp with time zone, "returned_to_client_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
$$;


ALTER FUNCTION "public"."mark_income_review_complete"("requested_income_source_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_income_review_needs_followup"("requested_income_source_id" "uuid", "requested_internal_notes" "text" DEFAULT NULL::"text") RETURNS TABLE("review_id" "uuid", "income_source_id" "uuid", "review_status" "text", "internal_notes" "text", "reviewed_by" "uuid", "reviewed_by_name" "text", "reviewed_at" timestamp with time zone, "follow_up_requested_at" timestamp with time zone, "returned_to_client_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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

  if normalized_notes = '' then
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
$$;


ALTER FUNCTION "public"."mark_income_review_needs_followup"("requested_income_source_id" "uuid", "requested_internal_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_vault_audit_log_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  raise exception
    'Vault audit records are append-only and cannot be updated or deleted.';
end;
$$;


ALTER FUNCTION "public"."prevent_vault_audit_log_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_document_analysis_job"("requested_document_id" "uuid", "requested_organizer_id" "uuid", "requested_evidence_id" "uuid", "requested_provider_key" "text", "requested_metadata" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  current_user_id uuid;
  selected_provider public.document_analysis_providers;
  selected_document public.client_documents;
  selected_organizer public.client_tax_organizers;
  created_job public.document_analysis_jobs;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active()
    or not public.current_user_can_manage_records() then
    raise exception 'You do not have permission to queue document analysis.';
  end if;

  select provider.*
  into selected_provider
  from public.document_analysis_providers as provider
  where provider.provider_key = trim(coalesce(requested_provider_key, ''))
    and provider.is_enabled = true;

  if not found then
    raise exception 'The requested analysis provider is unavailable.';
  end if;

  select document.*
  into selected_document
  from public.client_documents as document
  where document.id = requested_document_id
    and document.archived_at is null
    and document.is_current_version = true;

  if not found then
    raise exception 'The selected current document was not found.';
  end if;

  if requested_organizer_id is not null then
    select organizer.*
    into selected_organizer
    from public.client_tax_organizers as organizer
    where organizer.id = requested_organizer_id
      and organizer.client_id = selected_document.client_id;

    if not found then
      raise exception 'The document does not belong to the organizer client.';
    end if;
  end if;

  insert into public.document_analysis_jobs (
    document_id,
    organizer_id,
    evidence_id,
    provider_id,
    status,
    requested_by,
    queued_at,
    request_metadata
  )
  values (
    requested_document_id,
    requested_organizer_id,
    requested_evidence_id,
    selected_provider.id,
    'queued',
    current_user_id,
    timezone('utc', now()),
    coalesce(requested_metadata, '{}'::jsonb)
  )
  returning *
  into created_job;

  insert into public.document_analysis_events (
    job_id,
    event_type,
    actor_id,
    previous_status,
    new_status,
    message
  )
  values (
    created_job.id,
    'job_created',
    current_user_id,
    null,
    'queued',
    'Document analysis job created.'
  );

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
    'document_analysis_job_queued',
    'document_analysis_job',
    created_job.id,
    jsonb_build_object(
      'document_id', requested_document_id,
      'organizer_id', requested_organizer_id,
      'evidence_id', requested_evidence_id,
      'provider_key', selected_provider.provider_key,
      'status', created_job.status
    ),
    coalesce(requested_metadata, '{}'::jsonb)
  );

  return created_job.id;
end;
$$;


ALTER FUNCTION "public"."queue_document_analysis_job"("requested_document_id" "uuid", "requested_organizer_id" "uuid", "requested_evidence_id" "uuid", "requested_provider_key" "text", "requested_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_client_portal_login"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  update public.client_portal_profiles
  set
    last_login_at = timezone('utc', now())
  where auth_user_id = auth.uid()
    and portal_status = 'active';

  if not found then
    raise exception
      'An active client portal profile was not found.';
  end if;
end;
$$;


ALTER FUNCTION "public"."record_client_portal_login"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "tax_return_id" "uuid",
    "amount" numeric(12,2) NOT NULL,
    "payment_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "payment_method" "public"."payment_method" NOT NULL,
    "reference_number" "text",
    "notes" "text",
    "is_voided" boolean DEFAULT false NOT NULL,
    "voided_at" timestamp with time zone,
    "voided_by" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "void_reason" "text",
    "receipt_number" "text",
    "receipt_issued_at" timestamp with time zone,
    "receipt_issued_by" "uuid",
    CONSTRAINT "payments_amount_valid" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "payments_void_fields_valid" CHECK (((("is_voided" = false) AND ("voided_at" IS NULL) AND ("voided_by" IS NULL)) OR (("is_voided" = true) AND ("voided_at" IS NOT NULL))))
);

ALTER TABLE ONLY "public"."payments" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" OWNER TO "postgres";


COMMENT ON TABLE "public"."payments" IS 'Payments associated with clients and optional tax returns.';



COMMENT ON COLUMN "public"."payments"."void_reason" IS 'Explanation describing why a payment was voided.';



CREATE OR REPLACE FUNCTION "public"."record_return_payment"("requested_return_id" "uuid", "requested_amount" numeric, "requested_payment_method" "public"."payment_method", "requested_payment_date" "date" DEFAULT CURRENT_DATE, "requested_reference_number" "text" DEFAULT NULL::"text", "requested_notes" "text" DEFAULT NULL::"text") RETURNS "public"."payments"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
declare
  current_user_id uuid;
  payment_client_id uuid;
  generated_receipt_number text;
  created_payment public.payments;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
      and profile.role in (
        'administrator',
        'manager',
        'preparer',
        'reviewer',
        'receptionist'
      )
  ) then
    raise exception
      'You are not authorized to record payments.';
  end if;

  if requested_return_id is null then
    raise exception
      'A tax-return identifier is required.';
  end if;

  if requested_amount is null
    or requested_amount <= 0
  then
    raise exception
      'The payment amount must be greater than zero.';
  end if;

  if requested_payment_method is null then
    raise exception
      'A payment method is required.';
  end if;

  if requested_payment_date is null then
    raise exception
      'A payment date is required.';
  end if;

  select tax_return.client_id
  into payment_client_id
  from public.tax_returns tax_return
  where tax_return.id = requested_return_id;

  if payment_client_id is null then
    raise exception
      'The selected tax return was not found.';
  end if;

  generated_receipt_number :=
    public.generate_payment_receipt_number();

  insert into public.payments (
    tax_return_id,
    client_id,
    amount,
    payment_date,
    payment_method,
    reference_number,
    notes,
    created_by,
    receipt_number,
    receipt_issued_at,
    receipt_issued_by
  )
  values (
    requested_return_id,
    payment_client_id,
    requested_amount,
    requested_payment_date,
    requested_payment_method,
    nullif(
      trim(requested_reference_number),
      ''
    ),
    nullif(
      trim(requested_notes),
      ''
    ),
    current_user_id,
    generated_receipt_number,
    now(),
    current_user_id
  )
  returning *
  into created_payment;

  perform public.log_return_workflow(
    requested_return_id :=
      requested_return_id,

    requested_event_type :=
      'payment_received',

    requested_event_label :=
      'Payment received',

    requested_event_description :=
      format(
        'A payment of $%s was received. Receipt: %s.',
        to_char(
          requested_amount,
          'FM999,999,990.00'
        ),
        generated_receipt_number
      ),

    requested_is_client_visible :=
      true,

    requested_event_data :=
      jsonb_build_object(
        'payment_id',
        created_payment.id,

        'amount',
        created_payment.amount,

        'payment_method',
        created_payment.payment_method,

        'payment_date',
        created_payment.payment_date,

        'reference_number',
        created_payment.reference_number,

        'receipt_number',
        created_payment.receipt_number,

        'receipt_issued_at',
        created_payment.receipt_issued_at
      ),

    requested_occurred_at :=
      now()
  );

  return created_payment;
end;
$_$;


ALTER FUNCTION "public"."record_return_payment"("requested_return_id" "uuid", "requested_amount" numeric, "requested_payment_method" "public"."payment_method", "requested_payment_date" "date", "requested_reference_number" "text", "requested_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_return_workflow_history"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if tg_op = 'INSERT' then
    insert into public.return_workflow_history (
      tax_return_id,
      client_id,
      event_type,
      event_label,
      event_description,
      new_status,
      actor_user_id,
      is_client_visible,
      event_data,
      occurred_at
    )
    values (
      new.id,
      new.client_id,
      'return_created',
      'Tax return created',
      'Your tax return was added to the Smith Enterprises system.',
      new.status::text,
      auth.uid(),
      true,
      jsonb_build_object(
        'tax_year',
        new.tax_year,
        'return_type',
        new.return_type::text,
        'tax_form',
        new.tax_form::text
      ),
      coalesce(
        new.created_at,
        now()
      )
    );

    return new;
  end if;

  if tg_op = 'UPDATE'
    and old.status is distinct from new.status
  then
    insert into public.return_workflow_history (
      tax_return_id,
      client_id,
      event_type,
      event_label,
      event_description,
      previous_status,
      new_status,
      actor_user_id,
      is_client_visible,
      event_data,
      occurred_at
    )
    values (
      new.id,
      new.client_id,
      'status_changed',
      'Return status updated',
      concat(
        'Your tax return status changed from ',
        replace(
          initcap(old.status::text),
          '_',
          ' '
        ),
        ' to ',
        replace(
          initcap(new.status::text),
          '_',
          ' '
        ),
        '.'
      ),
      old.status::text,
      new.status::text,
      auth.uid(),
      true,
      jsonb_build_object(
        'previous_status',
        old.status::text,
        'new_status',
        new.status::text
      ),
      now()
    );
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."record_return_workflow_history"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_security_event"("requested_action" "text", "requested_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare audit_log_id bigint;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    metadata
  )
values (
    auth.uid(),
    trim(requested_action),
    'authentication',
    coalesce(requested_metadata, '{}'::jsonb)
  )
returning id into audit_log_id;
return audit_log_id;
end;
$$;


ALTER FUNCTION "public"."record_security_event"("requested_action" "text", "requested_metadata" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."record_security_event"("requested_action" "text", "requested_metadata" "jsonb") IS 'Records an authenticated security event in the append-only audit log.';



CREATE OR REPLACE FUNCTION "public"."record_tax_return_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  activity_action text;
begin
  if tg_op = 'INSERT' then
    activity_action :=
      'Tax return was created';
  elsif tg_op = 'UPDATE' then
    activity_action :=
      public.describe_tax_return_change(
        old,
        new
      );
  else
    return new;
  end if;

  insert into public.tax_return_activity (
    return_id,
    action,
    actor_id,
    occurred_at
  )
  values (
    new.id,
    activity_action,
    auth.uid(),
    now()
  );

  return new;
end;
$$;


ALTER FUNCTION "public"."record_tax_return_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_client_business_organizer_progress"("requested_organizer_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  saved_at timestamptz :=
    timezone('utc', now());

  has_activity boolean;
  business_count integer;
  complete_count integer;

  next_status
    public.tax_organizer_section_status;

  next_progress integer;

  completed_sections integer;
  total_sections integer;
BEGIN
  SELECT
    response.has_business_activity
  INTO
    has_activity
  FROM
    public.client_tax_organizer_business_responses
      AS response
  WHERE
    response.organizer_id =
      requested_organizer_id;

  SELECT
    count(*)::integer,

    count(*) FILTER (
      WHERE
        business.record_status =
          'complete'
    )::integer
  INTO
    business_count,
    complete_count
  FROM
    public.client_tax_organizer_businesses
      AS business
  WHERE
    business.organizer_id =
      requested_organizer_id;

  IF has_activity IS FALSE THEN
    next_status :=
      'completed'
        ::public.tax_organizer_section_status;

    next_progress := 100;

  ELSIF
    has_activity IS TRUE
    AND business_count > 0
    AND complete_count =
      business_count
  THEN
    next_status :=
      'completed'
        ::public.tax_organizer_section_status;

    next_progress := 100;

  ELSIF
    has_activity IS NOT NULL
    OR business_count > 0
  THEN
    next_status :=
      'in_progress'
        ::public.tax_organizer_section_status;

    next_progress :=
      CASE
        WHEN business_count = 0
        THEN 20

        ELSE greatest(
          25,
          round(
            (
              complete_count::numeric
              /
              business_count::numeric
            ) * 100
          )::integer
        )
      END;

  ELSE
    next_status :=
      'not_started'
        ::public.tax_organizer_section_status;

    next_progress := 0;
  END IF;

  UPDATE
    public.client_tax_organizer_sections
      AS section
  SET
    status =
      next_status,

    progress_percentage =
      next_progress,

    started_at =
      CASE
        WHEN
          next_status =
            'not_started'
              ::public.tax_organizer_section_status
        THEN null

        ELSE coalesce(
          section.started_at,
          saved_at
        )
      END,

    completed_at =
      CASE
        WHEN
          next_status =
            'completed'
              ::public.tax_organizer_section_status
        THEN coalesce(
          section.completed_at,
          saved_at
        )

        ELSE null
      END,

    last_saved_at =
      CASE
        WHEN
          next_status =
            'not_started'
              ::public.tax_organizer_section_status
        THEN section.last_saved_at

        ELSE saved_at
      END,

    updated_at =
      saved_at

  WHERE
    section.organizer_id =
      requested_organizer_id
    AND section.section_key =
      'business'
        ::public.tax_organizer_section_key;

  SELECT
    count(*) FILTER (
      WHERE
        section.status =
          'completed'
            ::public.tax_organizer_section_status
    )::integer,

    count(*)::integer
  INTO
    completed_sections,
    total_sections
  FROM
    public.client_tax_organizer_sections
      AS section
  WHERE
    section.organizer_id =
      requested_organizer_id;

  UPDATE
    public.client_tax_organizers
      AS organizer
  SET
    current_section =
      CASE
        WHEN
          next_status =
            'completed'
              ::public.tax_organizer_section_status
        THEN
          'rental'
            ::public.tax_organizer_section_key

        ELSE
          'business'
            ::public.tax_organizer_section_key
      END,

    progress_percentage =
      CASE
        WHEN total_sections = 0
        THEN 0

        ELSE round(
          (
            completed_sections::numeric
            /
            total_sections::numeric
          ) * 100
        )::integer
      END,

    started_at =
      coalesce(
        organizer.started_at,
        saved_at
      ),

    last_saved_at =
      saved_at,

    updated_at =
      saved_at

  WHERE
    organizer.id =
      requested_organizer_id;
END;
$$;


ALTER FUNCTION "public"."refresh_client_business_organizer_progress"("requested_organizer_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."register_client_document"("requested_client_id" "uuid", "requested_tax_return_id" "uuid", "requested_category" "text", "requested_original_file_name" "text", "requested_storage_bucket" "text", "requested_storage_path" "text", "requested_mime_type" "text", "requested_size_bytes" bigint, "requested_description" "text" DEFAULT NULL::"text", "requested_file_hash" "text" DEFAULT NULL::"text", "requested_hash_algorithm" "text" DEFAULT 'SHA-256'::"text") RETURNS SETOF "public"."client_documents"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $_$
declare
  created_document public.client_documents;
  normalized_file_hash text;
  normalized_hash_algorithm text;
begin
  if not public.current_user_can_manage_records() then
    raise exception
      'You are not authorized to upload client documents.';
  end if;

  if requested_storage_bucket <> 'client-documents' then
    raise exception
      'The document storage bucket is invalid.';
  end if;

  if requested_size_bytes <= 0
    or requested_size_bytes > 26214400 then
    raise exception
      'The document must be between 1 byte and 25 MB.';
  end if;

  if nullif(trim(requested_original_file_name), '') is null then
    raise exception
      'The original document file name is required.';
  end if;

  if nullif(trim(requested_storage_path), '') is null then
    raise exception
      'The document storage path is required.';
  end if;

  if nullif(trim(requested_mime_type), '') is null then
    raise exception
      'The document MIME type is required.';
  end if;

  if requested_tax_return_id is not null
    and not exists (
      select 1
      from public.tax_returns as tax_return
      where tax_return.id = requested_tax_return_id
        and tax_return.client_id = requested_client_id
    ) then
    raise exception
      'The selected tax return does not belong to this client.';
  end if;

  normalized_file_hash :=
    lower(nullif(trim(requested_file_hash), ''));

  normalized_hash_algorithm :=
    upper(
      coalesce(
        nullif(trim(requested_hash_algorithm), ''),
        'SHA-256'
      )
    );

  if normalized_file_hash is not null
    and normalized_hash_algorithm <> 'SHA-256' then
    raise exception
      'The requested document hash algorithm is not supported.';
  end if;

  if normalized_file_hash is not null
    and normalized_file_hash !~ '^[0-9a-f]{64}$' then
    raise exception
      'The SHA-256 document fingerprint must contain 64 hexadecimal characters.';
  end if;

  insert into public.client_documents (
    client_id,
    tax_return_id,
    category,
    status,
    original_file_name,
    storage_bucket,
    storage_path,
    mime_type,
    size_bytes,
    file_hash,
    hash_algorithm,
    description,
    uploaded_by
  )
  values (
    requested_client_id,
    requested_tax_return_id,
    requested_category,
    'uploaded',
    trim(requested_original_file_name),
    requested_storage_bucket,
    requested_storage_path,
    requested_mime_type,
    requested_size_bytes,
    normalized_file_hash,
    normalized_hash_algorithm,
    nullif(trim(requested_description), ''),
    auth.uid()
  )
  returning *
  into created_document;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    new_values,
    metadata
  )
  values (
    auth.uid(),
    'document_uploaded',
    'document',
    created_document.id,
    jsonb_build_object(
      'client_id',
      created_document.client_id,
      'tax_return_id',
      created_document.tax_return_id,
      'category',
      created_document.category,
      'status',
      created_document.status,
      'original_file_name',
      created_document.original_file_name,
      'mime_type',
      created_document.mime_type,
      'size_bytes',
      created_document.size_bytes,
      'file_hash',
      created_document.file_hash,
      'hash_algorithm',
      created_document.hash_algorithm,
      'description',
      created_document.description
    ),
    jsonb_build_object(
      'storage_bucket',
      created_document.storage_bucket,
      'storage_path',
      created_document.storage_path
    )
  );

  return next created_document;
end;
$_$;


ALTER FUNCTION "public"."register_client_document"("requested_client_id" "uuid", "requested_tax_return_id" "uuid", "requested_category" "text", "requested_original_file_name" "text", "requested_storage_bucket" "text", "requested_storage_path" "text", "requested_mime_type" "text", "requested_size_bytes" bigint, "requested_description" "text", "requested_file_hash" "text", "requested_hash_algorithm" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."register_document_as_organizer_evidence"("requested_organizer_id" "uuid", "requested_document_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_field_key" "text", "requested_evidence_type" "text", "requested_confidence" "text", "requested_link_type" "text", "requested_notes" "text") RETURNS TABLE("evidence_id" "uuid", "link_id" "uuid", "document_id" "uuid", "original_file_name" "text", "evidence_type" "text", "confidence" "text", "verification_status" "text", "was_existing_evidence" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $_$
#variable_conflict use_column
declare
  current_user_id uuid;

  selected_organizer
    public.client_tax_organizers;

  selected_document
    public.client_documents;

  selected_tax_return
    public.tax_returns;

  normalized_section_key text;
  normalized_subject_type text;
  normalized_field_key text;
  normalized_evidence_type text;
  normalized_confidence text;
  normalized_link_type text;
  normalized_notes text;

  saved_evidence
    public.organizer_evidence_sources;

  saved_link
    public.organizer_evidence_links;

  existing_evidence boolean :=
    false;
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
      'You do not have permission to register document evidence.';
  end if;

  if requested_organizer_id is null
    or requested_document_id is null
    or requested_subject_id is null then
    raise exception
      'Organizer, document, and subject identifiers are required.';
  end if;

  normalized_section_key :=
    trim(
      coalesce(
        requested_section_key,
        ''
      )
    );

  normalized_subject_type :=
    trim(
      coalesce(
        requested_subject_type,
        ''
      )
    );

  normalized_field_key :=
    nullif(
      trim(
        coalesce(
          requested_field_key,
          ''
        )
      ),
      ''
    );

  normalized_evidence_type :=
    trim(
      coalesce(
        requested_evidence_type,
        ''
      )
    );

  normalized_confidence :=
    trim(
      coalesce(
        requested_confidence,
        'unverified'
      )
    );

  normalized_link_type :=
    trim(
      coalesce(
        requested_link_type,
        'supports'
      )
    );

  normalized_notes :=
    nullif(
      trim(
        coalesce(
          requested_notes,
          ''
        )
      ),
      ''
    );

  if normalized_section_key = ''
    or normalized_subject_type = ''
    or normalized_evidence_type = '' then
    raise exception
      'Section, subject type, and evidence type are required.';
  end if;

  if normalized_field_key is not null
    and normalized_field_key !~
      '^[a-z][a-z0-9_]*$' then
    raise exception
      'The field key must use lowercase snake_case.';
  end if;

  if normalized_confidence not in (
    'high',
    'medium',
    'low',
    'unverified'
  ) then
    raise exception
      'Unsupported evidence confidence: %',
      normalized_confidence;
  end if;

  if normalized_link_type not in (
    'supports',
    'contradicts',
    'replaces',
    'reference'
  ) then
    raise exception
      'Unsupported evidence link type: %',
      normalized_link_type;
  end if;

  select organizer.*
  into selected_organizer
  from public.client_tax_organizers
    as organizer
  where organizer.id =
    requested_organizer_id
  for update;

  if not found then
    raise exception
      'The requested organizer was not found.';
  end if;

  select document.*
  into selected_document
  from public.client_documents
    as document
  where document.id =
      requested_document_id
    and document.client_id =
      selected_organizer.client_id
    and document.archived_at is null
    and document.is_current_version =
      true;

  if not found then
    raise exception
      'The selected current document was not found for this organizer client.';
  end if;

  if selected_document.tax_return_id is not null then
    select tax_return.*
    into selected_tax_return
    from public.tax_returns
      as tax_return
    where tax_return.id =
        selected_document.tax_return_id
      and tax_return.client_id =
        selected_organizer.client_id
      and tax_return.tax_year =
        selected_organizer.tax_year;

    if not found then
      raise exception
        'The selected document belongs to a different tax year.';
    end if;
  end if;

  select evidence.*
  into saved_evidence
  from public.organizer_evidence_sources
    as evidence
  where evidence.organizer_id =
      selected_organizer.id
    and evidence.document_id =
      selected_document.id
  for update;

  if found then
    existing_evidence :=
      true;
  else
    insert into
    public.organizer_evidence_sources (
      organizer_id,
      return_id,
      document_id,
      evidence_type,
      title,
      description,
      confidence,
      verification_status,
      created_by,
      metadata
    )
    values (
      selected_organizer.id,
      selected_document.tax_return_id,
      selected_document.id,
      normalized_evidence_type,
      selected_document.original_file_name,
      selected_document.description,
      normalized_confidence,
      'unverified',
      current_user_id,
      jsonb_build_object(
        'source',
        'client_document_library',
        'storage_bucket',
        selected_document.storage_bucket,
        'storage_path',
        selected_document.storage_path,
        'mime_type',
        selected_document.mime_type,
        'size_bytes',
        selected_document.size_bytes,
        'document_category',
        selected_document.category
      )
    )
    returning *
    into saved_evidence;

    insert into
    public.organizer_evidence_verification_events (
      evidence_id,
      action,
      actor_id,
      new_confidence,
      new_status,
      metadata
    )
    values (
      saved_evidence.id,
      'created',
      current_user_id,
      saved_evidence.confidence,
      saved_evidence.verification_status,
      jsonb_build_object(
        'organizer_id',
        selected_organizer.id,
        'document_id',
        selected_document.id,
        'source',
        'client_document_library'
      )
    );
  end if;

  insert into
  public.organizer_evidence_links (
    evidence_id,
    organizer_id,
    section_key,
    subject_type,
    subject_id,
    field_key,
    link_type,
    notes,
    linked_by
  )
  values (
    saved_evidence.id,
    selected_organizer.id,
    normalized_section_key,
    normalized_subject_type,
    requested_subject_id,
    normalized_field_key,
    normalized_link_type,
    normalized_notes,
    current_user_id
  )
  on conflict (
    evidence_id,
    section_key,
    subject_type,
    subject_id,
    field_key,
    link_type
  )
  do update set
    notes =
      excluded.notes,
    linked_by =
      current_user_id,
    linked_at =
      timezone(
        'utc',
        now()
      )
  returning *
  into saved_link;

  insert into
  public.organizer_evidence_verification_events (
    evidence_id,
    action,
    actor_id,
    note,
    metadata
  )
  values (
    saved_evidence.id,
    'link_added',
    current_user_id,
    normalized_notes,
    jsonb_build_object(
      'link_id',
      saved_link.id,
      'organizer_id',
      selected_organizer.id,
      'document_id',
      selected_document.id,
      'section_key',
      normalized_section_key,
      'subject_type',
      normalized_subject_type,
      'subject_id',
      requested_subject_id,
      'field_key',
      normalized_field_key,
      'link_type',
      normalized_link_type
    )
  );

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
    'client_document_registered_as_organizer_evidence',
    'organizer_evidence_link',
    saved_link.id,
    jsonb_build_object(
      'evidence_id',
      saved_evidence.id,
      'document_id',
      selected_document.id,
      'original_file_name',
      selected_document.original_file_name,
      'section_key',
      normalized_section_key,
      'subject_type',
      normalized_subject_type,
      'subject_id',
      requested_subject_id,
      'field_key',
      normalized_field_key,
      'link_type',
      normalized_link_type
    ),
    jsonb_build_object(
      'organizer_id',
      selected_organizer.id,
      'client_id',
      selected_organizer.client_id,
      'tax_year',
      selected_organizer.tax_year,
      'reused_existing_evidence',
      existing_evidence
    )
  );

  return query
  select
    saved_evidence.id,
    saved_link.id,
    selected_document.id,
    selected_document.original_file_name,
    saved_evidence.evidence_type,
    saved_evidence.confidence,
    saved_evidence.verification_status,
    existing_evidence;
end;
$_$;


ALTER FUNCTION "public"."register_document_as_organizer_evidence"("requested_organizer_id" "uuid", "requested_document_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_field_key" "text", "requested_evidence_type" "text", "requested_confidence" "text", "requested_link_type" "text", "requested_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."request_document_changes"("p_document_id" "uuid", "p_comments" "text") RETURNS "public"."client_documents"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_document public.client_documents;
    v_reviewer_name text;
BEGIN
    SELECT
        COALESCE(
            display_name,
            TRIM(
                COALESCE(first_name, '') || ' ' ||
                COALESCE(last_name, '')
            ),
            email
        )
    INTO v_reviewer_name
    FROM public.profiles
    WHERE id = auth.uid();

    UPDATE public.client_documents
    SET
        review_status = 'needs_changes',
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        reviewed_by_name = COALESCE(v_reviewer_name, 'Unknown Reviewer'),
        review_comments = p_comments,
        updated_at = now()
    WHERE id = p_document_id
      AND review_status = 'pending_review'
    RETURNING *
    INTO v_document;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Document was not found or is no longer pending review.';
    END IF;

    RETURN v_document;
END;
$$;


ALTER FUNCTION "public"."request_document_changes"("p_document_id" "uuid", "p_comments" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."request_document_review"("p_document_id" "uuid") RETURNS "public"."client_documents"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
    v_document public.client_documents;
begin

    update public.client_documents
    set
        review_status = 'pending_review',
        review_requested_by = auth.uid(),
        review_requested_at = timezone('utc', now()),
        reviewed_by = null,
        reviewed_by_name = null,
        reviewed_at = null,
        review_comments = null,
        updated_at = timezone('utc', now())
    where id = p_document_id
    returning *
    into v_document;

    return v_document;

end;
$$;


ALTER FUNCTION "public"."request_document_review"("p_document_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."request_document_review_assignment"("p_document_id" "uuid", "p_reviewer_id" "uuid", "p_review_due_at" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS SETOF "public"."client_documents"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
    current_profile public.profiles%rowtype;
    reviewer_profile public.profiles%rowtype;
    updated_document public.client_documents%rowtype;
    requester_name text;
    reviewer_name text;
begin
    if auth.uid() is null then
        raise exception 'Authentication is required.';
    end if;

    select *
    into current_profile
    from public.profiles
    where id = auth.uid()
      and is_active = true;

    if not found then
        raise exception 'An active staff account is required.';
    end if;

    if current_profile.role not in (
        'administrator'::public.app_role,
        'manager'::public.app_role,
        'preparer'::public.app_role,
        'receptionist'::public.app_role
    ) then
        raise exception 'Your role is not permitted to assign reviewers.';
    end if;

    select *
    into reviewer_profile
    from public.profiles
    where id = p_reviewer_id
      and is_active = true
      and role in (
          'administrator'::public.app_role,
          'manager'::public.app_role,
          'reviewer'::public.app_role
      );

    if not found then
        raise exception 'The selected reviewer is not an active authorized reviewer.';
    end if;

    requester_name := coalesce(
        nullif(trim(current_profile.display_name), ''),
        nullif(
            trim(
                concat_ws(
                    ' ',
                    current_profile.first_name,
                    current_profile.last_name
                )
            ),
            ''
        ),
        current_profile.email
    );

    reviewer_name := coalesce(
        nullif(trim(reviewer_profile.display_name), ''),
        nullif(
            trim(
                concat_ws(
                    ' ',
                    reviewer_profile.first_name,
                    reviewer_profile.last_name
                )
            ),
            ''
        ),
        reviewer_profile.email
    );

    ------------------------------------------------------------------
    -- NEW WORKFLOW:
    -- Document has ALREADY been submitted for review.
    -- Only assign the reviewer and due date.
    ------------------------------------------------------------------

    update public.client_documents
    set
        assigned_reviewer_id = reviewer_profile.id,
        assigned_reviewer_name = reviewer_name,
        review_due_at = p_review_due_at,
        updated_at = now()
    where id = p_document_id
      and archived_at is null
      and review_status = 'pending_review'
    returning *
    into updated_document;

    if not found then
        raise exception 'The document must already be Pending Review before a reviewer can be assigned.';
    end if;

    insert into public.document_notifications (
        recipient_user_id,
        actor_user_id,
        document_id,
        client_id,
        tax_return_id,
        notification_type,
        title,
        message,
        metadata
    )
    values (
        reviewer_profile.id,
        auth.uid(),
        updated_document.id,
        updated_document.client_id,
        updated_document.tax_return_id,
        'document_review_requested',
        'Document assigned for review',
        format(
            '%s assigned "%s" to you for review.',
            requester_name,
            updated_document.original_file_name
        ),
        jsonb_build_object(
            'reviewerName', reviewer_name,
            'requesterName', requester_name,
            'reviewDueAt', updated_document.review_due_at
        )
    );

    return next updated_document;
end;
$$;


ALTER FUNCTION "public"."request_document_review_assignment"("p_document_id" "uuid", "p_reviewer_id" "uuid", "p_review_due_at" timestamp with time zone) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_tax_organizers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "tax_year" integer NOT NULL,
    "status" "public"."tax_organizer_status" DEFAULT 'not_started'::"public"."tax_organizer_status" NOT NULL,
    "current_section" "public"."tax_organizer_section_key" DEFAULT 'personal'::"public"."tax_organizer_section_key" NOT NULL,
    "progress_percentage" integer DEFAULT 0 NOT NULL,
    "started_at" timestamp with time zone,
    "last_saved_at" timestamp with time zone,
    "submitted_at" timestamp with time zone,
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "client_tax_organizers_progress_valid" CHECK ((("progress_percentage" >= 0) AND ("progress_percentage" <= 100))),
    CONSTRAINT "client_tax_organizers_tax_year_valid" CHECK ((("tax_year" >= 2000) AND ("tax_year" <= 2100)))
);


ALTER TABLE "public"."client_tax_organizers" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."require_client_business_organizer_access"("requested_organizer_id" "uuid", "requested_require_editable" boolean) RETURNS "public"."client_tax_organizers"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  current_client_id uuid;
  organizer_record public.client_tax_organizers;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception 'An organizer identifier is required.';
  end if;

  select portal_profile.client_id
  into current_client_id
  from public.client_portal_profiles as portal_profile
  where portal_profile.auth_user_id = auth.uid()
    and portal_profile.portal_status = 'active'
  limit 1;

  if current_client_id is null then
    raise exception 'An active client portal profile was not found.';
  end if;

  select tax_organizer.*
  into organizer_record
  from public.client_tax_organizers as tax_organizer
  where tax_organizer.id = requested_organizer_id
    and tax_organizer.client_id = current_client_id;

  if not found then
    raise exception 'The requested tax organizer was not found.';
  end if;

  if requested_require_editable
    and organizer_record.status in (
      'submitted', 'under_review', 'approved'
    )
  then
    raise exception 'This organizer can no longer be edited.';
  end if;

  return organizer_record;
end;
$$;


ALTER FUNCTION "public"."require_client_business_organizer_access"("requested_organizer_id" "uuid", "requested_require_editable" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_document_review"("p_document_id" "uuid") RETURNS "public"."client_documents"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
    v_document public.client_documents;
begin

    update public.client_documents
    set
        review_status = 'draft',
        review_requested_by = null,
        review_requested_at = null,
        reviewed_by = null,
        reviewed_by_name = null,
        reviewed_at = null,
        review_comments = null,
        updated_at = timezone('utc', now())
    where id = p_document_id
    returning *
    into v_document;

    return v_document;

end;
$$;


ALTER FUNCTION "public"."reset_document_review"("p_document_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."restore_document_version"("requested_document_id" "uuid") RETURNS SETOF "public"."client_documents"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  selected_document public.client_documents;
  previous_current_document public.client_documents;
  restored_document public.client_documents;
begin
  if not public.current_user_can_manage_records() then
    raise exception
      'You are not authorized to restore document versions.';
  end if;

  select document.*
  into selected_document
  from public.client_documents as document
  where document.id = requested_document_id
    and document.archived_at is null;

  if not found then
    raise exception
      'The selected document version could not be found.';
  end if;

  if selected_document.is_current_version then
    raise exception
      'The selected document is already the current version.';
  end if;

  perform 1
  from public.client_documents
  where id = selected_document.version_group_id
  for update;

  select document.*
  into previous_current_document
  from public.client_documents as document
  where document.version_group_id =
    selected_document.version_group_id
    and document.is_current_version = true
  limit 1;

  update public.client_documents
  set
    is_current_version = false,
    updated_at = now()
  where version_group_id =
    selected_document.version_group_id
    and is_current_version = true;

  update public.client_documents
  set
    is_current_version = true,
    updated_at = now()
  where id = selected_document.id
  returning *
  into restored_document;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata
  )
  values (
    auth.uid(),
    'document_version_restored',
    'document',
    restored_document.id,
    jsonb_build_object(
      'previous_current_document_id',
      previous_current_document.id,
      'previous_current_version_number',
      previous_current_document.version_number
    ),
    jsonb_build_object(
      'restored_document_id',
      restored_document.id,
      'restored_version_number',
      restored_document.version_number,
      'is_current_version',
      restored_document.is_current_version
    ),
    jsonb_build_object(
      'client_id',
      restored_document.client_id,
      'tax_return_id',
      restored_document.tax_return_id,
      'version_group_id',
      restored_document.version_group_id
    )
  );

  return next restored_document;
end;
$$;


ALTER FUNCTION "public"."restore_document_version"("requested_document_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."return_dependent_to_client"("requested_dependent_id" "uuid", "requested_internal_notes" "text" DEFAULT NULL::"text") RETURNS TABLE("review_id" "uuid", "dependent_id" "uuid", "review_status" "text", "internal_notes" "text", "reviewed_by" "uuid", "reviewed_by_name" "text", "reviewed_at" timestamp with time zone, "follow_up_requested_at" timestamp with time zone, "returned_to_client_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  d public.client_tax_organizer_dependents;
  r public.client_tax_organizer_dependent_reviews;
  notes text := trim(coalesce(requested_internal_notes,''));
begin
  if uid is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then raise exception 'An active staff account is required.'; end if;
  if not public.current_user_can_manage_records() then raise exception 'You do not have permission to manage dependent reviews.'; end if;
  if requested_dependent_id is null then raise exception 'A dependent identifier is required.'; end if;
  if notes = '' then raise exception 'A return-to-client note is required.'; end if;
  if char_length(notes) > 10000 then raise exception 'The internal note cannot exceed 10,000 characters.'; end if;
  select x.* into d from public.client_tax_organizer_dependents x where x.id=requested_dependent_id;
  if not found then raise exception 'The selected dependent was not found.'; end if;

  insert into public.client_tax_organizer_dependent_reviews
    (dependent_id,review_status,internal_notes,follow_up_requested_by,
     follow_up_requested_at,returned_to_client_by,returned_to_client_at,created_by,updated_by)
  values(d.id,'returned_to_client',notes,uid,timezone('utc',now()),uid,timezone('utc',now()),uid,uid)
  on conflict (dependent_id) do update set
    review_status='returned_to_client',internal_notes=notes,reviewed_by=null,reviewed_at=null,
    follow_up_requested_by=uid,follow_up_requested_at=timezone('utc',now()),
    returned_to_client_by=uid,returned_to_client_at=timezone('utc',now()),updated_by=uid
  returning * into r;

  update public.client_tax_organizers set
    status='changes_requested',current_section='dependents',updated_at=timezone('utc',now())
  where id=d.organizer_id;

  insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_values,metadata)
  values(uid,'dependent_review_returned_to_client','client_tax_organizer_dependent_review',r.id,
    jsonb_build_object('dependent_id',r.dependent_id,'review_status',r.review_status,'internal_notes',r.internal_notes),
    jsonb_build_object('organizer_id',d.organizer_id,'organizer_status','changes_requested','current_section','dependents'));

  return query select r.id,r.dependent_id,r.review_status,r.internal_notes,uid,
    coalesce(nullif(trim(p.display_name),''),nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),p.email),
    r.reviewed_at,r.follow_up_requested_at,r.returned_to_client_at,r.updated_at
  from public.profiles p where p.id=uid;
end;
$$;


ALTER FUNCTION "public"."return_dependent_to_client"("requested_dependent_id" "uuid", "requested_internal_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."return_income_record_to_client"("requested_income_source_id" "uuid", "requested_internal_notes" "text" DEFAULT NULL::"text") RETURNS TABLE("review_id" "uuid", "income_source_id" "uuid", "review_status" "text", "internal_notes" "text", "reviewed_by" "uuid", "reviewed_by_name" "text", "reviewed_at" timestamp with time zone, "follow_up_requested_at" timestamp with time zone, "returned_to_client_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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

  if normalized_notes = '' then
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
    status = 'changes_requested',
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
$$;


ALTER FUNCTION "public"."return_income_record_to_client"("requested_income_source_id" "uuid", "requested_internal_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_client_organizer_banking_information"("requested_organizer_id" "uuid", "requested_account_holder_name" "text", "requested_bank_name" "text", "requested_account_type" "text", "requested_use_direct_deposit" boolean, "requested_authorize_direct_debit" boolean) RETURNS TABLE("organizer_id" "uuid", "section_status" "public"."tax_organizer_section_status", "section_progress_percentage" integer, "organizer_progress_percentage" integer, "saved_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  banking_requested boolean;
  has_routing_number boolean;
  has_account_number boolean;
  required_fields_complete boolean;

  completed_section_count integer;
  total_section_count integer;
  calculated_organizer_progress integer;

  current_saved_at timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if requested_account_type is not null
    and trim(requested_account_type) <> ''
    and trim(requested_account_type)
      not in (
        'checking',
        'savings'
      )
  then
    raise exception
      'The selected bank account type is invalid.';
  end if;

  current_saved_at :=
    now();

  insert into
    public.client_tax_organizer_banking_information
      as banking_information (
        organizer_id,
        account_holder_name,
        bank_name,
        account_type,
        use_direct_deposit,
        authorize_direct_debit,
        created_at,
        updated_at
      )
  values (
    requested_organizer_id,

    nullif(
      trim(
        requested_account_holder_name
      ),
      ''
    ),

    nullif(
      trim(
        requested_bank_name
      ),
      ''
    ),

    nullif(
      trim(
        requested_account_type
      ),
      ''
    ),

    requested_use_direct_deposit,

    requested_authorize_direct_debit,

    current_saved_at,

    current_saved_at
  )
  on conflict (
    organizer_id
  )
  do update
  set
    account_holder_name =
      excluded.account_holder_name,

    bank_name =
      excluded.bank_name,

    account_type =
      excluded.account_type,

    use_direct_deposit =
      excluded.use_direct_deposit,

    authorize_direct_debit =
      excluded.authorize_direct_debit,

    updated_at =
      current_saved_at;

  banking_requested :=
    coalesce(
      requested_use_direct_deposit,
      false
    )
    or coalesce(
      requested_authorize_direct_debit,
      false
    );

  select exists (
    select 1
    from public.vault_secrets
      as routing_secret
    where routing_secret.client_id =
        current_client_id
      and routing_secret.organizer_id =
        requested_organizer_id
      and routing_secret.secret_type =
        'routing_number'
      and routing_secret.archived_at
        is null
  )
  into
    has_routing_number;

  select exists (
    select 1
    from public.vault_secrets
      as account_secret
    where account_secret.client_id =
        current_client_id
      and account_secret.organizer_id =
        requested_organizer_id
      and account_secret.secret_type =
        'bank_account_number'
      and account_secret.archived_at
        is null
  )
  into
    has_account_number;

  required_fields_complete :=
    requested_use_direct_deposit
      is not null

    and requested_authorize_direct_debit
      is not null

    and (
      not banking_requested

      or (
        nullif(
          trim(
            requested_account_holder_name
          ),
          ''
        ) is not null

        and nullif(
          trim(
            requested_bank_name
          ),
          ''
        ) is not null

        and nullif(
          trim(
            requested_account_type
          ),
          ''
        ) is not null

        and has_routing_number

        and has_account_number
      )
    );

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      case
        when required_fields_complete
        then 'completed'
          ::public.tax_organizer_section_status
        else 'in_progress'
          ::public.tax_organizer_section_status
      end,

    progress_percentage =
      case
        when required_fields_complete
        then 100
        else 50
      end,

    started_at =
      coalesce(
        organizer_section.started_at,
        current_saved_at
      ),

    completed_at =
      case
        when required_fields_complete
        then coalesce(
          organizer_section.completed_at,
          current_saved_at
        )
        else null
      end,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'banking';

  select
    count(*) filter (
      where organizer_section.status =
        'completed'
    ),

    count(*)
  into
    completed_section_count,
    total_section_count
  from public.client_tax_organizer_sections
    as organizer_section
  where organizer_section.organizer_id =
    requested_organizer_id;

  calculated_organizer_progress :=
    case
      when total_section_count = 0
      then 0
      else round(
        (
          completed_section_count::numeric /
          total_section_count::numeric
        ) * 100
      )::integer
    end;

  update public.client_tax_organizers
    as tax_organizer
  set
    status =
      case
        when tax_organizer.status =
          'not_started'
        then 'in_progress'
          ::public.tax_organizer_status
        else tax_organizer.status
      end,

    current_section =
      case
        when required_fields_complete
        then 'dependents'
          ::public.tax_organizer_section_key
        else 'banking'
          ::public.tax_organizer_section_key
      end,

    progress_percentage =
      calculated_organizer_progress,

    started_at =
      coalesce(
        tax_organizer.started_at,
        current_saved_at
      ),

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    requested_organizer_id
      as result_organizer_id,

    case
      when required_fields_complete
      then 'completed'
        ::public.tax_organizer_section_status
      else 'in_progress'
        ::public.tax_organizer_section_status
    end
      as result_section_status,

    case
      when required_fields_complete
      then 100
      else 50
    end
      as result_section_progress,

    calculated_organizer_progress
      as result_organizer_progress,

    current_saved_at
      as result_saved_at;
end;
$$;


ALTER FUNCTION "public"."save_client_organizer_banking_information"("requested_organizer_id" "uuid", "requested_account_holder_name" "text", "requested_bank_name" "text", "requested_account_type" "text", "requested_use_direct_deposit" boolean, "requested_authorize_direct_debit" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_client_organizer_identity_information"("requested_organizer_id" "uuid", "requested_identification_type" "text", "requested_identification_state" "text", "requested_identification_issue_date" "date", "requested_identification_expiration_date" "date", "requested_citizenship_status" "text", "requested_is_us_citizen" boolean, "requested_has_government_photo_id" boolean, "requested_has_identity_changed" boolean) RETURNS TABLE("result_organizer_id" "uuid", "section_status" "public"."tax_organizer_section_status", "section_progress_percentage" integer, "organizer_progress_percentage" integer, "last_saved_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  required_fields_complete boolean;

  completed_section_count integer;
  total_section_count integer;
  calculated_organizer_progress integer;

  saved_at timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as profile
  where profile.auth_user_id =
      current_user_id
    and profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as organizer
  where organizer.id =
      requested_organizer_id
    and organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if (
    requested_identification_issue_date
      is not null
    and requested_identification_expiration_date
      is not null
    and requested_identification_expiration_date <
      requested_identification_issue_date
  ) then
    raise exception
      'The identification expiration date cannot be before the issue date.';
  end if;

  saved_at :=
    now();

  insert into public.client_tax_organizer_identity_information (
    organizer_id,
    identification_type,
    identification_state,
    identification_issue_date,
    identification_expiration_date,
    citizenship_status,
    is_us_citizen,
    has_government_photo_id,
    has_identity_changed
  )
  values (
    requested_organizer_id,

    nullif(
      trim(
        requested_identification_type
      ),
      ''
    ),

    nullif(
      upper(
        trim(
          requested_identification_state
        )
      ),
      ''
    ),

    requested_identification_issue_date,

    requested_identification_expiration_date,

    nullif(
      trim(
        requested_citizenship_status
      ),
      ''
    ),

    requested_is_us_citizen,

    requested_has_government_photo_id,

    requested_has_identity_changed
  )
  on conflict on constraint
    client_tax_organizer_identity_information_pkey
  do update
  set
    identification_type =
      excluded.identification_type,

    identification_state =
      excluded.identification_state,

    identification_issue_date =
      excluded.identification_issue_date,

    identification_expiration_date =
      excluded.identification_expiration_date,

    citizenship_status =
      excluded.citizenship_status,

    is_us_citizen =
      excluded.is_us_citizen,

    has_government_photo_id =
      excluded.has_government_photo_id,

    has_identity_changed =
      excluded.has_identity_changed,

    updated_at =
      saved_at;

  required_fields_complete :=
    nullif(
      trim(
        requested_identification_type
      ),
      ''
    ) is not null

    and nullif(
      trim(
        requested_identification_state
      ),
      ''
    ) is not null

    and requested_identification_expiration_date
      is not null

    and nullif(
      trim(
        requested_citizenship_status
      ),
      ''
    ) is not null

    and requested_is_us_citizen
      is not null

    and requested_has_government_photo_id
      is not null

    and requested_has_identity_changed
      is not null;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      case
        when required_fields_complete
        then 'completed'
          ::public.tax_organizer_section_status
        else 'in_progress'
          ::public.tax_organizer_section_status
      end,

    progress_percentage =
      case
        when required_fields_complete
        then 100
        else 50
      end,

    started_at =
      coalesce(
        organizer_section.started_at,
        saved_at
      ),

    completed_at =
      case
        when required_fields_complete
        then coalesce(
          organizer_section.completed_at,
          saved_at
        )
        else null
      end,

    last_saved_at =
      saved_at,

    updated_at =
      saved_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'identity';

  select
    count(*) filter (
      where organizer_section.status =
        'completed'
    ),
    count(*)
  into
    completed_section_count,
    total_section_count
  from public.client_tax_organizer_sections
    as organizer_section
  where organizer_section.organizer_id =
    requested_organizer_id;

  calculated_organizer_progress :=
    case
      when total_section_count = 0
      then 0
      else round(
        (
          completed_section_count::numeric /
          total_section_count::numeric
        ) * 100
      )::integer
    end;

  update public.client_tax_organizers
    as organizer
  set
    status =
      case
        when organizer.status =
          'not_started'
        then 'in_progress'
          ::public.tax_organizer_status
        else organizer.status
      end,

    current_section =
      case
        when required_fields_complete
        then 'banking'
          ::public.tax_organizer_section_key
        else 'identity'
          ::public.tax_organizer_section_key
      end,

    progress_percentage =
      calculated_organizer_progress,

    started_at =
      coalesce(
        organizer.started_at,
        saved_at
      ),

    last_saved_at =
      saved_at,

    updated_at =
      saved_at
  where organizer.id =
    requested_organizer_id;

  return query
  select
    requested_organizer_id,

    case
      when required_fields_complete
      then 'completed'
        ::public.tax_organizer_section_status
      else 'in_progress'
        ::public.tax_organizer_section_status
    end,

    case
      when required_fields_complete
      then 100
      else 50
    end,

    calculated_organizer_progress,

    saved_at;
end;
$$;


ALTER FUNCTION "public"."save_client_organizer_identity_information"("requested_organizer_id" "uuid", "requested_identification_type" "text", "requested_identification_state" "text", "requested_identification_issue_date" "date", "requested_identification_expiration_date" "date", "requested_citizenship_status" "text", "requested_is_us_citizen" boolean, "requested_has_government_photo_id" boolean, "requested_has_identity_changed" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_client_organizer_income_1099_div_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_identification_number" "text", "requested_total_ordinary_dividends" numeric, "requested_qualified_dividends" numeric, "requested_total_capital_gain_distributions" numeric, "requested_unrecaptured_section_1250_gain" numeric, "requested_section_1202_gain" numeric, "requested_collectibles_28_percent_rate_gain" numeric, "requested_section_897_ordinary_dividends" numeric, "requested_section_897_capital_gain" numeric, "requested_nondividend_distributions" numeric, "requested_federal_income_tax_withheld" numeric, "requested_section_199a_dividends" numeric, "requested_investment_expenses" numeric, "requested_foreign_tax_paid" numeric, "requested_foreign_country_or_us_possession" "text", "requested_exempt_interest_dividends" numeric, "requested_specified_private_activity_bond_interest_dividends" numeric, "requested_state_code" "text", "requested_state_identification_number" "text", "requested_state_tax_withheld" numeric, "requested_document_received" boolean) RETURNS TABLE("income_source_id" "uuid", "organizer_id" "uuid", "income_type" "text", "payer_name" "text", "recipient_type" "text", "record_status" "text", "document_received" boolean, "notes" "text", "display_order" integer, "income_created_at" timestamp with time zone, "income_updated_at" timestamp with time zone, "payer_identification_number" "text", "total_ordinary_dividends" numeric, "qualified_dividends" numeric, "total_capital_gain_distributions" numeric, "unrecaptured_section_1250_gain" numeric, "section_1202_gain" numeric, "collectibles_28_percent_rate_gain" numeric, "section_897_ordinary_dividends" numeric, "section_897_capital_gain" numeric, "nondividend_distributions" numeric, "federal_income_tax_withheld" numeric, "section_199a_dividends" numeric, "investment_expenses" numeric, "foreign_tax_paid" numeric, "foreign_country_or_us_possession" "text", "exempt_interest_dividends" numeric, "specified_private_activity_bond_interest_dividends" numeric, "state_code" "text", "state_identification_number" "text", "state_tax_withheld" numeric, "details_created_at" timestamp with time zone, "details_updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  required_fields_complete boolean;
  current_saved_at timestamptz;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
      and income_source.income_type =
        '1099_div'
  ) then
    raise exception
      'The requested 1099-DIV income source was not found.';
  end if;

  if requested_state_code is not null
    and trim(requested_state_code) <> ''
    and upper(trim(requested_state_code))
      !~ '^[A-Z]{2}$'
  then
    raise exception
      'The state code must contain two letters.';
  end if;

  if requested_payer_identification_number is not null
    and trim(requested_payer_identification_number) <> ''
    and trim(requested_payer_identification_number)
      !~ '^[0-9]{2}-?[0-9]{7}$'
  then
    raise exception
      'The payer identification number is invalid.';
  end if;

  if requested_total_ordinary_dividends is not null
    and requested_total_ordinary_dividends < 0
  then
    raise exception
      'Ordinary dividends cannot be negative.';
  end if;

  if requested_qualified_dividends is not null
    and requested_qualified_dividends < 0
  then
    raise exception
      'Qualified dividends cannot be negative.';
  end if;

  if requested_total_capital_gain_distributions is not null
    and requested_total_capital_gain_distributions < 0
  then
    raise exception
      'Capital gain distributions cannot be negative.';
  end if;

  if requested_unrecaptured_section_1250_gain is not null
    and requested_unrecaptured_section_1250_gain < 0
  then
    raise exception
      'Unrecaptured Section 1250 gain cannot be negative.';
  end if;

  if requested_section_1202_gain is not null
    and requested_section_1202_gain < 0
  then
    raise exception
      'Section 1202 gain cannot be negative.';
  end if;

  if requested_collectibles_28_percent_rate_gain is not null
    and requested_collectibles_28_percent_rate_gain < 0
  then
    raise exception
      'Collectibles gain cannot be negative.';
  end if;

  if requested_section_897_ordinary_dividends is not null
    and requested_section_897_ordinary_dividends < 0
  then
    raise exception
      'Section 897 ordinary dividends cannot be negative.';
  end if;

  if requested_section_897_capital_gain is not null
    and requested_section_897_capital_gain < 0
  then
    raise exception
      'Section 897 capital gain cannot be negative.';
  end if;

  if requested_nondividend_distributions is not null
    and requested_nondividend_distributions < 0
  then
    raise exception
      'Nondividend distributions cannot be negative.';
  end if;

  if requested_federal_income_tax_withheld is not null
    and requested_federal_income_tax_withheld < 0
  then
    raise exception
      'Federal income tax withheld cannot be negative.';
  end if;

  if requested_section_199a_dividends is not null
    and requested_section_199a_dividends < 0
  then
    raise exception
      'Section 199A dividends cannot be negative.';
  end if;

  if requested_investment_expenses is not null
    and requested_investment_expenses < 0
  then
    raise exception
      'Investment expenses cannot be negative.';
  end if;

  if requested_foreign_tax_paid is not null
    and requested_foreign_tax_paid < 0
  then
    raise exception
      'Foreign tax paid cannot be negative.';
  end if;

  if requested_exempt_interest_dividends is not null
    and requested_exempt_interest_dividends < 0
  then
    raise exception
      'Exempt-interest dividends cannot be negative.';
  end if;

  if requested_specified_private_activity_bond_interest_dividends is not null
    and requested_specified_private_activity_bond_interest_dividends < 0
  then
    raise exception
      'Private activity bond interest dividends cannot be negative.';
  end if;

  if requested_state_tax_withheld is not null
    and requested_state_tax_withheld < 0
  then
    raise exception
      'State tax withheld cannot be negative.';
  end if;

  current_saved_at := now();

  insert into
    public.client_tax_organizer_income_1099_div_details (
      income_source_id,
      payer_identification_number,
      total_ordinary_dividends,
      qualified_dividends,
      total_capital_gain_distributions,
      unrecaptured_section_1250_gain,
      section_1202_gain,
      collectibles_28_percent_rate_gain,
      section_897_ordinary_dividends,
      section_897_capital_gain,
      nondividend_distributions,
      federal_income_tax_withheld,
      section_199a_dividends,
      investment_expenses,
      foreign_tax_paid,
      foreign_country_or_us_possession,
      exempt_interest_dividends,
      specified_private_activity_bond_interest_dividends,
      state_code,
      state_identification_number,
      state_tax_withheld,
      created_at,
      updated_at
    )
  values (
    requested_income_source_id,
    nullif(trim(requested_payer_identification_number), ''),
    requested_total_ordinary_dividends,
    requested_qualified_dividends,
    requested_total_capital_gain_distributions,
    requested_unrecaptured_section_1250_gain,
    requested_section_1202_gain,
    requested_collectibles_28_percent_rate_gain,
    requested_section_897_ordinary_dividends,
    requested_section_897_capital_gain,
    requested_nondividend_distributions,
    requested_federal_income_tax_withheld,
    requested_section_199a_dividends,
    requested_investment_expenses,
    requested_foreign_tax_paid,
    nullif(trim(requested_foreign_country_or_us_possession), ''),
    requested_exempt_interest_dividends,
    requested_specified_private_activity_bond_interest_dividends,
    nullif(upper(trim(requested_state_code)), ''),
    nullif(trim(requested_state_identification_number), ''),
    requested_state_tax_withheld,
    current_saved_at,
    current_saved_at
  )
  on conflict on constraint
    client_tax_organizer_income_1099_div_details_pkey
  do update
  set
    payer_identification_number =
      excluded.payer_identification_number,
    total_ordinary_dividends =
      excluded.total_ordinary_dividends,
    qualified_dividends =
      excluded.qualified_dividends,
    total_capital_gain_distributions =
      excluded.total_capital_gain_distributions,
    unrecaptured_section_1250_gain =
      excluded.unrecaptured_section_1250_gain,
    section_1202_gain =
      excluded.section_1202_gain,
    collectibles_28_percent_rate_gain =
      excluded.collectibles_28_percent_rate_gain,
    section_897_ordinary_dividends =
      excluded.section_897_ordinary_dividends,
    section_897_capital_gain =
      excluded.section_897_capital_gain,
    nondividend_distributions =
      excluded.nondividend_distributions,
    federal_income_tax_withheld =
      excluded.federal_income_tax_withheld,
    section_199a_dividends =
      excluded.section_199a_dividends,
    investment_expenses =
      excluded.investment_expenses,
    foreign_tax_paid =
      excluded.foreign_tax_paid,
    foreign_country_or_us_possession =
      excluded.foreign_country_or_us_possession,
    exempt_interest_dividends =
      excluded.exempt_interest_dividends,
    specified_private_activity_bond_interest_dividends =
      excluded.specified_private_activity_bond_interest_dividends,
    state_code =
      excluded.state_code,
    state_identification_number =
      excluded.state_identification_number,
    state_tax_withheld =
      excluded.state_tax_withheld,
    updated_at =
      current_saved_at;

  required_fields_complete :=
    requested_total_ordinary_dividends is not null
    and coalesce(
      requested_document_received,
      false
    );

  update public.client_tax_organizer_income_sources
    as income_source
  set
    record_status =
      case
        when required_fields_complete
        then 'complete'
        else 'draft'
      end,

    document_received =
      coalesce(
        requested_document_received,
        false
      ),

    updated_at =
      current_saved_at

  where income_source.id =
      requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      'in_progress'
        ::public.tax_organizer_section_status,

    progress_percentage =
      greatest(
        organizer_section.progress_percentage,
        case
          when required_fields_complete
          then 50
          else 25
        end
      ),

    started_at =
      coalesce(
        organizer_section.started_at,
        current_saved_at
      ),

    completed_at =
      null,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at

  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'income';

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'income'
        ::public.tax_organizer_section_key,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at

  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    income_source.id,
    income_source.organizer_id,
    income_source.income_type,
    income_source.payer_name,
    income_source.recipient_type,
    income_source.record_status,
    income_source.document_received,
    income_source.notes,
    income_source.display_order,
    income_source.created_at,
    income_source.updated_at,
    details.payer_identification_number,
    details.total_ordinary_dividends,
    details.qualified_dividends,
    details.total_capital_gain_distributions,
    details.unrecaptured_section_1250_gain,
    details.section_1202_gain,
    details.collectibles_28_percent_rate_gain,
    details.section_897_ordinary_dividends,
    details.section_897_capital_gain,
    details.nondividend_distributions,
    details.federal_income_tax_withheld,
    details.section_199a_dividends,
    details.investment_expenses,
    details.foreign_tax_paid,
    details.foreign_country_or_us_possession,
    details.exempt_interest_dividends,
    details.specified_private_activity_bond_interest_dividends,
    details.state_code,
    details.state_identification_number,
    details.state_tax_withheld,
    details.created_at,
    details.updated_at

  from public.client_tax_organizer_income_sources
    as income_source

  join public.client_tax_organizer_income_1099_div_details
    as details
    on details.income_source_id =
      income_source.id

  where income_source.id =
      requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;
end;
$_$;


ALTER FUNCTION "public"."save_client_organizer_income_1099_div_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_identification_number" "text", "requested_total_ordinary_dividends" numeric, "requested_qualified_dividends" numeric, "requested_total_capital_gain_distributions" numeric, "requested_unrecaptured_section_1250_gain" numeric, "requested_section_1202_gain" numeric, "requested_collectibles_28_percent_rate_gain" numeric, "requested_section_897_ordinary_dividends" numeric, "requested_section_897_capital_gain" numeric, "requested_nondividend_distributions" numeric, "requested_federal_income_tax_withheld" numeric, "requested_section_199a_dividends" numeric, "requested_investment_expenses" numeric, "requested_foreign_tax_paid" numeric, "requested_foreign_country_or_us_possession" "text", "requested_exempt_interest_dividends" numeric, "requested_specified_private_activity_bond_interest_dividends" numeric, "requested_state_code" "text", "requested_state_identification_number" "text", "requested_state_tax_withheld" numeric, "requested_document_received" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."save_client_organizer_income_1099_div_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_identification_number" "text", "requested_total_ordinary_dividends" numeric, "requested_qualified_dividends" numeric, "requested_total_capital_gain_distributions" numeric, "requested_unrecaptured_section_1250_gain" numeric, "requested_section_1202_gain" numeric, "requested_collectibles_28_percent_rate_gain" numeric, "requested_section_897_ordinary_dividends" numeric, "requested_section_897_capital_gain" numeric, "requested_nondividend_distributions" numeric, "requested_federal_income_tax_withheld" numeric, "requested_section_199a_dividends" numeric, "requested_investment_expenses" numeric, "requested_foreign_tax_paid" numeric, "requested_foreign_country_or_us_possession" "text", "requested_exempt_interest_dividends" numeric, "requested_specified_private_activity_bond_interest_dividends" numeric, "requested_state_code" "text", "requested_state_identification_number" "text", "requested_state_tax_withheld" numeric, "requested_document_received" boolean) IS 'Creates or updates Form 1099-DIV detail values for an income source owned by the authenticated active client portal user.';



CREATE OR REPLACE FUNCTION "public"."save_client_organizer_income_1099_int_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_identification_number" "text", "requested_interest_income" numeric, "requested_early_withdrawal_penalty" numeric, "requested_interest_on_us_savings_bonds_and_treasury_obligations" numeric, "requested_federal_income_tax_withheld" numeric, "requested_investment_expenses" numeric, "requested_foreign_tax_paid" numeric, "requested_foreign_country_or_us_possession" "text", "requested_tax_exempt_interest" numeric, "requested_specified_private_activity_bond_interest" numeric, "requested_market_discount" numeric, "requested_bond_premium" numeric, "requested_bond_premium_on_treasury_obligations" numeric, "requested_bond_premium_on_tax_exempt_bond" numeric, "requested_state_code" "text", "requested_state_identification_number" "text", "requested_state_tax_withheld" numeric, "requested_document_received" boolean) RETURNS TABLE("income_source_id" "uuid", "organizer_id" "uuid", "income_type" "text", "payer_name" "text", "recipient_type" "text", "record_status" "text", "document_received" boolean, "notes" "text", "display_order" integer, "income_created_at" timestamp with time zone, "income_updated_at" timestamp with time zone, "payer_identification_number" "text", "interest_income" numeric, "early_withdrawal_penalty" numeric, "interest_on_us_savings_bonds_and_treasury_obligations" numeric, "federal_income_tax_withheld" numeric, "investment_expenses" numeric, "foreign_tax_paid" numeric, "foreign_country_or_us_possession" "text", "tax_exempt_interest" numeric, "specified_private_activity_bond_interest" numeric, "market_discount" numeric, "bond_premium" numeric, "bond_premium_on_treasury_obligations" numeric, "bond_premium_on_tax_exempt_bond" numeric, "state_code" "text", "state_identification_number" "text", "state_tax_withheld" numeric, "details_created_at" timestamp with time zone, "details_updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  required_fields_complete boolean;
  current_saved_at timestamptz;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
      and income_source.income_type =
        '1099_int'
  ) then
    raise exception
      'The requested 1099-INT income source was not found.';
  end if;

  if requested_state_code is not null
    and trim(requested_state_code) <> ''
    and upper(trim(requested_state_code))
      !~ '^[A-Z]{2}$'
  then
    raise exception
      'The state code must contain two letters.';
  end if;

  if requested_payer_identification_number is not null
    and trim(requested_payer_identification_number) <> ''
    and trim(requested_payer_identification_number)
      !~ '^[0-9]{2}-?[0-9]{7}$'
  then
    raise exception
      'The payer identification number is invalid.';
  end if;

  if requested_interest_income is not null
    and requested_interest_income < 0
  then
    raise exception
      'Interest income cannot be negative.';
  end if;

  if requested_early_withdrawal_penalty is not null
    and requested_early_withdrawal_penalty < 0
  then
    raise exception
      'Early withdrawal penalty cannot be negative.';
  end if;

  if requested_interest_on_us_savings_bonds_and_treasury_obligations is not null
    and requested_interest_on_us_savings_bonds_and_treasury_obligations < 0
  then
    raise exception
      'U.S. Savings Bond and Treasury interest cannot be negative.';
  end if;

  if requested_federal_income_tax_withheld is not null
    and requested_federal_income_tax_withheld < 0
  then
    raise exception
      'Federal income tax withheld cannot be negative.';
  end if;

  if requested_investment_expenses is not null
    and requested_investment_expenses < 0
  then
    raise exception
      'Investment expenses cannot be negative.';
  end if;

  if requested_foreign_tax_paid is not null
    and requested_foreign_tax_paid < 0
  then
    raise exception
      'Foreign tax paid cannot be negative.';
  end if;

  if requested_tax_exempt_interest is not null
    and requested_tax_exempt_interest < 0
  then
    raise exception
      'Tax-exempt interest cannot be negative.';
  end if;

  if requested_specified_private_activity_bond_interest is not null
    and requested_specified_private_activity_bond_interest < 0
  then
    raise exception
      'Private activity bond interest cannot be negative.';
  end if;

  if requested_market_discount is not null
    and requested_market_discount < 0
  then
    raise exception
      'Market discount cannot be negative.';
  end if;

  if requested_bond_premium is not null
    and requested_bond_premium < 0
  then
    raise exception
      'Bond premium cannot be negative.';
  end if;

  if requested_bond_premium_on_treasury_obligations is not null
    and requested_bond_premium_on_treasury_obligations < 0
  then
    raise exception
      'Treasury bond premium cannot be negative.';
  end if;

  if requested_bond_premium_on_tax_exempt_bond is not null
    and requested_bond_premium_on_tax_exempt_bond < 0
  then
    raise exception
      'Tax-exempt bond premium cannot be negative.';
  end if;

  if requested_state_tax_withheld is not null
    and requested_state_tax_withheld < 0
  then
    raise exception
      'State tax withheld cannot be negative.';
  end if;

  current_saved_at := now();

  insert into
    public.client_tax_organizer_income_1099_int_details (
      income_source_id,
      payer_identification_number,
      interest_income,
      early_withdrawal_penalty,
      interest_on_us_savings_bonds_and_treasury_obligations,
      federal_income_tax_withheld,
      investment_expenses,
      foreign_tax_paid,
      foreign_country_or_us_possession,
      tax_exempt_interest,
      specified_private_activity_bond_interest,
      market_discount,
      bond_premium,
      bond_premium_on_treasury_obligations,
      bond_premium_on_tax_exempt_bond,
      state_code,
      state_identification_number,
      state_tax_withheld,
      created_at,
      updated_at
    )
  values (
    requested_income_source_id,
    nullif(trim(requested_payer_identification_number), ''),
    requested_interest_income,
    requested_early_withdrawal_penalty,
    requested_interest_on_us_savings_bonds_and_treasury_obligations,
    requested_federal_income_tax_withheld,
    requested_investment_expenses,
    requested_foreign_tax_paid,
    nullif(trim(requested_foreign_country_or_us_possession), ''),
    requested_tax_exempt_interest,
    requested_specified_private_activity_bond_interest,
    requested_market_discount,
    requested_bond_premium,
    requested_bond_premium_on_treasury_obligations,
    requested_bond_premium_on_tax_exempt_bond,
    nullif(upper(trim(requested_state_code)), ''),
    nullif(trim(requested_state_identification_number), ''),
    requested_state_tax_withheld,
    current_saved_at,
    current_saved_at
  )
  on conflict on constraint
    client_tax_organizer_income_1099_int_details_pkey
  do update
  set
    payer_identification_number =
      excluded.payer_identification_number,
    interest_income =
      excluded.interest_income,
    early_withdrawal_penalty =
      excluded.early_withdrawal_penalty,
    interest_on_us_savings_bonds_and_treasury_obligations =
      excluded.interest_on_us_savings_bonds_and_treasury_obligations,
    federal_income_tax_withheld =
      excluded.federal_income_tax_withheld,
    investment_expenses =
      excluded.investment_expenses,
    foreign_tax_paid =
      excluded.foreign_tax_paid,
    foreign_country_or_us_possession =
      excluded.foreign_country_or_us_possession,
    tax_exempt_interest =
      excluded.tax_exempt_interest,
    specified_private_activity_bond_interest =
      excluded.specified_private_activity_bond_interest,
    market_discount =
      excluded.market_discount,
    bond_premium =
      excluded.bond_premium,
    bond_premium_on_treasury_obligations =
      excluded.bond_premium_on_treasury_obligations,
    bond_premium_on_tax_exempt_bond =
      excluded.bond_premium_on_tax_exempt_bond,
    state_code =
      excluded.state_code,
    state_identification_number =
      excluded.state_identification_number,
    state_tax_withheld =
      excluded.state_tax_withheld,
    updated_at =
      current_saved_at;

  required_fields_complete :=
    requested_interest_income is not null
    and coalesce(
      requested_document_received,
      false
    );

  update public.client_tax_organizer_income_sources
    as income_source
  set
    record_status =
      case
        when required_fields_complete
        then 'complete'
        else 'draft'
      end,

    document_received =
      coalesce(
        requested_document_received,
        false
      ),

    updated_at =
      current_saved_at

  where income_source.id =
      requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      'in_progress'
        ::public.tax_organizer_section_status,

    progress_percentage =
      greatest(
        organizer_section.progress_percentage,
        case
          when required_fields_complete
          then 50
          else 25
        end
      ),

    started_at =
      coalesce(
        organizer_section.started_at,
        current_saved_at
      ),

    completed_at =
      null,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at

  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'income';

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'income'
        ::public.tax_organizer_section_key,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at

  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    income_source.id,
    income_source.organizer_id,
    income_source.income_type,
    income_source.payer_name,
    income_source.recipient_type,
    income_source.record_status,
    income_source.document_received,
    income_source.notes,
    income_source.display_order,
    income_source.created_at,
    income_source.updated_at,
    details.payer_identification_number,
    details.interest_income,
    details.early_withdrawal_penalty,
    details.interest_on_us_savings_bonds_and_treasury_obligations,
    details.federal_income_tax_withheld,
    details.investment_expenses,
    details.foreign_tax_paid,
    details.foreign_country_or_us_possession,
    details.tax_exempt_interest,
    details.specified_private_activity_bond_interest,
    details.market_discount,
    details.bond_premium,
    details.bond_premium_on_treasury_obligations,
    details.bond_premium_on_tax_exempt_bond,
    details.state_code,
    details.state_identification_number,
    details.state_tax_withheld,
    details.created_at,
    details.updated_at

  from public.client_tax_organizer_income_sources
    as income_source

  join public.client_tax_organizer_income_1099_int_details
    as details
    on details.income_source_id =
      income_source.id

  where income_source.id =
      requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;
end;
$_$;


ALTER FUNCTION "public"."save_client_organizer_income_1099_int_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_identification_number" "text", "requested_interest_income" numeric, "requested_early_withdrawal_penalty" numeric, "requested_interest_on_us_savings_bonds_and_treasury_obligations" numeric, "requested_federal_income_tax_withheld" numeric, "requested_investment_expenses" numeric, "requested_foreign_tax_paid" numeric, "requested_foreign_country_or_us_possession" "text", "requested_tax_exempt_interest" numeric, "requested_specified_private_activity_bond_interest" numeric, "requested_market_discount" numeric, "requested_bond_premium" numeric, "requested_bond_premium_on_treasury_obligations" numeric, "requested_bond_premium_on_tax_exempt_bond" numeric, "requested_state_code" "text", "requested_state_identification_number" "text", "requested_state_tax_withheld" numeric, "requested_document_received" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."save_client_organizer_income_1099_int_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_identification_number" "text", "requested_interest_income" numeric, "requested_early_withdrawal_penalty" numeric, "requested_interest_on_us_savings_bonds_and_treasury_obligations" numeric, "requested_federal_income_tax_withheld" numeric, "requested_investment_expenses" numeric, "requested_foreign_tax_paid" numeric, "requested_foreign_country_or_us_possession" "text", "requested_tax_exempt_interest" numeric, "requested_specified_private_activity_bond_interest" numeric, "requested_market_discount" numeric, "requested_bond_premium" numeric, "requested_bond_premium_on_treasury_obligations" numeric, "requested_bond_premium_on_tax_exempt_bond" numeric, "requested_state_code" "text", "requested_state_identification_number" "text", "requested_state_tax_withheld" numeric, "requested_document_received" boolean) IS 'Creates or updates Form 1099-INT detail values for an income source owned by the authenticated active client portal user.';



CREATE OR REPLACE FUNCTION "public"."save_client_organizer_income_w2_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_employer_identification_number" "text", "requested_wages" numeric, "requested_federal_income_tax_withheld" numeric, "requested_social_security_wages" numeric, "requested_social_security_tax_withheld" numeric, "requested_medicare_wages" numeric, "requested_medicare_tax_withheld" numeric, "requested_state_code" "text", "requested_state_wages" numeric, "requested_state_income_tax_withheld" numeric, "requested_local_wages" numeric, "requested_local_income_tax_withheld" numeric, "requested_document_received" boolean) RETURNS TABLE("income_source_id" "uuid", "organizer_id" "uuid", "income_type" "text", "payer_name" "text", "recipient_type" "text", "record_status" "text", "document_received" boolean, "notes" "text", "display_order" integer, "income_created_at" timestamp with time zone, "income_updated_at" timestamp with time zone, "employer_identification_number" "text", "wages" numeric, "federal_income_tax_withheld" numeric, "social_security_wages" numeric, "social_security_tax_withheld" numeric, "medicare_wages" numeric, "medicare_tax_withheld" numeric, "state_code" "text", "state_wages" numeric, "state_income_tax_withheld" numeric, "local_wages" numeric, "local_income_tax_withheld" numeric, "w2_created_at" timestamp with time zone, "w2_updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  required_fields_complete boolean;
  current_saved_at timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
      and income_source.income_type =
        'w2'
  ) then
    raise exception
      'The requested W-2 income source was not found.';
  end if;

  if requested_employer_identification_number
      is not null
    and trim(
      requested_employer_identification_number
    ) <> ''
    and trim(
      requested_employer_identification_number
    ) !~ '^[0-9]{2}-?[0-9]{7}$'
  then
    raise exception
      'The employer identification number is invalid.';
  end if;

  if requested_state_code is not null
    and trim(requested_state_code) <> ''
    and upper(
      trim(requested_state_code)
    ) !~ '^[A-Z]{2}$'
  then
    raise exception
      'The state code must contain two letters.';
  end if;

  if requested_wages is not null
    and requested_wages < 0
  then
    raise exception
      'Wages cannot be negative.';
  end if;

  if requested_federal_income_tax_withheld is not null
    and requested_federal_income_tax_withheld < 0
  then
    raise exception
      'Federal income tax withheld cannot be negative.';
  end if;

  if requested_social_security_wages is not null
    and requested_social_security_wages < 0
  then
    raise exception
      'Social Security wages cannot be negative.';
  end if;

  if requested_social_security_tax_withheld is not null
    and requested_social_security_tax_withheld < 0
  then
    raise exception
      'Social Security tax withheld cannot be negative.';
  end if;

  if requested_medicare_wages is not null
    and requested_medicare_wages < 0
  then
    raise exception
      'Medicare wages cannot be negative.';
  end if;

  if requested_medicare_tax_withheld is not null
    and requested_medicare_tax_withheld < 0
  then
    raise exception
      'Medicare tax withheld cannot be negative.';
  end if;

  if requested_state_wages is not null
    and requested_state_wages < 0
  then
    raise exception
      'State wages cannot be negative.';
  end if;

  if requested_state_income_tax_withheld is not null
    and requested_state_income_tax_withheld < 0
  then
    raise exception
      'State income tax withheld cannot be negative.';
  end if;

  if requested_local_wages is not null
    and requested_local_wages < 0
  then
    raise exception
      'Local wages cannot be negative.';
  end if;

  if requested_local_income_tax_withheld is not null
    and requested_local_income_tax_withheld < 0
  then
    raise exception
      'Local income tax withheld cannot be negative.';
  end if;

  current_saved_at :=
    now();

  insert into
    public.client_tax_organizer_income_w2_details (
      income_source_id,
      employer_identification_number,
      wages,
      federal_income_tax_withheld,
      social_security_wages,
      social_security_tax_withheld,
      medicare_wages,
      medicare_tax_withheld,
      state_code,
      state_wages,
      state_income_tax_withheld,
      local_wages,
      local_income_tax_withheld,
      created_at,
      updated_at
    )
  values (
    requested_income_source_id,

    nullif(
      trim(
        requested_employer_identification_number
      ),
      ''
    ),

    requested_wages,

    requested_federal_income_tax_withheld,

    requested_social_security_wages,

    requested_social_security_tax_withheld,

    requested_medicare_wages,

    requested_medicare_tax_withheld,

    nullif(
      upper(
        trim(
          requested_state_code
        )
      ),
      ''
    ),

    requested_state_wages,

    requested_state_income_tax_withheld,

    requested_local_wages,

    requested_local_income_tax_withheld,

    current_saved_at,

    current_saved_at
  )
  on conflict on constraint
    client_tax_organizer_income_w2_details_pkey
  do update
  set
    employer_identification_number =
      excluded.employer_identification_number,

    wages =
      excluded.wages,

    federal_income_tax_withheld =
      excluded.federal_income_tax_withheld,

    social_security_wages =
      excluded.social_security_wages,

    social_security_tax_withheld =
      excluded.social_security_tax_withheld,

    medicare_wages =
      excluded.medicare_wages,

    medicare_tax_withheld =
      excluded.medicare_tax_withheld,

    state_code =
      excluded.state_code,

    state_wages =
      excluded.state_wages,

    state_income_tax_withheld =
      excluded.state_income_tax_withheld,

    local_wages =
      excluded.local_wages,

    local_income_tax_withheld =
      excluded.local_income_tax_withheld,

    updated_at =
      current_saved_at;

  required_fields_complete :=
    requested_wages is not null
    and coalesce(
      requested_document_received,
      false
    );

  update public.client_tax_organizer_income_sources
    as income_source
  set
    record_status =
      case
        when required_fields_complete
        then 'complete'
        else 'draft'
      end,

    document_received =
      coalesce(
        requested_document_received,
        false
      ),

    updated_at =
      current_saved_at
  where income_source.id =
      requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      'in_progress'
        ::public.tax_organizer_section_status,

    progress_percentage =
      greatest(
        organizer_section.progress_percentage,
        case
          when required_fields_complete
          then 50
          else 25
        end
      ),

    started_at =
      coalesce(
        organizer_section.started_at,
        current_saved_at
      ),

    completed_at =
      null,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'income';

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'income'
        ::public.tax_organizer_section_key,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    income_source.id,

    income_source.organizer_id,

    income_source.income_type,

    income_source.payer_name,

    income_source.recipient_type,

    income_source.record_status,

    income_source.document_received,

    income_source.notes,

    income_source.display_order,

    income_source.created_at,

    income_source.updated_at,

    w2.employer_identification_number,

    w2.wages,

    w2.federal_income_tax_withheld,

    w2.social_security_wages,

    w2.social_security_tax_withheld,

    w2.medicare_wages,

    w2.medicare_tax_withheld,

    w2.state_code,

    w2.state_wages,

    w2.state_income_tax_withheld,

    w2.local_wages,

    w2.local_income_tax_withheld,

    w2.created_at,

    w2.updated_at

  from public.client_tax_organizer_income_sources
    as income_source

  join public.client_tax_organizer_income_w2_details
    as w2
    on w2.income_source_id =
      income_source.id

  where income_source.id =
    requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;
end;
$_$;


ALTER FUNCTION "public"."save_client_organizer_income_w2_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_employer_identification_number" "text", "requested_wages" numeric, "requested_federal_income_tax_withheld" numeric, "requested_social_security_wages" numeric, "requested_social_security_tax_withheld" numeric, "requested_medicare_wages" numeric, "requested_medicare_tax_withheld" numeric, "requested_state_code" "text", "requested_state_wages" numeric, "requested_state_income_tax_withheld" numeric, "requested_local_wages" numeric, "requested_local_income_tax_withheld" numeric, "requested_document_received" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."save_client_organizer_income_w2_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_employer_identification_number" "text", "requested_wages" numeric, "requested_federal_income_tax_withheld" numeric, "requested_social_security_wages" numeric, "requested_social_security_tax_withheld" numeric, "requested_medicare_wages" numeric, "requested_medicare_tax_withheld" numeric, "requested_state_code" "text", "requested_state_wages" numeric, "requested_state_income_tax_withheld" numeric, "requested_local_wages" numeric, "requested_local_income_tax_withheld" numeric, "requested_document_received" boolean) IS 'Creates or updates non-sensitive W-2 detail values for an organizer income source owned by the authenticated client.';



CREATE OR REPLACE FUNCTION "public"."save_client_organizer_personal_information"("requested_organizer_id" "uuid", "requested_legal_first_name" "text", "requested_legal_middle_name" "text", "requested_legal_last_name" "text", "requested_preferred_name" "text", "requested_birth_date" "date", "requested_filing_status" "text", "requested_occupation" "text", "requested_email" "text", "requested_mobile_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_address_changed_this_year" boolean, "requested_marital_status_changed_this_year" boolean, "requested_employer_changed_this_year" boolean) RETURNS TABLE("organizer_id" "uuid", "section_status" "public"."tax_organizer_section_status", "section_progress_percentage" integer, "organizer_progress_percentage" integer, "last_saved_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$declare
  current_user_id uuid;
  current_client_id uuid;
  organizer_record public.client_tax_organizers;
  required_fields_complete boolean;
  completed_section_count integer;
  total_section_count integer;
  calculated_organizer_progress integer;
  saved_at timestamptz;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  select
    profile.client_id
  into
    current_client_id
  from public.client_portal_profiles as profile
  where profile.auth_user_id =
      current_user_id
    and profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    organizer.*
  into
    organizer_record
  from public.client_tax_organizers as organizer
  where organizer.id =
      requested_organizer_id
    and organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  saved_at := now();

  insert into public.client_tax_organizer_personal_information (
    organizer_id,
    legal_first_name,
    legal_middle_name,
    legal_last_name,
    preferred_name,
    birth_date,
    filing_status,
    occupation,
    email,
    mobile_phone,
    alternate_phone,
    address_line_1,
    address_line_2,
    city,
    state,
    postal_code,
    address_changed_this_year,
    marital_status_changed_this_year,
    employer_changed_this_year
  )
  values (
    requested_organizer_id,
    nullif(trim(requested_legal_first_name), ''),
    nullif(trim(requested_legal_middle_name), ''),
    nullif(trim(requested_legal_last_name), ''),
    nullif(trim(requested_preferred_name), ''),
    requested_birth_date,
    nullif(trim(requested_filing_status), ''),
    nullif(trim(requested_occupation), ''),
    nullif(lower(trim(requested_email)), ''),
    nullif(trim(requested_mobile_phone), ''),
    nullif(trim(requested_alternate_phone), ''),
    nullif(trim(requested_address_line_1), ''),
    nullif(trim(requested_address_line_2), ''),
    nullif(trim(requested_city), ''),
    nullif(upper(trim(requested_state)), ''),
    nullif(trim(requested_postal_code), ''),
    requested_address_changed_this_year,
    requested_marital_status_changed_this_year,
    requested_employer_changed_this_year
  )
  on conflict on constraint
    client_tax_organizer_personal_information_pkey
  do update
  set
    legal_first_name =
      excluded.legal_first_name,
    legal_middle_name =
      excluded.legal_middle_name,
    legal_last_name =
      excluded.legal_last_name,
    preferred_name =
      excluded.preferred_name,
    birth_date =
      excluded.birth_date,
    filing_status =
      excluded.filing_status,
    occupation =
      excluded.occupation,
    email =
      excluded.email,
    mobile_phone =
      excluded.mobile_phone,
    alternate_phone =
      excluded.alternate_phone,
    address_line_1 =
      excluded.address_line_1,
    address_line_2 =
      excluded.address_line_2,
    city =
      excluded.city,
    state =
      excluded.state,
    postal_code =
      excluded.postal_code,
    address_changed_this_year =
      excluded.address_changed_this_year,
    marital_status_changed_this_year =
      excluded.marital_status_changed_this_year,
    employer_changed_this_year =
      excluded.employer_changed_this_year,
    updated_at =
      saved_at;

  required_fields_complete :=
    nullif(trim(requested_legal_first_name), '') is not null
    and nullif(trim(requested_legal_last_name), '') is not null
    and requested_birth_date is not null
    and nullif(trim(requested_filing_status), '') is not null
    and nullif(trim(requested_occupation), '') is not null
    and nullif(trim(requested_email), '') is not null
    and nullif(trim(requested_mobile_phone), '') is not null
    and nullif(trim(requested_address_line_1), '') is not null
    and nullif(trim(requested_city), '') is not null
    and nullif(trim(requested_state), '') is not null
    and nullif(trim(requested_postal_code), '') is not null
    and requested_address_changed_this_year is not null
    and requested_marital_status_changed_this_year is not null
    and requested_employer_changed_this_year is not null;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      case
        when required_fields_complete
        then 'completed'
          ::public.tax_organizer_section_status
        else 'in_progress'
          ::public.tax_organizer_section_status
      end,

    progress_percentage =
      case
        when required_fields_complete
        then 100
        else 50
      end,

    started_at =
      coalesce(
        organizer_section.started_at,
        saved_at
      ),

    completed_at =
      case
        when required_fields_complete
        then coalesce(
          organizer_section.completed_at,
          saved_at
        )
        else null
      end,

    last_saved_at =
      saved_at,

    updated_at =
      saved_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'personal';

  select
    count(*) filter (
      where organizer_section.status =
        'completed'
    ),
    count(*)
  into
    completed_section_count,
    total_section_count
  from public.client_tax_organizer_sections
    as organizer_section
  where organizer_section.organizer_id =
    requested_organizer_id;

  calculated_organizer_progress :=
    case
      when total_section_count = 0
      then 0
      else round(
        (
          completed_section_count::numeric /
          total_section_count::numeric
        ) * 100
      )::integer
    end;

  update public.client_tax_organizers
    as organizer
  set
    status =
      case
        when organizer.status =
          'not_started'
        then 'in_progress'
          ::public.tax_organizer_status
        else organizer.status
      end,

    current_section =
      case
        when required_fields_complete
        then 'identity'
          ::public.tax_organizer_section_key
        else 'personal'
          ::public.tax_organizer_section_key
      end,

    progress_percentage =
      calculated_organizer_progress,

    started_at =
      coalesce(
        organizer.started_at,
        saved_at
      ),

    last_saved_at =
      saved_at,

    updated_at =
      saved_at
  where organizer.id =
    requested_organizer_id;

  return query
  select
    requested_organizer_id,
    case
      when required_fields_complete
      then 'completed'
        ::public.tax_organizer_section_status
      else 'in_progress'
        ::public.tax_organizer_section_status
    end,
    case
      when required_fields_complete
      then 100
      else 50
    end,
    calculated_organizer_progress,
    saved_at;
end;$$;


ALTER FUNCTION "public"."save_client_organizer_personal_information"("requested_organizer_id" "uuid", "requested_legal_first_name" "text", "requested_legal_middle_name" "text", "requested_legal_last_name" "text", "requested_preferred_name" "text", "requested_birth_date" "date", "requested_filing_status" "text", "requested_occupation" "text", "requested_email" "text", "requested_mobile_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_address_changed_this_year" boolean, "requested_marital_status_changed_this_year" boolean, "requested_employer_changed_this_year" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_dependent_review_notes"("requested_dependent_id" "uuid", "requested_internal_notes" "text") RETURNS TABLE("review_id" "uuid", "dependent_id" "uuid", "review_status" "text", "internal_notes" "text", "reviewed_by" "uuid", "reviewed_by_name" "text", "reviewed_at" timestamp with time zone, "follow_up_requested_at" timestamp with time zone, "returned_to_client_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  d public.client_tax_organizer_dependents;
  r public.client_tax_organizer_dependent_reviews;
  notes text := trim(coalesce(requested_internal_notes,''));
begin
  if uid is null then raise exception 'Authentication is required.'; end if;
  if not public.current_user_is_active() then raise exception 'An active staff account is required.'; end if;
  if not public.current_user_can_manage_records() then raise exception 'You do not have permission to manage dependent reviews.'; end if;
  if requested_dependent_id is null then raise exception 'A dependent identifier is required.'; end if;
  if char_length(notes) > 10000 then raise exception 'The internal note cannot exceed 10,000 characters.'; end if;
  select x.* into d from public.client_tax_organizer_dependents x where x.id=requested_dependent_id;
  if not found then raise exception 'The selected dependent was not found.'; end if;

  insert into public.client_tax_organizer_dependent_reviews
    (dependent_id,internal_notes,created_by,updated_by)
  values (d.id,notes,uid,uid)
  on conflict (dependent_id) do update set internal_notes=notes,updated_by=uid
  returning * into r;

  insert into public.audit_logs(actor_id,action,entity_type,entity_id,new_values,metadata)
  values(uid,'dependent_review_notes_saved','client_tax_organizer_dependent_review',r.id,
    jsonb_build_object('dependent_id',r.dependent_id,'internal_notes',r.internal_notes),
    jsonb_build_object('organizer_id',d.organizer_id));

  return query select r.id,r.dependent_id,r.review_status,r.internal_notes,r.reviewed_by,
    case when r.reviewed_by is null then null else coalesce(nullif(trim(p.display_name),''),
      nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),p.email) end,
    r.reviewed_at,r.follow_up_requested_at,r.returned_to_client_at,r.updated_at
  from (select 1) x left join public.profiles p on p.id=r.reviewed_by;
end;
$$;


ALTER FUNCTION "public"."save_dependent_review_notes"("requested_dependent_id" "uuid", "requested_internal_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_income_review_notes"("requested_income_source_id" "uuid", "requested_internal_notes" "text") RETURNS TABLE("review_id" "uuid", "income_source_id" "uuid", "review_status" "text", "internal_notes" "text", "reviewed_by" "uuid", "reviewed_by_name" "text", "reviewed_at" timestamp with time zone, "follow_up_requested_at" timestamp with time zone, "returned_to_client_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
$$;


ALTER FUNCTION "public"."save_income_review_notes"("requested_income_source_id" "uuid", "requested_internal_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_clients"("requested_search" "text" DEFAULT NULL::"text", "requested_status" "public"."client_status" DEFAULT NULL::"public"."client_status", "requested_limit" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "client_number" bigint, "first_name" "text", "middle_name" "text", "last_name" "text", "preferred_name" "text", "email" "text", "phone" "text", "city" "text", "state" "text", "status" "public"."client_status", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$declare
  safe_limit integer;
  normalized_search text;
  normalized_phone_search text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  safe_limit := least(
    greatest(
      coalesce(requested_limit, 50),
      1
    ),
    100
  );

  normalized_search :=
    nullif(
      lower(trim(requested_search)),
      ''
    );

  normalized_phone_search :=
    nullif(
      regexp_replace(
        coalesce(requested_search, ''),
        '[^0-9]',
        '',
        'g'
      ),
      ''
    );

  return query
  select
    client.id,
    client.client_number,
    client.first_name,
    client.middle_name,
    client.last_name,
    client.preferred_name,
    client.email,
    client.phone,
    client.city,
    client.state,
    client.status,
    client.created_at,
    client.updated_at
  from public.clients as client
  where
    (
      requested_status is null
      or client.status = requested_status
    )
    and
    (
      normalized_search is null

      or lower(client.first_name)
        like '%' || normalized_search || '%'

      or lower(client.last_name)
        like '%' || normalized_search || '%'

      or lower(
        coalesce(
          client.preferred_name,
          ''
        )
      ) like '%' || normalized_search || '%'

      or lower(
        coalesce(
          client.email,
          ''
        )
      ) like '%' || normalized_search || '%'

      or (
        normalized_phone_search is not null
        and regexp_replace(
          coalesce(client.phone, ''),
          '[^0-9]',
          '',
          'g'
        ) like
          '%' || normalized_phone_search || '%'
      )

      or client.client_number::text
        like '%' || normalized_search || '%'
    )
  order by
    client.last_name,
    client.first_name,
    client.client_number
  limit safe_limit;
end;$$;


ALTER FUNCTION "public"."search_clients"("requested_search" "text", "requested_status" "public"."client_status", "requested_limit" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."search_clients"("requested_search" "text", "requested_status" "public"."client_status", "requested_limit" integer) IS 'Returns a limited searchable client list for active staff.';



CREATE OR REPLACE FUNCTION "public"."search_tax_returns"("requested_search" "text" DEFAULT NULL::"text", "requested_status" "public"."return_status" DEFAULT NULL::"public"."return_status", "requested_tax_year" integer DEFAULT NULL::integer, "requested_preparer_id" "uuid" DEFAULT NULL::"uuid", "requested_limit" integer DEFAULT 100) RETURNS TABLE("id" "uuid", "client_id" "uuid", "client_number" bigint, "client_first_name" "text", "client_last_name" "text", "tax_year" integer, "return_type" "public"."return_type", "tax_form" "public"."tax_form_type", "filing_status" "public"."filing_status", "status" "public"."return_status", "assigned_preparer_id" "uuid", "assigned_preparer_name" "text", "assigned_reviewer_id" "uuid", "assigned_reviewer_name" "text", "date_received" "date", "due_date" "date", "filed_date" "date", "accepted_date" "date", "preparation_fee" numeric, "discount_amount" numeric, "net_fee" numeric, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  safe_limit integer;
  normalized_search text;
  normalized_phone_search text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_is_active() then
    raise exception 'An active staff account is required.';
  end if;

  safe_limit := least(greatest(coalesce(requested_limit, 100), 1), 250);
  normalized_search := nullif(lower(trim(requested_search)), '');
  normalized_phone_search := nullif(regexp_replace(coalesce(requested_search, ''), '[^0-9]', '', 'g'), '');

  return query
  select
    tax_return.id,
    tax_return.client_id,
    client.client_number,
    client.first_name,
    client.last_name,
    tax_return.tax_year,
    tax_return.return_type,
    tax_return.tax_form,
    tax_return.filing_status,
    tax_return.status,
    tax_return.assigned_preparer_id,
    coalesce(
      nullif(preparer.display_name, ''),
      nullif(concat_ws(' ', preparer.first_name, preparer.last_name), ''),
      preparer.email
    ) as assigned_preparer_name,
    tax_return.assigned_reviewer_id,
    coalesce(
      nullif(reviewer.display_name, ''),
      nullif(concat_ws(' ', reviewer.first_name, reviewer.last_name), ''),
      reviewer.email
    ) as assigned_reviewer_name,
    tax_return.date_received,
    tax_return.due_date,
    tax_return.filed_date,
    tax_return.accepted_date,
    tax_return.preparation_fee,
    tax_return.discount_amount,
    (tax_return.preparation_fee - tax_return.discount_amount)::numeric as net_fee,
    tax_return.created_at,
    tax_return.updated_at
  from public.tax_returns as tax_return
  join public.clients as client on client.id = tax_return.client_id
  left join public.profiles as preparer on preparer.id = tax_return.assigned_preparer_id
  left join public.profiles as reviewer on reviewer.id = tax_return.assigned_reviewer_id
  where (requested_status is null or tax_return.status = requested_status)
    and (requested_tax_year is null or tax_return.tax_year = requested_tax_year)
    and (requested_preparer_id is null or tax_return.assigned_preparer_id = requested_preparer_id)
    and (
      normalized_search is null
      or lower(client.first_name) like '%' || normalized_search || '%'
      or lower(client.last_name) like '%' || normalized_search || '%'
      or lower(concat_ws(' ', client.first_name, client.last_name)) like '%' || normalized_search || '%'
      or client.client_number::text like '%' || normalized_search || '%'
      or lower(coalesce(client.email, '')) like '%' || normalized_search || '%'
      or (
        normalized_phone_search is not null
        and regexp_replace(coalesce(client.phone, ''), '[^0-9]', '', 'g')
          like '%' || normalized_phone_search || '%'
      )
      or tax_return.tax_year::text like '%' || normalized_search || '%'
      or lower(tax_return.tax_form::text) like '%' || normalized_search || '%'
    )
  order by
    tax_return.tax_year desc,
    client.last_name,
    client.first_name,
    tax_return.created_at desc
  limit safe_limit;
end;
$$;


ALTER FUNCTION "public"."search_tax_returns"("requested_search" "text", "requested_status" "public"."return_status", "requested_tax_year" integer, "requested_preparer_id" "uuid", "requested_limit" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."search_tax_returns"("requested_search" "text", "requested_status" "public"."return_status", "requested_tax_year" integer, "requested_preparer_id" "uuid", "requested_limit" integer) IS 'Searches tax returns by workflow filters and client name, number, email, or phone.';



CREATE OR REPLACE FUNCTION "public"."set_client_organizer_business_activity"("requested_organizer_id" "uuid", "requested_has_business_activity" boolean) RETURNS TABLE("organizer_id" "uuid", "has_business_activity" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$declare
  saved_response public.client_tax_organizer_business_responses;
  saved_at timestamptz := timezone('utc', now());
begin
  perform public.require_client_business_organizer_access(
    requested_organizer_id, true
  );

  if requested_has_business_activity is null then
    raise exception
      'Select whether you had business or self-employment activity.';
  end if;

  insert into public.client_tax_organizer_business_responses (
    organizer_id,
    has_business_activity,
    created_at,
    updated_at
  )
  values (
    requested_organizer_id,
    requested_has_business_activity,
    saved_at,
    saved_at
  )
  ON CONFLICT ON CONSTRAINT client_tax_organizer_business_responses_pkey
  DO UPDATE SET
    has_business_activity = excluded.has_business_activity,
    updated_at = saved_at
  returning * into saved_response;

  perform public.refresh_client_business_organizer_progress(
    requested_organizer_id
  );

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id, new_values, metadata
  )
  values (
    auth.uid(),
    'client_business_activity_answered',
    'client_tax_organizer',
    requested_organizer_id,
    jsonb_build_object(
      'has_business_activity',
      saved_response.has_business_activity
    ),
    jsonb_build_object('section_key', 'business')
  );

  return query
  select
    saved_response.organizer_id,
    saved_response.has_business_activity,
    saved_response.created_at,
    saved_response.updated_at;
end;$$;


ALTER FUNCTION "public"."set_client_organizer_business_activity"("requested_organizer_id" "uuid", "requested_has_business_activity" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_client_portal_profile_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.email := lower(trim(new.email));
  new.updated_at := timezone('utc', now());

  return new;
end;
$$;


ALTER FUNCTION "public"."set_client_portal_profile_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_organizer_review_checklist_item"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_item_id" "uuid", "requested_is_completed" boolean) RETURNS TABLE("item_id" "uuid", "is_completed" boolean, "completed_by" "uuid", "completed_by_name" "text", "completed_at" timestamp with time zone, "completed_items" integer, "required_items" integer, "total_items" integer, "completion_percentage" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
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
$$;


ALTER FUNCTION "public"."set_organizer_review_checklist_item"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_item_id" "uuid", "requested_is_completed" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_required_document_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_required_document_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_tax_return_workflow_timestamps"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$ begin if new.workflow_status is distinct
from old.workflow_status then new.workflow_status_changed_at = now();
if new.workflow_status = 'on_hold' then new.workflow_held_at = now();
elsif old.workflow_status = 'on_hold' then new.workflow_held_at = null;
new.workflow_hold_reason = null;
end if;
if new.workflow_status = 'completed' then new.workflow_completed_at = now();
elsif old.workflow_status = 'completed' then new.workflow_completed_at = null;
end if;
end if;
if new.assigned_preparer_id is distinct
from old.assigned_preparer_id then if new.assigned_preparer_id is null then new.assigned_at = null;
else new.assigned_at = now();
end if;
end if;
return new;
end;
$$;


ALTER FUNCTION "public"."set_tax_return_workflow_timestamps"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
begin
  new.updated_at := statement_timestamp();

  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."set_updated_at"() IS 'Sets updated_at to the current statement timestamp before a row update.';



CREATE OR REPLACE FUNCTION "public"."store_vault_secret"("requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_secret_type" "text", "requested_encrypted_value" "bytea", "requested_initialization_vector" "bytea", "requested_authentication_tag" "bytea", "requested_key_version" integer, "requested_masked_value" "text", "requested_actor_user_id" "uuid") RETURNS TABLE("vault_secret_id" "uuid", "masked_value" "text", "key_version" integer, "status" "text", "updated_at" timestamp with time zone, "replaced_existing_secret" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  saved_at timestamptz;
  existing_secret_id uuid;
  new_secret_id uuid;
  replaced_existing boolean;
begin
  if requested_client_id is null then
    raise exception
      'A client identifier is required.';
  end if;

  if requested_secret_type is null
    or length(
      trim(requested_secret_type)
    ) = 0
  then
    raise exception
      'A vault secret type is required.';
  end if;

  if requested_encrypted_value is null
    or octet_length(
      requested_encrypted_value
    ) = 0
  then
    raise exception
      'An encrypted value is required.';
  end if;

  if requested_initialization_vector is null
    or octet_length(
      requested_initialization_vector
    ) = 0
  then
    raise exception
      'An initialization vector is required.';
  end if;

  if requested_authentication_tag is null
    or octet_length(
      requested_authentication_tag
    ) = 0
  then
    raise exception
      'An authentication tag is required.';
  end if;

  if requested_key_version is null then
    raise exception
      'A vault key version is required.';
  end if;

  if requested_masked_value is null
    or length(
      trim(requested_masked_value)
    ) = 0
  then
    raise exception
      'A masked value is required.';
  end if;

  if not exists (
    select 1
    from public.clients as client
    where client.id =
      requested_client_id
  ) then
    raise exception
      'The requested client was not found.';
  end if;

  if requested_organizer_id is not null
    and not exists (
      select 1
      from public.client_tax_organizers
        as organizer
      where organizer.id =
          requested_organizer_id
        and organizer.client_id =
          requested_client_id
    )
  then
    raise exception
      'The requested organizer does not belong to the client.';
  end if;

  if not exists (
    select 1
    from public.vault_key_versions
      as vault_key
    where vault_key.key_version =
        requested_key_version
      and vault_key.active = true
      and vault_key.retired_at is null
  ) then
    raise exception
      'The requested vault key version is not active.';
  end if;

  saved_at :=
    now();

  -- Lock an existing current record so simultaneous requests
  -- cannot replace the same secret independently.

  select
    vault_secret.id
  into
    existing_secret_id
  from public.vault_secrets
    as vault_secret
  where vault_secret.client_id =
      requested_client_id
    and vault_secret.organizer_id
      is not distinct from
      requested_organizer_id
    and vault_secret.secret_type =
      requested_secret_type
    and vault_secret.archived_at
      is null
  for update;

  replaced_existing :=
    existing_secret_id is not null;

  if replaced_existing then
    update public.vault_secrets
    set
      status =
        'replaced',

      archived_at =
        saved_at,

      archived_by =
        requested_actor_user_id,

      archive_reason =
        'Replaced by a newer encrypted value.',

      updated_by =
        requested_actor_user_id,

      updated_at =
        saved_at
    where id =
      existing_secret_id;
  end if;

  insert into public.vault_secrets (
    client_id,
    organizer_id,
    secret_type,
    encrypted_value,
    initialization_vector,
    authentication_tag,
    key_version,
    masked_value,
    status,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  values (
    requested_client_id,
    requested_organizer_id,
    trim(
      requested_secret_type
    ),
    requested_encrypted_value,
    requested_initialization_vector,
    requested_authentication_tag,
    requested_key_version,
    trim(
      requested_masked_value
    ),
    'pending_verification',
    requested_actor_user_id,
    requested_actor_user_id,
    saved_at,
    saved_at
  )
  returning id
  into new_secret_id;

  return query
  select
    new_secret_id,
    trim(
      requested_masked_value
    ),
    requested_key_version,
    'pending_verification'::text,
    saved_at,
    replaced_existing;
end;
$$;


ALTER FUNCTION "public"."store_vault_secret"("requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_secret_type" "text", "requested_encrypted_value" "bytea", "requested_initialization_vector" "bytea", "requested_authentication_tag" "bytea", "requested_key_version" integer, "requested_masked_value" "text", "requested_actor_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."store_vault_secret"("requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_secret_type" "text", "requested_encrypted_value" "bytea", "requested_initialization_vector" "bytea", "requested_authentication_tag" "bytea", "requested_key_version" integer, "requested_masked_value" "text", "requested_actor_user_id" "uuid") IS 'Atomically archives an existing active vault secret and stores its encrypted replacement. This function accepts encrypted bytes only and must never receive plaintext secret data.';



CREATE OR REPLACE FUNCTION "public"."store_vault_secret_v2"("requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_secret_type" "text", "requested_encrypted_value" "bytea", "requested_initialization_vector" "bytea", "requested_authentication_tag" "bytea", "requested_key_version" integer, "requested_masked_value" "text", "requested_actor_user_id" "uuid") RETURNS TABLE("vault_secret_id" "uuid", "masked_value" "text", "key_version" integer, "status" "text", "updated_at" timestamp with time zone, "replaced_existing_secret" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_saved_at timestamptz;
  existing_secret_id uuid;
  new_secret_id uuid;
  replaced_existing boolean;
begin
  if requested_client_id is null then
    raise exception
      'A client identifier is required.';
  end if;

  if requested_secret_type is null
    or length(
      trim(
        requested_secret_type
      )
    ) = 0
  then
    raise exception
      'A vault secret type is required.';
  end if;

  if requested_encrypted_value is null
    or octet_length(
      requested_encrypted_value
    ) = 0
  then
    raise exception
      'An encrypted value is required.';
  end if;

  if requested_initialization_vector is null
    or octet_length(
      requested_initialization_vector
    ) = 0
  then
    raise exception
      'An initialization vector is required.';
  end if;

  if requested_authentication_tag is null
    or octet_length(
      requested_authentication_tag
    ) = 0
  then
    raise exception
      'An authentication tag is required.';
  end if;

  if requested_key_version is null then
    raise exception
      'A vault key version is required.';
  end if;

  if requested_masked_value is null
    or length(
      trim(
        requested_masked_value
      )
    ) = 0
  then
    raise exception
      'A masked value is required.';
  end if;

  if not exists (
    select 1
    from public.clients
      as client_record
    where client_record.id =
      requested_client_id
  ) then
    raise exception
      'The requested client was not found.';
  end if;

  if requested_organizer_id is not null
    and not exists (
      select 1
      from public.client_tax_organizers
        as organizer_record
      where organizer_record.id =
          requested_organizer_id
        and organizer_record.client_id =
          requested_client_id
    )
  then
    raise exception
      'The requested organizer does not belong to the client.';
  end if;

  if requested_dependent_id is not null
    and not exists (
      select 1
      from public.client_tax_organizer_dependents
        as dependent_record
      join public.client_tax_organizers
        as organizer_record
        on organizer_record.id =
          dependent_record.organizer_id
      where dependent_record.id =
          requested_dependent_id
        and dependent_record.organizer_id =
          requested_organizer_id
        and organizer_record.client_id =
          requested_client_id
    )
  then
    raise exception
      'The requested dependent does not belong to the organizer.';
  end if;

  if requested_secret_type =
      'dependent_social_security_number'
    and requested_dependent_id is null
  then
    raise exception
      'A dependent identifier is required for a dependent Social Security number.';
  end if;

  if requested_dependent_id is not null
    and requested_secret_type <>
      'dependent_social_security_number'
  then
    raise exception
      'The requested secret type is not supported for a dependent.';
  end if;

  if not exists (
    select 1
    from public.vault_key_versions
      as key_record
    where key_record.key_version =
        requested_key_version
      and key_record.active = true
      and key_record.retired_at is null
  ) then
    raise exception
      'The requested vault key version is not active.';
  end if;

  current_saved_at :=
    now();

  select
    secret_record.id
  into
    existing_secret_id
  from public.vault_secrets
    as secret_record
  where secret_record.client_id =
      requested_client_id
    and secret_record.organizer_id
      is not distinct from
      requested_organizer_id
    and secret_record.dependent_id
      is not distinct from
      requested_dependent_id
    and secret_record.secret_type =
      requested_secret_type
    and secret_record.archived_at
      is null
  for update;

  replaced_existing :=
    existing_secret_id is not null;

  if replaced_existing then
    update public.vault_secrets
    set
      status =
        'replaced',

      archived_at =
        current_saved_at,

      archived_by =
        requested_actor_user_id,

      archive_reason =
        'Replaced by a newer encrypted value.',

      updated_by =
        requested_actor_user_id,

      updated_at =
        current_saved_at
    where id =
      existing_secret_id;
  end if;

  insert into public.vault_secrets (
    client_id,
    organizer_id,
    dependent_id,
    secret_type,
    encrypted_value,
    initialization_vector,
    authentication_tag,
    key_version,
    masked_value,
    status,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  values (
    requested_client_id,
    requested_organizer_id,
    requested_dependent_id,
    trim(
      requested_secret_type
    ),
    requested_encrypted_value,
    requested_initialization_vector,
    requested_authentication_tag,
    requested_key_version,
    trim(
      requested_masked_value
    ),
    'pending_verification',
    requested_actor_user_id,
    requested_actor_user_id,
    current_saved_at,
    current_saved_at
  )
  returning id
  into new_secret_id;

  return query
  select
    new_secret_id,
    trim(
      requested_masked_value
    ),
    requested_key_version,
    'pending_verification'::text,
    current_saved_at,
    replaced_existing;
end;
$$;


ALTER FUNCTION "public"."store_vault_secret_v2"("requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_secret_type" "text", "requested_encrypted_value" "bytea", "requested_initialization_vector" "bytea", "requested_authentication_tag" "bytea", "requested_key_version" integer, "requested_masked_value" "text", "requested_actor_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."store_vault_secret_v2"("requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_secret_type" "text", "requested_encrypted_value" "bytea", "requested_initialization_vector" "bytea", "requested_authentication_tag" "bytea", "requested_key_version" integer, "requested_masked_value" "text", "requested_actor_user_id" "uuid") IS 'Atomically stores or replaces an encrypted client-, organizer-, or dependent-level Secure Vault secret. Plaintext must never be passed to this function.';



CREATE OR REPLACE FUNCTION "public"."toggle_client_document_favorite"("requested_document_id" "uuid") RETURNS SETOF "public"."client_documents"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  previous_document public.client_documents;
  updated_document public.client_documents;
  audit_action text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.current_user_can_manage_records() then
    raise exception 'You are not authorized to update client documents.';
  end if;

  select *
  into previous_document
  from public.client_documents
  where id = requested_document_id
    and archived_at is null;

  if not found then
    raise exception 'The document could not be found.';
  end if;

  update public.client_documents
  set
    is_favorite = not previous_document.is_favorite,
    updated_at = timezone('utc', now())
  where id = requested_document_id
  returning *
  into updated_document;

  audit_action :=
    case
      when updated_document.is_favorite
        then 'document_favorited'
      else 'document_unfavorited'
    end;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata
  )
  values (
    auth.uid(),
    audit_action,
    'document',
    updated_document.id,
    jsonb_build_object(
      'is_favorite',
      previous_document.is_favorite
    ),
    jsonb_build_object(
      'is_favorite',
      updated_document.is_favorite
    ),
    jsonb_build_object(
      'client_id',
      updated_document.client_id,
      'tax_return_id',
      updated_document.tax_return_id,
      'original_file_name',
      updated_document.original_file_name
    )
  );

  return next updated_document;
end;
$$;


ALTER FUNCTION "public"."toggle_client_document_favorite"("requested_document_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."touch_platform_record"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
begin
  new.updated_at := statement_timestamp();
  new.row_version := coalesce(old.row_version, 0) + 1;

  return new;
end;
$$;


ALTER FUNCTION "public"."touch_platform_record"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."touch_platform_record"() IS 'Updates updated_at and increments row_version before a row update.';



CREATE OR REPLACE FUNCTION "public"."update_client_organizer_business"("requested_organizer_id" "uuid", "requested_business_id" "uuid", "requested_business" "jsonb") RETURNS SETOF "public"."client_tax_organizer_businesses"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  old_business public.client_tax_organizer_businesses;
  saved_business public.client_tax_organizer_businesses;
  saved_at timestamptz := timezone('utc', now());
begin
  perform public.require_client_business_organizer_access(
    requested_organizer_id, true
  );

  select business.*
  into old_business
  from public.client_tax_organizer_businesses as business
  where business.id = requested_business_id
    and business.organizer_id = requested_organizer_id;

  if not found then
    raise exception 'The requested business record was not found.';
  end if;

  -- Reuse create-style validation by validating the required keys here.
  if trim(coalesce(requested_business->>'business_name', '')) = ''
    and trim(coalesce(requested_business->>'dba_name', '')) = ''
  then
    raise exception 'Enter a business name or DBA.';
  end if;
  if trim(coalesce(requested_business->>'entity_type', '')) = '' then
    raise exception 'Select a business entity type.';
  end if;
  if trim(coalesce(
    requested_business->>'principal_business_activity', ''
  )) = '' then
    raise exception 'Enter the principal business activity.';
  end if;
  if not (requested_business ? 'was_active_during_tax_year') then
    raise exception
      'Confirm whether the business was active during the tax year.';
  end if;

  update public.client_tax_organizer_businesses as business
  set
    business_name = trim(coalesce(requested_business->>'business_name', '')),
    dba_name = trim(coalesce(requested_business->>'dba_name', '')),
    entity_type = trim(coalesce(requested_business->>'entity_type', '')),
    employer_identification_number = trim(coalesce(
      requested_business->>'employer_identification_number', ''
    )),
    principal_business_activity = trim(coalesce(
      requested_business->>'principal_business_activity', ''
    )),
    business_code = trim(coalesce(requested_business->>'business_code', '')),
    address_line_1 = trim(coalesce(requested_business->>'address_line_1', '')),
    address_line_2 = trim(coalesce(requested_business->>'address_line_2', '')),
    city = trim(coalesce(requested_business->>'city', '')),
    state = upper(trim(coalesce(requested_business->>'state', ''))),
    postal_code = trim(coalesce(requested_business->>'postal_code', '')),
    country = trim(coalesce(
      nullif(requested_business->>'country', ''), 'United States'
    )),
    date_started = nullif(requested_business->>'date_started', '')::date,
    date_closed = nullif(requested_business->>'date_closed', '')::date,
    ownership_percentage =
      nullif(requested_business->>'ownership_percentage', '')::numeric,
    accounting_method =
      trim(coalesce(requested_business->>'accounting_method', '')),
    was_active_during_tax_year =
      (requested_business->>'was_active_during_tax_year')::boolean,
    has_home_office = (requested_business->>'has_home_office')::boolean,
    has_employees = (requested_business->>'has_employees')::boolean,
    has_inventory = (requested_business->>'has_inventory')::boolean,
    uses_vehicle = (requested_business->>'uses_vehicle')::boolean,
    bookkeeping_complete =
      (requested_business->>'bookkeeping_complete')::boolean,
    gross_receipts = coalesce((requested_business->>'gross_receipts')::numeric, 0),
    returns_and_allowances =
      coalesce((requested_business->>'returns_and_allowances')::numeric, 0),
    other_business_income =
      coalesce((requested_business->>'other_business_income')::numeric, 0),
    cost_of_goods_sold =
      coalesce((requested_business->>'cost_of_goods_sold')::numeric, 0),
    advertising_expense =
      coalesce((requested_business->>'advertising_expense')::numeric, 0),
    car_and_truck_expense =
      coalesce((requested_business->>'car_and_truck_expense')::numeric, 0),
    commissions_and_fees_expense =
      coalesce((requested_business->>'commissions_and_fees_expense')::numeric, 0),
    contract_labor_expense =
      coalesce((requested_business->>'contract_labor_expense')::numeric, 0),
    depreciation_expense =
      coalesce((requested_business->>'depreciation_expense')::numeric, 0),
    employee_benefit_expense =
      coalesce((requested_business->>'employee_benefit_expense')::numeric, 0),
    insurance_expense =
      coalesce((requested_business->>'insurance_expense')::numeric, 0),
    interest_expense =
      coalesce((requested_business->>'interest_expense')::numeric, 0),
    legal_and_professional_expense =
      coalesce((requested_business->>'legal_and_professional_expense')::numeric, 0),
    office_expense =
      coalesce((requested_business->>'office_expense')::numeric, 0),
    pension_and_profit_sharing_expense =
      coalesce((requested_business->>'pension_and_profit_sharing_expense')::numeric, 0),
    rent_or_lease_expense =
      coalesce((requested_business->>'rent_or_lease_expense')::numeric, 0),
    repairs_and_maintenance_expense =
      coalesce((requested_business->>'repairs_and_maintenance_expense')::numeric, 0),
    supplies_expense =
      coalesce((requested_business->>'supplies_expense')::numeric, 0),
    taxes_and_licenses_expense =
      coalesce((requested_business->>'taxes_and_licenses_expense')::numeric, 0),
    travel_expense =
      coalesce((requested_business->>'travel_expense')::numeric, 0),
    deductible_meals_expense =
      coalesce((requested_business->>'deductible_meals_expense')::numeric, 0),
    utilities_expense =
      coalesce((requested_business->>'utilities_expense')::numeric, 0),
    wages_expense =
      coalesce((requested_business->>'wages_expense')::numeric, 0),
    other_expense =
      coalesce((requested_business->>'other_expense')::numeric, 0),
    other_expense_description = trim(coalesce(
      requested_business->>'other_expense_description', ''
    )),
    notes = trim(coalesce(requested_business->>'notes', '')),
    record_status = 'complete',
    updated_at = saved_at
  where business.id = requested_business_id
    and business.organizer_id = requested_organizer_id
  returning * into saved_business;

  perform public.refresh_client_business_organizer_progress(
    requested_organizer_id
  );

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id,
    old_values, new_values, metadata
  )
  values (
    auth.uid(),
    'client_business_updated',
    'client_tax_organizer_business',
    saved_business.id,
    to_jsonb(old_business),
    to_jsonb(saved_business),
    jsonb_build_object(
      'organizer_id', requested_organizer_id,
      'section_key', 'business'
    )
  );

  return next saved_business;
end;
$$;


ALTER FUNCTION "public"."update_client_organizer_business"("requested_organizer_id" "uuid", "requested_business_id" "uuid", "requested_business" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_suffix" "text", "requested_relationship" "text", "requested_birth_date" "date", "requested_is_full_time_student" boolean, "requested_is_permanently_disabled" boolean, "requested_lived_with_taxpayer_all_year" boolean, "requested_months_lived_with_taxpayer" smallint, "requested_us_citizen_or_resident" boolean, "requested_claimed_by_another_taxpayer" boolean) RETURNS TABLE("dependent_id" "uuid", "organizer_id" "uuid", "first_name" "text", "middle_name" "text", "last_name" "text", "suffix" "text", "relationship" "text", "birth_date" "date", "is_full_time_student" boolean, "is_permanently_disabled" boolean, "lived_with_taxpayer_all_year" boolean, "months_lived_with_taxpayer" smallint, "us_citizen_or_resident" boolean, "claimed_by_another_taxpayer" boolean, "display_order" integer, "section_status" "public"."tax_organizer_section_status", "section_progress_percentage" integer, "organizer_progress_percentage" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  dependent_record
    public.client_tax_organizer_dependents;

  completed_section_count integer;
  total_section_count integer;
  calculated_organizer_progress integer;

  current_saved_at timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_dependent_id is null then
    raise exception
      'A dependent identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  select
    existing_dependent.*
  into
    dependent_record
  from public.client_tax_organizer_dependents
    as existing_dependent
  where existing_dependent.id =
      requested_dependent_id
    and existing_dependent.organizer_id =
      requested_organizer_id
  for update;

  if not found then
    raise exception
      'The requested dependent was not found.';
  end if;

  if nullif(
    trim(
      requested_first_name
    ),
    ''
  ) is null then
    raise exception
      'The dependent first name is required.';
  end if;

  if nullif(
    trim(
      requested_last_name
    ),
    ''
  ) is null then
    raise exception
      'The dependent last name is required.';
  end if;

  if requested_relationship not in (
    'son',
    'daughter',
    'stepson',
    'stepdaughter',
    'foster_child',
    'brother',
    'sister',
    'stepbrother',
    'stepsister',
    'half_brother',
    'half_sister',
    'grandchild',
    'parent',
    'grandparent',
    'niece',
    'nephew',
    'other_relative',
    'non_relative'
  ) then
    raise exception
      'The selected dependent relationship is invalid.';
  end if;

  if requested_birth_date is null then
    raise exception
      'The dependent date of birth is required.';
  end if;

  if requested_birth_date >
      current_date then
    raise exception
      'The dependent date of birth cannot be in the future.';
  end if;

  if requested_months_lived_with_taxpayer
      is null
    or requested_months_lived_with_taxpayer
      not between 0 and 12
  then
    raise exception
      'Months lived with the taxpayer must be between 0 and 12.';
  end if;

  if (
    requested_lived_with_taxpayer_all_year = true
    and requested_months_lived_with_taxpayer <> 12
  ) then
    raise exception
      'A dependent who lived with the taxpayer all year must have 12 months recorded.';
  end if;

  if (
    requested_lived_with_taxpayer_all_year = false
    and requested_months_lived_with_taxpayer = 12
  ) then
    raise exception
      'Select lived all year when 12 months are recorded.';
  end if;

  current_saved_at :=
    now();

  update
    public.client_tax_organizer_dependents
      as updated_dependent
  set
    first_name =
      trim(
        requested_first_name
      ),

    middle_name =
      nullif(
        trim(
          requested_middle_name
        ),
        ''
      ),

    last_name =
      trim(
        requested_last_name
      ),

    suffix =
      nullif(
        trim(
          requested_suffix
        ),
        ''
      ),

    relationship =
      trim(
        requested_relationship
      ),

    birth_date =
      requested_birth_date,

    is_full_time_student =
      coalesce(
        requested_is_full_time_student,
        false
      ),

    is_permanently_disabled =
      coalesce(
        requested_is_permanently_disabled,
        false
      ),

    lived_with_taxpayer_all_year =
      coalesce(
        requested_lived_with_taxpayer_all_year,
        false
      ),

    months_lived_with_taxpayer =
      requested_months_lived_with_taxpayer,

    us_citizen_or_resident =
      coalesce(
        requested_us_citizen_or_resident,
        true
      ),

    claimed_by_another_taxpayer =
      coalesce(
        requested_claimed_by_another_taxpayer,
        false
      ),

    updated_at =
      current_saved_at

  where updated_dependent.id =
      requested_dependent_id
    and updated_dependent.organizer_id =
      requested_organizer_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      'in_progress'
        ::public.tax_organizer_section_status,

    progress_percentage =
      greatest(
        organizer_section.progress_percentage,
        50
      ),

    started_at =
      coalesce(
        organizer_section.started_at,
        current_saved_at
      ),

    completed_at =
      null,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'dependents';

  select
    count(*) filter (
      where organizer_section.status =
        'completed'
    ),

    count(*)
  into
    completed_section_count,
    total_section_count
  from public.client_tax_organizer_sections
    as organizer_section
  where organizer_section.organizer_id =
    requested_organizer_id;

  calculated_organizer_progress :=
    case
      when total_section_count = 0
      then 0
      else round(
        (
          completed_section_count::numeric /
          total_section_count::numeric
        ) * 100
      )::integer
    end;

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'dependents'
        ::public.tax_organizer_section_key,

    progress_percentage =
      calculated_organizer_progress,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    saved_dependent.id,

    saved_dependent.organizer_id,

    saved_dependent.first_name,

    saved_dependent.middle_name,

    saved_dependent.last_name,

    saved_dependent.suffix,

    saved_dependent.relationship,

    saved_dependent.birth_date,

    saved_dependent.is_full_time_student,

    saved_dependent.is_permanently_disabled,

    saved_dependent.lived_with_taxpayer_all_year,

    saved_dependent.months_lived_with_taxpayer,

    saved_dependent.us_citizen_or_resident,

    saved_dependent.claimed_by_another_taxpayer,

    saved_dependent.display_order,

    'in_progress'
      ::public.tax_organizer_section_status,

    50,

    calculated_organizer_progress,

    saved_dependent.created_at,

    saved_dependent.updated_at
  from public.client_tax_organizer_dependents
    as saved_dependent
  where saved_dependent.id =
    requested_dependent_id;
end;
$$;


ALTER FUNCTION "public"."update_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_suffix" "text", "requested_relationship" "text", "requested_birth_date" "date", "requested_is_full_time_student" boolean, "requested_is_permanently_disabled" boolean, "requested_lived_with_taxpayer_all_year" boolean, "requested_months_lived_with_taxpayer" smallint, "requested_us_citizen_or_resident" boolean, "requested_claimed_by_another_taxpayer" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_suffix" "text", "requested_relationship" "text", "requested_birth_date" "date", "requested_is_full_time_student" boolean, "requested_is_permanently_disabled" boolean, "requested_lived_with_taxpayer_all_year" boolean, "requested_months_lived_with_taxpayer" smallint, "requested_us_citizen_or_resident" boolean, "requested_claimed_by_another_taxpayer" boolean) IS 'Updates a non-sensitive dependent owned by the authenticated client. Protected identifiers remain in the Secure Vault.';



CREATE OR REPLACE FUNCTION "public"."update_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_coverage_id" "uuid", "requested_provider_name" "text", "requested_coverage_type" "text", "requested_covered_person_name" "text", "requested_policy_number" "text", "requested_start_month" integer, "requested_end_month" integer, "requested_is_full_year_coverage" boolean, "requested_document_received" boolean, "requested_document_type" "text", "requested_notes" "text") RETURNS TABLE("coverage_id" "uuid", "organizer_id" "uuid", "provider_name" "text", "coverage_type" "text", "covered_person_name" "text", "policy_number" "text", "start_month" integer, "end_month" integer, "is_full_year_coverage" boolean, "document_received" boolean, "document_type" "text", "notes" "text", "record_status" "text", "display_order" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  normalized_start_month integer;
  normalized_end_month integer;
  current_saved_at timestamptz;
  required_fields_complete boolean;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_coverage_id is null then
    raise exception
      'A healthcare coverage identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_healthcare_coverages
      as coverage
    where coverage.id =
        requested_coverage_id
      and coverage.organizer_id =
        requested_organizer_id
  ) then
    raise exception
      'The requested healthcare coverage was not found.';
  end if;

  if nullif(
    trim(
      requested_provider_name
    ),
    ''
  ) is null then
    raise exception
      'The healthcare provider name is required.';
  end if;

  if nullif(
    trim(
      requested_covered_person_name
    ),
    ''
  ) is null then
    raise exception
      'The covered person name is required.';
  end if;

  if requested_coverage_type not in (
    'employer',
    'marketplace',
    'medicare',
    'medicaid',
    'cobra',
    'private',
    'military',
    'other'
  ) then
    raise exception
      'The selected healthcare coverage type is invalid.';
  end if;

  if requested_document_type is not null
    and trim(requested_document_type) <> ''
    and requested_document_type not in (
      '1095_a',
      '1095_b',
      '1095_c',
      'insurance_card',
      'other'
    )
  then
    raise exception
      'The selected healthcare document type is invalid.';
  end if;

  if requested_is_full_year_coverage then
    normalized_start_month :=
      1;

    normalized_end_month :=
      12;
  else
    normalized_start_month :=
      requested_start_month;

    normalized_end_month :=
      requested_end_month;
  end if;

  if normalized_start_month is not null
    and normalized_start_month not between 1 and 12
  then
    raise exception
      'The coverage start month is invalid.';
  end if;

  if normalized_end_month is not null
    and normalized_end_month not between 1 and 12
  then
    raise exception
      'The coverage end month is invalid.';
  end if;

  if normalized_start_month is not null
    and normalized_end_month is not null
    and normalized_start_month >
      normalized_end_month
  then
    raise exception
      'The coverage start month cannot be after the end month.';
  end if;

  current_saved_at :=
    now();

  required_fields_complete :=
    (
      requested_is_full_year_coverage
      or (
        normalized_start_month is not null
        and normalized_end_month is not null
      )
    )
    and coalesce(
      requested_document_received,
      false
    );

  update public.client_tax_organizer_healthcare_coverages
    as coverage
  set
    provider_name =
      trim(
        requested_provider_name
      ),

    coverage_type =
      requested_coverage_type,

    covered_person_name =
      trim(
        requested_covered_person_name
      ),

    policy_number =
      nullif(
        trim(
          requested_policy_number
        ),
        ''
      ),

    start_month =
      normalized_start_month,

    end_month =
      normalized_end_month,

    is_full_year_coverage =
      coalesce(
        requested_is_full_year_coverage,
        false
      ),

    document_received =
      coalesce(
        requested_document_received,
        false
      ),

    document_type =
      nullif(
        trim(
          requested_document_type
        ),
        ''
      ),

    notes =
      nullif(
        trim(
          requested_notes
        ),
        ''
      ),

    record_status =
      case
        when required_fields_complete
        then 'complete'
        else 'draft'
      end,

    updated_at =
      current_saved_at

  where coverage.id =
      requested_coverage_id
    and coverage.organizer_id =
      requested_organizer_id;

  update public.client_tax_organizer_sections
    as organizer_section
  set
    status =
      'in_progress'
        ::public.tax_organizer_section_status,

    progress_percentage =
      greatest(
        organizer_section.progress_percentage,
        case
          when required_fields_complete
          then 50
          else 25
        end
      ),

    started_at =
      coalesce(
        organizer_section.started_at,
        current_saved_at
      ),

    completed_at =
      null,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where organizer_section.organizer_id =
      requested_organizer_id
    and organizer_section.section_key =
      'healthcare';

  update public.client_tax_organizers
    as tax_organizer
  set
    current_section =
      'healthcare'
        ::public.tax_organizer_section_key,

    last_saved_at =
      current_saved_at,

    updated_at =
      current_saved_at
  where tax_organizer.id =
    requested_organizer_id;

  return query
  select
    coverage.id,

    coverage.organizer_id,

    coverage.provider_name,

    coverage.coverage_type,

    coverage.covered_person_name,

    coverage.policy_number,

    coverage.start_month,

    coverage.end_month,

    coverage.is_full_year_coverage,

    coverage.document_received,

    coverage.document_type,

    coverage.notes,

    coverage.record_status,

    coverage.display_order,

    coverage.created_at,

    coverage.updated_at

  from public.client_tax_organizer_healthcare_coverages
    as coverage

  where coverage.id =
    requested_coverage_id;
end;
$$;


ALTER FUNCTION "public"."update_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_coverage_id" "uuid", "requested_provider_name" "text", "requested_coverage_type" "text", "requested_covered_person_name" "text", "requested_policy_number" "text", "requested_start_month" integer, "requested_end_month" integer, "requested_is_full_year_coverage" boolean, "requested_document_received" boolean, "requested_document_type" "text", "requested_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_coverage_id" "uuid", "requested_provider_name" "text", "requested_coverage_type" "text", "requested_covered_person_name" "text", "requested_policy_number" "text", "requested_start_month" integer, "requested_end_month" integer, "requested_is_full_year_coverage" boolean, "requested_document_received" boolean, "requested_document_type" "text", "requested_notes" "text") IS 'Updates a healthcare coverage record owned by the authenticated client.';



CREATE OR REPLACE FUNCTION "public"."update_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_name" "text", "requested_recipient_type" "text", "requested_record_status" "text", "requested_document_received" boolean, "requested_notes" "text") RETURNS TABLE("income_source_id" "uuid", "organizer_id" "uuid", "income_type" "text", "payer_name" "text", "recipient_type" "text", "record_status" "text", "document_received" boolean, "notes" "text", "display_order" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
#variable_conflict use_column

declare
  current_user_id uuid;
  current_client_id uuid;

  organizer_record
    public.client_tax_organizers;

  current_saved_at timestamptz;
begin
  current_user_id :=
    auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if requested_organizer_id is null then
    raise exception
      'An organizer identifier is required.';
  end if;

  if requested_income_source_id is null then
    raise exception
      'An income source identifier is required.';
  end if;

  select
    portal_profile.client_id
  into
    current_client_id
  from public.client_portal_profiles
    as portal_profile
  where portal_profile.auth_user_id =
      current_user_id
    and portal_profile.portal_status =
      'active'
  limit 1;

  if current_client_id is null then
    raise exception
      'An active client portal profile was not found.';
  end if;

  select
    tax_organizer.*
  into
    organizer_record
  from public.client_tax_organizers
    as tax_organizer
  where tax_organizer.id =
      requested_organizer_id
    and tax_organizer.client_id =
      current_client_id
  for update;

  if not found then
    raise exception
      'The requested tax organizer was not found.';
  end if;

  if organizer_record.status in (
    'submitted',
    'under_review',
    'approved'
  ) then
    raise exception
      'This organizer can no longer be edited.';
  end if;

  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income_source
    where income_source.id =
        requested_income_source_id
      and income_source.organizer_id =
        requested_organizer_id
  ) then
    raise exception
      'The requested income source was not found.';
  end if;

  if nullif(
    trim(
      requested_payer_name
    ),
    ''
  ) is null then
    raise exception
      'The payer or employer name is required.';
  end if;

  if requested_recipient_type not in (
    'taxpayer',
    'spouse',
    'dependent',
    'joint'
  ) then
    raise exception
      'The selected recipient type is invalid.';
  end if;

  if requested_record_status not in (
    'draft',
    'complete',
    'needs_review'
  ) then
    raise exception
      'The selected income status is invalid.';
  end if;

  current_saved_at :=
    now();

  update public.client_tax_organizer_income_sources
    as income_source
  set
    payer_name =
      trim(
        requested_payer_name
      ),

    recipient_type =
      requested_recipient_type,

    record_status =
      requested_record_status,

    document_received =
      coalesce(
        requested_document_received,
        false
      ),

    notes =
      nullif(
        trim(
          requested_notes
        ),
        ''
      ),

    updated_at =
      current_saved_at

  where income_source.id =
      requested_income_source_id
    and income_source.organizer_id =
      requested_organizer_id;

  return query
  select
    income_source.id,

    income_source.organizer_id,

    income_source.income_type,

    income_source.payer_name,

    income_source.recipient_type,

    income_source.record_status,

    income_source.document_received,

    income_source.notes,

    income_source.display_order,

    income_source.created_at,

    income_source.updated_at
  from public.client_tax_organizer_income_sources
    as income_source
  where income_source.id =
    requested_income_source_id;
end;
$$;


ALTER FUNCTION "public"."update_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_name" "text", "requested_recipient_type" "text", "requested_record_status" "text", "requested_document_received" boolean, "requested_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_name" "text", "requested_recipient_type" "text", "requested_record_status" "text", "requested_document_received" boolean, "requested_notes" "text") IS 'Updates common non-sensitive fields for an organizer income source owned by the authenticated client.';



CREATE OR REPLACE FUNCTION "public"."update_client_record"("requested_client_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text" DEFAULT NULL::"text", "requested_last_name" "text" DEFAULT NULL::"text", "requested_preferred_name" "text" DEFAULT NULL::"text", "requested_email" "text" DEFAULT NULL::"text", "requested_phone" "text" DEFAULT NULL::"text", "requested_alternate_phone" "text" DEFAULT NULL::"text", "requested_address_line_1" "text" DEFAULT NULL::"text", "requested_address_line_2" "text" DEFAULT NULL::"text", "requested_city" "text" DEFAULT NULL::"text", "requested_state" "text" DEFAULT NULL::"text", "requested_postal_code" "text" DEFAULT NULL::"text", "requested_birth_date" "date" DEFAULT NULL::"date", "requested_status" "public"."client_status" DEFAULT 'active'::"public"."client_status", "requested_notes" "text" DEFAULT NULL::"text") RETURNS "public"."clients"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare previous_record public.clients;
updated_record public.clients;
begin if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_can_manage_records() then raise exception 'You are not authorized to update clients.';
end if;
if nullif(trim(requested_first_name), '') is null then raise exception 'First name is required.';
end if;
if nullif(trim(requested_last_name), '') is null then raise exception 'Last name is required.';
end if;
select * into previous_record
from public.clients
where id = requested_client_id;
if not found then raise exception 'Client record was not found.';
end if;
update public.clients
set first_name = trim(requested_first_name),
  middle_name = nullif(trim(requested_middle_name), ''),
  last_name = trim(requested_last_name),
  preferred_name = nullif(trim(requested_preferred_name), ''),
  email = nullif(lower(trim(requested_email)), ''),
  phone = nullif(trim(requested_phone), ''),
  alternate_phone = nullif(trim(requested_alternate_phone), ''),
  address_line_1 = nullif(trim(requested_address_line_1), ''),
  address_line_2 = nullif(trim(requested_address_line_2), ''),
  city = nullif(trim(requested_city), ''),
  state = nullif(upper(trim(requested_state)), ''),
  postal_code = nullif(trim(requested_postal_code), ''),
  birth_date = requested_birth_date,
  status = requested_status,
  notes = nullif(trim(requested_notes), ''),
  updated_by = auth.uid()
where id = requested_client_id
returning * into updated_record;
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  )
values (
    auth.uid(),
    'client_updated',
    'client',
    updated_record.id,
    jsonb_build_object(
      'first_name',
      previous_record.first_name,
      'last_name',
      previous_record.last_name,
      'email',
      previous_record.email,
      'phone',
      previous_record.phone,
      'status',
      previous_record.status
    ),
    jsonb_build_object(
      'first_name',
      updated_record.first_name,
      'last_name',
      updated_record.last_name,
      'email',
      updated_record.email,
      'phone',
      updated_record.phone,
      'status',
      updated_record.status
    )
  );
return updated_record;
end;
$$;


ALTER FUNCTION "public"."update_client_record"("requested_client_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_preferred_name" "text", "requested_email" "text", "requested_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_birth_date" "date", "requested_status" "public"."client_status", "requested_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_client_record"("requested_client_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_preferred_name" "text", "requested_email" "text", "requested_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_birth_date" "date", "requested_status" "public"."client_status", "requested_notes" "text") IS 'Updates a client and writes the corresponding audit event.';



CREATE OR REPLACE FUNCTION "public"."update_organizer_evidence_verification"("requested_evidence_id" "uuid", "requested_confidence" "text", "requested_verification_status" "text", "requested_note" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  current_user_id uuid;
  normalized_confidence text;
  normalized_status text;
  normalized_note text;
  existing_evidence
    public.organizer_evidence_sources;
  updated_evidence
    public.organizer_evidence_sources;
  event_action text;
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
      'You do not have permission to verify evidence.';
  end if;

  if requested_evidence_id is null then
    raise exception
      'An evidence identifier is required.';
  end if;

  normalized_confidence :=
    trim(
      coalesce(
        requested_confidence,
        ''
      )
    );

  normalized_status :=
    trim(
      coalesce(
        requested_verification_status,
        ''
      )
    );

  normalized_note :=
    nullif(
      trim(
        coalesce(
          requested_note,
          ''
        )
      ),
      ''
    );

  if normalized_confidence not in (
    'high',
    'medium',
    'low',
    'unverified'
  ) then
    raise exception
      'Unsupported evidence confidence: %',
      normalized_confidence;
  end if;

  if normalized_status not in (
    'unverified',
    'under_review',
    'verified',
    'rejected',
    'needs_replacement'
  ) then
    raise exception
      'Unsupported evidence verification status: %',
      normalized_status;
  end if;

  if normalized_status in (
    'rejected',
    'needs_replacement'
  ) and normalized_note is null then
    raise exception
      'A verification note is required for rejected or replacement evidence.';
  end if;

  select evidence.*
  into existing_evidence
  from public.organizer_evidence_sources
    as evidence
  where evidence.id =
    requested_evidence_id;

  if not found then
    raise exception
      'The evidence source was not found.';
  end if;

  update
  public.organizer_evidence_sources
  set
    confidence =
      normalized_confidence,
    verification_status =
      normalized_status,
    verified_by =
      case
        when normalized_status =
          'verified'
          then current_user_id
        else null
      end,
    verified_at =
      case
        when normalized_status =
          'verified'
          then timezone(
            'utc',
            now()
          )
        else null
      end
  where id =
    requested_evidence_id
  returning *
  into updated_evidence;

  event_action :=
    case
      when normalized_status =
        'verified'
        then 'verified'
      when normalized_status =
        'rejected'
        then 'rejected'
      when normalized_status =
        'needs_replacement'
        then 'replacement_requested'
      when normalized_status =
        'under_review'
        then 'verification_started'
      when existing_evidence.confidence <>
        normalized_confidence
        then 'confidence_changed'
      else 'status_changed'
    end;

  insert into
  public.organizer_evidence_verification_events (
    evidence_id,
    action,
    actor_id,
    note,
    previous_confidence,
    new_confidence,
    previous_status,
    new_status,
    metadata
  )
  values (
    requested_evidence_id,
    event_action,
    current_user_id,
    normalized_note,
    existing_evidence.confidence,
    updated_evidence.confidence,
    existing_evidence.verification_status,
    updated_evidence.verification_status,
    jsonb_build_object(
      'organizer_id',
      updated_evidence.organizer_id
    )
  );

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata
  )
  values (
    current_user_id,
    'organizer_evidence_verification_updated',
    'organizer_evidence_source',
    requested_evidence_id,
    jsonb_build_object(
      'confidence',
      existing_evidence.confidence,
      'verification_status',
      existing_evidence.verification_status,
      'verified_by',
      existing_evidence.verified_by,
      'verified_at',
      existing_evidence.verified_at
    ),
    jsonb_build_object(
      'confidence',
      updated_evidence.confidence,
      'verification_status',
      updated_evidence.verification_status,
      'verified_by',
      updated_evidence.verified_by,
      'verified_at',
      updated_evidence.verified_at,
      'note',
      normalized_note
    ),
    jsonb_build_object(
      'organizer_id',
      updated_evidence.organizer_id,
      'return_id',
      updated_evidence.return_id
    )
  );
end;
$$;


ALTER FUNCTION "public"."update_organizer_evidence_verification"("requested_evidence_id" "uuid", "requested_confidence" "text", "requested_verification_status" "text", "requested_note" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_return_payment"("requested_payment_id" "uuid", "requested_amount" numeric, "requested_payment_method" "public"."payment_method", "requested_payment_date" "date", "requested_reference_number" "text" DEFAULT NULL::"text", "requested_notes" "text" DEFAULT NULL::"text") RETURNS "public"."payments"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  current_user_id uuid;
  existing_payment public.payments;
  updated_payment public.payments;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
      and profile.role in (
        'administrator',
        'manager'
      )
  ) then
    raise exception
      'You are not authorized to edit payments.';
  end if;

  if requested_payment_id is null then
    raise exception
      'A payment identifier is required.';
  end if;

  if requested_amount is null
    or requested_amount <= 0
  then
    raise exception
      'The payment amount must be greater than zero.';
  end if;

  if requested_payment_method is null then
    raise exception
      'A payment method is required.';
  end if;

  if requested_payment_date is null then
    raise exception
      'A payment date is required.';
  end if;

  select payment.*
  into existing_payment
  from public.payments payment
  where payment.id = requested_payment_id
  for update;

  if not found then
    raise exception
      'The selected payment was not found.';
  end if;

  if existing_payment.is_voided then
    raise exception
      'A voided payment cannot be edited.';
  end if;

  update public.payments
  set
    amount =
      requested_amount,

    payment_method =
      requested_payment_method,

    payment_date =
      requested_payment_date,

    reference_number =
      nullif(
        trim(requested_reference_number),
        ''
      ),

    notes =
      nullif(
        trim(requested_notes),
        ''
      ),

    updated_at =
      now()
  where id = requested_payment_id
  returning *
  into updated_payment;

  return updated_payment;
end;
$$;


ALTER FUNCTION "public"."update_return_payment"("requested_payment_id" "uuid", "requested_amount" numeric, "requested_payment_method" "public"."payment_method", "requested_payment_date" "date", "requested_reference_number" "text", "requested_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_tax_return_record"("requested_return_id" "uuid", "requested_client_id" "uuid", "requested_tax_year" integer, "requested_return_type" "public"."return_type", "requested_tax_form" "public"."tax_form_type", "requested_filing_status" "public"."filing_status", "requested_status" "public"."return_status", "requested_assigned_preparer_id" "uuid" DEFAULT NULL::"uuid", "requested_assigned_reviewer_id" "uuid" DEFAULT NULL::"uuid", "requested_date_received" "date" DEFAULT NULL::"date", "requested_due_date" "date" DEFAULT NULL::"date", "requested_filed_date" "date" DEFAULT NULL::"date", "requested_accepted_date" "date" DEFAULT NULL::"date", "requested_preparation_fee" numeric DEFAULT 0, "requested_discount_amount" numeric DEFAULT 0, "requested_description" "text" DEFAULT NULL::"text", "requested_federal_return_required" boolean DEFAULT true, "requested_state_return_required" boolean DEFAULT false, "requested_local_return_required" boolean DEFAULT false, "requested_extension_filed" boolean DEFAULT false, "requested_extension_date" "date" DEFAULT NULL::"date", "requested_estimated_refund" numeric DEFAULT 0, "requested_estimated_amount_due" numeric DEFAULT 0, "requested_notes" "text" DEFAULT NULL::"text") RETURNS "public"."tax_returns"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare previous_record public.tax_returns;
updated_record public.tax_returns;
effective_filed_date date;
effective_accepted_date date;
effective_extension_date date;
status_changed boolean;
preparer_changed boolean;
reviewer_changed boolean;
begin -- ----------------------------------------------------------
if auth.uid() is null then raise exception 'Authentication is required.';
end if;
if not public.current_user_can_manage_records() then raise exception 'You are not authorized to update tax returns.';
end if;
select * into previous_record
from public.tax_returns
where id = requested_return_id for
update;
if not found then raise exception 'Tax return was not found.';
end if;
if not exists (
  select 1
  from public.clients
  where id = requested_client_id
) then raise exception 'Client record was not found.';
end if;
if requested_tax_year < 2000
or requested_tax_year > 2100 then raise exception 'Tax year is invalid.';
end if;
if not public.is_valid_return_status_transition(
  previous_record.status,
  requested_status
) then raise exception 'The workflow transition from % to % is not allowed.',
previous_record.status,
requested_status;
end if;
if requested_preparation_fee is null
or requested_preparation_fee < 0 then raise exception 'Preparation fee cannot be negative.';
end if;
if requested_discount_amount is null
or requested_discount_amount < 0 then raise exception 'Discount cannot be negative.';
end if;
if requested_discount_amount > requested_preparation_fee then raise exception 'Discount cannot exceed preparation fee.';
end if;
if requested_estimated_refund is null
or requested_estimated_refund < 0 then raise exception 'Estimated refund cannot be negative.';
end if;
if requested_estimated_amount_due is null
or requested_estimated_amount_due < 0 then raise exception 'Estimated amount due cannot be negative.';
end if;
if requested_date_received is not null
and requested_due_date is not null
and requested_due_date < requested_date_received then raise exception 'Due date cannot be before the received date.';
end if;
if requested_filed_date is not null
and requested_accepted_date is not null
and requested_accepted_date < requested_filed_date then raise exception 'Accepted date cannot be before the filed date.';
end if;
if requested_extension_filed
and requested_extension_date is null then raise exception 'Extension date is required when an extension is filed.';
end if;
effective_extension_date := case
  when requested_extension_filed then requested_extension_date
  else null
end;
if requested_assigned_preparer_id is not null
and not exists (
  select 1
  from public.profiles
  where id = requested_assigned_preparer_id
    and is_active = true
    and role in (
      'administrator',
      'manager',
      'preparer'
    )
) then raise exception 'The selected preparer is not an active authorized preparer.';
end if;
if requested_assigned_reviewer_id is not null
and not exists (
  select 1
  from public.profiles
  where id = requested_assigned_reviewer_id
    and is_active = true
    and role in (
      'administrator',
      'manager',
      'reviewer'
    )
) then raise exception 'The selected reviewer is not an active authorized reviewer.';
end if;
if requested_assigned_preparer_id is not null
and requested_assigned_reviewer_id is not null
and requested_assigned_preparer_id = requested_assigned_reviewer_id then raise exception 'The preparer and reviewer must be different staff members.';
end if;
if requested_status in (
  'in_progress',
  'ready_for_review',
  'under_review',
  'ready_to_file',
  'filed',
  'accepted',
  'completed'
)
and requested_assigned_preparer_id is null then raise exception 'A preparer must be assigned for this workflow status.';
end if;
if requested_status in ('under_review', 'ready_to_file')
and requested_assigned_reviewer_id is null then raise exception 'A reviewer must be assigned for this workflow status.';
end if;
effective_filed_date := requested_filed_date;
effective_accepted_date := requested_accepted_date;
if requested_status in ('filed', 'accepted', 'completed')
and effective_filed_date is null then effective_filed_date := current_date;
end if;
if requested_status in ('accepted', 'completed')
and effective_accepted_date is null then effective_accepted_date := current_date;
end if;
if effective_filed_date is not null
and effective_accepted_date is not null
and effective_accepted_date < effective_filed_date then raise exception 'Accepted date cannot be before the filed date.';
end if;
if requested_status = 'rejected' then effective_accepted_date := null;
end if;
if requested_status in (
  'not_started',
  'documents_pending',
  'in_progress',
  'ready_for_review',
  'under_review',
  'ready_to_file'
) then effective_filed_date := requested_filed_date;
effective_accepted_date := null;
end if;
status_changed := previous_record.status is distinct
from requested_status;
preparer_changed := previous_record.assigned_preparer_id is distinct
from requested_assigned_preparer_id;
reviewer_changed := previous_record.assigned_reviewer_id is distinct
from requested_assigned_reviewer_id;
update public.tax_returns
set client_id = requested_client_id,
  tax_year = requested_tax_year,
  return_type = requested_return_type,
  tax_form = requested_tax_form,
  filing_status = requested_filing_status,
  status = requested_status,
  assigned_preparer_id = requested_assigned_preparer_id,
  assigned_reviewer_id = requested_assigned_reviewer_id,
  date_received = requested_date_received,
  due_date = requested_due_date,
  filed_date = effective_filed_date,
  accepted_date = effective_accepted_date,
  preparation_fee = requested_preparation_fee,
  discount_amount = requested_discount_amount,
  description = nullif(
    trim(requested_description),
    ''
  ),
  federal_return_required = requested_federal_return_required,
  state_return_required = requested_state_return_required,
  local_return_required = requested_local_return_required,
  extension_filed = requested_extension_filed,
  extension_date = effective_extension_date,
  estimated_refund = requested_estimated_refund,
  estimated_amount_due = requested_estimated_amount_due,
  notes = nullif(
    trim(requested_notes),
    ''
  ),
  updated_by = auth.uid()
where id = requested_return_id
returning * into updated_record;
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata
  )
values (
    auth.uid(),
    'tax_return_updated',
    'tax_return',
    updated_record.id,
    jsonb_build_object(
      'client_id',
      previous_record.client_id,
      'tax_year',
      previous_record.tax_year,
      'return_type',
      previous_record.return_type,
      'tax_form',
      previous_record.tax_form,
      'filing_status',
      previous_record.filing_status,
      'status',
      previous_record.status,
      'assigned_preparer_id',
      previous_record.assigned_preparer_id,
      'assigned_reviewer_id',
      previous_record.assigned_reviewer_id,
      'date_received',
      previous_record.date_received,
      'due_date',
      previous_record.due_date,
      'filed_date',
      previous_record.filed_date,
      'accepted_date',
      previous_record.accepted_date,
      'preparation_fee',
      previous_record.preparation_fee,
      'discount_amount',
      previous_record.discount_amount,
      'extension_filed',
      previous_record.extension_filed,
      'extension_date',
      previous_record.extension_date
    ),
    jsonb_build_object(
      'client_id',
      updated_record.client_id,
      'tax_year',
      updated_record.tax_year,
      'return_type',
      updated_record.return_type,
      'tax_form',
      updated_record.tax_form,
      'filing_status',
      updated_record.filing_status,
      'status',
      updated_record.status,
      'assigned_preparer_id',
      updated_record.assigned_preparer_id,
      'assigned_reviewer_id',
      updated_record.assigned_reviewer_id,
      'date_received',
      updated_record.date_received,
      'due_date',
      updated_record.due_date,
      'filed_date',
      updated_record.filed_date,
      'accepted_date',
      updated_record.accepted_date,
      'preparation_fee',
      updated_record.preparation_fee,
      'discount_amount',
      updated_record.discount_amount,
      'extension_filed',
      updated_record.extension_filed,
      'extension_date',
      updated_record.extension_date
    ),
    jsonb_build_object(
      'status_changed',
      status_changed,
      'preparer_changed',
      preparer_changed,
      'reviewer_changed',
      reviewer_changed
    )
  );
if status_changed then
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  )
values (
    auth.uid(),
    'return_status_updated',
    'tax_return',
    updated_record.id,
    jsonb_build_object(
      'status',
      previous_record.status
    ),
    jsonb_build_object(
      'status',
      updated_record.status
    )
  );
end if;
if preparer_changed then
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  )
values (
    auth.uid(),
    'return_preparer_assigned',
    'tax_return',
    updated_record.id,
    jsonb_build_object(
      'assigned_preparer_id',
      previous_record.assigned_preparer_id
    ),
    jsonb_build_object(
      'assigned_preparer_id',
      updated_record.assigned_preparer_id
    )
  );
end if;
if reviewer_changed then
insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  )
values (
    auth.uid(),
    'return_reviewer_assigned',
    'tax_return',
    updated_record.id,
    jsonb_build_object(
      'assigned_reviewer_id',
      previous_record.assigned_reviewer_id
    ),
    jsonb_build_object(
      'assigned_reviewer_id',
      updated_record.assigned_reviewer_id
    )
  );
end if;
return updated_record;
end;
$$;


ALTER FUNCTION "public"."update_tax_return_record"("requested_return_id" "uuid", "requested_client_id" "uuid", "requested_tax_year" integer, "requested_return_type" "public"."return_type", "requested_tax_form" "public"."tax_form_type", "requested_filing_status" "public"."filing_status", "requested_status" "public"."return_status", "requested_assigned_preparer_id" "uuid", "requested_assigned_reviewer_id" "uuid", "requested_date_received" "date", "requested_due_date" "date", "requested_filed_date" "date", "requested_accepted_date" "date", "requested_preparation_fee" numeric, "requested_discount_amount" numeric, "requested_description" "text", "requested_federal_return_required" boolean, "requested_state_return_required" boolean, "requested_local_return_required" boolean, "requested_extension_filed" boolean, "requested_extension_date" "date", "requested_estimated_refund" numeric, "requested_estimated_amount_due" numeric, "requested_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_tax_return_record"("requested_return_id" "uuid", "requested_client_id" "uuid", "requested_tax_year" integer, "requested_return_type" "public"."return_type", "requested_tax_form" "public"."tax_form_type", "requested_filing_status" "public"."filing_status", "requested_status" "public"."return_status", "requested_assigned_preparer_id" "uuid", "requested_assigned_reviewer_id" "uuid", "requested_date_received" "date", "requested_due_date" "date", "requested_filed_date" "date", "requested_accepted_date" "date", "requested_preparation_fee" numeric, "requested_discount_amount" numeric, "requested_description" "text", "requested_federal_return_required" boolean, "requested_state_return_required" boolean, "requested_local_return_required" boolean, "requested_extension_filed" boolean, "requested_extension_date" "date", "requested_estimated_refund" numeric, "requested_estimated_amount_due" numeric, "requested_notes" "text") IS 'Validates and updates a tax return while recording workflow, assignment, and general audit events.';



CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_client_portal_invitation"("requested_token_hash" "text") RETURNS TABLE("portal_account_id" "uuid", "client_id" "uuid", "client_name" "text", "email" "text", "expires_at" timestamp with time zone, "invitation_status" "public"."portal_invitation_status")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  normalized_token_hash text;
begin
  normalized_token_hash :=
    trim(
      coalesce(
        requested_token_hash,
        ''
      )
    );

  if normalized_token_hash = '' then
    raise exception
      'An invitation token is required.';
  end if;

  return query
  select
    account.id as portal_account_id,
    account.client_id,
    trim(
      concat_ws(
        ' ',
        client.first_name,
        client.middle_name,
        client.last_name
      )
    ) as client_name,
    account.email,
    account.invitation_expires_at as expires_at,
    case
      when account.invitation_status = 'pending'
        and account.invitation_expires_at <= now()
      then 'expired'::public.portal_invitation_status
      else account.invitation_status
    end as invitation_status
  from public.client_portal_accounts account
  join public.clients client
    on client.id = account.client_id
  where account.invitation_token_hash =
    normalized_token_hash
  limit 1;

  if not found then
    raise exception
      'The invitation is invalid or no longer available.';
  end if;
end;
$$;


ALTER FUNCTION "public"."validate_client_portal_invitation"("requested_token_hash" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_organizer_income_1099_div_source"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income
    where income.id =
      new.income_source_id
      and income.income_type =
        '1099_div'
  ) then
    raise exception
      'Form 1099-DIV details require a 1099-DIV income source.';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."validate_organizer_income_1099_div_source"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_organizer_income_1099_int_source"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  if not exists (
    select 1
    from public.client_tax_organizer_income_sources
      as income
    where income.id =
      new.income_source_id
      and income.income_type =
        '1099_int'
  ) then
    raise exception
      'Form 1099-INT details require a 1099-INT income source.';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."validate_organizer_income_1099_int_source"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."void_return_payment"("requested_payment_id" "uuid", "requested_void_reason" "text") RETURNS "public"."payments"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
declare
  current_user_id uuid;
  existing_payment public.payments;
  voided_payment public.payments;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.profiles profile
    where profile.id = current_user_id
      and profile.is_active = true
      and profile.role in (
        'administrator',
        'manager'
      )
  ) then
    raise exception
      'You are not authorized to void payments.';
  end if;

  if requested_payment_id is null then
    raise exception
      'A payment identifier is required.';
  end if;

  if nullif(
    trim(requested_void_reason),
    ''
  ) is null then
    raise exception
      'A void reason is required.';
  end if;

  select payment.*
  into existing_payment
  from public.payments payment
  where payment.id = requested_payment_id
  for update;

  if not found then
    raise exception
      'The selected payment was not found.';
  end if;

  if existing_payment.is_voided then
    raise exception
      'The selected payment has already been voided.';
  end if;

  update public.payments
  set
    is_voided = true,
    voided_at = now(),
    voided_by = current_user_id,
    void_reason = trim(
      requested_void_reason
    ),
    updated_at = now()
  where id = requested_payment_id
  returning *
  into voided_payment;

  perform public.log_return_workflow(
    requested_return_id :=
      voided_payment.tax_return_id,

    requested_event_type :=
      'payment_voided',

    requested_event_label :=
      'Payment voided',

    requested_event_description :=
      format(
        'A payment of $%s was voided. Reason: %s',
        to_char(
          voided_payment.amount,
          'FM999,999,990.00'
        ),
        voided_payment.void_reason
      ),

    requested_is_client_visible :=
      false,

    requested_event_data :=
      jsonb_build_object(
        'payment_id',
        voided_payment.id,

        'amount',
        voided_payment.amount,

        'payment_method',
        voided_payment.payment_method,

        'payment_date',
        voided_payment.payment_date,

        'reference_number',
        voided_payment.reference_number,

        'void_reason',
        voided_payment.void_reason,

        'voided_by',
        voided_payment.voided_by,

        'voided_at',
        voided_payment.voided_at
      ),

    requested_occurred_at :=
      voided_payment.voided_at
  );

  return voided_payment;
end;
$_$;


ALTER FUNCTION "public"."void_return_payment"("requested_payment_id" "uuid", "requested_void_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."write_vault_audit_event"("requested_vault_secret_id" "uuid", "requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_secret_type" "text", "requested_actor_user_id" "uuid", "requested_action" "text", "requested_outcome" "text", "requested_reason" "text", "requested_source" "text", "requested_request_id" "uuid", "requested_session_id" "text", "requested_ip_address" "inet", "requested_user_agent" "text", "requested_metadata" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  audit_event_id uuid;
  normalized_metadata jsonb;
begin
  if requested_action is null
    or length(
      trim(requested_action)
    ) = 0
  then
    raise exception
      'A vault audit action is required.';
  end if;

  if requested_outcome is null
    or length(
      trim(requested_outcome)
    ) = 0
  then
    raise exception
      'A vault audit outcome is required.';
  end if;

  if requested_source is null
    or length(
      trim(requested_source)
    ) = 0
  then
    raise exception
      'A vault audit source is required.';
  end if;

  normalized_metadata :=
    coalesce(
      requested_metadata,
      '{}'::jsonb
    );

  if jsonb_typeof(
    normalized_metadata
  ) <> 'object'
  then
    raise exception
      'Vault audit metadata must be a JSON object.';
  end if;

  insert into public.vault_audit_log (
    vault_secret_id,
    client_id,
    organizer_id,
    secret_type,
    actor_user_id,
    action,
    outcome,
    reason,
    source,
    request_id,
    session_id,
    ip_address,
    user_agent,
    metadata
  )
  values (
    requested_vault_secret_id,
    requested_client_id,
    requested_organizer_id,

    nullif(
      trim(
        requested_secret_type
      ),
      ''
    ),

    requested_actor_user_id,

    lower(
      trim(
        requested_action
      )
    ),

    lower(
      trim(
        requested_outcome
      )
    ),

    nullif(
      trim(
        requested_reason
      ),
      ''
    ),

    lower(
      trim(
        requested_source
      )
    ),

    requested_request_id,

    nullif(
      trim(
        requested_session_id
      ),
      ''
    ),

    requested_ip_address,

    nullif(
      trim(
        requested_user_agent
      ),
      ''
    ),

    normalized_metadata
  )
  returning id
  into audit_event_id;

  return audit_event_id;
end;
$$;


ALTER FUNCTION "public"."write_vault_audit_event"("requested_vault_secret_id" "uuid", "requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_secret_type" "text", "requested_actor_user_id" "uuid", "requested_action" "text", "requested_outcome" "text", "requested_reason" "text", "requested_source" "text", "requested_request_id" "uuid", "requested_session_id" "text", "requested_ip_address" "inet", "requested_user_agent" "text", "requested_metadata" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."write_vault_audit_event"("requested_vault_secret_id" "uuid", "requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_secret_type" "text", "requested_actor_user_id" "uuid", "requested_action" "text", "requested_outcome" "text", "requested_reason" "text", "requested_source" "text", "requested_request_id" "uuid", "requested_session_id" "text", "requested_ip_address" "inet", "requested_user_agent" "text", "requested_metadata" "jsonb") IS 'Appends a non-sensitive Secure Vault audit event. Plaintext secrets must never be supplied in the reason, user-agent, session, or metadata arguments.';



CREATE OR REPLACE FUNCTION "public"."write_vault_audit_event_v2"("requested_vault_secret_id" "uuid", "requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_secret_type" "text", "requested_actor_user_id" "uuid", "requested_action" "text", "requested_outcome" "text", "requested_reason" "text", "requested_source" "text", "requested_request_id" "uuid", "requested_session_id" "text", "requested_ip_address" "inet", "requested_user_agent" "text", "requested_metadata" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  audit_event_id uuid;
  normalized_metadata jsonb;
begin
  if requested_action is null
    or length(
      trim(
        requested_action
      )
    ) = 0
  then
    raise exception
      'A vault audit action is required.';
  end if;

  if requested_outcome is null
    or length(
      trim(
        requested_outcome
      )
    ) = 0
  then
    raise exception
      'A vault audit outcome is required.';
  end if;

  if requested_source is null
    or length(
      trim(
        requested_source
      )
    ) = 0
  then
    raise exception
      'A vault audit source is required.';
  end if;

  normalized_metadata :=
    coalesce(
      requested_metadata,
      '{}'::jsonb
    );

  if jsonb_typeof(
    normalized_metadata
  ) <> 'object'
  then
    raise exception
      'Vault audit metadata must be a JSON object.';
  end if;

  insert into public.vault_audit_log (
    vault_secret_id,
    client_id,
    organizer_id,
    dependent_id,
    secret_type,
    actor_user_id,
    action,
    outcome,
    reason,
    source,
    request_id,
    session_id,
    ip_address,
    user_agent,
    metadata
  )
  values (
    requested_vault_secret_id,
    requested_client_id,
    requested_organizer_id,
    requested_dependent_id,

    nullif(
      trim(
        requested_secret_type
      ),
      ''
    ),

    requested_actor_user_id,

    lower(
      trim(
        requested_action
      )
    ),

    lower(
      trim(
        requested_outcome
      )
    ),

    nullif(
      trim(
        requested_reason
      ),
      ''
    ),

    lower(
      trim(
        requested_source
      )
    ),

    requested_request_id,

    nullif(
      trim(
        requested_session_id
      ),
      ''
    ),

    requested_ip_address,

    nullif(
      trim(
        requested_user_agent
      ),
      ''
    ),

    normalized_metadata
  )
  returning id
  into audit_event_id;

  return audit_event_id;
end;
$$;


ALTER FUNCTION "public"."write_vault_audit_event_v2"("requested_vault_secret_id" "uuid", "requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_secret_type" "text", "requested_actor_user_id" "uuid", "requested_action" "text", "requested_outcome" "text", "requested_reason" "text", "requested_source" "text", "requested_request_id" "uuid", "requested_session_id" "text", "requested_ip_address" "inet", "requested_user_agent" "text", "requested_metadata" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."write_vault_audit_event_v2"("requested_vault_secret_id" "uuid", "requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_secret_type" "text", "requested_actor_user_id" "uuid", "requested_action" "text", "requested_outcome" "text", "requested_reason" "text", "requested_source" "text", "requested_request_id" "uuid", "requested_session_id" "text", "requested_ip_address" "inet", "requested_user_agent" "text", "requested_metadata" "jsonb") IS 'Appends a non-sensitive Secure Vault audit event with optional dependent ownership. Plaintext secrets are prohibited in every argument.';



CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" bigint NOT NULL,
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE ONLY "public"."audit_logs" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_logs" IS 'Append-only application security and business activity log.';



ALTER TABLE "public"."audit_logs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."audit_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."client_portal_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "portal_status" "public"."client_portal_status" DEFAULT 'invited'::"public"."client_portal_status" NOT NULL,
    "invited_at" timestamp with time zone,
    "activated_at" timestamp with time zone,
    "last_login_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "client_portal_profiles_activation_status" CHECK ((("portal_status" <> 'active'::"public"."client_portal_status") OR ("activated_at" IS NOT NULL))),
    CONSTRAINT "client_portal_profiles_email_length" CHECK ((("length"("email") >= 3) AND ("length"("email") <= 320))),
    CONSTRAINT "client_portal_profiles_email_normalized" CHECK (("email" = "lower"(TRIM(BOTH FROM "email"))))
);

ALTER TABLE ONLY "public"."client_portal_profiles" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_portal_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_portal_profiles" IS 'Links Supabase authentication users to Smith Enterprises client records.';



COMMENT ON COLUMN "public"."client_portal_profiles"."auth_user_id" IS 'Supabase auth.users identifier for the client portal account.';



COMMENT ON COLUMN "public"."client_portal_profiles"."client_id" IS 'Existing Smith Enterprises client record associated with the portal account.';



COMMENT ON COLUMN "public"."client_portal_profiles"."portal_status" IS 'Controls whether the client account is invited, active, or disabled.';



CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_banking_information" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "account_holder_name" "text",
    "bank_name" "text",
    "account_type" "text",
    "use_direct_deposit" boolean,
    "authorize_direct_debit" boolean,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "organizer_banking_account_holder_length" CHECK ((("account_holder_name" IS NULL) OR (("length"(TRIM(BOTH FROM "account_holder_name")) >= 1) AND ("length"(TRIM(BOTH FROM "account_holder_name")) <= 200)))),
    CONSTRAINT "organizer_banking_account_type_check" CHECK ((("account_type" IS NULL) OR ("account_type" = ANY (ARRAY['checking'::"text", 'savings'::"text"])))),
    CONSTRAINT "organizer_banking_bank_name_length" CHECK ((("bank_name" IS NULL) OR (("length"(TRIM(BOTH FROM "bank_name")) >= 1) AND ("length"(TRIM(BOTH FROM "bank_name")) <= 200))))
);


ALTER TABLE "public"."client_tax_organizer_banking_information" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_tax_organizer_banking_information" IS 'Stores non-sensitive banking preferences for a client tax organizer. Routing and account numbers are stored only in the Secure Vault.';



COMMENT ON COLUMN "public"."client_tax_organizer_banking_information"."account_holder_name" IS 'Name associated with the bank account.';



COMMENT ON COLUMN "public"."client_tax_organizer_banking_information"."bank_name" IS 'Financial institution name.';



COMMENT ON COLUMN "public"."client_tax_organizer_banking_information"."account_type" IS 'Bank account classification: checking or savings.';



COMMENT ON COLUMN "public"."client_tax_organizer_banking_information"."use_direct_deposit" IS 'Indicates whether the client wants an eligible refund deposited into this account.';



COMMENT ON COLUMN "public"."client_tax_organizer_banking_information"."authorize_direct_debit" IS 'Indicates whether the client may use the account for an authorized tax-payment debit.';



CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_business_responses" (
    "organizer_id" "uuid" NOT NULL,
    "has_business_activity" boolean,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE ONLY "public"."client_tax_organizer_business_responses" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_business_responses" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_tax_organizer_business_responses" IS 'Client answer indicating whether the organizer includes business or self-employment activity.';



CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_dependent_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dependent_id" "uuid" NOT NULL,
    "review_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "internal_notes" "text" DEFAULT ''::"text" NOT NULL,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "follow_up_requested_by" "uuid",
    "follow_up_requested_at" timestamp with time zone,
    "returned_to_client_by" "uuid",
    "returned_to_client_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "client_tax_organizer_dependent_reviews_internal_notes_check" CHECK (("char_length"("internal_notes") <= 10000)),
    CONSTRAINT "client_tax_organizer_dependent_reviews_review_status_check" CHECK (("review_status" = ANY (ARRAY['pending'::"text", 'reviewed'::"text", 'needs_follow_up'::"text", 'returned_to_client'::"text"]))),
    CONSTRAINT "dependent_reviews_follow_up_fields_valid" CHECK ((("review_status" <> 'needs_follow_up'::"text") OR (("follow_up_requested_by" IS NOT NULL) AND ("follow_up_requested_at" IS NOT NULL)))),
    CONSTRAINT "dependent_reviews_returned_fields_valid" CHECK ((("review_status" <> 'returned_to_client'::"text") OR (("returned_to_client_by" IS NOT NULL) AND ("returned_to_client_at" IS NOT NULL)))),
    CONSTRAINT "dependent_reviews_reviewed_fields_valid" CHECK ((("review_status" <> 'reviewed'::"text") OR (("reviewed_by" IS NOT NULL) AND ("reviewed_at" IS NOT NULL))))
);

ALTER TABLE ONLY "public"."client_tax_organizer_dependent_reviews" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_dependent_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_dependents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "middle_name" "text",
    "last_name" "text" NOT NULL,
    "suffix" "text",
    "relationship" "text" NOT NULL,
    "birth_date" "date" NOT NULL,
    "is_full_time_student" boolean DEFAULT false NOT NULL,
    "is_permanently_disabled" boolean DEFAULT false NOT NULL,
    "lived_with_taxpayer_all_year" boolean DEFAULT false NOT NULL,
    "months_lived_with_taxpayer" smallint DEFAULT 0 NOT NULL,
    "us_citizen_or_resident" boolean DEFAULT true NOT NULL,
    "claimed_by_another_taxpayer" boolean DEFAULT false NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "organizer_dependents_birth_date_check" CHECK (("birth_date" <= CURRENT_DATE)),
    CONSTRAINT "organizer_dependents_display_order_check" CHECK (("display_order" >= 0)),
    CONSTRAINT "organizer_dependents_first_name_length" CHECK ((("length"(TRIM(BOTH FROM "first_name")) >= 1) AND ("length"(TRIM(BOTH FROM "first_name")) <= 100))),
    CONSTRAINT "organizer_dependents_last_name_length" CHECK ((("length"(TRIM(BOTH FROM "last_name")) >= 1) AND ("length"(TRIM(BOTH FROM "last_name")) <= 100))),
    CONSTRAINT "organizer_dependents_middle_name_length" CHECK ((("middle_name" IS NULL) OR (("length"(TRIM(BOTH FROM "middle_name")) >= 1) AND ("length"(TRIM(BOTH FROM "middle_name")) <= 100)))),
    CONSTRAINT "organizer_dependents_months_check" CHECK ((("months_lived_with_taxpayer" >= 0) AND ("months_lived_with_taxpayer" <= 12))),
    CONSTRAINT "organizer_dependents_relationship_check" CHECK (("relationship" = ANY (ARRAY['son'::"text", 'daughter'::"text", 'stepson'::"text", 'stepdaughter'::"text", 'foster_child'::"text", 'brother'::"text", 'sister'::"text", 'stepbrother'::"text", 'stepsister'::"text", 'half_brother'::"text", 'half_sister'::"text", 'grandchild'::"text", 'parent'::"text", 'grandparent'::"text", 'niece'::"text", 'nephew'::"text", 'other_relative'::"text", 'non_relative'::"text"]))),
    CONSTRAINT "organizer_dependents_residency_consistency" CHECK (((("lived_with_taxpayer_all_year" = true) AND ("months_lived_with_taxpayer" = 12)) OR (("lived_with_taxpayer_all_year" = false) AND (("months_lived_with_taxpayer" >= 0) AND ("months_lived_with_taxpayer" <= 11))))),
    CONSTRAINT "organizer_dependents_suffix_check" CHECK ((("suffix" IS NULL) OR ("suffix" = ANY (ARRAY['Jr.'::"text", 'Sr.'::"text", 'II'::"text", 'III'::"text", 'IV'::"text", 'V'::"text"]))))
);


ALTER TABLE "public"."client_tax_organizer_dependents" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_tax_organizer_dependents" IS 'Stores non-sensitive dependent information for a client tax organizer. Dependent SSNs and other protected identifiers are stored only in the Secure Vault.';



COMMENT ON COLUMN "public"."client_tax_organizer_dependents"."organizer_id" IS 'Tax organizer that owns the dependent record.';



COMMENT ON COLUMN "public"."client_tax_organizer_dependents"."relationship" IS 'Dependent relationship classification used for tax-organizer questions.';



COMMENT ON COLUMN "public"."client_tax_organizer_dependents"."months_lived_with_taxpayer" IS 'Number of months from 0 through 12 that the dependent lived with the taxpayer during the tax year.';



COMMENT ON COLUMN "public"."client_tax_organizer_dependents"."display_order" IS 'Controls the order in which dependent cards appear in the client portal.';



CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_healthcare_coverages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "provider_name" "text" NOT NULL,
    "coverage_type" "text" NOT NULL,
    "covered_person_name" "text" NOT NULL,
    "policy_number" "text",
    "start_month" integer,
    "end_month" integer,
    "is_full_year_coverage" boolean DEFAULT false NOT NULL,
    "document_received" boolean DEFAULT false NOT NULL,
    "document_type" "text",
    "notes" "text",
    "record_status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "healthcare_coverage_type_check" CHECK (("coverage_type" = ANY (ARRAY['employer'::"text", 'marketplace'::"text", 'medicare'::"text", 'medicaid'::"text", 'cobra'::"text", 'private'::"text", 'military'::"text", 'other'::"text"]))),
    CONSTRAINT "healthcare_covered_person_name_check" CHECK ((("length"(TRIM(BOTH FROM "covered_person_name")) >= 1) AND ("length"(TRIM(BOTH FROM "covered_person_name")) <= 200))),
    CONSTRAINT "healthcare_display_order_check" CHECK (("display_order" >= 0)),
    CONSTRAINT "healthcare_document_type_check" CHECK ((("document_type" IS NULL) OR ("document_type" = ANY (ARRAY['1095_a'::"text", '1095_b'::"text", '1095_c'::"text", 'insurance_card'::"text", 'other'::"text"])))),
    CONSTRAINT "healthcare_end_month_check" CHECK ((("end_month" IS NULL) OR (("end_month" >= 1) AND ("end_month" <= 12)))),
    CONSTRAINT "healthcare_full_year_months_check" CHECK (((NOT "is_full_year_coverage") OR ((("start_month" IS NULL) OR ("start_month" = 1)) AND (("end_month" IS NULL) OR ("end_month" = 12))))),
    CONSTRAINT "healthcare_month_range_check" CHECK ((("start_month" IS NULL) OR ("end_month" IS NULL) OR ("start_month" <= "end_month"))),
    CONSTRAINT "healthcare_notes_length_check" CHECK ((("notes" IS NULL) OR ("length"("notes") <= 4000))),
    CONSTRAINT "healthcare_policy_number_length_check" CHECK ((("policy_number" IS NULL) OR ("length"(TRIM(BOTH FROM "policy_number")) <= 100))),
    CONSTRAINT "healthcare_provider_name_check" CHECK ((("length"(TRIM(BOTH FROM "provider_name")) >= 1) AND ("length"(TRIM(BOTH FROM "provider_name")) <= 200))),
    CONSTRAINT "healthcare_record_status_check" CHECK (("record_status" = ANY (ARRAY['draft'::"text", 'complete'::"text", 'needs_review'::"text"]))),
    CONSTRAINT "healthcare_start_month_check" CHECK ((("start_month" IS NULL) OR (("start_month" >= 1) AND ("start_month" <= 12))))
);


ALTER TABLE "public"."client_tax_organizer_healthcare_coverages" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_tax_organizer_healthcare_coverages" IS 'Stores healthcare coverage records associated with a client tax organizer.';



COMMENT ON COLUMN "public"."client_tax_organizer_healthcare_coverages"."coverage_type" IS 'Identifies the source of healthcare coverage, including employer, Marketplace, Medicare, Medicaid, COBRA, private, military, or other coverage.';



COMMENT ON COLUMN "public"."client_tax_organizer_healthcare_coverages"."covered_person_name" IS 'Identifies the taxpayer, spouse, dependent, or other household member covered by the healthcare policy.';



COMMENT ON COLUMN "public"."client_tax_organizer_healthcare_coverages"."policy_number" IS 'Optional healthcare policy identifier. Social Security numbers and other government identifiers must never be stored in this field.';



COMMENT ON COLUMN "public"."client_tax_organizer_healthcare_coverages"."document_received" IS 'Indicates whether the supporting healthcare document has been uploaded or delivered.';



COMMENT ON COLUMN "public"."client_tax_organizer_healthcare_coverages"."record_status" IS 'Tracks whether the healthcare record is a draft, complete, or requires review.';



CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_identity_information" (
    "organizer_id" "uuid" NOT NULL,
    "identification_type" "text",
    "identification_number" "text",
    "identification_state" "text",
    "identification_issue_date" "date",
    "identification_expiration_date" "date",
    "citizenship_status" "text",
    "is_us_citizen" boolean,
    "has_government_photo_id" boolean,
    "has_identity_changed" boolean,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."client_tax_organizer_identity_information" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_income_1099_div_details" (
    "income_source_id" "uuid" NOT NULL,
    "payer_identification_number" "text",
    "total_ordinary_dividends" numeric(14,2),
    "qualified_dividends" numeric(14,2),
    "total_capital_gain_distributions" numeric(14,2),
    "unrecaptured_section_1250_gain" numeric(14,2),
    "section_1202_gain" numeric(14,2),
    "collectibles_28_percent_rate_gain" numeric(14,2),
    "section_897_ordinary_dividends" numeric(14,2),
    "section_897_capital_gain" numeric(14,2),
    "nondividend_distributions" numeric(14,2),
    "federal_income_tax_withheld" numeric(14,2),
    "section_199a_dividends" numeric(14,2),
    "investment_expenses" numeric(14,2),
    "foreign_tax_paid" numeric(14,2),
    "foreign_country_or_us_possession" "text",
    "exempt_interest_dividends" numeric(14,2),
    "specified_private_activity_bond_interest_dividends" numeric(14,2),
    "state_code" "text",
    "state_identification_number" "text",
    "state_tax_withheld" numeric(14,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "organizer_income_1099_div_1202_check" CHECK ((("section_1202_gain" IS NULL) OR ("section_1202_gain" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_1250_check" CHECK ((("unrecaptured_section_1250_gain" IS NULL) OR ("unrecaptured_section_1250_gain" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_199a_check" CHECK ((("section_199a_dividends" IS NULL) OR ("section_199a_dividends" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_897_capital_check" CHECK ((("section_897_capital_gain" IS NULL) OR ("section_897_capital_gain" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_897_ordinary_check" CHECK ((("section_897_ordinary_dividends" IS NULL) OR ("section_897_ordinary_dividends" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_capital_gain_check" CHECK ((("total_capital_gain_distributions" IS NULL) OR ("total_capital_gain_distributions" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_collectibles_check" CHECK ((("collectibles_28_percent_rate_gain" IS NULL) OR ("collectibles_28_percent_rate_gain" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_exempt_interest_check" CHECK ((("exempt_interest_dividends" IS NULL) OR ("exempt_interest_dividends" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_federal_withholding_check" CHECK ((("federal_income_tax_withheld" IS NULL) OR ("federal_income_tax_withheld" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_foreign_country_check" CHECK ((("foreign_country_or_us_possession" IS NULL) OR (("length"(TRIM(BOTH FROM "foreign_country_or_us_possession")) >= 2) AND ("length"(TRIM(BOTH FROM "foreign_country_or_us_possession")) <= 100)))),
    CONSTRAINT "organizer_income_1099_div_foreign_tax_check" CHECK ((("foreign_tax_paid" IS NULL) OR ("foreign_tax_paid" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_investment_expenses_check" CHECK ((("investment_expenses" IS NULL) OR ("investment_expenses" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_nondividend_check" CHECK ((("nondividend_distributions" IS NULL) OR ("nondividend_distributions" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_ordinary_check" CHECK ((("total_ordinary_dividends" IS NULL) OR ("total_ordinary_dividends" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_payer_id_check" CHECK ((("payer_identification_number" IS NULL) OR (("length"(TRIM(BOTH FROM "payer_identification_number")) >= 2) AND ("length"(TRIM(BOTH FROM "payer_identification_number")) <= 32)))),
    CONSTRAINT "organizer_income_1099_div_private_activity_check" CHECK ((("specified_private_activity_bond_interest_dividends" IS NULL) OR ("specified_private_activity_bond_interest_dividends" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_qualified_check" CHECK ((("qualified_dividends" IS NULL) OR ("qualified_dividends" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_div_state_code_check" CHECK ((("state_code" IS NULL) OR ("state_code" ~ '^[A-Z]{2}$'::"text"))),
    CONSTRAINT "organizer_income_1099_div_state_id_check" CHECK ((("state_identification_number" IS NULL) OR (("length"(TRIM(BOTH FROM "state_identification_number")) >= 1) AND ("length"(TRIM(BOTH FROM "state_identification_number")) <= 40)))),
    CONSTRAINT "organizer_income_1099_div_state_tax_check" CHECK ((("state_tax_withheld" IS NULL) OR ("state_tax_withheld" >= (0)::numeric)))
);


ALTER TABLE "public"."client_tax_organizer_income_1099_div_details" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_tax_organizer_income_1099_div_details" IS 'One-to-one Form 1099-DIV detail records associated with organizer income sources whose income_type is 1099_div.';



CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_income_1099_int_details" (
    "income_source_id" "uuid" NOT NULL,
    "payer_identification_number" "text",
    "interest_income" numeric(14,2),
    "early_withdrawal_penalty" numeric(14,2),
    "interest_on_us_savings_bonds_and_treasury_obligations" numeric(14,2),
    "federal_income_tax_withheld" numeric(14,2),
    "investment_expenses" numeric(14,2),
    "foreign_tax_paid" numeric(14,2),
    "foreign_country_or_us_possession" "text",
    "tax_exempt_interest" numeric(14,2),
    "specified_private_activity_bond_interest" numeric(14,2),
    "market_discount" numeric(14,2),
    "bond_premium" numeric(14,2),
    "bond_premium_on_treasury_obligations" numeric(14,2),
    "bond_premium_on_tax_exempt_bond" numeric(14,2),
    "state_code" "text",
    "state_identification_number" "text",
    "state_tax_withheld" numeric(14,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "organizer_income_1099_int_bond_premium_check" CHECK ((("bond_premium" IS NULL) OR ("bond_premium" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_int_early_penalty_check" CHECK ((("early_withdrawal_penalty" IS NULL) OR ("early_withdrawal_penalty" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_int_federal_withholding_check" CHECK ((("federal_income_tax_withheld" IS NULL) OR ("federal_income_tax_withheld" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_int_foreign_country_check" CHECK ((("foreign_country_or_us_possession" IS NULL) OR (("length"(TRIM(BOTH FROM "foreign_country_or_us_possession")) >= 2) AND ("length"(TRIM(BOTH FROM "foreign_country_or_us_possession")) <= 100)))),
    CONSTRAINT "organizer_income_1099_int_foreign_tax_check" CHECK ((("foreign_tax_paid" IS NULL) OR ("foreign_tax_paid" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_int_interest_check" CHECK ((("interest_income" IS NULL) OR ("interest_income" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_int_investment_expenses_check" CHECK ((("investment_expenses" IS NULL) OR ("investment_expenses" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_int_market_discount_check" CHECK ((("market_discount" IS NULL) OR ("market_discount" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_int_payer_id_check" CHECK ((("payer_identification_number" IS NULL) OR (("length"(TRIM(BOTH FROM "payer_identification_number")) >= 2) AND ("length"(TRIM(BOTH FROM "payer_identification_number")) <= 32)))),
    CONSTRAINT "organizer_income_1099_int_private_activity_check" CHECK ((("specified_private_activity_bond_interest" IS NULL) OR ("specified_private_activity_bond_interest" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_int_savings_bonds_check" CHECK ((("interest_on_us_savings_bonds_and_treasury_obligations" IS NULL) OR ("interest_on_us_savings_bonds_and_treasury_obligations" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_int_state_code_check" CHECK ((("state_code" IS NULL) OR ("state_code" ~ '^[A-Z]{2}$'::"text"))),
    CONSTRAINT "organizer_income_1099_int_state_id_check" CHECK ((("state_identification_number" IS NULL) OR (("length"(TRIM(BOTH FROM "state_identification_number")) >= 1) AND ("length"(TRIM(BOTH FROM "state_identification_number")) <= 40)))),
    CONSTRAINT "organizer_income_1099_int_state_tax_check" CHECK ((("state_tax_withheld" IS NULL) OR ("state_tax_withheld" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_int_tax_exempt_check" CHECK ((("tax_exempt_interest" IS NULL) OR ("tax_exempt_interest" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_int_tax_exempt_premium_check" CHECK ((("bond_premium_on_tax_exempt_bond" IS NULL) OR ("bond_premium_on_tax_exempt_bond" >= (0)::numeric))),
    CONSTRAINT "organizer_income_1099_int_treasury_premium_check" CHECK ((("bond_premium_on_treasury_obligations" IS NULL) OR ("bond_premium_on_treasury_obligations" >= (0)::numeric)))
);


ALTER TABLE "public"."client_tax_organizer_income_1099_int_details" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_tax_organizer_income_1099_int_details" IS 'One-to-one Form 1099-INT detail records associated with organizer income sources whose income_type is 1099_int.';



CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_income_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "income_source_id" "uuid" NOT NULL,
    "review_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "internal_notes" "text" DEFAULT ''::"text" NOT NULL,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "follow_up_requested_by" "uuid",
    "follow_up_requested_at" timestamp with time zone,
    "returned_to_client_by" "uuid",
    "returned_to_client_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "income_reviews_follow_up_fields_valid" CHECK ((("review_status" <> 'needs_follow_up'::"text") OR (("follow_up_requested_by" IS NOT NULL) AND ("follow_up_requested_at" IS NOT NULL)))),
    CONSTRAINT "income_reviews_notes_length" CHECK (("char_length"("internal_notes") <= 10000)),
    CONSTRAINT "income_reviews_returned_fields_valid" CHECK ((("review_status" <> 'returned_to_client'::"text") OR (("returned_to_client_by" IS NOT NULL) AND ("returned_to_client_at" IS NOT NULL)))),
    CONSTRAINT "income_reviews_reviewed_fields_valid" CHECK ((("review_status" <> 'reviewed'::"text") OR (("reviewed_by" IS NOT NULL) AND ("reviewed_at" IS NOT NULL)))),
    CONSTRAINT "income_reviews_status_valid" CHECK (("review_status" = ANY (ARRAY['pending'::"text", 'reviewed'::"text", 'needs_follow_up'::"text", 'returned_to_client'::"text"])))
);

ALTER TABLE ONLY "public"."client_tax_organizer_income_reviews" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_income_reviews" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_tax_organizer_income_reviews" IS 'Stores staff-only review status and internal notes separately from client-entered Income data.';



CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_income_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "income_type" "text" NOT NULL,
    "payer_name" "text" NOT NULL,
    "recipient_type" "text" DEFAULT 'taxpayer'::"text" NOT NULL,
    "record_status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "document_received" boolean DEFAULT false NOT NULL,
    "notes" "text",
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "organizer_income_display_order_check" CHECK (("display_order" >= 0)),
    CONSTRAINT "organizer_income_notes_length_check" CHECK ((("notes" IS NULL) OR ("length"("notes") <= 4000))),
    CONSTRAINT "organizer_income_payer_name_check" CHECK ((("length"(TRIM(BOTH FROM "payer_name")) >= 1) AND ("length"(TRIM(BOTH FROM "payer_name")) <= 200))),
    CONSTRAINT "organizer_income_recipient_type_check" CHECK (("recipient_type" = ANY (ARRAY['taxpayer'::"text", 'spouse'::"text", 'dependent'::"text", 'joint'::"text"]))),
    CONSTRAINT "organizer_income_record_status_check" CHECK (("record_status" = ANY (ARRAY['draft'::"text", 'complete'::"text", 'needs_review'::"text"]))),
    CONSTRAINT "organizer_income_type_check" CHECK (("income_type" = ANY (ARRAY['w2'::"text", '1099_nec'::"text", '1099_misc'::"text", '1099_k'::"text", '1099_int'::"text", '1099_div'::"text", '1099_r'::"text", 'ssa_1099'::"text", '1099_g'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."client_tax_organizer_income_sources" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_tax_organizer_income_sources" IS 'Stores the common, non-sensitive information shared by all organizer income sources. Form-specific values are stored in dedicated detail tables.';



COMMENT ON COLUMN "public"."client_tax_organizer_income_sources"."income_type" IS 'IRS income-document or income-source category used to select the corresponding detail workflow.';



COMMENT ON COLUMN "public"."client_tax_organizer_income_sources"."recipient_type" IS 'Identifies whether the income belongs to the taxpayer, spouse, dependent, or a joint recipient.';



COMMENT ON COLUMN "public"."client_tax_organizer_income_sources"."record_status" IS 'Validation status for the individual income record.';



COMMENT ON COLUMN "public"."client_tax_organizer_income_sources"."document_received" IS 'Indicates whether the supporting tax document has been received or uploaded.';



CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_income_w2_details" (
    "income_source_id" "uuid" NOT NULL,
    "employer_identification_number" "text",
    "wages" numeric(14,2),
    "federal_income_tax_withheld" numeric(14,2),
    "social_security_wages" numeric(14,2),
    "social_security_tax_withheld" numeric(14,2),
    "medicare_wages" numeric(14,2),
    "medicare_tax_withheld" numeric(14,2),
    "state_code" "text",
    "state_wages" numeric(14,2),
    "state_income_tax_withheld" numeric(14,2),
    "local_wages" numeric(14,2),
    "local_income_tax_withheld" numeric(14,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "organizer_income_w2_ein_check" CHECK ((("employer_identification_number" IS NULL) OR ("employer_identification_number" ~ '^[0-9]{2}-?[0-9]{7}$'::"text"))),
    CONSTRAINT "organizer_income_w2_federal_withholding_check" CHECK ((("federal_income_tax_withheld" IS NULL) OR ("federal_income_tax_withheld" >= (0)::numeric))),
    CONSTRAINT "organizer_income_w2_local_tax_check" CHECK ((("local_income_tax_withheld" IS NULL) OR ("local_income_tax_withheld" >= (0)::numeric))),
    CONSTRAINT "organizer_income_w2_local_wages_check" CHECK ((("local_wages" IS NULL) OR ("local_wages" >= (0)::numeric))),
    CONSTRAINT "organizer_income_w2_medicare_tax_check" CHECK ((("medicare_tax_withheld" IS NULL) OR ("medicare_tax_withheld" >= (0)::numeric))),
    CONSTRAINT "organizer_income_w2_medicare_wages_check" CHECK ((("medicare_wages" IS NULL) OR ("medicare_wages" >= (0)::numeric))),
    CONSTRAINT "organizer_income_w2_social_security_tax_check" CHECK ((("social_security_tax_withheld" IS NULL) OR ("social_security_tax_withheld" >= (0)::numeric))),
    CONSTRAINT "organizer_income_w2_social_security_wages_check" CHECK ((("social_security_wages" IS NULL) OR ("social_security_wages" >= (0)::numeric))),
    CONSTRAINT "organizer_income_w2_state_code_check" CHECK ((("state_code" IS NULL) OR ("state_code" ~ '^[A-Z]{2}$'::"text"))),
    CONSTRAINT "organizer_income_w2_state_tax_check" CHECK ((("state_income_tax_withheld" IS NULL) OR ("state_income_tax_withheld" >= (0)::numeric))),
    CONSTRAINT "organizer_income_w2_state_wages_check" CHECK ((("state_wages" IS NULL) OR ("state_wages" >= (0)::numeric))),
    CONSTRAINT "organizer_income_w2_wages_check" CHECK ((("wages" IS NULL) OR ("wages" >= (0)::numeric)))
);


ALTER TABLE "public"."client_tax_organizer_income_w2_details" OWNER TO "postgres";


COMMENT ON TABLE "public"."client_tax_organizer_income_w2_details" IS 'Stores the non-sensitive W-2 values associated with an organizer income source. Employee SSNs are not stored in this table.';



COMMENT ON COLUMN "public"."client_tax_organizer_income_w2_details"."employer_identification_number" IS 'Employer EIN shown on the W-2. Employee Social Security numbers must never be stored here.';



CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_personal_information" (
    "organizer_id" "uuid" NOT NULL,
    "legal_first_name" "text",
    "legal_middle_name" "text",
    "legal_last_name" "text",
    "preferred_name" "text",
    "birth_date" "date",
    "filing_status" "text",
    "occupation" "text",
    "email" "text",
    "mobile_phone" "text",
    "alternate_phone" "text",
    "address_line_1" "text",
    "address_line_2" "text",
    "city" "text",
    "state" "text",
    "postal_code" "text",
    "address_changed_this_year" boolean,
    "marital_status_changed_this_year" boolean,
    "employer_changed_this_year" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."client_tax_organizer_personal_information" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."client_tax_organizer_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "section_key" "public"."tax_organizer_section_key" NOT NULL,
    "status" "public"."tax_organizer_section_status" DEFAULT 'not_started'::"public"."tax_organizer_section_status" NOT NULL,
    "progress_percentage" integer DEFAULT 0 NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "last_saved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "client_tax_organizer_sections_progress_valid" CHECK ((("progress_percentage" >= 0) AND ("progress_percentage" <= 100)))
);


ALTER TABLE "public"."client_tax_organizer_sections" OWNER TO "postgres";


ALTER TABLE "public"."clients" ALTER COLUMN "client_number" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."clients_client_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_access_log" (
    "id" bigint NOT NULL,
    "document_id" "uuid" NOT NULL,
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "details" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."document_access_log" OWNER TO "postgres";


ALTER TABLE "public"."document_access_log" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_access_log_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_activity" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "performed_by" "uuid",
    "action" "text" NOT NULL,
    "details" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."document_activity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_analysis_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "actor_id" "uuid",
    "previous_status" "text",
    "new_status" "text",
    "message" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "document_analysis_event_type_valid" CHECK (("event_type" = ANY (ARRAY['job_created'::"text", 'job_queued'::"text", 'processing_started'::"text", 'processing_completed'::"text", 'review_required'::"text", 'processing_failed'::"text", 'job_cancelled'::"text", 'result_reviewed'::"text", 'field_reviewed'::"text"])))
);

ALTER TABLE ONLY "public"."document_analysis_events" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_analysis_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_analysis_extracted_fields" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "result_id" "uuid" NOT NULL,
    "field_key" "text" NOT NULL,
    "display_label" "text" NOT NULL,
    "extracted_value" "text",
    "normalized_value" "text",
    "confidence" numeric(5,4),
    "page_number" integer,
    "bounding_box" "jsonb",
    "source_text" "text",
    "staff_decision" "text" DEFAULT 'pending'::"text" NOT NULL,
    "accepted_value" "text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "document_analysis_field_confidence_valid" CHECK ((("confidence" IS NULL) OR (("confidence" >= (0)::numeric) AND ("confidence" <= (1)::numeric)))),
    CONSTRAINT "document_analysis_field_decision_valid" CHECK (("staff_decision" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'corrected'::"text", 'rejected'::"text"]))),
    CONSTRAINT "document_analysis_field_key_valid" CHECK (("field_key" ~ '^[a-z][a-z0-9_]*$'::"text"))
);

ALTER TABLE ONLY "public"."document_analysis_extracted_fields" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_analysis_extracted_fields" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_analysis_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "organizer_id" "uuid",
    "evidence_id" "uuid",
    "provider_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "requested_by" "uuid",
    "requested_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "queued_at" timestamp with time zone,
    "processing_started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "attempt_count" integer DEFAULT 0 NOT NULL,
    "max_attempts" integer DEFAULT 3 NOT NULL,
    "provider_job_reference" "text",
    "failure_code" "text",
    "failure_message" "text",
    "request_metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "document_analysis_job_attempts_valid" CHECK ((("attempt_count" >= 0) AND ("max_attempts" > 0) AND ("attempt_count" <= "max_attempts"))),
    CONSTRAINT "document_analysis_job_status_valid" CHECK (("status" = ANY (ARRAY['pending'::"text", 'queued'::"text", 'processing'::"text", 'completed'::"text", 'review_required'::"text", 'failed'::"text", 'cancelled'::"text"])))
);

ALTER TABLE ONLY "public"."document_analysis_jobs" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_analysis_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_analysis_providers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider_key" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "provider_type" "text" NOT NULL,
    "is_enabled" boolean DEFAULT false NOT NULL,
    "configuration" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "document_analysis_provider_key_valid" CHECK (("provider_key" ~ '^[a-z][a-z0-9_]*$'::"text")),
    CONSTRAINT "document_analysis_provider_type_valid" CHECK (("provider_type" = ANY (ARRAY['manual'::"text", 'azure_document_intelligence'::"text", 'aws_textract'::"text", 'google_document_ai'::"text", 'custom'::"text"])))
);

ALTER TABLE ONLY "public"."document_analysis_providers" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_analysis_providers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_analysis_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid" NOT NULL,
    "document_type" "text",
    "overall_confidence" numeric(5,4),
    "page_count" integer,
    "raw_provider_result" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "normalized_result" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "requires_staff_review" boolean DEFAULT true NOT NULL,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "review_outcome" "text",
    "review_notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "document_analysis_result_confidence_valid" CHECK ((("overall_confidence" IS NULL) OR (("overall_confidence" >= (0)::numeric) AND ("overall_confidence" <= (1)::numeric)))),
    CONSTRAINT "document_analysis_result_outcome_valid" CHECK ((("review_outcome" IS NULL) OR ("review_outcome" = ANY (ARRAY['accepted'::"text", 'partially_accepted'::"text", 'rejected'::"text", 'needs_reprocessing'::"text"]))))
);

ALTER TABLE ONLY "public"."document_analysis_results" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_analysis_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "display_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "document_categories_code_not_blank" CHECK (("length"(TRIM(BOTH FROM "code")) > 0)),
    CONSTRAINT "document_categories_name_not_blank" CHECK (("length"(TRIM(BOTH FROM "name")) > 0))
);


ALTER TABLE "public"."document_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient_user_id" "uuid" NOT NULL,
    "actor_user_id" "uuid",
    "document_id" "uuid",
    "client_id" "uuid",
    "tax_return_id" "uuid",
    "notification_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "read_at" timestamp with time zone,
    "archived_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "document_notifications_type_check" CHECK (("notification_type" = ANY (ARRAY['document_review_requested'::"text", 'document_approved'::"text", 'document_changes_requested'::"text", 'document_review_reset'::"text", 'document_review_reassigned'::"text", 'document_review_overdue'::"text"])))
);


ALTER TABLE "public"."document_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'other'::"text" NOT NULL,
    "default_required" boolean DEFAULT false NOT NULL,
    "supports_multiple" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "document_types_category_valid" CHECK (("category" = ANY (ARRAY['identity'::"text", 'income'::"text", 'deduction'::"text", 'business'::"text", 'investment'::"text", 'retirement'::"text", 'prior_year'::"text", 'organizer'::"text", 'signature'::"text", 'other'::"text"]))),
    CONSTRAINT "document_types_code_not_blank" CHECK (("length"(TRIM(BOTH FROM "code")) > 0)),
    CONSTRAINT "document_types_name_not_blank" CHECK (("length"(TRIM(BOTH FROM "name")) > 0)),
    CONSTRAINT "document_types_sort_order_nonnegative" CHECK (("sort_order" >= 0))
);


ALTER TABLE "public"."document_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "assignment_notifications" boolean DEFAULT true NOT NULL,
    "client_notifications" boolean DEFAULT true NOT NULL,
    "return_notifications" boolean DEFAULT true NOT NULL,
    "payment_notifications" boolean DEFAULT true NOT NULL,
    "system_notifications" boolean DEFAULT true NOT NULL,
    "high_priority_notifications" boolean DEFAULT true NOT NULL,
    "security_notifications" boolean DEFAULT true NOT NULL,
    "browser_notifications" boolean DEFAULT false NOT NULL,
    "email_notifications" boolean DEFAULT false NOT NULL,
    "daily_digest" boolean DEFAULT false NOT NULL,
    "weekly_digest" boolean DEFAULT false NOT NULL,
    "quiet_hours_enabled" boolean DEFAULT false NOT NULL,
    "quiet_hours_start" time without time zone,
    "quiet_hours_end" time without time zone,
    "badge_counter" boolean DEFAULT true NOT NULL,
    "notification_sound" boolean DEFAULT true NOT NULL,
    "desktop_toasts" boolean DEFAULT true NOT NULL,
    "auto_mark_read" boolean DEFAULT false NOT NULL,
    "retention_days" integer DEFAULT 90 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient_user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "category" "text" DEFAULT 'system'::"text" NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text" NOT NULL,
    "action_url" "text",
    "related_entity_id" "uuid",
    "related_entity_type" "text",
    "is_read" boolean DEFAULT false NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "notifications_category_check" CHECK (("category" = ANY (ARRAY['assignment'::"text", 'deadline'::"text", 'payment'::"text", 'client'::"text", 'document'::"text", 'system'::"text"]))),
    CONSTRAINT "notifications_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "notifications_read_state_check" CHECK (((("is_read" = false) AND ("read_at" IS NULL)) OR (("is_read" = true) AND ("read_at" IS NOT NULL))))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


COMMENT ON COLUMN "public"."notifications"."is_archived" IS 'Indicates whether the notification has been archived by its recipient.';



COMMENT ON COLUMN "public"."notifications"."archived_at" IS 'Timestamp when the notification was archived. Null when active.';



COMMENT ON COLUMN "public"."notifications"."deleted_at" IS 'Soft-delete timestamp. Null means the notification has not been deleted.';



CREATE TABLE IF NOT EXISTS "public"."organizer_evidence_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "evidence_id" "uuid" NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "section_key" "text" NOT NULL,
    "subject_type" "text" NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "field_key" "text",
    "link_type" "text" DEFAULT 'supports'::"text" NOT NULL,
    "notes" "text",
    "linked_by" "uuid",
    "linked_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "organizer_evidence_link_field_valid" CHECK ((("field_key" IS NULL) OR ("field_key" ~ '^[a-z][a-z0-9_]*$'::"text"))),
    CONSTRAINT "organizer_evidence_link_notes_length" CHECK ((("notes" IS NULL) OR ("char_length"("notes") <= 5000))),
    CONSTRAINT "organizer_evidence_link_section_valid" CHECK (("section_key" = ANY (ARRAY['personal_information'::"text", 'filing_status'::"text", 'dependents'::"text", 'income'::"text", 'healthcare'::"text", 'deductions'::"text", 'credits'::"text", 'business'::"text", 'investments'::"text", 'banking'::"text", 'documents'::"text", 'final_review'::"text"]))),
    CONSTRAINT "organizer_evidence_link_subject_valid" CHECK (("subject_type" = ANY (ARRAY['organizer'::"text", 'personal_information'::"text", 'filing_status'::"text", 'dependent'::"text", 'income_source'::"text", 'healthcare_record'::"text", 'deduction'::"text", 'credit'::"text", 'business_record'::"text", 'investment_record'::"text", 'banking_record'::"text", 'document'::"text"]))),
    CONSTRAINT "organizer_evidence_link_type_valid" CHECK (("link_type" = ANY (ARRAY['supports'::"text", 'contradicts'::"text", 'replaces'::"text", 'reference'::"text"])))
);

ALTER TABLE ONLY "public"."organizer_evidence_links" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizer_evidence_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizer_evidence_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "return_id" "uuid",
    "document_id" "uuid",
    "evidence_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "confidence" "text" DEFAULT 'unverified'::"text" NOT NULL,
    "verification_status" "text" DEFAULT 'unverified'::"text" NOT NULL,
    "created_by" "uuid",
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "organizer_evidence_confidence_valid" CHECK (("confidence" = ANY (ARRAY['high'::"text", 'medium'::"text", 'low'::"text", 'unverified'::"text"]))),
    CONSTRAINT "organizer_evidence_status_valid" CHECK (("verification_status" = ANY (ARRAY['unverified'::"text", 'under_review'::"text", 'verified'::"text", 'rejected'::"text", 'needs_replacement'::"text"]))),
    CONSTRAINT "organizer_evidence_title_required" CHECK (("char_length"(TRIM(BOTH FROM "title")) > 0)),
    CONSTRAINT "organizer_evidence_type_required" CHECK (("char_length"(TRIM(BOTH FROM "evidence_type")) > 0)),
    CONSTRAINT "organizer_evidence_verification_valid" CHECK ((("verification_status" <> 'verified'::"text") OR (("verified_by" IS NOT NULL) AND ("verified_at" IS NOT NULL))))
);

ALTER TABLE ONLY "public"."organizer_evidence_sources" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizer_evidence_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizer_evidence_verification_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "evidence_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "actor_id" "uuid",
    "note" "text",
    "previous_confidence" "text",
    "new_confidence" "text",
    "previous_status" "text",
    "new_status" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "organizer_evidence_event_action_valid" CHECK (("action" = ANY (ARRAY['created'::"text", 'verification_started'::"text", 'verified'::"text", 'rejected'::"text", 'replacement_requested'::"text", 'confidence_changed'::"text", 'link_added'::"text", 'link_removed'::"text", 'status_changed'::"text"]))),
    CONSTRAINT "organizer_evidence_event_new_confidence_valid" CHECK ((("new_confidence" IS NULL) OR ("new_confidence" = ANY (ARRAY['high'::"text", 'medium'::"text", 'low'::"text", 'unverified'::"text"])))),
    CONSTRAINT "organizer_evidence_event_new_status_valid" CHECK ((("new_status" IS NULL) OR ("new_status" = ANY (ARRAY['unverified'::"text", 'under_review'::"text", 'verified'::"text", 'rejected'::"text", 'needs_replacement'::"text"])))),
    CONSTRAINT "organizer_evidence_event_note_length" CHECK ((("note" IS NULL) OR ("char_length"("note") <= 10000))),
    CONSTRAINT "organizer_evidence_event_previous_confidence_valid" CHECK ((("previous_confidence" IS NULL) OR ("previous_confidence" = ANY (ARRAY['high'::"text", 'medium'::"text", 'low'::"text", 'unverified'::"text"])))),
    CONSTRAINT "organizer_evidence_event_previous_status_valid" CHECK ((("previous_status" IS NULL) OR ("previous_status" = ANY (ARRAY['unverified'::"text", 'under_review'::"text", 'verified'::"text", 'rejected'::"text", 'needs_replacement'::"text"]))))
);

ALTER TABLE ONLY "public"."organizer_evidence_verification_events" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizer_evidence_verification_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizer_review_checklist_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section_key" "text" NOT NULL,
    "subject_type" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "version" integer DEFAULT 1 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "review_checklist_definition_name_required" CHECK (("char_length"(TRIM(BOTH FROM "name")) > 0)),
    CONSTRAINT "review_checklist_definition_section_valid" CHECK (("section_key" = ANY (ARRAY['income'::"text", 'dependents'::"text", 'healthcare'::"text", 'deductions'::"text", 'credits'::"text", 'business'::"text", 'investments'::"text", 'final_review'::"text"]))),
    CONSTRAINT "review_checklist_definition_subject_valid" CHECK (("subject_type" = ANY (ARRAY['income_source'::"text", 'dependent'::"text", 'healthcare_record'::"text", 'deduction'::"text", 'credit'::"text", 'business_record'::"text", 'investment_record'::"text", 'organizer'::"text"]))),
    CONSTRAINT "review_checklist_definition_version_valid" CHECK (("version" > 0))
);

ALTER TABLE ONLY "public"."organizer_review_checklist_definitions" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizer_review_checklist_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizer_review_checklist_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "definition_id" "uuid" NOT NULL,
    "item_key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "is_required" boolean DEFAULT true NOT NULL,
    "display_order" integer NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "review_checklist_item_key_required" CHECK (("char_length"(TRIM(BOTH FROM "item_key")) > 0)),
    CONSTRAINT "review_checklist_item_label_required" CHECK (("char_length"(TRIM(BOTH FROM "label")) > 0)),
    CONSTRAINT "review_checklist_item_order_valid" CHECK (("display_order" >= 0))
);

ALTER TABLE ONLY "public"."organizer_review_checklist_items" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizer_review_checklist_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizer_review_checklist_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "subject_type" "text" NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "checklist_item_id" "uuid" NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "completed_by" "uuid",
    "completed_at" timestamp with time zone,
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "review_checklist_response_completion_valid" CHECK (((("is_completed" = false) AND ("completed_at" IS NULL)) OR (("is_completed" = true) AND ("completed_by" IS NOT NULL) AND ("completed_at" IS NOT NULL)))),
    CONSTRAINT "review_checklist_response_subject_valid" CHECK (("subject_type" = ANY (ARRAY['income_source'::"text", 'dependent'::"text", 'healthcare_record'::"text", 'deduction'::"text", 'credit'::"text", 'business_record'::"text", 'investment_record'::"text", 'organizer'::"text"])))
);

ALTER TABLE ONLY "public"."organizer_review_checklist_responses" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizer_review_checklist_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizer_review_timeline_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "section_key" "text" NOT NULL,
    "subject_type" "text" NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "note_text" "text",
    "actor_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "organizer_review_timeline_event_type_valid" CHECK (("event_type" = ANY (ARRAY['staff_note'::"text", 'marked_reviewed'::"text", 'needs_follow_up'::"text", 'returned_to_client'::"text", 'resubmitted'::"text", 'status_changed'::"text"]))),
    CONSTRAINT "organizer_review_timeline_note_length" CHECK ((("note_text" IS NULL) OR ("char_length"("note_text") <= 10000))),
    CONSTRAINT "organizer_review_timeline_note_required" CHECK ((("event_type" <> 'staff_note'::"text") OR (("note_text" IS NOT NULL) AND ("char_length"(TRIM(BOTH FROM "note_text")) > 0)))),
    CONSTRAINT "organizer_review_timeline_section_valid" CHECK (("section_key" = ANY (ARRAY['income'::"text", 'dependents'::"text", 'healthcare'::"text", 'deductions'::"text", 'credits'::"text", 'business'::"text", 'investments'::"text", 'final_review'::"text"]))),
    CONSTRAINT "organizer_review_timeline_subject_type_valid" CHECK (("subject_type" = ANY (ARRAY['income_source'::"text", 'dependent'::"text", 'healthcare_record'::"text", 'deduction'::"text", 'credit'::"text", 'business_record'::"text", 'investment_record'::"text", 'organizer'::"text"])))
);

ALTER TABLE ONLY "public"."organizer_review_timeline_entries" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizer_review_timeline_entries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."payment_receipt_sequence"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."payment_receipt_sequence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "display_name" "text",
    "phone" "text",
    "role" "public"."app_role" DEFAULT 'read_only'::"public"."app_role" NOT NULL,
    "is_active" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE ONLY "public"."profiles" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'Application profile and role information for authenticated staff.';



CREATE TABLE IF NOT EXISTS "public"."required_document_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "return_type" "public"."return_type",
    "tax_form" "public"."tax_form_type",
    "is_required" boolean DEFAULT true NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "matching_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "required_document_templates_category_allowed" CHECK (("category" = ANY (ARRAY['identity'::"text", 'income'::"text", 'deductions'::"text", 'business'::"text", 'irs_notice'::"text", 'prior_return'::"text", 'engagement'::"text", 'internal'::"text", 'miscellaneous'::"text"]))),
    CONSTRAINT "required_document_templates_name_not_blank" CHECK (("length"(TRIM(BOTH FROM "name")) > 0)),
    CONSTRAINT "required_document_templates_sort_order_nonnegative" CHECK (("sort_order" >= 0))
);


ALTER TABLE "public"."required_document_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."return_required_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tax_return_id" "uuid" NOT NULL,
    "template_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "is_required" boolean DEFAULT true NOT NULL,
    "is_complete" boolean DEFAULT false NOT NULL,
    "matched_document_id" "uuid",
    "completed_at" timestamp with time zone,
    "completed_by" "uuid",
    "notes" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "return_required_documents_category_allowed" CHECK (("category" = ANY (ARRAY['identity'::"text", 'income'::"text", 'deductions'::"text", 'business'::"text", 'irs_notice'::"text", 'prior_return'::"text", 'engagement'::"text", 'internal'::"text", 'miscellaneous'::"text"]))),
    CONSTRAINT "return_required_documents_completion_consistent" CHECK (((("is_complete" = false) AND ("completed_at" IS NULL)) OR (("is_complete" = true) AND ("completed_at" IS NOT NULL)))),
    CONSTRAINT "return_required_documents_name_not_blank" CHECK (("length"(TRIM(BOTH FROM "name")) > 0)),
    CONSTRAINT "return_required_documents_sort_order_nonnegative" CHECK (("sort_order" >= 0))
);


ALTER TABLE "public"."return_required_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."return_workflow_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tax_return_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "event_label" "text" NOT NULL,
    "event_description" "text",
    "previous_status" "text",
    "new_status" "text",
    "actor_user_id" "uuid",
    "is_client_visible" boolean DEFAULT true NOT NULL,
    "event_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "return_workflow_history_event_data_is_object" CHECK (("jsonb_typeof"("event_data") = 'object'::"text")),
    CONSTRAINT "return_workflow_history_event_label_not_blank" CHECK (("length"(TRIM(BOTH FROM "event_label")) > 0)),
    CONSTRAINT "return_workflow_history_event_type_not_blank" CHECK (("length"(TRIM(BOTH FROM "event_type")) > 0))
);


ALTER TABLE "public"."return_workflow_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tax_package_template_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_id" "uuid" NOT NULL,
    "document_type_id" "uuid" NOT NULL,
    "requirement_level" "text" DEFAULT 'required'::"text" NOT NULL,
    "instructions" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tax_package_template_items_requirement_valid" CHECK (("requirement_level" = ANY (ARRAY['required'::"text", 'conditional'::"text", 'optional'::"text"]))),
    CONSTRAINT "tax_package_template_items_sort_order_nonnegative" CHECK (("sort_order" >= 0))
);


ALTER TABLE "public"."tax_package_template_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tax_package_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "return_form" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tax_package_templates_code_not_blank" CHECK (("length"(TRIM(BOTH FROM "code")) > 0)),
    CONSTRAINT "tax_package_templates_name_not_blank" CHECK (("length"(TRIM(BOTH FROM "name")) > 0)),
    CONSTRAINT "tax_package_templates_return_form_not_blank" CHECK (("length"(TRIM(BOTH FROM "return_form")) > 0))
);


ALTER TABLE "public"."tax_package_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tax_return_activity" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "return_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "actor_id" "uuid",
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tax_return_activity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vault_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vault_secret_id" "uuid",
    "client_id" "uuid",
    "organizer_id" "uuid",
    "secret_type" "text",
    "actor_user_id" "uuid",
    "action" "text" NOT NULL,
    "outcome" "text" DEFAULT 'success'::"text" NOT NULL,
    "reason" "text",
    "source" "text" DEFAULT 'edge_function'::"text" NOT NULL,
    "request_id" "uuid",
    "session_id" "text",
    "ip_address" "inet",
    "user_agent" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "dependent_id" "uuid",
    CONSTRAINT "vault_audit_log_action_check" CHECK (("action" = ANY (ARRAY['create'::"text", 'replace'::"text", 'view_masked'::"text", 'view_full'::"text", 'verify'::"text", 'reject'::"text", 'archive'::"text", 'access_denied'::"text", 'decrypt_failed'::"text", 'encrypt_failed'::"text"]))),
    CONSTRAINT "vault_audit_log_metadata_object" CHECK (("jsonb_typeof"("metadata") = 'object'::"text")),
    CONSTRAINT "vault_audit_log_outcome_check" CHECK (("outcome" = ANY (ARRAY['success'::"text", 'failure'::"text", 'denied'::"text"]))),
    CONSTRAINT "vault_audit_log_reason_length" CHECK ((("reason" IS NULL) OR ("length"("reason") <= 1000))),
    CONSTRAINT "vault_audit_log_secret_type_check" CHECK ((("secret_type" IS NULL) OR ("secret_type" = ANY (ARRAY['social_security_number'::"text", 'dependent_social_security_number'::"text", 'itin'::"text", 'drivers_license'::"text", 'passport'::"text", 'state_identification'::"text", 'routing_number'::"text", 'bank_account_number'::"text", 'identity_protection_pin'::"text", 'employer_identification_number'::"text"])))),
    CONSTRAINT "vault_audit_log_session_length" CHECK ((("session_id" IS NULL) OR ("length"("session_id") <= 512))),
    CONSTRAINT "vault_audit_log_source_check" CHECK (("source" = ANY (ARRAY['client_portal'::"text", 'staff_portal'::"text", 'admin_portal'::"text", 'edge_function'::"text", 'system'::"text", 'migration'::"text"]))),
    CONSTRAINT "vault_audit_log_user_agent_length" CHECK ((("user_agent" IS NULL) OR ("length"("user_agent") <= 2000)))
);


ALTER TABLE "public"."vault_audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."vault_audit_log" IS 'Append-only audit history for Secure Vault operations. Audit records must never contain plaintext secret values.';



COMMENT ON COLUMN "public"."vault_audit_log"."vault_secret_id" IS 'Vault record associated with the event. This may be null for denied or failed requests that did not resolve a record.';



COMMENT ON COLUMN "public"."vault_audit_log"."actor_user_id" IS 'Authenticated user responsible for the vault operation.';



COMMENT ON COLUMN "public"."vault_audit_log"."action" IS 'Security-sensitive action attempted or completed.';



COMMENT ON COLUMN "public"."vault_audit_log"."outcome" IS 'Result of the audited action: success, failure, or denied.';



COMMENT ON COLUMN "public"."vault_audit_log"."reason" IS 'Business justification supplied for sensitive access when required.';



COMMENT ON COLUMN "public"."vault_audit_log"."request_id" IS 'Correlation identifier used to trace the operation across services.';



COMMENT ON COLUMN "public"."vault_audit_log"."metadata" IS 'Non-sensitive structured operational metadata. Plaintext secrets are prohibited.';



COMMENT ON COLUMN "public"."vault_audit_log"."dependent_id" IS 'Optional dependent associated with the audited Secure Vault operation.';



CREATE TABLE IF NOT EXISTS "public"."vault_key_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key_version" integer NOT NULL,
    "algorithm" "text" NOT NULL,
    "active" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "retired_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "activated_at" timestamp with time zone,
    "description" "text",
    CONSTRAINT "vault_key_versions_active_retirement_check" CHECK (((NOT "active") OR ("retired_at" IS NULL))),
    CONSTRAINT "vault_key_versions_algorithm_check" CHECK (("algorithm" = 'AES-256-GCM'::"text")),
    CONSTRAINT "vault_key_versions_description_length" CHECK ((("description" IS NULL) OR ("length"("description") <= 1000))),
    CONSTRAINT "vault_key_versions_key_version_positive" CHECK (("key_version" > 0)),
    CONSTRAINT "vault_key_versions_retirement_check" CHECK ((("retired_at" IS NULL) OR ("retired_at" >= "created_at")))
);


ALTER TABLE "public"."vault_key_versions" OWNER TO "postgres";


COMMENT ON TABLE "public"."vault_key_versions" IS 'Tracks encryption-key metadata and lifecycle versions used by the Smith Enterprises Secure Vault. Actual encryption keys are never stored in this table.';



COMMENT ON COLUMN "public"."vault_key_versions"."key_version" IS 'Monotonically increasing version number referenced by encrypted vault records.';



COMMENT ON COLUMN "public"."vault_key_versions"."algorithm" IS 'Approved encryption algorithm associated with this key version.';



COMMENT ON COLUMN "public"."vault_key_versions"."active" IS 'Indicates the single key version currently used for new encryption operations.';



COMMENT ON COLUMN "public"."vault_key_versions"."retired_at" IS 'Timestamp when this key version was retired from new encryption operations. Existing records may still reference it until re-encrypted.';



COMMENT ON COLUMN "public"."vault_key_versions"."updated_at" IS 'Timestamp of the latest metadata update.';



COMMENT ON COLUMN "public"."vault_key_versions"."activated_at" IS 'Timestamp when this key version became active for new encryption operations.';



COMMENT ON COLUMN "public"."vault_key_versions"."description" IS 'Non-sensitive operational description of the key version.';



CREATE TABLE IF NOT EXISTS "public"."vault_secrets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "organizer_id" "uuid",
    "secret_type" "text" NOT NULL,
    "encrypted_value" "bytea" NOT NULL,
    "initialization_vector" "bytea" NOT NULL,
    "authentication_tag" "bytea" NOT NULL,
    "key_version" integer NOT NULL,
    "masked_value" "text" NOT NULL,
    "status" "text" DEFAULT 'collected'::"text" NOT NULL,
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "archived_at" timestamp with time zone,
    "archived_by" "uuid",
    "archive_reason" "text",
    "dependent_id" "uuid",
    CONSTRAINT "vault_secrets_archive_fields_check" CHECK (((("archived_at" IS NULL) AND ("archived_by" IS NULL) AND ("archive_reason" IS NULL)) OR (("archived_at" IS NOT NULL) AND ("archive_reason" IS NOT NULL) AND ("length"(TRIM(BOTH FROM "archive_reason")) > 0)))),
    CONSTRAINT "vault_secrets_archived_status_check" CHECK ((("archived_at" IS NULL) OR ("status" = ANY (ARRAY['replaced'::"text", 'archived'::"text"])))),
    CONSTRAINT "vault_secrets_authentication_tag_not_empty" CHECK (("octet_length"("authentication_tag") > 0)),
    CONSTRAINT "vault_secrets_dependent_requires_organizer" CHECK ((("dependent_id" IS NULL) OR ("organizer_id" IS NOT NULL))),
    CONSTRAINT "vault_secrets_dependent_ssn_owner_check" CHECK ((("secret_type" <> 'dependent_social_security_number'::"text") OR ("dependent_id" IS NOT NULL))),
    CONSTRAINT "vault_secrets_encrypted_value_not_empty" CHECK (("octet_length"("encrypted_value") > 0)),
    CONSTRAINT "vault_secrets_initialization_vector_not_empty" CHECK (("octet_length"("initialization_vector") > 0)),
    CONSTRAINT "vault_secrets_masked_value_length" CHECK (("length"("masked_value") <= 128)),
    CONSTRAINT "vault_secrets_masked_value_not_blank" CHECK (("length"(TRIM(BOTH FROM "masked_value")) > 0)),
    CONSTRAINT "vault_secrets_secret_type_check" CHECK (("secret_type" = ANY (ARRAY['social_security_number'::"text", 'dependent_social_security_number'::"text", 'itin'::"text", 'drivers_license'::"text", 'passport'::"text", 'state_identification'::"text", 'routing_number'::"text", 'bank_account_number'::"text", 'identity_protection_pin'::"text", 'employer_identification_number'::"text"]))),
    CONSTRAINT "vault_secrets_status_check" CHECK (("status" = ANY (ARRAY['collected'::"text", 'pending_verification'::"text", 'verified'::"text", 'rejected'::"text", 'replaced'::"text", 'archived'::"text"]))),
    CONSTRAINT "vault_secrets_verified_fields_check" CHECK (((("status" = 'verified'::"text") AND ("verified_by" IS NOT NULL) AND ("verified_at" IS NOT NULL)) OR ("status" <> 'verified'::"text")))
);


ALTER TABLE "public"."vault_secrets" OWNER TO "postgres";


COMMENT ON TABLE "public"."vault_secrets" IS 'Stores encrypted sensitive client and organizer information. Plaintext secret values must never be stored in this table.';



COMMENT ON COLUMN "public"."vault_secrets"."client_id" IS 'Client who owns the encrypted secret.';



COMMENT ON COLUMN "public"."vault_secrets"."organizer_id" IS 'Optional tax organizer associated with the secret.';



COMMENT ON COLUMN "public"."vault_secrets"."secret_type" IS 'Classification of the protected value, such as social_security_number or bank_account_number.';



COMMENT ON COLUMN "public"."vault_secrets"."encrypted_value" IS 'AES-256-GCM encrypted ciphertext. This column must never contain plaintext.';



COMMENT ON COLUMN "public"."vault_secrets"."initialization_vector" IS 'Random initialization vector used for AES-GCM encryption.';



COMMENT ON COLUMN "public"."vault_secrets"."authentication_tag" IS 'Authentication tag used to verify ciphertext integrity during decryption.';



COMMENT ON COLUMN "public"."vault_secrets"."key_version" IS 'Encryption key version used to protect this record.';



COMMENT ON COLUMN "public"."vault_secrets"."masked_value" IS 'Non-sensitive masked representation suitable for ordinary display, such as ***-**-6789.';



COMMENT ON COLUMN "public"."vault_secrets"."status" IS 'Lifecycle state of the protected secret.';



COMMENT ON COLUMN "public"."vault_secrets"."archived_at" IS 'Timestamp indicating that the secret is no longer active. Archived ciphertext is retained according to retention policy.';



COMMENT ON COLUMN "public"."vault_secrets"."dependent_id" IS 'Optional dependent associated with the protected value. Dependent identifiers such as SSNs must reference this column.';



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_documents"
    ADD CONSTRAINT "client_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_documents"
    ADD CONSTRAINT "client_documents_storage_location_unique" UNIQUE ("storage_bucket", "storage_path");



ALTER TABLE ONLY "public"."client_portal_accounts"
    ADD CONSTRAINT "client_portal_accounts_client_unique" UNIQUE ("client_id");



ALTER TABLE ONLY "public"."client_portal_accounts"
    ADD CONSTRAINT "client_portal_accounts_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."client_portal_accounts"
    ADD CONSTRAINT "client_portal_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_portal_profiles"
    ADD CONSTRAINT "client_portal_profiles_auth_user_unique" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."client_portal_profiles"
    ADD CONSTRAINT "client_portal_profiles_client_unique" UNIQUE ("client_id");



ALTER TABLE ONLY "public"."client_portal_profiles"
    ADD CONSTRAINT "client_portal_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tax_organizer_banking_information"
    ADD CONSTRAINT "client_tax_organizer_banking_information_organizer_id_key" UNIQUE ("organizer_id");



ALTER TABLE ONLY "public"."client_tax_organizer_banking_information"
    ADD CONSTRAINT "client_tax_organizer_banking_information_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tax_organizer_business_responses"
    ADD CONSTRAINT "client_tax_organizer_business_responses_pkey" PRIMARY KEY ("organizer_id");



ALTER TABLE ONLY "public"."client_tax_organizer_businesses"
    ADD CONSTRAINT "client_tax_organizer_businesses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tax_organizer_dependent_reviews"
    ADD CONSTRAINT "client_tax_organizer_dependent_reviews_dependent_id_key" UNIQUE ("dependent_id");



ALTER TABLE ONLY "public"."client_tax_organizer_dependent_reviews"
    ADD CONSTRAINT "client_tax_organizer_dependent_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tax_organizer_dependents"
    ADD CONSTRAINT "client_tax_organizer_dependents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tax_organizer_healthcare_coverages"
    ADD CONSTRAINT "client_tax_organizer_healthcare_coverages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tax_organizer_identity_information"
    ADD CONSTRAINT "client_tax_organizer_identity_information_pkey" PRIMARY KEY ("organizer_id");



ALTER TABLE ONLY "public"."client_tax_organizer_income_1099_div_details"
    ADD CONSTRAINT "client_tax_organizer_income_1099_div_details_pkey" PRIMARY KEY ("income_source_id");



ALTER TABLE ONLY "public"."client_tax_organizer_income_1099_int_details"
    ADD CONSTRAINT "client_tax_organizer_income_1099_int_details_pkey" PRIMARY KEY ("income_source_id");



ALTER TABLE ONLY "public"."client_tax_organizer_income_reviews"
    ADD CONSTRAINT "client_tax_organizer_income_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tax_organizer_income_sources"
    ADD CONSTRAINT "client_tax_organizer_income_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tax_organizer_income_w2_details"
    ADD CONSTRAINT "client_tax_organizer_income_w2_details_pkey" PRIMARY KEY ("income_source_id");



ALTER TABLE ONLY "public"."client_tax_organizer_personal_information"
    ADD CONSTRAINT "client_tax_organizer_personal_information_pkey" PRIMARY KEY ("organizer_id");



ALTER TABLE ONLY "public"."client_tax_organizer_sections"
    ADD CONSTRAINT "client_tax_organizer_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tax_organizer_sections"
    ADD CONSTRAINT "client_tax_organizer_sections_unique" UNIQUE ("organizer_id", "section_key");



ALTER TABLE ONLY "public"."client_tax_organizers"
    ADD CONSTRAINT "client_tax_organizers_client_year_unique" UNIQUE ("client_id", "tax_year");



ALTER TABLE ONLY "public"."client_tax_organizers"
    ADD CONSTRAINT "client_tax_organizers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_access_log"
    ADD CONSTRAINT "document_access_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_activity"
    ADD CONSTRAINT "document_activity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_analysis_events"
    ADD CONSTRAINT "document_analysis_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_analysis_extracted_fields"
    ADD CONSTRAINT "document_analysis_extracted_fields_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_analysis_jobs"
    ADD CONSTRAINT "document_analysis_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_analysis_providers"
    ADD CONSTRAINT "document_analysis_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_analysis_providers"
    ADD CONSTRAINT "document_analysis_providers_provider_key_key" UNIQUE ("provider_key");



ALTER TABLE ONLY "public"."document_analysis_results"
    ADD CONSTRAINT "document_analysis_results_job_id_key" UNIQUE ("job_id");



ALTER TABLE ONLY "public"."document_analysis_results"
    ADD CONSTRAINT "document_analysis_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_categories"
    ADD CONSTRAINT "document_categories_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."document_categories"
    ADD CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_notifications"
    ADD CONSTRAINT "document_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_types"
    ADD CONSTRAINT "document_types_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."document_types"
    ADD CONSTRAINT "document_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."client_tax_organizer_income_reviews"
    ADD CONSTRAINT "income_reviews_source_unique" UNIQUE ("income_source_id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizer_evidence_links"
    ADD CONSTRAINT "organizer_evidence_link_unique" UNIQUE ("evidence_id", "section_key", "subject_type", "subject_id", "field_key", "link_type");



ALTER TABLE ONLY "public"."organizer_evidence_links"
    ADD CONSTRAINT "organizer_evidence_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizer_evidence_sources"
    ADD CONSTRAINT "organizer_evidence_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizer_evidence_verification_events"
    ADD CONSTRAINT "organizer_evidence_verification_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizer_review_checklist_definitions"
    ADD CONSTRAINT "organizer_review_checklist_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizer_review_checklist_items"
    ADD CONSTRAINT "organizer_review_checklist_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizer_review_checklist_responses"
    ADD CONSTRAINT "organizer_review_checklist_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizer_review_timeline_entries"
    ADD CONSTRAINT "organizer_review_timeline_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."required_document_templates"
    ADD CONSTRAINT "required_document_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."return_required_documents"
    ADD CONSTRAINT "return_required_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."return_workflow_history"
    ADD CONSTRAINT "return_workflow_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizer_review_checklist_definitions"
    ADD CONSTRAINT "review_checklist_definition_unique" UNIQUE ("section_key", "subject_type", "version");



ALTER TABLE ONLY "public"."organizer_review_checklist_items"
    ADD CONSTRAINT "review_checklist_item_key_unique" UNIQUE ("definition_id", "item_key");



ALTER TABLE ONLY "public"."organizer_review_checklist_items"
    ADD CONSTRAINT "review_checklist_item_order_unique" UNIQUE ("definition_id", "display_order");



ALTER TABLE ONLY "public"."organizer_review_checklist_responses"
    ADD CONSTRAINT "review_checklist_response_unique" UNIQUE ("subject_type", "subject_id", "checklist_item_id");



ALTER TABLE ONLY "public"."security_acknowledgments"
    ADD CONSTRAINT "security_acknowledgments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_acknowledgments"
    ADD CONSTRAINT "security_acknowledgments_user_version_unique" UNIQUE ("user_id", "notice_version");



ALTER TABLE ONLY "public"."tax_package_template_items"
    ADD CONSTRAINT "tax_package_template_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tax_package_template_items"
    ADD CONSTRAINT "tax_package_template_items_unique_document" UNIQUE ("template_id", "document_type_id");



ALTER TABLE ONLY "public"."tax_package_templates"
    ADD CONSTRAINT "tax_package_templates_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."tax_package_templates"
    ADD CONSTRAINT "tax_package_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tax_return_activity"
    ADD CONSTRAINT "tax_return_activity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tax_returns"
    ADD CONSTRAINT "tax_returns_client_year_type_unique" UNIQUE ("client_id", "tax_year", "return_type");



ALTER TABLE ONLY "public"."tax_returns"
    ADD CONSTRAINT "tax_returns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vault_audit_log"
    ADD CONSTRAINT "vault_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vault_key_versions"
    ADD CONSTRAINT "vault_key_versions_key_version_key" UNIQUE ("key_version");



ALTER TABLE ONLY "public"."vault_key_versions"
    ADD CONSTRAINT "vault_key_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vault_secrets"
    ADD CONSTRAINT "vault_secrets_pkey" PRIMARY KEY ("id");



CREATE INDEX "audit_logs_actor_index" ON "public"."audit_logs" USING "btree" ("actor_id");



CREATE INDEX "audit_logs_created_at_index" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "audit_logs_entity_index" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "client_documents_active_status_index" ON "public"."client_documents" USING "btree" ("status", "category") WHERE ("archived_at" IS NULL);



CREATE INDEX "client_documents_assigned_reviewer_id_idx" ON "public"."client_documents" USING "btree" ("assigned_reviewer_id") WHERE ("archived_at" IS NULL);



CREATE INDEX "client_documents_client_hash_index" ON "public"."client_documents" USING "btree" ("client_id", "file_hash");



CREATE INDEX "client_documents_client_index" ON "public"."client_documents" USING "btree" ("client_id", "created_at" DESC);



CREATE INDEX "client_documents_client_review_status_idx" ON "public"."client_documents" USING "btree" ("client_id", "review_status") WHERE ("archived_at" IS NULL);



CREATE INDEX "client_documents_file_hash_index" ON "public"."client_documents" USING "btree" ("file_hash");



CREATE UNIQUE INDEX "client_documents_one_current_version_unique" ON "public"."client_documents" USING "btree" ("version_group_id") WHERE ("is_current_version" = true);



CREATE INDEX "client_documents_pending_review_idx" ON "public"."client_documents" USING "btree" ("review_requested_at") WHERE (("archived_at" IS NULL) AND ("review_status" = 'pending_review'::"text"));



CREATE INDEX "client_documents_previous_version_index" ON "public"."client_documents" USING "btree" ("previous_version_id") WHERE ("previous_version_id" IS NOT NULL);



CREATE INDEX "client_documents_return_index" ON "public"."client_documents" USING "btree" ("tax_return_id", "created_at" DESC) WHERE ("tax_return_id" IS NOT NULL);



CREATE INDEX "client_documents_review_queue_idx" ON "public"."client_documents" USING "btree" ("review_status", "assigned_reviewer_id", "review_due_at") WHERE ("archived_at" IS NULL);



CREATE INDEX "client_documents_review_status_idx" ON "public"."client_documents" USING "btree" ("review_status") WHERE ("archived_at" IS NULL);



CREATE INDEX "client_documents_version_group_index" ON "public"."client_documents" USING "btree" ("version_group_id", "version_number" DESC);



CREATE UNIQUE INDEX "client_documents_version_group_number_unique" ON "public"."client_documents" USING "btree" ("version_group_id", "version_number");



CREATE INDEX "client_portal_profiles_client_index" ON "public"."client_portal_profiles" USING "btree" ("client_id");



CREATE INDEX "client_portal_profiles_email_index" ON "public"."client_portal_profiles" USING "btree" ("lower"("email"));



CREATE INDEX "client_portal_profiles_status_index" ON "public"."client_portal_profiles" USING "btree" ("portal_status");



CREATE INDEX "client_tax_organizer_income_1099_div_updated_index" ON "public"."client_tax_organizer_income_1099_div_details" USING "btree" ("updated_at");



CREATE INDEX "client_tax_organizer_income_1099_int_updated_index" ON "public"."client_tax_organizer_income_1099_int_details" USING "btree" ("updated_at");



CREATE UNIQUE INDEX "clients_client_number_unique" ON "public"."clients" USING "btree" ("client_number");



CREATE INDEX "clients_email_lower_index" ON "public"."clients" USING "btree" ("lower"("email")) WHERE ("email" IS NOT NULL);



CREATE INDEX "clients_lower_email_index" ON "public"."clients" USING "btree" ("lower"("email"));



CREATE INDEX "clients_lower_first_name_index" ON "public"."clients" USING "btree" ("lower"("first_name"));



CREATE INDEX "clients_lower_last_name_index" ON "public"."clients" USING "btree" ("lower"("last_name"));



CREATE INDEX "clients_name_search_index" ON "public"."clients" USING "btree" ("lower"("last_name"), "lower"("first_name"));



CREATE INDEX "clients_phone_index" ON "public"."clients" USING "btree" ("phone");



CREATE INDEX "clients_status_index" ON "public"."clients" USING "btree" ("status");



CREATE INDEX "dependent_reviews_reviewed_by_index" ON "public"."client_tax_organizer_dependent_reviews" USING "btree" ("reviewed_by");



CREATE INDEX "dependent_reviews_status_index" ON "public"."client_tax_organizer_dependent_reviews" USING "btree" ("review_status");



CREATE INDEX "document_access_log_actor_idx" ON "public"."document_access_log" USING "btree" ("actor_id", "occurred_at" DESC);



CREATE INDEX "document_access_log_document_idx" ON "public"."document_access_log" USING "btree" ("document_id", "occurred_at" DESC);



CREATE INDEX "document_analysis_events_job_index" ON "public"."document_analysis_events" USING "btree" ("job_id", "created_at" DESC);



CREATE INDEX "document_analysis_fields_result_index" ON "public"."document_analysis_extracted_fields" USING "btree" ("result_id", "field_key");



CREATE INDEX "document_analysis_jobs_document_index" ON "public"."document_analysis_jobs" USING "btree" ("document_id", "created_at" DESC);



CREATE INDEX "document_analysis_jobs_status_index" ON "public"."document_analysis_jobs" USING "btree" ("status", "requested_at");



CREATE INDEX "document_notifications_document_idx" ON "public"."document_notifications" USING "btree" ("document_id");



CREATE INDEX "document_notifications_recipient_unread_idx" ON "public"."document_notifications" USING "btree" ("recipient_user_id", "created_at" DESC) WHERE (("read_at" IS NULL) AND ("archived_at" IS NULL));



CREATE INDEX "document_types_active_sort_idx" ON "public"."document_types" USING "btree" ("is_active", "sort_order", "name");



CREATE INDEX "idx_client_portal_accounts_auth_user_id" ON "public"."client_portal_accounts" USING "btree" ("auth_user_id");



CREATE INDEX "idx_client_portal_accounts_email" ON "public"."client_portal_accounts" USING "btree" ("email");



CREATE INDEX "idx_client_portal_accounts_invitation_expires_at" ON "public"."client_portal_accounts" USING "btree" ("invitation_expires_at");



CREATE INDEX "idx_client_portal_accounts_invitation_status" ON "public"."client_portal_accounts" USING "btree" ("invitation_status");



CREATE INDEX "idx_client_portal_accounts_status" ON "public"."client_portal_accounts" USING "btree" ("status");



CREATE INDEX "idx_client_tax_organizer_sections_organizer" ON "public"."client_tax_organizer_sections" USING "btree" ("organizer_id");



CREATE INDEX "idx_client_tax_organizer_sections_status" ON "public"."client_tax_organizer_sections" USING "btree" ("status");



CREATE INDEX "idx_client_tax_organizers_client" ON "public"."client_tax_organizers" USING "btree" ("client_id");



CREATE INDEX "idx_client_tax_organizers_status" ON "public"."client_tax_organizers" USING "btree" ("status");



CREATE INDEX "idx_client_tax_organizers_tax_year" ON "public"."client_tax_organizers" USING "btree" ("tax_year" DESC);



CREATE INDEX "idx_document_activity_client" ON "public"."document_activity" USING "btree" ("client_id");



CREATE INDEX "idx_document_activity_created" ON "public"."document_activity" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_document_activity_document" ON "public"."document_activity" USING "btree" ("document_id");



CREATE UNIQUE INDEX "idx_payments_receipt_number" ON "public"."payments" USING "btree" ("receipt_number");



CREATE INDEX "income_reviews_reviewed_by_index" ON "public"."client_tax_organizer_income_reviews" USING "btree" ("reviewed_by");



CREATE INDEX "income_reviews_status_index" ON "public"."client_tax_organizer_income_reviews" USING "btree" ("review_status");



CREATE INDEX "notifications_recipient_archived_created_idx" ON "public"."notifications" USING "btree" ("recipient_user_id", "is_archived", "created_at" DESC) WHERE ("deleted_at" IS NULL);



CREATE INDEX "notifications_recipient_created_at_idx" ON "public"."notifications" USING "btree" ("recipient_user_id", "created_at" DESC);



CREATE INDEX "notifications_recipient_deleted_idx" ON "public"."notifications" USING "btree" ("recipient_user_id", "deleted_at") WHERE ("deleted_at" IS NOT NULL);



CREATE INDEX "notifications_recipient_unread_idx" ON "public"."notifications" USING "btree" ("recipient_user_id", "is_read", "created_at" DESC);



CREATE INDEX "notifications_related_entity_idx" ON "public"."notifications" USING "btree" ("related_entity_type", "related_entity_id") WHERE ("related_entity_id" IS NOT NULL);



CREATE INDEX "organizer_banking_organizer_id_index" ON "public"."client_tax_organizer_banking_information" USING "btree" ("organizer_id");



CREATE INDEX "organizer_businesses_organizer_index" ON "public"."client_tax_organizer_businesses" USING "btree" ("organizer_id", "display_order", "created_at");



CREATE INDEX "organizer_businesses_status_index" ON "public"."client_tax_organizer_businesses" USING "btree" ("organizer_id", "record_status");



CREATE INDEX "organizer_dependents_birth_date_index" ON "public"."client_tax_organizer_dependents" USING "btree" ("birth_date");



CREATE INDEX "organizer_dependents_organizer_display_order_index" ON "public"."client_tax_organizer_dependents" USING "btree" ("organizer_id", "display_order", "created_at");



CREATE INDEX "organizer_dependents_organizer_id_index" ON "public"."client_tax_organizer_dependents" USING "btree" ("organizer_id");



CREATE INDEX "organizer_evidence_events_evidence_index" ON "public"."organizer_evidence_verification_events" USING "btree" ("evidence_id", "created_at" DESC);



CREATE INDEX "organizer_evidence_links_subject_index" ON "public"."organizer_evidence_links" USING "btree" ("organizer_id", "section_key", "subject_type", "subject_id", "field_key");



CREATE INDEX "organizer_evidence_sources_document_index" ON "public"."organizer_evidence_sources" USING "btree" ("document_id") WHERE ("document_id" IS NOT NULL);



CREATE UNIQUE INDEX "organizer_evidence_sources_organizer_document_unique" ON "public"."organizer_evidence_sources" USING "btree" ("organizer_id", "document_id") WHERE ("document_id" IS NOT NULL);



CREATE INDEX "organizer_evidence_sources_organizer_index" ON "public"."organizer_evidence_sources" USING "btree" ("organizer_id", "created_at" DESC);



CREATE INDEX "organizer_evidence_sources_status_index" ON "public"."organizer_evidence_sources" USING "btree" ("organizer_id", "verification_status", "confidence");



CREATE INDEX "organizer_healthcare_display_index" ON "public"."client_tax_organizer_healthcare_coverages" USING "btree" ("organizer_id", "display_order", "created_at");



CREATE INDEX "organizer_healthcare_document_index" ON "public"."client_tax_organizer_healthcare_coverages" USING "btree" ("organizer_id", "document_received");



CREATE INDEX "organizer_healthcare_organizer_index" ON "public"."client_tax_organizer_healthcare_coverages" USING "btree" ("organizer_id");



CREATE INDEX "organizer_healthcare_status_index" ON "public"."client_tax_organizer_healthcare_coverages" USING "btree" ("organizer_id", "record_status");



CREATE INDEX "organizer_healthcare_type_index" ON "public"."client_tax_organizer_healthcare_coverages" USING "btree" ("organizer_id", "coverage_type");



CREATE INDEX "organizer_income_sources_display_index" ON "public"."client_tax_organizer_income_sources" USING "btree" ("organizer_id", "display_order", "created_at");



CREATE INDEX "organizer_income_sources_organizer_index" ON "public"."client_tax_organizer_income_sources" USING "btree" ("organizer_id");



CREATE INDEX "organizer_income_sources_status_index" ON "public"."client_tax_organizer_income_sources" USING "btree" ("organizer_id", "record_status");



CREATE INDEX "organizer_income_sources_type_index" ON "public"."client_tax_organizer_income_sources" USING "btree" ("organizer_id", "income_type");



CREATE INDEX "organizer_review_timeline_organizer_index" ON "public"."organizer_review_timeline_entries" USING "btree" ("organizer_id", "section_key", "created_at" DESC);



CREATE INDEX "organizer_review_timeline_subject_index" ON "public"."organizer_review_timeline_entries" USING "btree" ("subject_type", "subject_id", "created_at" DESC);



CREATE INDEX "payments_client_index" ON "public"."payments" USING "btree" ("client_id");



CREATE INDEX "payments_date_index" ON "public"."payments" USING "btree" ("payment_date");



CREATE INDEX "payments_return_index" ON "public"."payments" USING "btree" ("tax_return_id");



CREATE UNIQUE INDEX "profiles_email_lower_unique" ON "public"."profiles" USING "btree" ("lower"("email"));



CREATE INDEX "profiles_role_index" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "required_document_templates_lookup_idx" ON "public"."required_document_templates" USING "btree" ("is_active", "return_type", "tax_form", "sort_order");



CREATE UNIQUE INDEX "required_document_templates_unique_scope" ON "public"."required_document_templates" USING "btree" ("name", "return_type", "tax_form") NULLS NOT DISTINCT;



CREATE INDEX "return_required_documents_matched_document_idx" ON "public"."return_required_documents" USING "btree" ("matched_document_id") WHERE ("matched_document_id" IS NOT NULL);



CREATE INDEX "return_required_documents_return_idx" ON "public"."return_required_documents" USING "btree" ("tax_return_id", "is_complete", "sort_order");



CREATE UNIQUE INDEX "return_required_documents_template_unique_idx" ON "public"."return_required_documents" USING "btree" ("tax_return_id", "template_id") WHERE ("template_id" IS NOT NULL);



CREATE INDEX "return_workflow_history_client_id_idx" ON "public"."return_workflow_history" USING "btree" ("client_id", "occurred_at" DESC);



CREATE INDEX "return_workflow_history_client_visible_idx" ON "public"."return_workflow_history" USING "btree" ("tax_return_id", "occurred_at" DESC) WHERE ("is_client_visible" = true);



CREATE INDEX "return_workflow_history_tax_return_id_idx" ON "public"."return_workflow_history" USING "btree" ("tax_return_id", "occurred_at" DESC);



CREATE INDEX "review_checklist_items_definition_index" ON "public"."organizer_review_checklist_items" USING "btree" ("definition_id", "display_order");



CREATE INDEX "review_checklist_responses_subject_index" ON "public"."organizer_review_checklist_responses" USING "btree" ("organizer_id", "subject_type", "subject_id");



CREATE INDEX "security_acknowledgments_accepted_at_index" ON "public"."security_acknowledgments" USING "btree" ("accepted_at" DESC);



CREATE INDEX "security_acknowledgments_user_index" ON "public"."security_acknowledgments" USING "btree" ("user_id");



CREATE INDEX "tax_package_template_items_template_sort_idx" ON "public"."tax_package_template_items" USING "btree" ("template_id", "sort_order");



CREATE INDEX "tax_package_templates_form_active_idx" ON "public"."tax_package_templates" USING "btree" ("return_form", "is_active");



CREATE INDEX "tax_return_activity_return_id_occurred_at_idx" ON "public"."tax_return_activity" USING "btree" ("return_id", "occurred_at" DESC);



CREATE INDEX "tax_returns_assigned_preparer_id_idx" ON "public"."tax_returns" USING "btree" ("assigned_preparer_id");



CREATE INDEX "tax_returns_client_index" ON "public"."tax_returns" USING "btree" ("client_id");



CREATE INDEX "tax_returns_form_index" ON "public"."tax_returns" USING "btree" ("tax_form");



CREATE INDEX "tax_returns_preparer_index" ON "public"."tax_returns" USING "btree" ("assigned_preparer_id");



CREATE INDEX "tax_returns_preparer_status_due_date_index" ON "public"."tax_returns" USING "btree" ("assigned_preparer_id", "status", "due_date");



CREATE INDEX "tax_returns_received_date_index" ON "public"."tax_returns" USING "btree" ("date_received" DESC);



CREATE INDEX "tax_returns_reviewer_index" ON "public"."tax_returns" USING "btree" ("assigned_reviewer_id");



CREATE INDEX "tax_returns_reviewer_status_index" ON "public"."tax_returns" USING "btree" ("assigned_reviewer_id", "status");



CREATE INDEX "tax_returns_search_sort_index" ON "public"."tax_returns" USING "btree" ("tax_year" DESC, "status", "assigned_preparer_id", "created_at" DESC);



CREATE INDEX "tax_returns_status_index" ON "public"."tax_returns" USING "btree" ("status");



CREATE INDEX "tax_returns_tax_year_index" ON "public"."tax_returns" USING "btree" ("tax_year");



CREATE INDEX "tax_returns_workflow_status_changed_at_idx" ON "public"."tax_returns" USING "btree" ("workflow_status_changed_at" DESC);



CREATE INDEX "tax_returns_workflow_status_idx" ON "public"."tax_returns" USING "btree" ("workflow_status");



CREATE INDEX "vault_audit_log_action_index" ON "public"."vault_audit_log" USING "btree" ("action");



CREATE INDEX "vault_audit_log_actor_user_id_index" ON "public"."vault_audit_log" USING "btree" ("actor_user_id");



CREATE INDEX "vault_audit_log_client_created_at_index" ON "public"."vault_audit_log" USING "btree" ("client_id", "created_at" DESC);



CREATE INDEX "vault_audit_log_client_id_index" ON "public"."vault_audit_log" USING "btree" ("client_id");



CREATE INDEX "vault_audit_log_created_at_index" ON "public"."vault_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "vault_audit_log_dependent_id_index" ON "public"."vault_audit_log" USING "btree" ("dependent_id") WHERE ("dependent_id" IS NOT NULL);



CREATE INDEX "vault_audit_log_organizer_id_index" ON "public"."vault_audit_log" USING "btree" ("organizer_id");



CREATE INDEX "vault_audit_log_request_id_index" ON "public"."vault_audit_log" USING "btree" ("request_id") WHERE ("request_id" IS NOT NULL);



CREATE INDEX "vault_audit_log_secret_id_index" ON "public"."vault_audit_log" USING "btree" ("vault_secret_id");



CREATE INDEX "vault_key_versions_created_at_index" ON "public"."vault_key_versions" USING "btree" ("created_at" DESC);



CREATE INDEX "vault_key_versions_retired_at_index" ON "public"."vault_key_versions" USING "btree" ("retired_at") WHERE ("retired_at" IS NOT NULL);



CREATE UNIQUE INDEX "vault_key_versions_single_active_key" ON "public"."vault_key_versions" USING "btree" ("active") WHERE ("active" = true);



CREATE INDEX "vault_secrets_active_lookup_index" ON "public"."vault_secrets" USING "btree" ("client_id", "organizer_id", "secret_type") WHERE ("archived_at" IS NULL);



CREATE INDEX "vault_secrets_client_id_index" ON "public"."vault_secrets" USING "btree" ("client_id");



CREATE INDEX "vault_secrets_dependent_active_lookup_index" ON "public"."vault_secrets" USING "btree" ("client_id", "organizer_id", "dependent_id", "secret_type") WHERE (("dependent_id" IS NOT NULL) AND ("archived_at" IS NULL));



CREATE INDEX "vault_secrets_dependent_id_index" ON "public"."vault_secrets" USING "btree" ("dependent_id") WHERE ("dependent_id" IS NOT NULL);



CREATE INDEX "vault_secrets_key_version_index" ON "public"."vault_secrets" USING "btree" ("key_version");



CREATE INDEX "vault_secrets_organizer_id_index" ON "public"."vault_secrets" USING "btree" ("organizer_id");



CREATE INDEX "vault_secrets_secret_type_index" ON "public"."vault_secrets" USING "btree" ("secret_type");



CREATE INDEX "vault_secrets_status_index" ON "public"."vault_secrets" USING "btree" ("status");



CREATE UNIQUE INDEX "vault_secrets_unique_active_secret" ON "public"."vault_secrets" USING "btree" ("client_id", COALESCE("organizer_id", '00000000-0000-0000-0000-000000000000'::"uuid"), COALESCE("dependent_id", '00000000-0000-0000-0000-000000000000'::"uuid"), "secret_type") WHERE ("archived_at" IS NULL);



CREATE OR REPLACE TRIGGER "business_responses_set_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_business_responses" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "client_documents_set_updated_at" BEFORE UPDATE ON "public"."client_documents" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "client_portal_accounts_updated_at" BEFORE UPDATE ON "public"."client_portal_accounts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "client_tax_organizer_identity_information_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_identity_information" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "client_tax_organizer_income_1099_div_set_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_income_1099_div_details" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "client_tax_organizer_income_1099_div_validate_source" BEFORE INSERT OR UPDATE OF "income_source_id" ON "public"."client_tax_organizer_income_1099_div_details" FOR EACH ROW EXECUTE FUNCTION "public"."validate_organizer_income_1099_div_source"();



CREATE OR REPLACE TRIGGER "client_tax_organizer_income_1099_int_set_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_income_1099_int_details" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "client_tax_organizer_income_1099_int_validate_source" BEFORE INSERT OR UPDATE OF "income_source_id" ON "public"."client_tax_organizer_income_1099_int_details" FOR EACH ROW EXECUTE FUNCTION "public"."validate_organizer_income_1099_int_source"();



CREATE OR REPLACE TRIGGER "client_tax_organizer_personal_information_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_personal_information" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "client_tax_organizer_sections_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_sections" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "client_tax_organizers_updated_at" BEFORE UPDATE ON "public"."client_tax_organizers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "clients_set_updated_at" BEFORE UPDATE ON "public"."clients" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "create_return_assignment_notification_trigger" AFTER UPDATE OF "assigned_preparer_id" ON "public"."tax_returns" FOR EACH ROW WHEN (("old"."assigned_preparer_id" IS DISTINCT FROM "new"."assigned_preparer_id")) EXECUTE FUNCTION "public"."create_return_assignment_notification"();



CREATE OR REPLACE TRIGGER "dependent_reviews_set_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_dependent_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "document_analysis_fields_set_updated_at" BEFORE UPDATE ON "public"."document_analysis_extracted_fields" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "document_analysis_jobs_set_updated_at" BEFORE UPDATE ON "public"."document_analysis_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "document_analysis_providers_set_updated_at" BEFORE UPDATE ON "public"."document_analysis_providers" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "document_analysis_results_set_updated_at" BEFORE UPDATE ON "public"."document_analysis_results" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "income_reviews_set_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_income_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "initialize_document_version_trigger" BEFORE INSERT ON "public"."client_documents" FOR EACH ROW EXECUTE FUNCTION "public"."initialize_document_version"();



CREATE OR REPLACE TRIGGER "organizer_banking_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_banking_information" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "organizer_businesses_set_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_businesses" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "organizer_dependents_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_dependents" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "organizer_evidence_sources_set_updated_at" BEFORE UPDATE ON "public"."organizer_evidence_sources" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "organizer_healthcare_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_healthcare_coverages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "organizer_income_sources_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_income_sources" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "organizer_income_w2_details_updated_at" BEFORE UPDATE ON "public"."client_tax_organizer_income_w2_details" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "payments_set_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "profiles_set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "record_return_workflow_history_trigger" AFTER INSERT OR UPDATE OF "status" ON "public"."tax_returns" FOR EACH ROW EXECUTE FUNCTION "public"."record_return_workflow_history"();



CREATE OR REPLACE TRIGGER "record_tax_return_activity_trigger" AFTER INSERT OR UPDATE ON "public"."tax_returns" FOR EACH ROW EXECUTE FUNCTION "public"."record_tax_return_activity"();



CREATE OR REPLACE TRIGGER "review_checklist_definitions_set_updated_at" BEFORE UPDATE ON "public"."organizer_review_checklist_definitions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "review_checklist_items_set_updated_at" BEFORE UPDATE ON "public"."organizer_review_checklist_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "review_checklist_responses_set_updated_at" BEFORE UPDATE ON "public"."organizer_review_checklist_responses" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_client_portal_profile_updated_at" BEFORE INSERT OR UPDATE ON "public"."client_portal_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_client_portal_profile_updated_at"();



CREATE OR REPLACE TRIGGER "set_document_types_updated_at" BEFORE UPDATE ON "public"."document_types" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_required_document_templates_updated_at" BEFORE UPDATE ON "public"."required_document_templates" FOR EACH ROW EXECUTE FUNCTION "public"."set_required_document_updated_at"();



CREATE OR REPLACE TRIGGER "set_return_required_documents_updated_at" BEFORE UPDATE ON "public"."return_required_documents" FOR EACH ROW EXECUTE FUNCTION "public"."set_required_document_updated_at"();



CREATE OR REPLACE TRIGGER "set_tax_package_template_items_updated_at" BEFORE UPDATE ON "public"."tax_package_template_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_tax_package_templates_updated_at" BEFORE UPDATE ON "public"."tax_package_templates" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_tax_return_workflow_timestamps" BEFORE UPDATE ON "public"."tax_returns" FOR EACH ROW EXECUTE FUNCTION "public"."set_tax_return_workflow_timestamps"();



CREATE OR REPLACE TRIGGER "tax_returns_set_updated_at" BEFORE UPDATE ON "public"."tax_returns" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "update_notification_preferences_updated_at" BEFORE UPDATE ON "public"."notification_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "vault_audit_log_prevent_delete" BEFORE DELETE ON "public"."vault_audit_log" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_vault_audit_log_changes"();



CREATE OR REPLACE TRIGGER "vault_audit_log_prevent_update" BEFORE UPDATE ON "public"."vault_audit_log" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_vault_audit_log_changes"();



CREATE OR REPLACE TRIGGER "vault_key_versions_updated_at" BEFORE UPDATE ON "public"."vault_key_versions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "vault_secrets_updated_at" BEFORE UPDATE ON "public"."vault_secrets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_documents"
    ADD CONSTRAINT "client_documents_assigned_reviewer_id_fkey" FOREIGN KEY ("assigned_reviewer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_documents"
    ADD CONSTRAINT "client_documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_documents"
    ADD CONSTRAINT "client_documents_previous_version_id_fkey" FOREIGN KEY ("previous_version_id") REFERENCES "public"."client_documents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_documents"
    ADD CONSTRAINT "client_documents_tax_return_id_fkey" FOREIGN KEY ("tax_return_id") REFERENCES "public"."tax_returns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_documents"
    ADD CONSTRAINT "client_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."client_documents"
    ADD CONSTRAINT "client_documents_version_group_id_fkey" FOREIGN KEY ("version_group_id") REFERENCES "public"."client_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_portal_accounts"
    ADD CONSTRAINT "client_portal_accounts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_portal_profiles"
    ADD CONSTRAINT "client_portal_profiles_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_portal_profiles"
    ADD CONSTRAINT "client_portal_profiles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_banking_information"
    ADD CONSTRAINT "client_tax_organizer_banking_information_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_business_responses"
    ADD CONSTRAINT "client_tax_organizer_business_responses_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_businesses"
    ADD CONSTRAINT "client_tax_organizer_businesses_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_dependent_reviews"
    ADD CONSTRAINT "client_tax_organizer_dependent_revi_follow_up_requested_by_fkey" FOREIGN KEY ("follow_up_requested_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_tax_organizer_dependent_reviews"
    ADD CONSTRAINT "client_tax_organizer_dependent_revie_returned_to_client_by_fkey" FOREIGN KEY ("returned_to_client_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_tax_organizer_dependent_reviews"
    ADD CONSTRAINT "client_tax_organizer_dependent_reviews_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_tax_organizer_dependent_reviews"
    ADD CONSTRAINT "client_tax_organizer_dependent_reviews_dependent_id_fkey" FOREIGN KEY ("dependent_id") REFERENCES "public"."client_tax_organizer_dependents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_dependent_reviews"
    ADD CONSTRAINT "client_tax_organizer_dependent_reviews_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_tax_organizer_dependent_reviews"
    ADD CONSTRAINT "client_tax_organizer_dependent_reviews_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_tax_organizer_dependents"
    ADD CONSTRAINT "client_tax_organizer_dependents_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_healthcare_coverages"
    ADD CONSTRAINT "client_tax_organizer_healthcare_coverages_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_identity_information"
    ADD CONSTRAINT "client_tax_organizer_identity_information_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_income_1099_div_details"
    ADD CONSTRAINT "client_tax_organizer_income_1099_div_deta_income_source_id_fkey" FOREIGN KEY ("income_source_id") REFERENCES "public"."client_tax_organizer_income_sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_income_1099_int_details"
    ADD CONSTRAINT "client_tax_organizer_income_1099_int_deta_income_source_id_fkey" FOREIGN KEY ("income_source_id") REFERENCES "public"."client_tax_organizer_income_sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_income_reviews"
    ADD CONSTRAINT "client_tax_organizer_income_reviews_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_tax_organizer_income_reviews"
    ADD CONSTRAINT "client_tax_organizer_income_reviews_follow_up_requested_by_fkey" FOREIGN KEY ("follow_up_requested_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_tax_organizer_income_reviews"
    ADD CONSTRAINT "client_tax_organizer_income_reviews_income_source_id_fkey" FOREIGN KEY ("income_source_id") REFERENCES "public"."client_tax_organizer_income_sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_income_reviews"
    ADD CONSTRAINT "client_tax_organizer_income_reviews_returned_to_client_by_fkey" FOREIGN KEY ("returned_to_client_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_tax_organizer_income_reviews"
    ADD CONSTRAINT "client_tax_organizer_income_reviews_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_tax_organizer_income_reviews"
    ADD CONSTRAINT "client_tax_organizer_income_reviews_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."client_tax_organizer_income_sources"
    ADD CONSTRAINT "client_tax_organizer_income_sources_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_income_w2_details"
    ADD CONSTRAINT "client_tax_organizer_income_w2_details_income_source_id_fkey" FOREIGN KEY ("income_source_id") REFERENCES "public"."client_tax_organizer_income_sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_personal_information"
    ADD CONSTRAINT "client_tax_organizer_personal_information_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizer_sections"
    ADD CONSTRAINT "client_tax_organizer_sections_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."client_tax_organizers"
    ADD CONSTRAINT "client_tax_organizers_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_access_log"
    ADD CONSTRAINT "document_access_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_access_log"
    ADD CONSTRAINT "document_access_log_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."client_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_activity"
    ADD CONSTRAINT "document_activity_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_activity"
    ADD CONSTRAINT "document_activity_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."client_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_activity"
    ADD CONSTRAINT "document_activity_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."document_analysis_events"
    ADD CONSTRAINT "document_analysis_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_analysis_events"
    ADD CONSTRAINT "document_analysis_events_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."document_analysis_jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_analysis_extracted_fields"
    ADD CONSTRAINT "document_analysis_extracted_fields_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "public"."document_analysis_results"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_analysis_extracted_fields"
    ADD CONSTRAINT "document_analysis_extracted_fields_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_analysis_jobs"
    ADD CONSTRAINT "document_analysis_jobs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."client_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_analysis_jobs"
    ADD CONSTRAINT "document_analysis_jobs_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "public"."organizer_evidence_sources"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_analysis_jobs"
    ADD CONSTRAINT "document_analysis_jobs_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_analysis_jobs"
    ADD CONSTRAINT "document_analysis_jobs_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."document_analysis_providers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."document_analysis_jobs"
    ADD CONSTRAINT "document_analysis_jobs_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_analysis_results"
    ADD CONSTRAINT "document_analysis_results_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."document_analysis_jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_analysis_results"
    ADD CONSTRAINT "document_analysis_results_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_notifications"
    ADD CONSTRAINT "document_notifications_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_notifications"
    ADD CONSTRAINT "document_notifications_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_notifications"
    ADD CONSTRAINT "document_notifications_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."client_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_notifications"
    ADD CONSTRAINT "document_notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_notifications"
    ADD CONSTRAINT "document_notifications_tax_return_id_fkey" FOREIGN KEY ("tax_return_id") REFERENCES "public"."tax_returns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizer_evidence_links"
    ADD CONSTRAINT "organizer_evidence_links_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "public"."organizer_evidence_sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizer_evidence_links"
    ADD CONSTRAINT "organizer_evidence_links_linked_by_fkey" FOREIGN KEY ("linked_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizer_evidence_links"
    ADD CONSTRAINT "organizer_evidence_links_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizer_evidence_sources"
    ADD CONSTRAINT "organizer_evidence_sources_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizer_evidence_sources"
    ADD CONSTRAINT "organizer_evidence_sources_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."client_documents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizer_evidence_sources"
    ADD CONSTRAINT "organizer_evidence_sources_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizer_evidence_sources"
    ADD CONSTRAINT "organizer_evidence_sources_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "public"."tax_returns"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizer_evidence_sources"
    ADD CONSTRAINT "organizer_evidence_sources_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizer_evidence_verification_events"
    ADD CONSTRAINT "organizer_evidence_verification_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizer_evidence_verification_events"
    ADD CONSTRAINT "organizer_evidence_verification_events_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "public"."organizer_evidence_sources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizer_review_checklist_items"
    ADD CONSTRAINT "organizer_review_checklist_items_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "public"."organizer_review_checklist_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizer_review_checklist_responses"
    ADD CONSTRAINT "organizer_review_checklist_responses_checklist_item_id_fkey" FOREIGN KEY ("checklist_item_id") REFERENCES "public"."organizer_review_checklist_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizer_review_checklist_responses"
    ADD CONSTRAINT "organizer_review_checklist_responses_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizer_review_checklist_responses"
    ADD CONSTRAINT "organizer_review_checklist_responses_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizer_review_checklist_responses"
    ADD CONSTRAINT "organizer_review_checklist_responses_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizer_review_timeline_entries"
    ADD CONSTRAINT "organizer_review_timeline_entries_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organizer_review_timeline_entries"
    ADD CONSTRAINT "organizer_review_timeline_entries_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_receipt_issued_by_fkey" FOREIGN KEY ("receipt_issued_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_tax_return_id_fkey" FOREIGN KEY ("tax_return_id") REFERENCES "public"."tax_returns"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_voided_by_fkey" FOREIGN KEY ("voided_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."required_document_templates"
    ADD CONSTRAINT "required_document_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."required_document_templates"
    ADD CONSTRAINT "required_document_templates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."return_required_documents"
    ADD CONSTRAINT "return_required_documents_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."return_required_documents"
    ADD CONSTRAINT "return_required_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."return_required_documents"
    ADD CONSTRAINT "return_required_documents_matched_document_id_fkey" FOREIGN KEY ("matched_document_id") REFERENCES "public"."client_documents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."return_required_documents"
    ADD CONSTRAINT "return_required_documents_tax_return_id_fkey" FOREIGN KEY ("tax_return_id") REFERENCES "public"."tax_returns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."return_required_documents"
    ADD CONSTRAINT "return_required_documents_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."required_document_templates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."return_required_documents"
    ADD CONSTRAINT "return_required_documents_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."return_workflow_history"
    ADD CONSTRAINT "return_workflow_history_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."return_workflow_history"
    ADD CONSTRAINT "return_workflow_history_tax_return_id_fkey" FOREIGN KEY ("tax_return_id") REFERENCES "public"."tax_returns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."security_acknowledgments"
    ADD CONSTRAINT "security_acknowledgments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tax_package_template_items"
    ADD CONSTRAINT "tax_package_template_items_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_types"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."tax_package_template_items"
    ADD CONSTRAINT "tax_package_template_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."tax_package_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tax_return_activity"
    ADD CONSTRAINT "tax_return_activity_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tax_return_activity"
    ADD CONSTRAINT "tax_return_activity_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "public"."tax_returns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tax_returns"
    ADD CONSTRAINT "tax_returns_assigned_preparer_id_fkey" FOREIGN KEY ("assigned_preparer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tax_returns"
    ADD CONSTRAINT "tax_returns_assigned_reviewer_id_fkey" FOREIGN KEY ("assigned_reviewer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tax_returns"
    ADD CONSTRAINT "tax_returns_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."tax_returns"
    ADD CONSTRAINT "tax_returns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tax_returns"
    ADD CONSTRAINT "tax_returns_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vault_audit_log"
    ADD CONSTRAINT "vault_audit_log_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vault_audit_log"
    ADD CONSTRAINT "vault_audit_log_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vault_audit_log"
    ADD CONSTRAINT "vault_audit_log_dependent_id_fkey" FOREIGN KEY ("dependent_id") REFERENCES "public"."client_tax_organizer_dependents"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vault_audit_log"
    ADD CONSTRAINT "vault_audit_log_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vault_audit_log"
    ADD CONSTRAINT "vault_audit_log_vault_secret_id_fkey" FOREIGN KEY ("vault_secret_id") REFERENCES "public"."vault_secrets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vault_secrets"
    ADD CONSTRAINT "vault_secrets_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vault_secrets"
    ADD CONSTRAINT "vault_secrets_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."vault_secrets"
    ADD CONSTRAINT "vault_secrets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vault_secrets"
    ADD CONSTRAINT "vault_secrets_dependent_id_fkey" FOREIGN KEY ("dependent_id") REFERENCES "public"."client_tax_organizer_dependents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vault_secrets"
    ADD CONSTRAINT "vault_secrets_key_version_fkey" FOREIGN KEY ("key_version") REFERENCES "public"."vault_key_versions"("key_version") ON UPDATE RESTRICT ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."vault_secrets"
    ADD CONSTRAINT "vault_secrets_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."client_tax_organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vault_secrets"
    ADD CONSTRAINT "vault_secrets_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vault_secrets"
    ADD CONSTRAINT "vault_secrets_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Active staff can create audit logs" ON "public"."audit_logs" FOR INSERT TO "authenticated" WITH CHECK (("public"."current_user_is_active"() AND (("actor_id" IS NULL) OR ("actor_id" = "auth"."uid"()))));



CREATE POLICY "Active staff can view client portal profiles" ON "public"."client_portal_profiles" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



CREATE POLICY "Active staff can view clients" ON "public"."clients" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



CREATE POLICY "Active staff can view document metadata" ON "public"."client_documents" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



CREATE POLICY "Active staff can view payments" ON "public"."payments" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



CREATE POLICY "Active staff can view tax returns" ON "public"."tax_returns" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



CREATE POLICY "Active users can create their own acknowledgments" ON "public"."security_acknowledgments" FOR INSERT TO "authenticated" WITH CHECK (("public"."current_user_is_active"() AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Administrators can delete client portal profiles" ON "public"."client_portal_profiles" FOR DELETE TO "authenticated" USING ("public"."current_user_is_admin"());



CREATE POLICY "Administrators can delete clients" ON "public"."clients" FOR DELETE TO "authenticated" USING ("public"."current_user_is_admin"());



CREATE POLICY "Administrators can delete payments" ON "public"."payments" FOR DELETE TO "authenticated" USING ("public"."current_user_is_admin"());



CREATE POLICY "Administrators can delete tax returns" ON "public"."tax_returns" FOR DELETE TO "authenticated" USING ("public"."current_user_is_admin"());



CREATE POLICY "Administrators can update profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ("public"."current_user_is_admin"()) WITH CHECK ("public"."current_user_is_admin"());



CREATE POLICY "Administrators can view all acknowledgments" ON "public"."security_acknowledgments" FOR SELECT TO "authenticated" USING ("public"."current_user_is_admin"());



CREATE POLICY "Administrators can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING ("public"."current_user_is_admin"());



CREATE POLICY "Administrators can view audit logs" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING ("public"."current_user_is_admin"());



CREATE POLICY "Authenticated users can insert document activity" ON "public"."document_activity" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can read document activity" ON "public"."document_activity" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read document types" ON "public"."document_types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read return activity" ON "public"."tax_return_activity" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read tax package template items" ON "public"."tax_package_template_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read tax package templates" ON "public"."tax_package_templates" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authorized staff can create client portal profiles" ON "public"."client_portal_profiles" FOR INSERT TO "authenticated" WITH CHECK ("public"."current_user_can_manage_records"());



CREATE POLICY "Authorized staff can create clients" ON "public"."clients" FOR INSERT TO "authenticated" WITH CHECK (("public"."current_user_can_manage_records"() AND (("created_by" IS NULL) OR ("created_by" = "auth"."uid"()))));



CREATE POLICY "Authorized staff can create document metadata" ON "public"."client_documents" FOR INSERT TO "authenticated" WITH CHECK (("public"."current_user_can_manage_records"() AND ("uploaded_by" = "auth"."uid"())));



CREATE POLICY "Authorized staff can create payments" ON "public"."payments" FOR INSERT TO "authenticated" WITH CHECK (("public"."current_user_can_manage_records"() AND (("created_by" IS NULL) OR ("created_by" = "auth"."uid"()))));



CREATE POLICY "Authorized staff can create tax returns" ON "public"."tax_returns" FOR INSERT TO "authenticated" WITH CHECK (("public"."current_user_can_manage_records"() AND (("created_by" IS NULL) OR ("created_by" = "auth"."uid"()))));



CREATE POLICY "Authorized staff can update client portal profiles" ON "public"."client_portal_profiles" FOR UPDATE TO "authenticated" USING ("public"."current_user_can_manage_records"()) WITH CHECK ("public"."current_user_can_manage_records"());



CREATE POLICY "Authorized staff can update clients" ON "public"."clients" FOR UPDATE TO "authenticated" USING ("public"."current_user_can_manage_records"()) WITH CHECK (("public"."current_user_can_manage_records"() AND (("updated_by" IS NULL) OR ("updated_by" = "auth"."uid"()))));



CREATE POLICY "Authorized staff can update document metadata" ON "public"."client_documents" FOR UPDATE TO "authenticated" USING ("public"."current_user_can_manage_records"()) WITH CHECK ("public"."current_user_can_manage_records"());



CREATE POLICY "Authorized staff can update tax returns" ON "public"."tax_returns" FOR UPDATE TO "authenticated" USING ("public"."current_user_can_manage_records"()) WITH CHECK (("public"."current_user_can_manage_records"() AND (("updated_by" IS NULL) OR ("updated_by" = "auth"."uid"()))));



CREATE POLICY "Client can insert identity information" ON "public"."client_tax_organizer_identity_information" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."client_tax_organizers" "organizer"
     JOIN "public"."client_portal_profiles" "profile" ON (("profile"."client_id" = "organizer"."client_id")))
  WHERE (("organizer"."id" = "client_tax_organizer_identity_information"."organizer_id") AND ("profile"."auth_user_id" = "auth"."uid"())))));



CREATE POLICY "Client can update identity information" ON "public"."client_tax_organizer_identity_information" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."client_tax_organizers" "organizer"
     JOIN "public"."client_portal_profiles" "profile" ON (("profile"."client_id" = "organizer"."client_id")))
  WHERE (("organizer"."id" = "client_tax_organizer_identity_information"."organizer_id") AND ("profile"."auth_user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."client_tax_organizers" "organizer"
     JOIN "public"."client_portal_profiles" "profile" ON (("profile"."client_id" = "organizer"."client_id")))
  WHERE (("organizer"."id" = "client_tax_organizer_identity_information"."organizer_id") AND ("profile"."auth_user_id" = "auth"."uid"())))));



CREATE POLICY "Client can view identity information" ON "public"."client_tax_organizer_identity_information" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."client_tax_organizers" "organizer"
     JOIN "public"."client_portal_profiles" "profile" ON (("profile"."client_id" = "organizer"."client_id")))
  WHERE (("organizer"."id" = "client_tax_organizer_identity_information"."organizer_id") AND ("profile"."auth_user_id" = "auth"."uid"())))));



CREATE POLICY "Clients can view their own portal profile" ON "public"."client_portal_profiles" FOR SELECT TO "authenticated" USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Managers can update payments" ON "public"."payments" FOR UPDATE TO "authenticated" USING (("public"."current_user_role"() = ANY (ARRAY['administrator'::"public"."app_role", 'manager'::"public"."app_role"]))) WITH CHECK (("public"."current_user_role"() = ANY (ARRAY['administrator'::"public"."app_role", 'manager'::"public"."app_role"])));



CREATE POLICY "Staff can delete their notifications" ON "public"."notifications" FOR DELETE TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") IS NOT NULL) AND ("recipient_user_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Staff can update their notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") IS NOT NULL) AND ("recipient_user_id" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK (("recipient_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Staff can view their notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") IS NOT NULL) AND ("recipient_user_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Users can insert their notification preferences" ON "public"."notification_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own document notifications" ON "public"."document_notifications" FOR SELECT TO "authenticated" USING ((("recipient_user_id" = "auth"."uid"()) AND "public"."current_user_is_active"()));



CREATE POLICY "Users can update their notification preferences" ON "public"."notification_preferences" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own document notifications" ON "public"."document_notifications" FOR UPDATE TO "authenticated" USING ((("recipient_user_id" = "auth"."uid"()) AND "public"."current_user_is_active"())) WITH CHECK ((("recipient_user_id" = "auth"."uid"()) AND "public"."current_user_is_active"()));



CREATE POLICY "Users can view their notification preferences" ON "public"."notification_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own acknowledgments" ON "public"."security_acknowledgments" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_portal_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_portal_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_banking_information" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_business_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_businesses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_dependent_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_dependents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_healthcare_coverages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_identity_information" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_income_1099_div_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_income_1099_int_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_income_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_income_sources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_income_w2_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_personal_information" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizer_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."client_tax_organizers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dependent_reviews_manage_authorized_staff" ON "public"."client_tax_organizer_dependent_reviews" TO "authenticated" USING ("public"."current_user_can_manage_records"()) WITH CHECK ("public"."current_user_can_manage_records"());



CREATE POLICY "dependent_reviews_select_active_staff" ON "public"."client_tax_organizer_dependent_reviews" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



ALTER TABLE "public"."document_access_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_activity" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_analysis_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "document_analysis_events_staff_select" ON "public"."document_analysis_events" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



ALTER TABLE "public"."document_analysis_extracted_fields" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "document_analysis_fields_staff_select" ON "public"."document_analysis_extracted_fields" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



ALTER TABLE "public"."document_analysis_jobs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "document_analysis_jobs_staff_select" ON "public"."document_analysis_jobs" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



ALTER TABLE "public"."document_analysis_providers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "document_analysis_providers_staff_select" ON "public"."document_analysis_providers" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



ALTER TABLE "public"."document_analysis_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "document_analysis_results_staff_select" ON "public"."document_analysis_results" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



ALTER TABLE "public"."document_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "income_reviews_manage_authorized_staff" ON "public"."client_tax_organizer_income_reviews" TO "authenticated" USING ("public"."current_user_can_manage_records"()) WITH CHECK ("public"."current_user_can_manage_records"());



CREATE POLICY "income_reviews_select_active_staff" ON "public"."client_tax_organizer_income_reviews" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organizer_evidence_events_active_staff_select" ON "public"."organizer_evidence_verification_events" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



CREATE POLICY "organizer_evidence_events_authorized_staff_insert" ON "public"."organizer_evidence_verification_events" FOR INSERT TO "authenticated" WITH CHECK (("public"."current_user_can_manage_records"() AND ("actor_id" = "auth"."uid"())));



ALTER TABLE "public"."organizer_evidence_links" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organizer_evidence_links_active_staff_select" ON "public"."organizer_evidence_links" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



CREATE POLICY "organizer_evidence_links_authorized_staff_manage" ON "public"."organizer_evidence_links" TO "authenticated" USING ("public"."current_user_can_manage_records"()) WITH CHECK ("public"."current_user_can_manage_records"());



ALTER TABLE "public"."organizer_evidence_sources" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organizer_evidence_sources_active_staff_select" ON "public"."organizer_evidence_sources" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



CREATE POLICY "organizer_evidence_sources_authorized_staff_manage" ON "public"."organizer_evidence_sources" TO "authenticated" USING ("public"."current_user_can_manage_records"()) WITH CHECK ("public"."current_user_can_manage_records"());



ALTER TABLE "public"."organizer_evidence_verification_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizer_review_checklist_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizer_review_checklist_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizer_review_checklist_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizer_review_timeline_entries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organizer_review_timeline_insert_authorized_staff" ON "public"."organizer_review_timeline_entries" FOR INSERT TO "authenticated" WITH CHECK (("public"."current_user_can_manage_records"() AND ("actor_id" = "auth"."uid"())));



CREATE POLICY "organizer_review_timeline_select_active_staff" ON "public"."organizer_review_timeline_entries" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."required_document_templates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "required_document_templates_manage_authorized_users" ON "public"."required_document_templates" TO "authenticated" USING ("public"."current_user_can_manage_records"()) WITH CHECK ("public"."current_user_can_manage_records"());



CREATE POLICY "required_document_templates_select_active_users" ON "public"."required_document_templates" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



ALTER TABLE "public"."return_required_documents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "return_required_documents_manage_authorized_users" ON "public"."return_required_documents" TO "authenticated" USING ("public"."current_user_can_manage_records"()) WITH CHECK ("public"."current_user_can_manage_records"());



CREATE POLICY "return_required_documents_select_active_users" ON "public"."return_required_documents" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



ALTER TABLE "public"."return_workflow_history" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "review_checklist_definitions_staff_select" ON "public"."organizer_review_checklist_definitions" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



CREATE POLICY "review_checklist_items_staff_select" ON "public"."organizer_review_checklist_items" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



CREATE POLICY "review_checklist_responses_staff_manage" ON "public"."organizer_review_checklist_responses" TO "authenticated" USING ("public"."current_user_can_manage_records"()) WITH CHECK ("public"."current_user_can_manage_records"());



CREATE POLICY "review_checklist_responses_staff_select" ON "public"."organizer_review_checklist_responses" FOR SELECT TO "authenticated" USING ("public"."current_user_is_active"());



ALTER TABLE "public"."security_acknowledgments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tax_package_template_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tax_package_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tax_return_activity" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tax_returns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vault_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vault_key_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vault_secrets" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."security_acknowledgments" TO "authenticated";
GRANT ALL ON TABLE "public"."security_acknowledgments" TO "service_role";



REVOKE ALL ON FUNCTION "public"."accept_security_notice"("requested_notice_version" "text", "requested_user_agent" "text", "requested_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."accept_security_notice"("requested_notice_version" "text", "requested_user_agent" "text", "requested_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_security_notice"("requested_notice_version" "text", "requested_user_agent" "text", "requested_metadata" "jsonb") TO "service_role";



GRANT ALL ON TABLE "public"."client_portal_accounts" TO "anon";
GRANT ALL ON TABLE "public"."client_portal_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."client_portal_accounts" TO "service_role";



REVOKE ALL ON FUNCTION "public"."activate_client_portal_account"("requested_token_hash" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."activate_client_portal_account"("requested_token_hash" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."activate_client_portal_account"("requested_token_hash" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."activate_client_portal_account"("requested_token_hash" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."add_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_suffix" "text", "requested_relationship" "text", "requested_birth_date" "date", "requested_is_full_time_student" boolean, "requested_is_permanently_disabled" boolean, "requested_lived_with_taxpayer_all_year" boolean, "requested_months_lived_with_taxpayer" smallint, "requested_us_citizen_or_resident" boolean, "requested_claimed_by_another_taxpayer" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."add_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_suffix" "text", "requested_relationship" "text", "requested_birth_date" "date", "requested_is_full_time_student" boolean, "requested_is_permanently_disabled" boolean, "requested_lived_with_taxpayer_all_year" boolean, "requested_months_lived_with_taxpayer" smallint, "requested_us_citizen_or_resident" boolean, "requested_claimed_by_another_taxpayer" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_suffix" "text", "requested_relationship" "text", "requested_birth_date" "date", "requested_is_full_time_student" boolean, "requested_is_permanently_disabled" boolean, "requested_lived_with_taxpayer_all_year" boolean, "requested_months_lived_with_taxpayer" smallint, "requested_us_citizen_or_resident" boolean, "requested_claimed_by_another_taxpayer" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."add_organizer_review_staff_note"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_note_text" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."add_organizer_review_staff_note"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_note_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_organizer_review_staff_note"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_note_text" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."add_organizer_review_workflow_event"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_event_type" "text", "requested_note_text" "text", "requested_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."add_organizer_review_workflow_event"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_event_type" "text", "requested_note_text" "text", "requested_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_organizer_review_workflow_event"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_event_type" "text", "requested_note_text" "text", "requested_metadata" "jsonb") TO "service_role";



GRANT ALL ON TABLE "public"."client_documents" TO "anon";
GRANT ALL ON TABLE "public"."client_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."client_documents" TO "service_role";



GRANT ALL ON FUNCTION "public"."approve_document"("p_document_id" "uuid", "p_comments" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_document"("p_document_id" "uuid", "p_comments" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_document"("p_document_id" "uuid", "p_comments" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."archive_client_document"("requested_document_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."archive_client_document"("requested_document_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."archive_client_document"("requested_document_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_client_document"("requested_document_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."assign_tax_return_preparer"("requested_return_id" "uuid", "requested_preparer_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."assign_tax_return_preparer"("requested_return_id" "uuid", "requested_preparer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_tax_return_preparer"("requested_return_id" "uuid", "requested_preparer_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_view_executive_financial_analytics"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_view_executive_financial_analytics"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_view_executive_financial_analytics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_view_executive_financial_analytics"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."complete_client_portal_activation"("requested_token_hash" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."complete_client_portal_activation"("requested_token_hash" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_client_portal_activation"("requested_token_hash" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_client_portal_activation"("requested_token_hash" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_required_document"("requested_required_document_id" "uuid", "requested_document_id" "uuid", "requested_is_complete" boolean, "requested_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_required_document"("requested_required_document_id" "uuid", "requested_document_id" "uuid", "requested_is_complete" boolean, "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_required_document"("requested_required_document_id" "uuid", "requested_document_id" "uuid", "requested_is_complete" boolean, "requested_notes" "text") TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_businesses" TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_client_organizer_business"("requested_organizer_id" "uuid", "requested_business" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_client_organizer_business"("requested_organizer_id" "uuid", "requested_business" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_client_organizer_business"("requested_organizer_id" "uuid", "requested_business" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_provider_name" "text", "requested_coverage_type" "text", "requested_covered_person_name" "text", "requested_policy_number" "text", "requested_start_month" integer, "requested_end_month" integer, "requested_is_full_year_coverage" boolean, "requested_document_received" boolean, "requested_document_type" "text", "requested_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_provider_name" "text", "requested_coverage_type" "text", "requested_covered_person_name" "text", "requested_policy_number" "text", "requested_start_month" integer, "requested_end_month" integer, "requested_is_full_year_coverage" boolean, "requested_document_received" boolean, "requested_document_type" "text", "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_provider_name" "text", "requested_coverage_type" "text", "requested_covered_person_name" "text", "requested_policy_number" "text", "requested_start_month" integer, "requested_end_month" integer, "requested_is_full_year_coverage" boolean, "requested_document_received" boolean, "requested_document_type" "text", "requested_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_type" "text", "requested_payer_name" "text", "requested_recipient_type" "text", "requested_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_type" "text", "requested_payer_name" "text", "requested_recipient_type" "text", "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_type" "text", "requested_payer_name" "text", "requested_recipient_type" "text", "requested_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_client_portal_account"("requested_client_id" "uuid", "requested_email" "text", "requested_invitation_token_hash" "text", "requested_invitation_expires_at" timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_client_portal_account"("requested_client_id" "uuid", "requested_email" "text", "requested_invitation_token_hash" "text", "requested_invitation_expires_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."create_client_portal_account"("requested_client_id" "uuid", "requested_email" "text", "requested_invitation_token_hash" "text", "requested_invitation_expires_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_client_portal_account"("requested_client_id" "uuid", "requested_email" "text", "requested_invitation_token_hash" "text", "requested_invitation_expires_at" timestamp with time zone) TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_client_record"("requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_preferred_name" "text", "requested_email" "text", "requested_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_birth_date" "date", "requested_status" "public"."client_status", "requested_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_client_record"("requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_preferred_name" "text", "requested_email" "text", "requested_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_birth_date" "date", "requested_status" "public"."client_status", "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_client_record"("requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_preferred_name" "text", "requested_email" "text", "requested_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_birth_date" "date", "requested_status" "public"."client_status", "requested_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_document_version"("requested_document_id" "uuid", "requested_original_file_name" "text", "requested_storage_bucket" "text", "requested_storage_path" "text", "requested_mime_type" "text", "requested_size_bytes" bigint, "requested_version_notes" "text", "requested_file_hash" "text", "requested_hash_algorithm" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_document_version"("requested_document_id" "uuid", "requested_original_file_name" "text", "requested_storage_bucket" "text", "requested_storage_path" "text", "requested_mime_type" "text", "requested_size_bytes" bigint, "requested_version_notes" "text", "requested_file_hash" "text", "requested_hash_algorithm" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_document_version"("requested_document_id" "uuid", "requested_original_file_name" "text", "requested_storage_bucket" "text", "requested_storage_path" "text", "requested_mime_type" "text", "requested_size_bytes" bigint, "requested_version_notes" "text", "requested_file_hash" "text", "requested_hash_algorithm" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_document_version"("requested_document_id" "uuid", "requested_original_file_name" "text", "requested_storage_bucket" "text", "requested_storage_path" "text", "requested_mime_type" "text", "requested_size_bytes" bigint, "requested_version_notes" "text", "requested_file_hash" "text", "requested_hash_algorithm" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_organizer_evidence_source"("requested_organizer_id" "uuid", "requested_return_id" "uuid", "requested_document_id" "uuid", "requested_evidence_type" "text", "requested_title" "text", "requested_description" "text", "requested_confidence" "text", "requested_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_organizer_evidence_source"("requested_organizer_id" "uuid", "requested_return_id" "uuid", "requested_document_id" "uuid", "requested_evidence_type" "text", "requested_title" "text", "requested_description" "text", "requested_confidence" "text", "requested_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_organizer_evidence_source"("requested_organizer_id" "uuid", "requested_return_id" "uuid", "requested_document_id" "uuid", "requested_evidence_type" "text", "requested_title" "text", "requested_description" "text", "requested_confidence" "text", "requested_metadata" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_return_assignment_notification"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_return_assignment_notification"() TO "service_role";



GRANT ALL ON TABLE "public"."tax_returns" TO "authenticated";
GRANT ALL ON TABLE "public"."tax_returns" TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_tax_return_record"("requested_client_id" "uuid", "requested_tax_year" integer, "requested_return_type" "public"."return_type", "requested_tax_form" "public"."tax_form_type", "requested_filing_status" "public"."filing_status", "requested_status" "public"."return_status", "requested_assigned_preparer_id" "uuid", "requested_assigned_reviewer_id" "uuid", "requested_date_received" "date", "requested_due_date" "date", "requested_filed_date" "date", "requested_accepted_date" "date", "requested_preparation_fee" numeric, "requested_discount_amount" numeric, "requested_description" "text", "requested_federal_return_required" boolean, "requested_state_return_required" boolean, "requested_local_return_required" boolean, "requested_extension_filed" boolean, "requested_extension_date" "date", "requested_estimated_refund" numeric, "requested_estimated_amount_due" numeric, "requested_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_tax_return_record"("requested_client_id" "uuid", "requested_tax_year" integer, "requested_return_type" "public"."return_type", "requested_tax_form" "public"."tax_form_type", "requested_filing_status" "public"."filing_status", "requested_status" "public"."return_status", "requested_assigned_preparer_id" "uuid", "requested_assigned_reviewer_id" "uuid", "requested_date_received" "date", "requested_due_date" "date", "requested_filed_date" "date", "requested_accepted_date" "date", "requested_preparation_fee" numeric, "requested_discount_amount" numeric, "requested_description" "text", "requested_federal_return_required" boolean, "requested_state_return_required" boolean, "requested_local_return_required" boolean, "requested_extension_filed" boolean, "requested_extension_date" "date", "requested_estimated_refund" numeric, "requested_estimated_amount_due" numeric, "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_tax_return_record"("requested_client_id" "uuid", "requested_tax_year" integer, "requested_return_type" "public"."return_type", "requested_tax_form" "public"."tax_form_type", "requested_filing_status" "public"."filing_status", "requested_status" "public"."return_status", "requested_assigned_preparer_id" "uuid", "requested_assigned_reviewer_id" "uuid", "requested_date_received" "date", "requested_due_date" "date", "requested_filed_date" "date", "requested_accepted_date" "date", "requested_preparation_fee" numeric, "requested_discount_amount" numeric, "requested_description" "text", "requested_federal_return_required" boolean, "requested_state_return_required" boolean, "requested_local_return_required" boolean, "requested_extension_filed" boolean, "requested_extension_date" "date", "requested_estimated_refund" numeric, "requested_estimated_amount_due" numeric, "requested_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."current_actor_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_actor_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_actor_id"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."current_client_id"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."current_client_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_client_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_client_id"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."current_client_portal_is_active"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."current_client_portal_is_active"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_client_portal_is_active"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_client_portal_is_active"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."current_client_portal_profile_id"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."current_client_portal_profile_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_client_portal_profile_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_client_portal_profile_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_can_manage_records"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_can_manage_records"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_can_manage_records"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_is_active"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_is_active"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_is_active"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_role"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."delete_client_organizer_business"("requested_organizer_id" "uuid", "requested_business_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."delete_client_organizer_business"("requested_organizer_id" "uuid", "requested_business_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_client_organizer_business"("requested_organizer_id" "uuid", "requested_business_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."delete_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_dependent_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."delete_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_dependent_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_dependent_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."delete_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_coverage_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."delete_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_coverage_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_coverage_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."delete_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."delete_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."describe_tax_return_change"("old_record" "public"."tax_returns", "new_record" "public"."tax_returns") TO "anon";
GRANT ALL ON FUNCTION "public"."describe_tax_return_change"("old_record" "public"."tax_returns", "new_record" "public"."tax_returns") TO "authenticated";
GRANT ALL ON FUNCTION "public"."describe_tax_return_change"("old_record" "public"."tax_returns", "new_record" "public"."tax_returns") TO "service_role";



GRANT ALL ON FUNCTION "public"."find_matching_document_hash"("requested_client_id" "uuid", "requested_tax_return_id" "uuid", "requested_file_hash" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."find_matching_document_hash"("requested_client_id" "uuid", "requested_tax_return_id" "uuid", "requested_file_hash" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_matching_document_hash"("requested_client_id" "uuid", "requested_tax_return_id" "uuid", "requested_file_hash" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_payment_receipt_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_payment_receipt_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_payment_receipt_number"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_active_vault_key_version"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_active_vault_key_version"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_document_activity"("requested_client_id" "uuid", "requested_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_document_activity"("requested_client_id" "uuid", "requested_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_document_activity"("requested_client_id" "uuid", "requested_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_organizer_banking_information"("requested_organizer_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_organizer_banking_information"("requested_organizer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_organizer_banking_information"("requested_organizer_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_organizer_business_response"("requested_organizer_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_organizer_business_response"("requested_organizer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_organizer_business_response"("requested_organizer_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_organizer_businesses"("requested_organizer_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_organizer_businesses"("requested_organizer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_organizer_businesses"("requested_organizer_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_organizer_dependents"("requested_organizer_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_organizer_dependents"("requested_organizer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_organizer_dependents"("requested_organizer_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_organizer_healthcare_coverages"("requested_organizer_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_organizer_healthcare_coverages"("requested_organizer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_organizer_healthcare_coverages"("requested_organizer_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_organizer_identity_information"("requested_organizer_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_organizer_identity_information"("requested_organizer_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_client_organizer_identity_information"("requested_organizer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_organizer_identity_information"("requested_organizer_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_organizer_income_1099_div_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_organizer_income_1099_div_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_organizer_income_1099_div_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_organizer_income_1099_int_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_organizer_income_1099_int_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_organizer_income_1099_int_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_organizer_income_sources"("requested_organizer_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_organizer_income_sources"("requested_organizer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_organizer_income_sources"("requested_organizer_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_organizer_income_w2_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_organizer_income_w2_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_organizer_income_w2_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_organizer_personal_information"("requested_organizer_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_organizer_personal_information"("requested_organizer_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_client_organizer_personal_information"("requested_organizer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_organizer_personal_information"("requested_organizer_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_portal_dashboard"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_portal_dashboard"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_client_portal_dashboard"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_portal_dashboard"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_returns"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_returns"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_client_returns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_returns"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_client_tax_returns"("requested_client_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_client_tax_returns"("requested_client_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_tax_returns"("requested_client_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_current_access_status"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_current_access_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_access_status"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_current_client_profile"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_current_client_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_client_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_client_profile"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard_attention_items"("requested_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_attention_items"("requested_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_attention_items"("requested_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_executive_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_executive_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_executive_metrics"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard_monthly_financials"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_monthly_financials"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_monthly_financials"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard_my_workload"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_my_workload"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_my_workload"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard_priority_queue"("requested_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_priority_queue"("requested_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_priority_queue"("requested_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_priority_queue"("requested_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard_readiness_metrics"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_readiness_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_readiness_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_readiness_metrics"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard_recent_returns"("requested_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_recent_returns"("requested_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_recent_returns"("requested_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard_smart_recommendations"("requested_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_smart_recommendations"("requested_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_smart_recommendations"("requested_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_smart_recommendations"("requested_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard_staff_workload"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_staff_workload"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_staff_workload"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard_status_metrics"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_status_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_status_metrics"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_dashboard_summary"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_dashboard_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_summary"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_document_analysis_jobs"("requested_document_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_document_analysis_jobs"("requested_document_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_document_analysis_jobs"("requested_document_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_executive_financial_analytics"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_executive_financial_analytics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_executive_financial_analytics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_executive_financial_analytics"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_my_unread_document_notification_count"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_my_unread_document_notification_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_unread_document_notification_count"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_office_payment_summary"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_office_payment_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_office_payment_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_office_payment_summary"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_or_create_client_tax_organizer"("requested_tax_year" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_or_create_client_tax_organizer"("requested_tax_year" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_client_tax_organizer"("requested_tax_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_client_tax_organizer"("requested_tax_year" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_organizer_review_checklist"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_organizer_review_checklist"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_organizer_review_checklist"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_organizer_review_timeline"("requested_organizer_id" "uuid", "requested_subject_type" "text", "requested_subject_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_organizer_review_timeline"("requested_organizer_id" "uuid", "requested_subject_type" "text", "requested_subject_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_organizer_review_timeline"("requested_organizer_id" "uuid", "requested_subject_type" "text", "requested_subject_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_organizer_subject_evidence"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_organizer_subject_evidence"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_organizer_subject_evidence"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_payment_receipt"("requested_payment_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_payment_receipt"("requested_payment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_payment_receipt"("requested_payment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_payment_receipt"("requested_payment_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_recent_dashboard_activity"("requested_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_recent_dashboard_activity"("requested_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recent_dashboard_activity"("requested_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_recent_office_payments"("requested_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_recent_office_payments"("requested_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_recent_office_payments"("requested_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recent_office_payments"("requested_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_return_payment_summary"("requested_return_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_return_payment_summary"("requested_return_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_return_payment_summary"("requested_return_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_return_payment_summary"("requested_return_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_return_payments"("requested_return_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_return_payments"("requested_return_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_return_payments"("requested_return_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_return_payments"("requested_return_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_return_staff_options"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_return_staff_options"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_return_staff_options"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_return_workflow_history"("requested_return_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_return_workflow_history"("requested_return_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_return_workflow_history"("requested_return_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_return_workflow_history"("requested_return_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_return_workspace_summary"("p_return_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_return_workspace_summary"("p_return_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_return_workspace_summary"("p_return_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_staff_client_organizer_workspace"("requested_client_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_staff_client_organizer_workspace"("requested_client_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_staff_client_organizer_workspace"("requested_client_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_staff_dependent_review"("requested_dependent_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_staff_dependent_review"("requested_dependent_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_staff_dependent_review"("requested_dependent_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_staff_income_review"("requested_client_id" "uuid", "requested_tax_year" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_staff_income_review"("requested_client_id" "uuid", "requested_tax_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_staff_income_review"("requested_client_id" "uuid", "requested_tax_year" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_staff_organizer_dependents_review"("requested_client_id" "uuid", "requested_tax_year" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_staff_organizer_dependents_review"("requested_client_id" "uuid", "requested_tax_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_staff_organizer_dependents_review"("requested_client_id" "uuid", "requested_tax_year" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_staff_organizer_healthcare_review"("requested_client_id" "uuid", "requested_tax_year" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_staff_organizer_healthcare_review"("requested_client_id" "uuid", "requested_tax_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_staff_organizer_healthcare_review"("requested_client_id" "uuid", "requested_tax_year" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_staff_organizer_income_review"("requested_client_id" "uuid", "requested_tax_year" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_staff_organizer_income_review"("requested_client_id" "uuid", "requested_tax_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_staff_organizer_income_review"("requested_client_id" "uuid", "requested_tax_year" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_staff_organizer_summary"("requested_client_id" "uuid", "requested_tax_year" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_staff_organizer_summary"("requested_client_id" "uuid", "requested_tax_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_staff_organizer_summary"("requested_client_id" "uuid", "requested_tax_year" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_staff_workload_summary"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_staff_workload_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_staff_workload_summary"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_tax_return_activity"("requested_return_id" "uuid", "requested_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_tax_return_activity"("requested_return_id" "uuid", "requested_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_tax_return_activity"("requested_return_id" "uuid", "requested_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_tax_return_activity"("requested_return_id" "uuid", "requested_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_tax_return_details"("requested_return_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_tax_return_details"("requested_return_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_tax_return_details"("requested_return_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."has_accepted_security_notice"("requested_notice_version" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."has_accepted_security_notice"("requested_notice_version" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_accepted_security_notice"("requested_notice_version" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_row_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."initialize_document_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."initialize_document_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."initialize_document_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."initialize_platform_record"() TO "service_role";



GRANT ALL ON FUNCTION "public"."initialize_required_documents"("requested_return_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."initialize_required_documents"("requested_return_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."initialize_required_documents"("requested_return_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_valid_return_status_transition"("current_status" "public"."return_status", "requested_status" "public"."return_status") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_valid_return_status_transition"("current_status" "public"."return_status", "requested_status" "public"."return_status") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_valid_return_status_transition"("current_status" "public"."return_status", "requested_status" "public"."return_status") TO "service_role";



REVOKE ALL ON FUNCTION "public"."link_organizer_evidence"("requested_evidence_id" "uuid", "requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_field_key" "text", "requested_link_type" "text", "requested_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."link_organizer_evidence"("requested_evidence_id" "uuid", "requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_field_key" "text", "requested_link_type" "text", "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."link_organizer_evidence"("requested_evidence_id" "uuid", "requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_field_key" "text", "requested_link_type" "text", "requested_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."list_client_documents"("requested_client_id" "uuid", "requested_tax_return_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."list_client_documents"("requested_client_id" "uuid", "requested_tax_return_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_client_documents"("requested_client_id" "uuid", "requested_tax_return_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_document_reviewers"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_document_reviewers"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_document_reviewers"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_document_versions"("requested_document_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_document_versions"("requested_document_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."list_document_versions"("requested_document_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_document_versions"("requested_document_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_my_assigned_document_reviews"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_my_assigned_document_reviews"() TO "anon";
GRANT ALL ON FUNCTION "public"."list_my_assigned_document_reviews"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_my_assigned_document_reviews"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_my_document_notifications"("p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_my_document_notifications"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_my_document_notifications"("p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_organizer_available_documents"("requested_organizer_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_organizer_available_documents"("requested_organizer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_organizer_available_documents"("requested_organizer_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."list_required_documents"("requested_return_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."list_required_documents"("requested_return_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_required_documents"("requested_return_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."log_return_workflow"("requested_return_id" "uuid", "requested_event_type" "text", "requested_event_label" "text", "requested_event_description" "text", "requested_is_client_visible" boolean, "requested_event_data" "jsonb", "requested_occurred_at" timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."log_return_workflow"("requested_return_id" "uuid", "requested_event_type" "text", "requested_event_label" "text", "requested_event_description" "text", "requested_is_client_visible" boolean, "requested_event_data" "jsonb", "requested_occurred_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."log_return_workflow"("requested_return_id" "uuid", "requested_event_type" "text", "requested_event_label" "text", "requested_event_description" "text", "requested_is_client_visible" boolean, "requested_event_data" "jsonb", "requested_occurred_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_return_workflow"("requested_return_id" "uuid", "requested_event_type" "text", "requested_event_label" "text", "requested_event_description" "text", "requested_is_client_visible" boolean, "requested_event_data" "jsonb", "requested_occurred_at" timestamp with time zone) TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_all_document_notifications_read"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_all_document_notifications_read"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_all_document_notifications_read"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_dependent_review_complete"("requested_dependent_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_dependent_review_complete"("requested_dependent_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_dependent_review_complete"("requested_dependent_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_dependent_review_needs_followup"("requested_dependent_id" "uuid", "requested_internal_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_dependent_review_needs_followup"("requested_dependent_id" "uuid", "requested_internal_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_dependent_review_needs_followup"("requested_dependent_id" "uuid", "requested_internal_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_document_notification_read"("p_notification_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_document_notification_read"("p_notification_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_document_notification_read"("p_notification_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_income_review_complete"("requested_income_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_income_review_complete"("requested_income_source_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_income_review_complete"("requested_income_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."mark_income_review_needs_followup"("requested_income_source_id" "uuid", "requested_internal_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_income_review_needs_followup"("requested_income_source_id" "uuid", "requested_internal_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_income_review_needs_followup"("requested_income_source_id" "uuid", "requested_internal_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_vault_audit_log_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_vault_audit_log_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_vault_audit_log_changes"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."queue_document_analysis_job"("requested_document_id" "uuid", "requested_organizer_id" "uuid", "requested_evidence_id" "uuid", "requested_provider_key" "text", "requested_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."queue_document_analysis_job"("requested_document_id" "uuid", "requested_organizer_id" "uuid", "requested_evidence_id" "uuid", "requested_provider_key" "text", "requested_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."queue_document_analysis_job"("requested_document_id" "uuid", "requested_organizer_id" "uuid", "requested_evidence_id" "uuid", "requested_provider_key" "text", "requested_metadata" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."record_client_portal_login"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."record_client_portal_login"() TO "anon";
GRANT ALL ON FUNCTION "public"."record_client_portal_login"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_client_portal_login"() TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



REVOKE ALL ON FUNCTION "public"."record_return_payment"("requested_return_id" "uuid", "requested_amount" numeric, "requested_payment_method" "public"."payment_method", "requested_payment_date" "date", "requested_reference_number" "text", "requested_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."record_return_payment"("requested_return_id" "uuid", "requested_amount" numeric, "requested_payment_method" "public"."payment_method", "requested_payment_date" "date", "requested_reference_number" "text", "requested_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."record_return_payment"("requested_return_id" "uuid", "requested_amount" numeric, "requested_payment_method" "public"."payment_method", "requested_payment_date" "date", "requested_reference_number" "text", "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_return_payment"("requested_return_id" "uuid", "requested_amount" numeric, "requested_payment_method" "public"."payment_method", "requested_payment_date" "date", "requested_reference_number" "text", "requested_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."record_return_workflow_history"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."record_return_workflow_history"() TO "anon";
GRANT ALL ON FUNCTION "public"."record_return_workflow_history"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_return_workflow_history"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."record_security_event"("requested_action" "text", "requested_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."record_security_event"("requested_action" "text", "requested_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_security_event"("requested_action" "text", "requested_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."record_tax_return_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."record_tax_return_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_tax_return_activity"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."refresh_client_business_organizer_progress"("requested_organizer_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."refresh_client_business_organizer_progress"("requested_organizer_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."register_client_document"("requested_client_id" "uuid", "requested_tax_return_id" "uuid", "requested_category" "text", "requested_original_file_name" "text", "requested_storage_bucket" "text", "requested_storage_path" "text", "requested_mime_type" "text", "requested_size_bytes" bigint, "requested_description" "text", "requested_file_hash" "text", "requested_hash_algorithm" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."register_client_document"("requested_client_id" "uuid", "requested_tax_return_id" "uuid", "requested_category" "text", "requested_original_file_name" "text", "requested_storage_bucket" "text", "requested_storage_path" "text", "requested_mime_type" "text", "requested_size_bytes" bigint, "requested_description" "text", "requested_file_hash" "text", "requested_hash_algorithm" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."register_client_document"("requested_client_id" "uuid", "requested_tax_return_id" "uuid", "requested_category" "text", "requested_original_file_name" "text", "requested_storage_bucket" "text", "requested_storage_path" "text", "requested_mime_type" "text", "requested_size_bytes" bigint, "requested_description" "text", "requested_file_hash" "text", "requested_hash_algorithm" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."register_client_document"("requested_client_id" "uuid", "requested_tax_return_id" "uuid", "requested_category" "text", "requested_original_file_name" "text", "requested_storage_bucket" "text", "requested_storage_path" "text", "requested_mime_type" "text", "requested_size_bytes" bigint, "requested_description" "text", "requested_file_hash" "text", "requested_hash_algorithm" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."register_document_as_organizer_evidence"("requested_organizer_id" "uuid", "requested_document_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_field_key" "text", "requested_evidence_type" "text", "requested_confidence" "text", "requested_link_type" "text", "requested_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."register_document_as_organizer_evidence"("requested_organizer_id" "uuid", "requested_document_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_field_key" "text", "requested_evidence_type" "text", "requested_confidence" "text", "requested_link_type" "text", "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."register_document_as_organizer_evidence"("requested_organizer_id" "uuid", "requested_document_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_field_key" "text", "requested_evidence_type" "text", "requested_confidence" "text", "requested_link_type" "text", "requested_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."request_document_changes"("p_document_id" "uuid", "p_comments" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."request_document_changes"("p_document_id" "uuid", "p_comments" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."request_document_changes"("p_document_id" "uuid", "p_comments" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."request_document_review"("p_document_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."request_document_review"("p_document_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."request_document_review"("p_document_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."request_document_review_assignment"("p_document_id" "uuid", "p_reviewer_id" "uuid", "p_review_due_at" timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."request_document_review_assignment"("p_document_id" "uuid", "p_reviewer_id" "uuid", "p_review_due_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."request_document_review_assignment"("p_document_id" "uuid", "p_reviewer_id" "uuid", "p_review_due_at" timestamp with time zone) TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizers" TO "anon";
GRANT ALL ON TABLE "public"."client_tax_organizers" TO "authenticated";
GRANT ALL ON TABLE "public"."client_tax_organizers" TO "service_role";



REVOKE ALL ON FUNCTION "public"."require_client_business_organizer_access"("requested_organizer_id" "uuid", "requested_require_editable" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."require_client_business_organizer_access"("requested_organizer_id" "uuid", "requested_require_editable" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_document_review"("p_document_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."reset_document_review"("p_document_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_document_review"("p_document_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."restore_document_version"("requested_document_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."restore_document_version"("requested_document_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."restore_document_version"("requested_document_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."restore_document_version"("requested_document_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."return_dependent_to_client"("requested_dependent_id" "uuid", "requested_internal_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."return_dependent_to_client"("requested_dependent_id" "uuid", "requested_internal_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."return_dependent_to_client"("requested_dependent_id" "uuid", "requested_internal_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."return_income_record_to_client"("requested_income_source_id" "uuid", "requested_internal_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."return_income_record_to_client"("requested_income_source_id" "uuid", "requested_internal_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."return_income_record_to_client"("requested_income_source_id" "uuid", "requested_internal_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_client_organizer_banking_information"("requested_organizer_id" "uuid", "requested_account_holder_name" "text", "requested_bank_name" "text", "requested_account_type" "text", "requested_use_direct_deposit" boolean, "requested_authorize_direct_debit" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_client_organizer_banking_information"("requested_organizer_id" "uuid", "requested_account_holder_name" "text", "requested_bank_name" "text", "requested_account_type" "text", "requested_use_direct_deposit" boolean, "requested_authorize_direct_debit" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_client_organizer_banking_information"("requested_organizer_id" "uuid", "requested_account_holder_name" "text", "requested_bank_name" "text", "requested_account_type" "text", "requested_use_direct_deposit" boolean, "requested_authorize_direct_debit" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_client_organizer_identity_information"("requested_organizer_id" "uuid", "requested_identification_type" "text", "requested_identification_state" "text", "requested_identification_issue_date" "date", "requested_identification_expiration_date" "date", "requested_citizenship_status" "text", "requested_is_us_citizen" boolean, "requested_has_government_photo_id" boolean, "requested_has_identity_changed" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_client_organizer_identity_information"("requested_organizer_id" "uuid", "requested_identification_type" "text", "requested_identification_state" "text", "requested_identification_issue_date" "date", "requested_identification_expiration_date" "date", "requested_citizenship_status" "text", "requested_is_us_citizen" boolean, "requested_has_government_photo_id" boolean, "requested_has_identity_changed" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."save_client_organizer_identity_information"("requested_organizer_id" "uuid", "requested_identification_type" "text", "requested_identification_state" "text", "requested_identification_issue_date" "date", "requested_identification_expiration_date" "date", "requested_citizenship_status" "text", "requested_is_us_citizen" boolean, "requested_has_government_photo_id" boolean, "requested_has_identity_changed" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_client_organizer_identity_information"("requested_organizer_id" "uuid", "requested_identification_type" "text", "requested_identification_state" "text", "requested_identification_issue_date" "date", "requested_identification_expiration_date" "date", "requested_citizenship_status" "text", "requested_is_us_citizen" boolean, "requested_has_government_photo_id" boolean, "requested_has_identity_changed" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_client_organizer_income_1099_div_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_identification_number" "text", "requested_total_ordinary_dividends" numeric, "requested_qualified_dividends" numeric, "requested_total_capital_gain_distributions" numeric, "requested_unrecaptured_section_1250_gain" numeric, "requested_section_1202_gain" numeric, "requested_collectibles_28_percent_rate_gain" numeric, "requested_section_897_ordinary_dividends" numeric, "requested_section_897_capital_gain" numeric, "requested_nondividend_distributions" numeric, "requested_federal_income_tax_withheld" numeric, "requested_section_199a_dividends" numeric, "requested_investment_expenses" numeric, "requested_foreign_tax_paid" numeric, "requested_foreign_country_or_us_possession" "text", "requested_exempt_interest_dividends" numeric, "requested_specified_private_activity_bond_interest_dividends" numeric, "requested_state_code" "text", "requested_state_identification_number" "text", "requested_state_tax_withheld" numeric, "requested_document_received" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_client_organizer_income_1099_div_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_identification_number" "text", "requested_total_ordinary_dividends" numeric, "requested_qualified_dividends" numeric, "requested_total_capital_gain_distributions" numeric, "requested_unrecaptured_section_1250_gain" numeric, "requested_section_1202_gain" numeric, "requested_collectibles_28_percent_rate_gain" numeric, "requested_section_897_ordinary_dividends" numeric, "requested_section_897_capital_gain" numeric, "requested_nondividend_distributions" numeric, "requested_federal_income_tax_withheld" numeric, "requested_section_199a_dividends" numeric, "requested_investment_expenses" numeric, "requested_foreign_tax_paid" numeric, "requested_foreign_country_or_us_possession" "text", "requested_exempt_interest_dividends" numeric, "requested_specified_private_activity_bond_interest_dividends" numeric, "requested_state_code" "text", "requested_state_identification_number" "text", "requested_state_tax_withheld" numeric, "requested_document_received" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_client_organizer_income_1099_div_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_identification_number" "text", "requested_total_ordinary_dividends" numeric, "requested_qualified_dividends" numeric, "requested_total_capital_gain_distributions" numeric, "requested_unrecaptured_section_1250_gain" numeric, "requested_section_1202_gain" numeric, "requested_collectibles_28_percent_rate_gain" numeric, "requested_section_897_ordinary_dividends" numeric, "requested_section_897_capital_gain" numeric, "requested_nondividend_distributions" numeric, "requested_federal_income_tax_withheld" numeric, "requested_section_199a_dividends" numeric, "requested_investment_expenses" numeric, "requested_foreign_tax_paid" numeric, "requested_foreign_country_or_us_possession" "text", "requested_exempt_interest_dividends" numeric, "requested_specified_private_activity_bond_interest_dividends" numeric, "requested_state_code" "text", "requested_state_identification_number" "text", "requested_state_tax_withheld" numeric, "requested_document_received" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_client_organizer_income_1099_int_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_identification_number" "text", "requested_interest_income" numeric, "requested_early_withdrawal_penalty" numeric, "requested_interest_on_us_savings_bonds_and_treasury_obligations" numeric, "requested_federal_income_tax_withheld" numeric, "requested_investment_expenses" numeric, "requested_foreign_tax_paid" numeric, "requested_foreign_country_or_us_possession" "text", "requested_tax_exempt_interest" numeric, "requested_specified_private_activity_bond_interest" numeric, "requested_market_discount" numeric, "requested_bond_premium" numeric, "requested_bond_premium_on_treasury_obligations" numeric, "requested_bond_premium_on_tax_exempt_bond" numeric, "requested_state_code" "text", "requested_state_identification_number" "text", "requested_state_tax_withheld" numeric, "requested_document_received" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_client_organizer_income_1099_int_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_identification_number" "text", "requested_interest_income" numeric, "requested_early_withdrawal_penalty" numeric, "requested_interest_on_us_savings_bonds_and_treasury_obligations" numeric, "requested_federal_income_tax_withheld" numeric, "requested_investment_expenses" numeric, "requested_foreign_tax_paid" numeric, "requested_foreign_country_or_us_possession" "text", "requested_tax_exempt_interest" numeric, "requested_specified_private_activity_bond_interest" numeric, "requested_market_discount" numeric, "requested_bond_premium" numeric, "requested_bond_premium_on_treasury_obligations" numeric, "requested_bond_premium_on_tax_exempt_bond" numeric, "requested_state_code" "text", "requested_state_identification_number" "text", "requested_state_tax_withheld" numeric, "requested_document_received" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_client_organizer_income_1099_int_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_identification_number" "text", "requested_interest_income" numeric, "requested_early_withdrawal_penalty" numeric, "requested_interest_on_us_savings_bonds_and_treasury_obligations" numeric, "requested_federal_income_tax_withheld" numeric, "requested_investment_expenses" numeric, "requested_foreign_tax_paid" numeric, "requested_foreign_country_or_us_possession" "text", "requested_tax_exempt_interest" numeric, "requested_specified_private_activity_bond_interest" numeric, "requested_market_discount" numeric, "requested_bond_premium" numeric, "requested_bond_premium_on_treasury_obligations" numeric, "requested_bond_premium_on_tax_exempt_bond" numeric, "requested_state_code" "text", "requested_state_identification_number" "text", "requested_state_tax_withheld" numeric, "requested_document_received" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_client_organizer_income_w2_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_employer_identification_number" "text", "requested_wages" numeric, "requested_federal_income_tax_withheld" numeric, "requested_social_security_wages" numeric, "requested_social_security_tax_withheld" numeric, "requested_medicare_wages" numeric, "requested_medicare_tax_withheld" numeric, "requested_state_code" "text", "requested_state_wages" numeric, "requested_state_income_tax_withheld" numeric, "requested_local_wages" numeric, "requested_local_income_tax_withheld" numeric, "requested_document_received" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_client_organizer_income_w2_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_employer_identification_number" "text", "requested_wages" numeric, "requested_federal_income_tax_withheld" numeric, "requested_social_security_wages" numeric, "requested_social_security_tax_withheld" numeric, "requested_medicare_wages" numeric, "requested_medicare_tax_withheld" numeric, "requested_state_code" "text", "requested_state_wages" numeric, "requested_state_income_tax_withheld" numeric, "requested_local_wages" numeric, "requested_local_income_tax_withheld" numeric, "requested_document_received" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_client_organizer_income_w2_details"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_employer_identification_number" "text", "requested_wages" numeric, "requested_federal_income_tax_withheld" numeric, "requested_social_security_wages" numeric, "requested_social_security_tax_withheld" numeric, "requested_medicare_wages" numeric, "requested_medicare_tax_withheld" numeric, "requested_state_code" "text", "requested_state_wages" numeric, "requested_state_income_tax_withheld" numeric, "requested_local_wages" numeric, "requested_local_income_tax_withheld" numeric, "requested_document_received" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_client_organizer_personal_information"("requested_organizer_id" "uuid", "requested_legal_first_name" "text", "requested_legal_middle_name" "text", "requested_legal_last_name" "text", "requested_preferred_name" "text", "requested_birth_date" "date", "requested_filing_status" "text", "requested_occupation" "text", "requested_email" "text", "requested_mobile_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_address_changed_this_year" boolean, "requested_marital_status_changed_this_year" boolean, "requested_employer_changed_this_year" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_client_organizer_personal_information"("requested_organizer_id" "uuid", "requested_legal_first_name" "text", "requested_legal_middle_name" "text", "requested_legal_last_name" "text", "requested_preferred_name" "text", "requested_birth_date" "date", "requested_filing_status" "text", "requested_occupation" "text", "requested_email" "text", "requested_mobile_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_address_changed_this_year" boolean, "requested_marital_status_changed_this_year" boolean, "requested_employer_changed_this_year" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."save_client_organizer_personal_information"("requested_organizer_id" "uuid", "requested_legal_first_name" "text", "requested_legal_middle_name" "text", "requested_legal_last_name" "text", "requested_preferred_name" "text", "requested_birth_date" "date", "requested_filing_status" "text", "requested_occupation" "text", "requested_email" "text", "requested_mobile_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_address_changed_this_year" boolean, "requested_marital_status_changed_this_year" boolean, "requested_employer_changed_this_year" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_client_organizer_personal_information"("requested_organizer_id" "uuid", "requested_legal_first_name" "text", "requested_legal_middle_name" "text", "requested_legal_last_name" "text", "requested_preferred_name" "text", "requested_birth_date" "date", "requested_filing_status" "text", "requested_occupation" "text", "requested_email" "text", "requested_mobile_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_address_changed_this_year" boolean, "requested_marital_status_changed_this_year" boolean, "requested_employer_changed_this_year" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_dependent_review_notes"("requested_dependent_id" "uuid", "requested_internal_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_dependent_review_notes"("requested_dependent_id" "uuid", "requested_internal_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_dependent_review_notes"("requested_dependent_id" "uuid", "requested_internal_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_income_review_notes"("requested_income_source_id" "uuid", "requested_internal_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_income_review_notes"("requested_income_source_id" "uuid", "requested_internal_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_income_review_notes"("requested_income_source_id" "uuid", "requested_internal_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."search_clients"("requested_search" "text", "requested_status" "public"."client_status", "requested_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."search_clients"("requested_search" "text", "requested_status" "public"."client_status", "requested_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_clients"("requested_search" "text", "requested_status" "public"."client_status", "requested_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."search_tax_returns"("requested_search" "text", "requested_status" "public"."return_status", "requested_tax_year" integer, "requested_preparer_id" "uuid", "requested_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."search_tax_returns"("requested_search" "text", "requested_status" "public"."return_status", "requested_tax_year" integer, "requested_preparer_id" "uuid", "requested_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_tax_returns"("requested_search" "text", "requested_status" "public"."return_status", "requested_tax_year" integer, "requested_preparer_id" "uuid", "requested_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_client_organizer_business_activity"("requested_organizer_id" "uuid", "requested_has_business_activity" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_client_organizer_business_activity"("requested_organizer_id" "uuid", "requested_has_business_activity" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_client_organizer_business_activity"("requested_organizer_id" "uuid", "requested_has_business_activity" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_client_portal_profile_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_client_portal_profile_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_client_portal_profile_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_organizer_review_checklist_item"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_item_id" "uuid", "requested_is_completed" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_organizer_review_checklist_item"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_item_id" "uuid", "requested_is_completed" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_organizer_review_checklist_item"("requested_organizer_id" "uuid", "requested_section_key" "text", "requested_subject_type" "text", "requested_subject_id" "uuid", "requested_item_id" "uuid", "requested_is_completed" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_required_document_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_required_document_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_required_document_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_tax_return_workflow_timestamps"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_tax_return_workflow_timestamps"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_tax_return_workflow_timestamps"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."store_vault_secret"("requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_secret_type" "text", "requested_encrypted_value" "bytea", "requested_initialization_vector" "bytea", "requested_authentication_tag" "bytea", "requested_key_version" integer, "requested_masked_value" "text", "requested_actor_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."store_vault_secret"("requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_secret_type" "text", "requested_encrypted_value" "bytea", "requested_initialization_vector" "bytea", "requested_authentication_tag" "bytea", "requested_key_version" integer, "requested_masked_value" "text", "requested_actor_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."store_vault_secret_v2"("requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_secret_type" "text", "requested_encrypted_value" "bytea", "requested_initialization_vector" "bytea", "requested_authentication_tag" "bytea", "requested_key_version" integer, "requested_masked_value" "text", "requested_actor_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."store_vault_secret_v2"("requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_secret_type" "text", "requested_encrypted_value" "bytea", "requested_initialization_vector" "bytea", "requested_authentication_tag" "bytea", "requested_key_version" integer, "requested_masked_value" "text", "requested_actor_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_client_document_favorite"("requested_document_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_client_document_favorite"("requested_document_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_client_document_favorite"("requested_document_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."touch_platform_record"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_client_organizer_business"("requested_organizer_id" "uuid", "requested_business_id" "uuid", "requested_business" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_client_organizer_business"("requested_organizer_id" "uuid", "requested_business_id" "uuid", "requested_business" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_client_organizer_business"("requested_organizer_id" "uuid", "requested_business_id" "uuid", "requested_business" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_suffix" "text", "requested_relationship" "text", "requested_birth_date" "date", "requested_is_full_time_student" boolean, "requested_is_permanently_disabled" boolean, "requested_lived_with_taxpayer_all_year" boolean, "requested_months_lived_with_taxpayer" smallint, "requested_us_citizen_or_resident" boolean, "requested_claimed_by_another_taxpayer" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_suffix" "text", "requested_relationship" "text", "requested_birth_date" "date", "requested_is_full_time_student" boolean, "requested_is_permanently_disabled" boolean, "requested_lived_with_taxpayer_all_year" boolean, "requested_months_lived_with_taxpayer" smallint, "requested_us_citizen_or_resident" boolean, "requested_claimed_by_another_taxpayer" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_client_organizer_dependent"("requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_suffix" "text", "requested_relationship" "text", "requested_birth_date" "date", "requested_is_full_time_student" boolean, "requested_is_permanently_disabled" boolean, "requested_lived_with_taxpayer_all_year" boolean, "requested_months_lived_with_taxpayer" smallint, "requested_us_citizen_or_resident" boolean, "requested_claimed_by_another_taxpayer" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_coverage_id" "uuid", "requested_provider_name" "text", "requested_coverage_type" "text", "requested_covered_person_name" "text", "requested_policy_number" "text", "requested_start_month" integer, "requested_end_month" integer, "requested_is_full_year_coverage" boolean, "requested_document_received" boolean, "requested_document_type" "text", "requested_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_coverage_id" "uuid", "requested_provider_name" "text", "requested_coverage_type" "text", "requested_covered_person_name" "text", "requested_policy_number" "text", "requested_start_month" integer, "requested_end_month" integer, "requested_is_full_year_coverage" boolean, "requested_document_received" boolean, "requested_document_type" "text", "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_client_organizer_healthcare_coverage"("requested_organizer_id" "uuid", "requested_coverage_id" "uuid", "requested_provider_name" "text", "requested_coverage_type" "text", "requested_covered_person_name" "text", "requested_policy_number" "text", "requested_start_month" integer, "requested_end_month" integer, "requested_is_full_year_coverage" boolean, "requested_document_received" boolean, "requested_document_type" "text", "requested_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_name" "text", "requested_recipient_type" "text", "requested_record_status" "text", "requested_document_received" boolean, "requested_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_name" "text", "requested_recipient_type" "text", "requested_record_status" "text", "requested_document_received" boolean, "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_client_organizer_income_source"("requested_organizer_id" "uuid", "requested_income_source_id" "uuid", "requested_payer_name" "text", "requested_recipient_type" "text", "requested_record_status" "text", "requested_document_received" boolean, "requested_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_client_record"("requested_client_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_preferred_name" "text", "requested_email" "text", "requested_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_birth_date" "date", "requested_status" "public"."client_status", "requested_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_client_record"("requested_client_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_preferred_name" "text", "requested_email" "text", "requested_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_birth_date" "date", "requested_status" "public"."client_status", "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_client_record"("requested_client_id" "uuid", "requested_first_name" "text", "requested_middle_name" "text", "requested_last_name" "text", "requested_preferred_name" "text", "requested_email" "text", "requested_phone" "text", "requested_alternate_phone" "text", "requested_address_line_1" "text", "requested_address_line_2" "text", "requested_city" "text", "requested_state" "text", "requested_postal_code" "text", "requested_birth_date" "date", "requested_status" "public"."client_status", "requested_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_organizer_evidence_verification"("requested_evidence_id" "uuid", "requested_confidence" "text", "requested_verification_status" "text", "requested_note" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_organizer_evidence_verification"("requested_evidence_id" "uuid", "requested_confidence" "text", "requested_verification_status" "text", "requested_note" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_organizer_evidence_verification"("requested_evidence_id" "uuid", "requested_confidence" "text", "requested_verification_status" "text", "requested_note" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_return_payment"("requested_payment_id" "uuid", "requested_amount" numeric, "requested_payment_method" "public"."payment_method", "requested_payment_date" "date", "requested_reference_number" "text", "requested_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_return_payment"("requested_payment_id" "uuid", "requested_amount" numeric, "requested_payment_method" "public"."payment_method", "requested_payment_date" "date", "requested_reference_number" "text", "requested_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_return_payment"("requested_payment_id" "uuid", "requested_amount" numeric, "requested_payment_method" "public"."payment_method", "requested_payment_date" "date", "requested_reference_number" "text", "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_return_payment"("requested_payment_id" "uuid", "requested_amount" numeric, "requested_payment_method" "public"."payment_method", "requested_payment_date" "date", "requested_reference_number" "text", "requested_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_tax_return_record"("requested_return_id" "uuid", "requested_client_id" "uuid", "requested_tax_year" integer, "requested_return_type" "public"."return_type", "requested_tax_form" "public"."tax_form_type", "requested_filing_status" "public"."filing_status", "requested_status" "public"."return_status", "requested_assigned_preparer_id" "uuid", "requested_assigned_reviewer_id" "uuid", "requested_date_received" "date", "requested_due_date" "date", "requested_filed_date" "date", "requested_accepted_date" "date", "requested_preparation_fee" numeric, "requested_discount_amount" numeric, "requested_description" "text", "requested_federal_return_required" boolean, "requested_state_return_required" boolean, "requested_local_return_required" boolean, "requested_extension_filed" boolean, "requested_extension_date" "date", "requested_estimated_refund" numeric, "requested_estimated_amount_due" numeric, "requested_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_tax_return_record"("requested_return_id" "uuid", "requested_client_id" "uuid", "requested_tax_year" integer, "requested_return_type" "public"."return_type", "requested_tax_form" "public"."tax_form_type", "requested_filing_status" "public"."filing_status", "requested_status" "public"."return_status", "requested_assigned_preparer_id" "uuid", "requested_assigned_reviewer_id" "uuid", "requested_date_received" "date", "requested_due_date" "date", "requested_filed_date" "date", "requested_accepted_date" "date", "requested_preparation_fee" numeric, "requested_discount_amount" numeric, "requested_description" "text", "requested_federal_return_required" boolean, "requested_state_return_required" boolean, "requested_local_return_required" boolean, "requested_extension_filed" boolean, "requested_extension_date" "date", "requested_estimated_refund" numeric, "requested_estimated_amount_due" numeric, "requested_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tax_return_record"("requested_return_id" "uuid", "requested_client_id" "uuid", "requested_tax_year" integer, "requested_return_type" "public"."return_type", "requested_tax_form" "public"."tax_form_type", "requested_filing_status" "public"."filing_status", "requested_status" "public"."return_status", "requested_assigned_preparer_id" "uuid", "requested_assigned_reviewer_id" "uuid", "requested_date_received" "date", "requested_due_date" "date", "requested_filed_date" "date", "requested_accepted_date" "date", "requested_preparation_fee" numeric, "requested_discount_amount" numeric, "requested_description" "text", "requested_federal_return_required" boolean, "requested_state_return_required" boolean, "requested_local_return_required" boolean, "requested_extension_filed" boolean, "requested_extension_date" "date", "requested_estimated_refund" numeric, "requested_estimated_amount_due" numeric, "requested_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."validate_client_portal_invitation"("requested_token_hash" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."validate_client_portal_invitation"("requested_token_hash" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_client_portal_invitation"("requested_token_hash" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_client_portal_invitation"("requested_token_hash" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."validate_organizer_income_1099_div_source"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."validate_organizer_income_1099_div_source"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_organizer_income_1099_div_source"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_organizer_income_1099_div_source"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."validate_organizer_income_1099_int_source"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."validate_organizer_income_1099_int_source"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_organizer_income_1099_int_source"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_organizer_income_1099_int_source"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."void_return_payment"("requested_payment_id" "uuid", "requested_void_reason" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."void_return_payment"("requested_payment_id" "uuid", "requested_void_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."void_return_payment"("requested_payment_id" "uuid", "requested_void_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."void_return_payment"("requested_payment_id" "uuid", "requested_void_reason" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."write_vault_audit_event"("requested_vault_secret_id" "uuid", "requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_secret_type" "text", "requested_actor_user_id" "uuid", "requested_action" "text", "requested_outcome" "text", "requested_reason" "text", "requested_source" "text", "requested_request_id" "uuid", "requested_session_id" "text", "requested_ip_address" "inet", "requested_user_agent" "text", "requested_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."write_vault_audit_event"("requested_vault_secret_id" "uuid", "requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_secret_type" "text", "requested_actor_user_id" "uuid", "requested_action" "text", "requested_outcome" "text", "requested_reason" "text", "requested_source" "text", "requested_request_id" "uuid", "requested_session_id" "text", "requested_ip_address" "inet", "requested_user_agent" "text", "requested_metadata" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."write_vault_audit_event_v2"("requested_vault_secret_id" "uuid", "requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_secret_type" "text", "requested_actor_user_id" "uuid", "requested_action" "text", "requested_outcome" "text", "requested_reason" "text", "requested_source" "text", "requested_request_id" "uuid", "requested_session_id" "text", "requested_ip_address" "inet", "requested_user_agent" "text", "requested_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."write_vault_audit_event_v2"("requested_vault_secret_id" "uuid", "requested_client_id" "uuid", "requested_organizer_id" "uuid", "requested_dependent_id" "uuid", "requested_secret_type" "text", "requested_actor_user_id" "uuid", "requested_action" "text", "requested_outcome" "text", "requested_reason" "text", "requested_source" "text", "requested_request_id" "uuid", "requested_session_id" "text", "requested_ip_address" "inet", "requested_user_agent" "text", "requested_metadata" "jsonb") TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."audit_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."audit_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."audit_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."client_portal_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."client_portal_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_banking_information" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_business_responses" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_dependent_reviews" TO "anon";
GRANT ALL ON TABLE "public"."client_tax_organizer_dependent_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."client_tax_organizer_dependent_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_dependents" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_healthcare_coverages" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_identity_information" TO "anon";
GRANT ALL ON TABLE "public"."client_tax_organizer_identity_information" TO "authenticated";
GRANT ALL ON TABLE "public"."client_tax_organizer_identity_information" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_income_1099_div_details" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_income_1099_int_details" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_income_reviews" TO "anon";
GRANT ALL ON TABLE "public"."client_tax_organizer_income_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."client_tax_organizer_income_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_income_sources" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_income_w2_details" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_personal_information" TO "anon";
GRANT ALL ON TABLE "public"."client_tax_organizer_personal_information" TO "authenticated";
GRANT ALL ON TABLE "public"."client_tax_organizer_personal_information" TO "service_role";



GRANT ALL ON TABLE "public"."client_tax_organizer_sections" TO "anon";
GRANT ALL ON TABLE "public"."client_tax_organizer_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."client_tax_organizer_sections" TO "service_role";



GRANT ALL ON SEQUENCE "public"."clients_client_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."clients_client_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."clients_client_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."document_access_log" TO "anon";
GRANT ALL ON TABLE "public"."document_access_log" TO "authenticated";
GRANT ALL ON TABLE "public"."document_access_log" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_access_log_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_access_log_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_access_log_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."document_activity" TO "anon";
GRANT ALL ON TABLE "public"."document_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."document_activity" TO "service_role";



GRANT ALL ON TABLE "public"."document_analysis_events" TO "anon";
GRANT ALL ON TABLE "public"."document_analysis_events" TO "authenticated";
GRANT ALL ON TABLE "public"."document_analysis_events" TO "service_role";



GRANT ALL ON TABLE "public"."document_analysis_extracted_fields" TO "anon";
GRANT ALL ON TABLE "public"."document_analysis_extracted_fields" TO "authenticated";
GRANT ALL ON TABLE "public"."document_analysis_extracted_fields" TO "service_role";



GRANT ALL ON TABLE "public"."document_analysis_jobs" TO "anon";
GRANT ALL ON TABLE "public"."document_analysis_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."document_analysis_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."document_analysis_providers" TO "anon";
GRANT ALL ON TABLE "public"."document_analysis_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."document_analysis_providers" TO "service_role";



GRANT ALL ON TABLE "public"."document_analysis_results" TO "anon";
GRANT ALL ON TABLE "public"."document_analysis_results" TO "authenticated";
GRANT ALL ON TABLE "public"."document_analysis_results" TO "service_role";



GRANT ALL ON TABLE "public"."document_categories" TO "anon";
GRANT ALL ON TABLE "public"."document_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."document_categories" TO "service_role";



GRANT ALL ON TABLE "public"."document_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."document_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."document_types" TO "anon";
GRANT ALL ON TABLE "public"."document_types" TO "authenticated";
GRANT ALL ON TABLE "public"."document_types" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."organizer_evidence_links" TO "anon";
GRANT ALL ON TABLE "public"."organizer_evidence_links" TO "authenticated";
GRANT ALL ON TABLE "public"."organizer_evidence_links" TO "service_role";



GRANT ALL ON TABLE "public"."organizer_evidence_sources" TO "anon";
GRANT ALL ON TABLE "public"."organizer_evidence_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."organizer_evidence_sources" TO "service_role";



GRANT ALL ON TABLE "public"."organizer_evidence_verification_events" TO "anon";
GRANT ALL ON TABLE "public"."organizer_evidence_verification_events" TO "authenticated";
GRANT ALL ON TABLE "public"."organizer_evidence_verification_events" TO "service_role";



GRANT ALL ON TABLE "public"."organizer_review_checklist_definitions" TO "anon";
GRANT ALL ON TABLE "public"."organizer_review_checklist_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."organizer_review_checklist_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."organizer_review_checklist_items" TO "anon";
GRANT ALL ON TABLE "public"."organizer_review_checklist_items" TO "authenticated";
GRANT ALL ON TABLE "public"."organizer_review_checklist_items" TO "service_role";



GRANT ALL ON TABLE "public"."organizer_review_checklist_responses" TO "anon";
GRANT ALL ON TABLE "public"."organizer_review_checklist_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."organizer_review_checklist_responses" TO "service_role";



GRANT ALL ON TABLE "public"."organizer_review_timeline_entries" TO "anon";
GRANT ALL ON TABLE "public"."organizer_review_timeline_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."organizer_review_timeline_entries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payment_receipt_sequence" TO "anon";
GRANT ALL ON SEQUENCE "public"."payment_receipt_sequence" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payment_receipt_sequence" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."required_document_templates" TO "anon";
GRANT ALL ON TABLE "public"."required_document_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."required_document_templates" TO "service_role";



GRANT ALL ON TABLE "public"."return_required_documents" TO "anon";
GRANT ALL ON TABLE "public"."return_required_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."return_required_documents" TO "service_role";



GRANT ALL ON TABLE "public"."return_workflow_history" TO "service_role";



GRANT ALL ON TABLE "public"."tax_package_template_items" TO "anon";
GRANT ALL ON TABLE "public"."tax_package_template_items" TO "authenticated";
GRANT ALL ON TABLE "public"."tax_package_template_items" TO "service_role";



GRANT ALL ON TABLE "public"."tax_package_templates" TO "anon";
GRANT ALL ON TABLE "public"."tax_package_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."tax_package_templates" TO "service_role";



GRANT ALL ON TABLE "public"."tax_return_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."tax_return_activity" TO "service_role";



GRANT ALL ON TABLE "public"."vault_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."vault_key_versions" TO "service_role";



GRANT ALL ON TABLE "public"."vault_secrets" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







