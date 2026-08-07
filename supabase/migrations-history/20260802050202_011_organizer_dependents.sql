-- ==========================================================
-- Smith Enterprises Tax Management
-- Organizer Dependents
-- ==========================================================

begin;

create table if not exists
  public.client_tax_organizer_dependents (
    id uuid
      primary key
      default gen_random_uuid(),

    organizer_id uuid
      not null
      references public.client_tax_organizers(id)
      on delete cascade,

    first_name text
      not null,

    middle_name text,

    last_name text
      not null,

    suffix text,

    relationship text
      not null,

    birth_date date
      not null,

    is_full_time_student boolean
      not null
      default false,

    is_permanently_disabled boolean
      not null
      default false,

    lived_with_taxpayer_all_year boolean
      not null
      default false,

    months_lived_with_taxpayer smallint
      not null
      default 0,

    us_citizen_or_resident boolean
      not null
      default true,

    claimed_by_another_taxpayer boolean
      not null
      default false,

    display_order integer
      not null
      default 0,

    created_at timestamptz
      not null
      default now(),

    updated_at timestamptz
      not null
      default now(),

    constraint organizer_dependents_first_name_length
      check (
        length(
          trim(first_name)
        ) between 1 and 100
      ),

    constraint organizer_dependents_middle_name_length
      check (
        middle_name is null
        or length(
          trim(middle_name)
        ) between 1 and 100
      ),

    constraint organizer_dependents_last_name_length
      check (
        length(
          trim(last_name)
        ) between 1 and 100
      ),

    constraint organizer_dependents_suffix_check
      check (
        suffix is null
        or suffix in (
          'Jr.',
          'Sr.',
          'II',
          'III',
          'IV',
          'V'
        )
      ),

    constraint organizer_dependents_relationship_check
      check (
        relationship in (
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
        )
      ),

    constraint organizer_dependents_birth_date_check
      check (
        birth_date <= current_date
      ),

    constraint organizer_dependents_months_check
      check (
        months_lived_with_taxpayer
          between 0 and 12
      ),

    constraint organizer_dependents_residency_consistency
      check (
        (
          lived_with_taxpayer_all_year = true
          and months_lived_with_taxpayer = 12
        )
        or
        (
          lived_with_taxpayer_all_year = false
          and months_lived_with_taxpayer
            between 0 and 11
        )
      ),

    constraint organizer_dependents_display_order_check
      check (
        display_order >= 0
      )
  );

comment on table
  public.client_tax_organizer_dependents
is
'Stores non-sensitive dependent information for a client tax organizer. Dependent SSNs and other protected identifiers are stored only in the Secure Vault.';

comment on column
  public.client_tax_organizer_dependents.organizer_id
is
'Tax organizer that owns the dependent record.';

comment on column
  public.client_tax_organizer_dependents.relationship
is
'Dependent relationship classification used for tax-organizer questions.';

comment on column
  public.client_tax_organizer_dependents.months_lived_with_taxpayer
is
'Number of months from 0 through 12 that the dependent lived with the taxpayer during the tax year.';

comment on column
  public.client_tax_organizer_dependents.display_order
is
'Controls the order in which dependent cards appear in the client portal.';

create index if not exists
  organizer_dependents_organizer_id_index
on public.client_tax_organizer_dependents (
  organizer_id
);

create index if not exists
  organizer_dependents_organizer_display_order_index
on public.client_tax_organizer_dependents (
  organizer_id,
  display_order,
  created_at
);

create index if not exists
  organizer_dependents_birth_date_index
on public.client_tax_organizer_dependents (
  birth_date
);

drop trigger if exists
  organizer_dependents_updated_at
on public.client_tax_organizer_dependents;

create trigger
  organizer_dependents_updated_at
before update
on public.client_tax_organizer_dependents
for each row
execute function
  public.update_updated_at_column();

alter table
  public.client_tax_organizer_dependents
enable row level security;

-- Dependents will be accessed through authenticated,
-- security-definer RPC functions. Direct table access from
-- the browser is intentionally disabled.

revoke all
on table
  public.client_tax_organizer_dependents
from anon;

revoke all
on table
  public.client_tax_organizer_dependents
from authenticated;

commit;