-- ==========================================================
-- Smith Enterprises Tax Management
-- Organizer Healthcare Foundation
-- ==========================================================

begin;

create table if not exists
  public.client_tax_organizer_healthcare_coverages (
    id uuid
      primary key
      default gen_random_uuid(),

    organizer_id uuid
      not null
      references public.client_tax_organizers(id)
      on delete cascade,

    provider_name text
      not null,

    coverage_type text
      not null,

    covered_person_name text
      not null,

    policy_number text,

    start_month integer,

    end_month integer,

    is_full_year_coverage boolean
      not null
      default false,

    document_received boolean
      not null
      default false,

    document_type text,

    notes text,

    record_status text
      not null
      default 'draft',

    display_order integer
      not null
      default 0,

    created_at timestamptz
      not null
      default now(),

    updated_at timestamptz
      not null
      default now(),

    constraint healthcare_provider_name_check
      check (
        length(
          trim(
            provider_name
          )
        ) between 1 and 200
      ),

    constraint healthcare_covered_person_name_check
      check (
        length(
          trim(
            covered_person_name
          )
        ) between 1 and 200
      ),

    constraint healthcare_coverage_type_check
      check (
        coverage_type in (
          'employer',
          'marketplace',
          'medicare',
          'medicaid',
          'cobra',
          'private',
          'military',
          'other'
        )
      ),

    constraint healthcare_document_type_check
      check (
        document_type is null
        or document_type in (
          '1095_a',
          '1095_b',
          '1095_c',
          'insurance_card',
          'other'
        )
      ),

    constraint healthcare_start_month_check
      check (
        start_month is null
        or start_month between 1 and 12
      ),

    constraint healthcare_end_month_check
      check (
        end_month is null
        or end_month between 1 and 12
      ),

    constraint healthcare_month_range_check
      check (
        start_month is null
        or end_month is null
        or start_month <= end_month
      ),

    constraint healthcare_full_year_months_check
      check (
        not is_full_year_coverage
        or (
          (
            start_month is null
            or start_month = 1
          )
          and (
            end_month is null
            or end_month = 12
          )
        )
      ),

    constraint healthcare_policy_number_length_check
      check (
        policy_number is null
        or length(
          trim(
            policy_number
          )
        ) <= 100
      ),

    constraint healthcare_notes_length_check
      check (
        notes is null
        or length(notes) <= 4000
      ),

    constraint healthcare_record_status_check
      check (
        record_status in (
          'draft',
          'complete',
          'needs_review'
        )
      ),

    constraint healthcare_display_order_check
      check (
        display_order >= 0
      )
  );

comment on table
  public.client_tax_organizer_healthcare_coverages
is
'Stores healthcare coverage records associated with a client tax organizer.';

comment on column
  public.client_tax_organizer_healthcare_coverages.coverage_type
is
'Identifies the source of healthcare coverage, including employer, Marketplace, Medicare, Medicaid, COBRA, private, military, or other coverage.';

comment on column
  public.client_tax_organizer_healthcare_coverages.covered_person_name
is
'Identifies the taxpayer, spouse, dependent, or other household member covered by the healthcare policy.';

comment on column
  public.client_tax_organizer_healthcare_coverages.policy_number
is
'Optional healthcare policy identifier. Social Security numbers and other government identifiers must never be stored in this field.';

comment on column
  public.client_tax_organizer_healthcare_coverages.document_received
is
'Indicates whether the supporting healthcare document has been uploaded or delivered.';

comment on column
  public.client_tax_organizer_healthcare_coverages.record_status
is
'Tracks whether the healthcare record is a draft, complete, or requires review.';


-- ==========================================================
-- Indexes
-- ==========================================================

create index if not exists
  organizer_healthcare_organizer_index
on public.client_tax_organizer_healthcare_coverages (
  organizer_id
);

create index if not exists
  organizer_healthcare_type_index
on public.client_tax_organizer_healthcare_coverages (
  organizer_id,
  coverage_type
);

create index if not exists
  organizer_healthcare_status_index
on public.client_tax_organizer_healthcare_coverages (
  organizer_id,
  record_status
);

create index if not exists
  organizer_healthcare_document_index
on public.client_tax_organizer_healthcare_coverages (
  organizer_id,
  document_received
);

create index if not exists
  organizer_healthcare_display_index
on public.client_tax_organizer_healthcare_coverages (
  organizer_id,
  display_order,
  created_at
);


-- ==========================================================
-- Updated-at Trigger
-- ==========================================================

drop trigger if exists
  organizer_healthcare_updated_at
on public.client_tax_organizer_healthcare_coverages;

create trigger
  organizer_healthcare_updated_at
before update
on public.client_tax_organizer_healthcare_coverages
for each row
execute function
  public.update_updated_at_column();


-- ==========================================================
-- Row-Level Security
-- ==========================================================

alter table
  public.client_tax_organizer_healthcare_coverages
enable row level security;

revoke all
on table
  public.client_tax_organizer_healthcare_coverages
from anon;

revoke all
on table
  public.client_tax_organizer_healthcare_coverages
from authenticated;

commit;