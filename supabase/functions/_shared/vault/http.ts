export const corsHeaders = {
  "Access-Control-Allow-Origin":
    "*",

  "Access-Control-Allow-Headers":
    [
      "authorization",
      "x-client-info",
      "apikey",
      "content-type",
    ].join(", "),

  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
}

export function jsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,

      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    },
  )
}

export function errorResponse(
  message: string,
  status = 400,
  requestId?: string,
): Response {
  return jsonResponse(
    {
      success: false,
      message,
      requestId,
    },
    status,
  )
}