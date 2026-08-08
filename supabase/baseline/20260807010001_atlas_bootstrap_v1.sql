-- ============================================================
-- Atlas Foundation v1
-- Supabase platform bootstrap
--
-- This file contains configuration/data that is not included
-- in the public-schema-only production dump.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- Client document storage bucket
-- ------------------------------------------------------------

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
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ------------------------------------------------------------
-- Storage policies
-- ------------------------------------------------------------

drop policy if exists
  "Active staff can read client documents"
on storage.objects;

create policy
  "Active staff can read client documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'client-documents'
  and public.current_user_is_active()
);

drop policy if exists
  "Authorized staff can upload client documents"
on storage.objects;

create policy
  "Authorized staff can upload client documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'client-documents'
  and public.current_user_can_manage_records()
  and (storage.foldername(name))[1] is not null
);

drop policy if exists
  "Authorized staff can remove client documents"
on storage.objects;

create policy
  "Authorized staff can remove client documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'client-documents'
  and public.current_user_can_manage_records()
);

-- ------------------------------------------------------------
-- Auth user profile trigger
-- ------------------------------------------------------------

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

commit;