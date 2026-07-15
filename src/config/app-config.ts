import { env } from "@/config/env"

export const appConfig = {
  name: env.VITE_APP_NAME,
  version: env.VITE_APP_VERSION,
  environment: env.VITE_APP_ENVIRONMENT,

  routes: {
    home: "/",
    login: "/login",
    dashboard: "/dashboard",
    clients: "/clients",
    returns: "/returns",
    payments: "/payments",
    reports: "/reports",
    settings: "/settings",
  },
} as const