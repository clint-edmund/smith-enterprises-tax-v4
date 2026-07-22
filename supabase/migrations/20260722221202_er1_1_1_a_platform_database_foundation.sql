/*
===============================================================================
 Smith Enterprises Enterprise Practice Platform
 Enterprise Release: ER-1
 Milestone: ER-1.1.1.A
 Migration: Platform Database Foundation
===============================================================================

 Purpose
 -------
 Establish reusable PostgreSQL trigger functions and database helpers for
 operational tables throughout the Smith Enterprises platform.

 This migration creates:

 1. set_updated_at()
 2. increment_row_version()
 3. touch_platform_record()
 4. initialize_platform_record()
 5. current_actor_id()

 Design principles
 -----------------
 - Additive and non-destructive
 - No existing business tables are modified
 - No triggers are attached during this migration
 - Functions are reusable across platform domains
 - Timestamps use PostgreSQL timestamptz values
 - Row versions use optimistic concurrency semantics
 - Functions run as SECURITY INVOKER
 - Function search paths are explicitly constrained

 Expected compatible columns
 ---------------------------
 Future tables using these functions should use:

 created_at    timestamptz NOT NULL DEFAULT statement_timestamp()
 updated_at    timestamptz NOT NULL DEFAULT statement_timestamp()
 row_version   bigint      NOT NULL DEFAULT 1

 Security
 --------
 These functions do not bypass Row Level Security.

 Trigger functions execute using SECURITY INVOKER and therefore retain the
 privileges and security context of the operation invoking the trigger.

 Rollback
 --------
 Rollback statements are documented at the end of this migration.

 Important
 ---------
 Do not attach these functions to a table unless the table contains the
 columns expected by the selected trigger function.
===============================================================================
*/

begin;

/*
===============================================================================
 Function: public.set_updated_at
===============================================================================

 Sets the updated_at column whenever a row is updated.

 Required table column:

 updated_at timestamptz
*/

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
begin
  new.updated_at := statement_timestamp();

  return new;
end;
$function$;

comment on function public.set_updated_at() is
  'Sets updated_at to the current statement timestamp before a row update.';


/*
===============================================================================
 Function: public.increment_row_version
===============================================================================

 Implements optimistic concurrency versioning.

 Every successful update increments row_version by one.

 Required table column:

 row_version bigint
*/

create or replace function public.increment_row_version()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
begin
  new.row_version := coalesce(old.row_version, 0) + 1;

  return new;
end;
$function$;

comment on function public.increment_row_version() is
  'Increments row_version before a row update for optimistic concurrency control.';


/*
===============================================================================
 Function: public.touch_platform_record
===============================================================================

 Performs the two standard update operations required by most platform tables:

 1. Updates updated_at
 2. Increments row_version

 Required table columns:

 updated_at  timestamptz
 row_version bigint
*/

create or replace function public.touch_platform_record()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
begin
  new.updated_at := statement_timestamp();
  new.row_version := coalesce(old.row_version, 0) + 1;

  return new;
end;
$function$;

comment on function public.touch_platform_record() is
  'Updates updated_at and increments row_version before a row update.';


/*
===============================================================================
 Function: public.initialize_platform_record
===============================================================================

 Initializes standard operational columns when a row is inserted.

 The function provides defensive defaults when a caller does not explicitly
 supply values.

 Required table columns:

 created_at  timestamptz
 updated_at  timestamptz
 row_version bigint
*/

create or replace function public.initialize_platform_record()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
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
$function$;

comment on function public.initialize_platform_record() is
  'Initializes created_at, updated_at, and row_version before a row insert.';


/*
===============================================================================
 Function: public.current_actor_id
===============================================================================

 Returns the authenticated Supabase user identifier associated with the
 current request.

 The result is NULL when:

 - No authenticated user exists
 - A migration is running outside an authenticated request
 - A trusted server process does not provide an authenticated user context

 This helper allows future audit code to use one consistent database function
 rather than directly coupling every table to auth.uid().
*/

create or replace function public.current_actor_id()
returns uuid
language sql
stable
security invoker
set search_path = pg_catalog, auth, public
as $function$
  select auth.uid();
$function$;

comment on function public.current_actor_id() is
  'Returns the authenticated Supabase user ID for the current request, or NULL when no authenticated user exists.';


/*
===============================================================================
 Function permissions
===============================================================================

 PostgreSQL functions grant EXECUTE to PUBLIC by default.

 These helper functions are intended to be called by triggers and trusted
 database operations. Direct execution is therefore limited where practical.

 Trigger functions do not need to be called directly by the browser client.
*/

revoke execute
  on function public.set_updated_at()
  from anon, authenticated;

revoke execute
  on function public.increment_row_version()
  from anon, authenticated;

revoke execute
  on function public.touch_platform_record()
  from anon, authenticated;

revoke execute
  on function public.initialize_platform_record()
  from anon, authenticated;

/*
 current_actor_id() may be used by authenticated database policies and future
 audit functions, so authenticated access is retained.
*/

grant execute
  on function public.current_actor_id()
  to authenticated;

grant execute
  on function public.current_actor_id()
  to service_role;


/*
===============================================================================
 Migration completion
===============================================================================
*/

commit;


/*
===============================================================================
 Validation Queries
===============================================================================

 Run these separately after the migration succeeds.

 Do not include them in an application transaction.

-------------------------------------------------------------------------------
 1. Confirm that all five functions exist
-------------------------------------------------------------------------------

select
  routine_schema,
  routine_name,
  routine_type,
  data_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'set_updated_at',
    'increment_row_version',
    'touch_platform_record',
    'initialize_platform_record',
    'current_actor_id'
  )
order by routine_name;

Expected result:

 current_actor_id
 increment_row_version
 initialize_platform_record
 set_updated_at
 touch_platform_record

-------------------------------------------------------------------------------
 2. Confirm current_actor_id can execute
-------------------------------------------------------------------------------

select public.current_actor_id();

A NULL result is expected when running directly from a migration or from the
Supabase SQL Editor without an authenticated application request.

-------------------------------------------------------------------------------
 3. Inspect function definitions
-------------------------------------------------------------------------------

select
  pg_get_functiondef(
    'public.set_updated_at()'::regprocedure
  );

select
  pg_get_functiondef(
    'public.increment_row_version()'::regprocedure
  );

select
  pg_get_functiondef(
    'public.touch_platform_record()'::regprocedure
  );

select
  pg_get_functiondef(
    'public.initialize_platform_record()'::regprocedure
  );

select
  pg_get_functiondef(
    'public.current_actor_id()'::regprocedure
  );

===============================================================================
 Rollback
===============================================================================

 Only use this rollback when no tables or triggers depend on these functions.

 begin;

 drop function if exists public.current_actor_id();
 drop function if exists public.initialize_platform_record();
 drop function if exists public.touch_platform_record();
 drop function if exists public.increment_row_version();
 drop function if exists public.set_updated_at();

 commit;

===============================================================================
*/