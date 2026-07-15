import { createBrowserRouter, Navigate } from "react-router-dom"

import { AppLayout } from "@/app/layouts/app-layout"
import { PublicLayout } from "@/app/layouts/public-layout"
import { NotFoundPage } from "@/app/router/not-found-page"
import { appConfig } from "@/config/app-config"
import { HomePage } from "@/features/auth/pages/home-page"
import { LoginPage } from "@/features/auth/pages/login-page"
import { ClientsPage } from "@/features/clients/pages/clients-page"
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page"
import { PaymentsPage } from "@/features/payments/pages/payments-page"
import { ReportsPage } from "@/features/reports/pages/reports-page"
import { ReturnsPage } from "@/features/returns/pages/returns-page"
import { SettingsPage } from "@/features/settings/pages/settings-page"

export const appRouter = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: appConfig.routes.home,
        element: <HomePage />,
      },
      {
        path: appConfig.routes.login,
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: appConfig.routes.dashboard,
        element: <DashboardPage />,
      },
      {
        path: appConfig.routes.clients,
        element: <ClientsPage />,
      },
      {
        path: appConfig.routes.returns,
        element: <ReturnsPage />,
      },
      {
        path: appConfig.routes.payments,
        element: <PaymentsPage />,
      },
      {
        path: appConfig.routes.reports,
        element: <ReportsPage />,
      },
      {
        path: appConfig.routes.settings,
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "/home",
    element: <Navigate to={appConfig.routes.home} replace />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
])