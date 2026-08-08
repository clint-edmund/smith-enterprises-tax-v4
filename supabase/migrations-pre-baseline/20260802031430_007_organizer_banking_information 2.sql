-- ==========================================================
-- Smith Enterprises Tax Management
-- Organizer Banking Information
-- ==========================================================

begin;

create table if not exists
  public.client_tax_organizer_banking_information (
    id uuid
      primary key
      default gen_random_uuid(),

    organizer_id uuid
      not null
      unique
      references public.client_tax_organizers(id)
      on delete cascade,

    account_holder_name text,

    bank_name text,

    account_type text,

    use_direct_deposit boolean,

    authorize_direct_debit boolean,

    created_at timestamptz
      not null
      default now(),

    updated_at timestamptz
      not null
      default now(),

    constraint organizer_banking_account_holder_length
      check (
        account_holder_name is null
        or length(
          trim(account_holder_name)
        ) between 1 and 200
      ),

    constraint organizer_banking_bank_name_length
      check (
        bank_name is null
        or length(
          trim(bank_name)
        ) between 1 and 200
      ),

    constraint organizer_banking_account_type_check
      check (
        account_type is null
        or account_type in (
          'checking',
          'savings'
        )
      )
  );

comment on table
  public.client_tax_organizer_banking_information
is
'Stores non-sensitive banking preferences for a client tax organizer. Routing and account numbers are stored only in the Secure Vault.';

comment on column
  public.client_tax_organizer_banking_information.account_holder_name
is
'Name associated with the bank account.';

comment on column
  public.client_tax_organizer_banking_information.bank_name
is
'Financial institution name.';

comment on column
  public.client_tax_organizer_banking_information.account_type
is
'Bank account classification: checking or savings.';

comment on column
  public.client_tax_organizer_banking_information.use_direct_deposit
is
'Indicates whether the client wants an eligible refund deposited into this account.';

comment on column
  public.client_tax_organizer_banking_information.authorize_direct_debit
is
'Indicates whether the client may use the account for an authorized tax-payment debit.';

create index if not exists
  organizer_banking_organizer_id_index
on public.client_tax_organizer_banking_information (
  organizer_id
);

drop trigger if exists
  organizer_banking_updated_at
on public.client_tax_organizer_banking_information;

create trigger
  organizer_banking_updated_at
before update
on public.client_tax_organizer_banking_information
for each row
execute function
  public.update_updated_at_column();

alter table
  public.client_tax_organizer_banking_information
enable row level security;

-- The client application will use secured RPC functions.
-- Direct browser access is intentionally disabled.

revoke all
on table
  public.client_tax_organizer_banking_information
from anon;

revoke all
on table
  public.client_tax_organizer_banking_information
from authenticated;

commit;