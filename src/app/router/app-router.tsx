import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom"

import { AppLayout } from "@/app/layouts/app-layout"
import { PublicLayout } from "@/app/layouts/public-layout"
import { NotFoundPage } from "@/app/router/not-found-page"
import { appConfig } from "@/config/app-config"
import { ProtectedRoute } from "@/features/auth/components/protected-route"
import { PublicOnlyRoute } from "@/features/auth/components/public-only-route"
import { SecurityAcknowledgmentRoute } from "@/features/auth/components/security-acknowledgment-route"
import { AccountErrorPage } from "@/features/auth/pages/account-error-page"
import { HomePage } from "@/features/auth/pages/home-page"
import { LoginPage } from "@/features/auth/pages/login-page"
import { PendingApprovalPage } from "@/features/auth/pages/pending-approval-page"
import { SecurityAcknowledgmentPage } from "@/features/auth/pages/security-acknowledgment-page"
import { ClientsPage } from "@/features/clients/pages/clients-page"
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page"
import { NotificationCenterPage, } from "@/features/notifications/pages/notification-center-page"
import { PaymentsPage } from "@/features/payments/pages/payments-page"
import { ReportsPage } from "@/features/reports/pages/reports-page"
import { DocumentsPage } from "@/features/documents/pages/documents-page"
import { ReturnsPage } from "@/features/returns/pages/returns-page"
import { SettingsPage } from "@/features/settings/pages/settings-page"
import { ClientDetailsPage } from "@/features/clients/pages/client-details-page"
import { EditClientPage } from "@/features/clients/pages/edit-client-page"
import { NewClientPage } from "@/features/clients/pages/new-client-page"
import { NewReturnPage } from "@/features/returns/pages/new-return-page"
import { ReturnDetailsPage } from "@/features/returns/pages/return-details-page"
import { EditReturnPage } from "@/features/returns/pages/edit-return-page"
import { NotificationPreferencesPage } from "@/features/notifications/pages/notification-preferences-page"

export const appRouter =
  createBrowserRouter([
    {
      element: <PublicLayout />,
      children: [
        {
          path: appConfig.routes.home,
          element: <HomePage />,
        },
        {
          element: <PublicOnlyRoute />,
          children: [
            {
              path:
                appConfig.routes.login,
              element: <LoginPage />,
            },
          ],
        },
      ],
    },
    {
      path:
        appConfig.routes.pendingApproval,
      element: <PendingApprovalPage />,
    },
    {
      path:
        appConfig.routes.accountError,
      element: <AccountErrorPage />,
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          path:
            appConfig.routes
              .securityAcknowledgment,
          element:
            <SecurityAcknowledgmentPage />,
        },
        {
          element:
            <SecurityAcknowledgmentRoute />,
          children: [
            {
              element: <AppLayout />,
              children: [
                {
                  path:
                    appConfig.routes.dashboard,
                  element:
                    <DashboardPage />,
                },
                {
                  path: appConfig.routes.notifications,
                  element: <NotificationCenterPage />,
                },
                {
                  path: appConfig.routes.clients,
                  element: <ClientsPage />,
                },
                {       
                  path: appConfig.routes.clientNew,
                  element: <NewClientPage />,
                },
                {
                  path: appConfig.routes.clientEdit,
                  element: <EditClientPage />,
                },
                {
                  path: appConfig.routes.clientDetails,
                  element: <ClientDetailsPage />,
                },
                {
                  path:
                    appConfig.routes.returns,
                  element:
                    <ReturnsPage />,
                },
                {
                  path: appConfig.routes.documents,
                  element: <DocumentsPage />,
                },
                {
                  path: appConfig.routes.returnNew,
                  element: <NewReturnPage />,
                },
                {
                  path: appConfig.routes.returnEdit,
                  element: <EditReturnPage />,
                },
                {
                  path: appConfig.routes.returnDetails,
                  element: <ReturnDetailsPage />,
                },
                {
                  path:
                    appConfig.routes.payments,
                  element:
                    <PaymentsPage />,
                },
                {
                  path:
                    appConfig.routes.reports,
                  element:
                    <ReportsPage />,
                },
                {
                  path:
                    appConfig.routes.settings,
                  element:
                    <SettingsPage />,    
                },
                {
                  path:
                    appConfig.routes.notificationPreferences,
                  element:
                    <NotificationPreferencesPage />,
                }
              ],
            },
          ],
        },
      ],
    },
    {
      path: "/home",
      element: (
        <Navigate
          to={appConfig.routes.home}
          replace
        />
      ),
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ])