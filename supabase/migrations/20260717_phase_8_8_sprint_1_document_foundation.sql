-- ============================================================
-- Smith Enterprises Tax Management v4
-- Phase 8.8 Sprint 1 - Document management foundation
-- ============================================================

create table if not exists public.client_documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null
    references public.clients(id)
    on delete cascade,
  tax_return_id uuid
    references public.tax_returns(id)
    on delete cascade,
  category text not null
    default 'miscellaneous'
    check (category in (
      'identity',
      'income',
      'deductions',
      'business',
      'irs_notice',
      'prior_return',
      'engagement',
      'internal',
      'miscellaneous'
    )),
  status text not null
    default 'uploaded'
    check (status in (
      'uploaded',
      'verified',
      'rejected',
      'archived'
    )),
  original_file_name text not null,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  description text,
  uploaded_by uuid not null
    references public.profiles(id),
  created_at timestamptz not null
    default timezone('utc', now()),
  updated_at timestamptz not null
    default timezone('utc', now()),
  archived_at timestamptz,
  constraint client_documents_storage_location_unique
    unique (storage_bucket, storage_path)
);

create index if not exists client_documents_client_index
  on public.client_documents (client_id, created_at desc);

create index if not exists client_documents_return_index
  on public.client_documents (tax_return_id, created_at desc)
  where tax_return_id is not null;

create index if not exists client_documents_active_status_index
  on public.client_documents (status, category)
  where archived_at is null;

create trigger client_documents_set_updated_at
before update on public.client_documents
for each row
execute function public.set_updated_at();

alter table public.client_documents enable row level security;

create policy "Active staff can view document metadata"
on public.client_documents
for select
to authenticated
using (public.current_user_is_active());

create policy "Authorized staff can create document metadata"
on public.client_documents
for insert
to authenticated
with check (
  public.current_user_can_manage_records()
  and uploaded_by = auth.uid()
);

create policy "Authorized staff can update document metadata"
on public.client_documents
for update
to authenticated
using (public.current_user_can_manage_records())
with check (public.current_user_can_manage_records());

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'client-documents',
  'client-documents',
  false,
  26214400,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Active staff can read client documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'client-documents'
  and public.current_user_is_active()
);

create policy "Authorized staff can upload client documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'client-documents'
  and public.current_user_can_manage_records()
  and (storage.foldername(name))[1] is not null
);

create policy "Authorized staff can remove client documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'client-documents'
  and public.current_user_can_manage_records()
);

create or replace function public.list_client_documents(
  requested_client_id uuid,
  requested_tax_return_id uuid default null
)
returns table (
  id uuid,
  client_id uuid,
  tax_return_id uuid,
  category text,
  status text,
  original_file_name text,
  storage_bucket text,
  storage_path text,
  mime_type text,
  size_bytes bigint,
  description text,
  uploaded_by uuid,
  uploaded_by_name text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
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
    document.description,
    document.uploaded_by,
    coalesce(
      nullif(profile.display_name, ''),
      nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), ''),
      profile.email
    ) as uploaded_by_name,
    document.created_at,
    document.updated_at
  from public.client_documents as document
  join public.profiles as profile
    on profile.id = document.uploaded_by
  where document.client_id = requested_client_id
    and document.archived_at is null
    and (
      requested_tax_return_id is null
      or document.tax_return_id = requested_tax_return_id
    )
  order by document.created_at desc;
$$;

create or replace function public.register_client_document(
  requested_client_id uuid,
  requested_tax_return_id uuid,
  requested_category text,
  requested_original_file_name text,
  requested_storage_bucket text,
  requested_storage_path text,
  requested_mime_type text,
  requested_size_bytes bigint,
  requested_description text default null
)
returns setof public.client_documents
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_document public.client_documents;
begin
  if not public.current_user_can_manage_records() then
    raise exception 'You are not authorized to upload client documents.';
  end if;

  if requested_storage_bucket <> 'client-documents' then
    raise exception 'The document storage bucket is invalid.';
  end if;

  if requested_size_bytes <= 0 or requested_size_bytes > 26214400 then
    raise exception 'The document must be between 1 byte and 25 MB.';
  end if;

  if requested_tax_return_id is not null and not exists (
    select 1
    from public.tax_returns as tax_return
    where tax_return.id = requested_tax_return_id
      and tax_return.client_id = requested_client_id
  ) then
    raise exception 'The selected tax return does not belong to this client.';
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
    description,
    uploaded_by
  )
  values (
    requested_client_id,
    requested_tax_return_id,
    requested_category,
    'uploaded',
    requested_original_file_name,
    requested_storage_bucket,
    requested_storage_path,
    requested_mime_type,
    requested_size_bytes,
    nullif(trim(requested_description), ''),
    auth.uid()
  )
  returning * into created_document;

  return next created_document;
end;
$$;

create or replace function public.archive_client_document(
  requested_document_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.current_user_can_manage_records() then
    raise exception 'You are not authorized to archive client documents.';
  end if;

  update public.client_documents
  set
    status = 'archived',
    archived_at = timezone('utc', now())
  where id = requested_document_id
    and archived_at is null;

  if not found then
    raise exception 'The document could not be found.';
  end if;
end;
$$;

revoke all on function public.list_client_documents(uuid, uuid) from public;
revoke all on function public.register_client_document(uuid, uuid, text, text, text, text, text, bigint, text) from public;
revoke all on function public.archive_client_document(uuid) from public;

grant execute on function public.list_client_documents(uuid, uuid) to authenticated;
grant execute on function public.register_client_document(uuid, uuid, text, text, text, text, text, bigint, text) to authenticated;
grant execute on function public.archive_client_document(uuid) to authenticated;

comment on table public.client_documents is
  'Secure metadata for client and tax-return documents stored in Supabase Storage.';
