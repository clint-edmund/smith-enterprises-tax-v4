alter table public.notifications
  add column if not exists is_archived boolean not null default false,
  add column if not exists archived_at timestamptz null,
  add column if not exists deleted_at timestamptz null;

create index if not exists notifications_recipient_archived_created_idx
  on public.notifications (
    recipient_user_id,
    is_archived,
    created_at desc
  )
  where deleted_at is null;

create index if not exists notifications_recipient_deleted_idx
  on public.notifications (
    recipient_user_id,
    deleted_at
  )
  where deleted_at is not null;

comment on column public.notifications.is_archived is
  'Indicates whether the notification has been archived by its recipient.';

comment on column public.notifications.archived_at is
  'Timestamp when the notification was archived. Null when active.';

comment on column public.notifications.deleted_at is
  'Soft-delete timestamp. Null means the notification has not been deleted.';