begin;

-- ============================================================
-- Phase 10.4.7B
-- Secure Review Workflow RPCs
-- ============================================================

------------------------------------------------------------
-- Submit document for review
------------------------------------------------------------

create or replace function public.request_document_review(
    p_document_id uuid
)
returns public.client_documents
language plpgsql
security definer
set search_path = public
as
$$
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

------------------------------------------------------------
-- Approve document
------------------------------------------------------------

create or replace function public.approve_document(
    p_document_id uuid,
    p_reviewer_name text,
    p_comments text default null
)
returns public.client_documents
language plpgsql
security definer
set search_path = public
as
$$
declare
    v_document public.client_documents;
begin

    update public.client_documents
    set
        review_status = 'approved',
        reviewed_by = auth.uid(),
        reviewed_by_name = p_reviewer_name,
        reviewed_at = timezone('utc', now()),
        review_comments = p_comments,
        updated_at = timezone('utc', now())
    where id = p_document_id
    returning *
    into v_document;

    return v_document;

end;
$$;

------------------------------------------------------------
-- Needs Changes
------------------------------------------------------------

create or replace function public.request_document_changes(
    p_document_id uuid,
    p_reviewer_name text,
    p_comments text
)
returns public.client_documents
language plpgsql
security definer
set search_path = public
as
$$
declare
    v_document public.client_documents;
begin

    update public.client_documents
    set
        review_status = 'needs_changes',
        reviewed_by = auth.uid(),
        reviewed_by_name = p_reviewer_name,
        reviewed_at = timezone('utc', now()),
        review_comments = p_comments,
        updated_at = timezone('utc', now())
    where id = p_document_id
    returning *
    into v_document;

    return v_document;

end;
$$;

------------------------------------------------------------
-- Reset review when new version uploaded
------------------------------------------------------------

create or replace function public.reset_document_review(
    p_document_id uuid
)
returns public.client_documents
language plpgsql
security definer
set search_path = public
as
$$
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

------------------------------------------------------------
-- Permissions
------------------------------------------------------------

grant execute on function public.request_document_review(uuid)
to authenticated;

grant execute on function public.approve_document(
    uuid,
    text,
    text
)
to authenticated;

grant execute on function public.request_document_changes(
    uuid,
    text,
    text
)
to authenticated;

grant execute on function public.reset_document_review(uuid)
to authenticated;

commit;