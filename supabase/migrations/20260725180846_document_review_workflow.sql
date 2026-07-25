begin;

-- =========================================================
-- Phase 10.4.7A
-- Document review and approval workflow foundation
-- =========================================================

alter table public.client_documents
  add column if not exists review_status text,
  add column if not exists review_requested_by uuid,
  add column if not exists review_requested_at timestamptz,
  add column if not exists reviewed_by uuid,
  add column if not exists reviewed_by_name text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_comments text;

-- Existing documents begin in the draft state.
update public.client_documents
set review_status = 'draft'
where review_status is null;

alter table public.client_documents
  alter column review_status set default 'draft',
  alter column review_status set not null;

-- Restrict review_status to the supported workflow values.
alter table public.client_documents
  drop constraint if exists client_documents_review_status_check;

alter table public.client_documents
  add constraint client_documents_review_status_check
  check (
    review_status in (
      'draft',
      'pending_review',
      'approved',
      'needs_changes'
    )
  );

-- Review comments should remain reasonably sized.
alter table public.client_documents
  drop constraint if exists client_documents_review_comments_length_check;

alter table public.client_documents
  add constraint client_documents_review_comments_length_check
  check (
    review_comments is null
    or char_length(review_comments) <= 2000
  );

-- Reviewed fields must stay logically consistent.
alter table public.client_documents
  drop constraint if exists client_documents_review_metadata_check;

alter table public.client_documents
  add constraint client_documents_review_metadata_check
  check (
    (
      review_status in (
        'draft',
        'pending_review'
      )
      and reviewed_at is null
      and reviewed_by is null
    )
    or
    (
      review_status in (
        'approved',
        'needs_changes'
      )
      and reviewed_at is not null
      and reviewed_by is not null
    )
  );

-- Review-request metadata is required while pending review.
alter table public.client_documents
  drop constraint if exists client_documents_review_request_metadata_check;

alter table public.client_documents
  add constraint client_documents_review_request_metadata_check
  check (
    review_status <> 'pending_review'
    or review_requested_at is not null
  );

-- Useful for review queues and client-level filtering.
create index if not exists
  client_documents_review_status_idx
on public.client_documents (
  review_status
)
where archived_at is null;

create index if not exists
  client_documents_client_review_status_idx
on public.client_documents (
  client_id,
  review_status
)
where archived_at is null;

create index if not exists
  client_documents_pending_review_idx
on public.client_documents (
  review_requested_at
)
where
  archived_at is null
  and review_status = 'pending_review';

comment on column public.client_documents.review_status is
  'Document review state: draft, pending_review, approved, or needs_changes.';

comment on column public.client_documents.review_requested_by is
  'Authenticated user who submitted the document for review.';

comment on column public.client_documents.review_requested_at is
  'Time the current version was submitted for review.';

comment on column public.client_documents.reviewed_by is
  'Authenticated user who approved the document or requested changes.';

comment on column public.client_documents.reviewed_by_name is
  'Display name captured when the document review decision was made.';

comment on column public.client_documents.reviewed_at is
  'Time the current review decision was recorded.';

comment on column public.client_documents.review_comments is
  'Reviewer comments associated with the current review decision.';

commit;