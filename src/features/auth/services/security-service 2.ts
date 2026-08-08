import { securityNotice } from "@/config/security-notice"
import { supabase } from "@/services/supabase"
import type { Json } from "@/types/database.types"

export interface SecurityAcknowledgmentResult {
  accepted: boolean
}

export async function hasAcceptedCurrentNotice():
  Promise<SecurityAcknowledgmentResult> {
  const { data, error } = await supabase.rpc(
    "has_accepted_security_notice",
    {
      requested_notice_version:
        securityNotice.version,
    },
  )

  if (error) {
    throw error
  }

  return {
    accepted: data === true,
  }
}

export async function acceptCurrentSecurityNotice():
  Promise<void> {
  const metadata: Json = {
    language:
      navigator.language || "unknown",

    platform:
      navigator.platform || "unknown",

    screen_width:
      window.screen.width,

    screen_height:
      window.screen.height,

    application_path:
      window.location.pathname,
  }

  const { error } = await supabase.rpc(
    "accept_security_notice",
    {
      requested_notice_version:
        securityNotice.version,

      requested_user_agent:
        navigator.userAgent,

      requested_metadata:
        metadata,
    },
  )

  if (error) {
    throw error
  }
}

export async function recordSecurityEvent(
  action: string,
  metadata: Json = {},
): Promise<void> {
  const { error } = await supabase.rpc(
    "record_security_event",
    {
      requested_action: action,
      requested_metadata: metadata,
    },
  )

  if (error) {
    console.error(
      `Unable to record security event "${action}":`,
      error,
    )
  }
}