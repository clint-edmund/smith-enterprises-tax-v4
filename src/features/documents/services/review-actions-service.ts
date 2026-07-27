import { supabase } from "@/services/supabase"

export async function approveReview(
  documentId: string,
) {
  const {
    error,
  } =
    await supabase.rpc(
      "approve_document",
      {
        p_document_id:
          documentId,
      },
    )

  if (error) {
    throw error
  }
}

export async function requestChanges(
  documentId: string,
  comments: string,
) {
  const {
    error,
  } =
    await supabase.rpc(
      "request_document_changes",
      {
        p_document_id:
          documentId,

        p_comments:
          comments,
      },
    )

  if (error) {
    throw error
  }
}