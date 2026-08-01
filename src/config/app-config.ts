import { env } from "@/config/env"

export const appConfig = {
  name: env.VITE_APP_NAME,
  version: env.VITE_APP_VERSION,
  environment: env.VITE_APP_ENVIRONMENT,

  business: {
    name: "Smith Enterprises",
    tagline: "Professional Tax & Accounting Services",

    // Add the office contact information when it is finalized.
    // Blank values are automatically hidden from printed receipts.
    addressLines: [
      "4518 Beech Road", 
      "Suite 225",
      "Temple Hills, MD 20748",
    ] as string[],
    phone: "301-316-1229",
    email: "info@smithenterprises.com",
    website: "https://smithenterprisesllc.com",
  },

  routes: {
    home: "/",
    login: "/login",
    pendingApproval: "/pending-approval",
    accountError: "/account-error",
    securityAcknowledgment:
      "/security-acknowledgment",
    dashboard: "/dashboard",
    notifications: "/notifications",
    clients: "/clients",
    clientNew: "/clients/new",
    clientDetails: "/clients/:clientId",
    clientEdit: "/clients/:clientId/edit",
    returns: "/returns",
    documents: "/documents",
    reviewQueue: "/documents/review-queue",
    returnNew: "/returns/new",
    returnDetails: "/returns/:returnId",
    returnWorkspace:
      "/returns/:returnId/workspace",
    returnEdit: "/returns/:returnId/edit",
    payments: "/payments",
    reports: "/reports",
    settings: "/settings",
    notificationPreferences:
      "/settings/notifications",
    clientHome: "/client",
    clientLogin: "/client/login",
    clientRegister: "/client/register",
    clientDashboard: "/client/dashboard",
    clientDocuments: "/client/documents",
    clientMessages: "/client/messages",
    clientPayments: "/client/payments",
    clientProfile: "/client/profile",
  },
} as const

export function getClientDetailsRoute(
  clientId: string,
): string {
  return `/clients/${clientId}`
}

export function getClientEditRoute(
  clientId: string,
): string {
  return `/clients/${clientId}/edit`
}

export function getReturnDetailsRoute(
  returnId: string,
): string {
  return `/returns/${returnId}`
}

export function getReturnEditRoute(
  returnId: string,
): string {
  return `/returns/${returnId}/edit`
}

export function getNewClientReturnRoute(
  clientId: string,
): string {
  return `/returns/new?clientId=${encodeURIComponent(
    clientId,
  )}`
}
