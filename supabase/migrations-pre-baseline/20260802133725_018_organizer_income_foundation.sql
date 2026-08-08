-- ==========================================================
-- Smith Enterprises Tax Management
-- Organizer Income Foundation
-- ==========================================================

begin;

-- ==========================================================
-- Income Sources
-- ==========================================================

create table if not exists
  public.client_tax_organizer_income_sources (
    id uuid
      primary key
      default gen_random_uuid(),

    organizer_id uuid
      not null
      references public.client_tax_organizers(id)
      on delete cascade,

    income_type text
      not null,

    payer_name text
      not null,

    recipient_type text
      not null
      default 'taxpayer',

    record_status text
      not null
      default 'draft',

    document_received boolean
      not null
      default false,

    notes text,

    display_order integer
      not null
      default 0,

    created_at timestamptz
      not null
      default now(),

    updated_at timestamptz
      not null
      default now(),

    constraint organizer_income_type_check
      check (
        income_type in (
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
        )
      ),

    constraint organizer_income_payer_name_check
      check (
        length(
          trim(
            payer_name
          )
        ) between 1 and 200
      ),

    constraint organizer_income_recipient_type_check
      check (
        recipient_type in (
          'taxpayer',
          'spouse',
          'dependent',
          'joint'
        )
      ),

    constraint organizer_income_record_status_check
      check (
        record_status in (
          'draft',
          'complete',
          'needs_review'
        )
      ),

    constraint organizer_income_notes_length_check
      check (
        notes is null
        or length(notes) <= 4000
      ),

    constraint organizer_income_display_order_check
      check (
        display_order >= 0
      )
  );

comment on table
  public.client_tax_organizer_income_sources
is
'Stores the common, non-sensitive information shared by all organizer income sources. Form-specific values are stored in dedicated detail tables.';

comment on column
  public.client_tax_organizer_income_sources.income_type
is
'IRS income-document or income-source category used to select the corresponding detail workflow.';

comment on column
  public.client_tax_organizer_income_sources.recipient_type
is
'Identifies whether the income belongs to the taxpayer, spouse, dependent, or a joint recipient.';

comment on column
  public.client_tax_organizer_income_sources.record_status
is
'Validation status for the individual income record.';

comment on column
  public.client_tax_organizer_income_sources.document_received
is
'Indicates whether the supporting tax document has been received or uploaded.';

create index if not exists
  organizer_income_sources_organizer_index
on public.client_tax_organizer_income_sources (
  organizer_id
);

create index if not exists
  organizer_income_sources_type_index
on public.client_tax_organizer_income_sources (
  organizer_id,
  income_type
);

create index if not exists
  organizer_income_sources_display_index
on public.client_tax_organizer_income_sources (
  organizer_id,
  display_order,
  created_at
);

create index if not exists
  organizer_income_sources_status_index
on public.client_tax_organizer_income_sources (
  organizer_id,
  record_status
);

drop trigger if exists
  organizer_income_sources_updated_at
on public.client_tax_organizer_income_sources;

create trigger
  organizer_income_sources_updated_at
before update
on public.client_tax_organizer_income_sources
for each row
execute function
  public.update_updated_at_column();

alter table
  public.client_tax_organizer_income_sources
enable row level security;

revoke all
on table
  public.client_tax_organizer_income_sources
from anon;

revoke all
on table
  public.client_tax_organizer_income_sources
from authenticated;


-- ==========================================================
-- W-2 Details
-- ==========================================================

create table if not exists
  public.client_tax_organizer_income_w2_details (
    income_source_id uuid
      primary key
      references public.client_tax_organizer_income_sources(id)
      on delete cascade,

    employer_identification_number text,

    wages numeric(14, 2),

    federal_income_tax_withheld numeric(14, 2),

    social_security_wages numeric(14, 2),

    social_security_tax_withheld numeric(14, 2),

    medicare_wages numeric(14, 2),

    medicare_tax_withheld numeric(14, 2),

    state_code text,

    state_wages numeric(14, 2),

    state_income_tax_withheld numeric(14, 2),

    local_wages numeric(14, 2),

    local_income_tax_withheld numeric(14, 2),

    created_at timestamptz
      not null
      default now(),

    updated_at timestamptz
      not null
      default now(),

    constraint organizer_income_w2_ein_check
      check (
        employer_identification_number is null
        or employer_identification_number ~
          '^[0-9]{2}-?[0-9]{7}$'
      ),

    constraint organizer_income_w2_state_code_check
      check (
        state_code is null
        or state_code ~
          '^[A-Z]{2}$'
      ),

    constraint organizer_income_w2_wages_check
      check (
        wages is null
        or wages >= 0
      ),

    constraint organizer_income_w2_federal_withholding_check
      check (
        federal_income_tax_withheld is null
        or federal_income_tax_withheld >= 0
      ),

    constraint organizer_income_w2_social_security_wages_check
      check (
        social_security_wages is null
        or social_security_wages >= 0
      ),

    constraint organizer_income_w2_social_security_tax_check
      check (
        social_security_tax_withheld is null
        or social_security_tax_withheld >= 0
      ),

    constraint organizer_income_w2_medicare_wages_check
      check (
        medicare_wages is null
        or medicare_wages >= 0
      ),

    constraint organizer_income_w2_medicare_tax_check
      check (
        medicare_tax_withheld is null
        or medicare_tax_withheld >= 0
      ),

    constraint organizer_income_w2_state_wages_check
      check (
        state_wages is null
        or state_wages >= 0
      ),

    constraint organizer_income_w2_state_tax_check
      check (
        state_income_tax_withheld is null
        or state_income_tax_withheld >= 0
      ),

    constraint organizer_income_w2_local_wages_check
      check (
        local_wages is null
        or local_wages >= 0
      ),

    constraint organizer_income_w2_local_tax_check
      check (
        local_income_tax_withheld is null
        or local_income_tax_withheld >= 0
      )
  );

comment on table
  public.client_tax_organizer_income_w2_details
is
'Stores the non-sensitive W-2 values associated with an organizer income source. Employee SSNs are not stored in this table.';

comment on column
  public.client_tax_organizer_income_w2_details.employer_identification_number
is
'Employer EIN shown on the W-2. Employee Social Security numbers must never be stored here.';

drop trigger if exists
  organizer_income_w2_details_updated_at
on public.client_tax_organizer_income_w2_details;

create trigger
  organizer_income_w2_details_updated_at
before update
on public.client_tax_organizer_income_w2_details
for each row
execute function
  public.update_updated_at_column();

alter table
  public.client_tax_organizer_income_w2_details
enable row level security;

revoke all
on table
  public.client_tax_organizer_income_w2_details
from anon;

revoke all
on table
  public.client_tax_organizer_income_w2_details
from authenticated;

commit;