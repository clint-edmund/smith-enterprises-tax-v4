import {
  createBrowserRouter,
  Navigate,
  Outlet,
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
import { ClientPortalGuard } from "@/features/client-portal/guards/client-portal-guard"
import { ClientPortalLayout } from "@/features/client-portal/layouts/client-portal-layout"
import {
  AcceptPortalInvitationPage,
} from "@/features/security/pages/accept-portal-invitation-page"
import {
  PrivacyPolicyPage,
} from "@/features/client-portal/pages/privacy-policy-page"
import {
  TermsOfServicePage,
} from "@/features/client-portal/pages/terms-of-service-page"
import { ClientDashboardPage } from "@/features/client-portal/pages/client-dashboard-page"
import { ClientLoginPage } from "@/features/client-portal/pages/client-login-page"
import { ClientRegistrationPage } from "@/features/client-portal/pages/client-registration-page"
import { ClientDetailsPage } from "@/features/clients/pages/client-details-page"
import { ClientsPage } from "@/features/clients/pages/clients-page"
import { EditClientPage } from "@/features/clients/pages/edit-client-page"
import { NewClientPage } from "@/features/clients/pages/new-client-page"
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page"
import { DocumentsPage } from "@/features/documents/pages/documents-page"
import { ReviewQueuePage } from "@/features/documents/pages/review-queue-page"
import {
  NotificationCenterPage,
} from "@/features/notifications/pages/notification-center-page"
import {
  NotificationPreferencesPage,
} from "@/features/notifications/pages/notification-preferences-page"
import { PaymentsPage } from "@/features/payments/pages/payments-page"
import { ReportsPage } from "@/features/reports/pages/reports-page"
import { EditReturnPage } from "@/features/returns/pages/edit-return-page"
import { NewReturnPage } from "@/features/returns/pages/new-return-page"
import { ReturnDetailsPage } from "@/features/returns/pages/return-details-page"
import { ReturnsPage } from "@/features/returns/pages/returns-page"
import {
  LegacyReturnWorkspaceRedirect,
} from "@/features/returns/pages/legacy-return-workspace-redirect"
import { SettingsPage } from "@/features/settings/pages/settings-page"
import {
  ClientAuthProvider,
} from "@/features/client-portal/providers/client-auth-provider"
import { ClientReturnsPage } from "@/features/client-portal/pages/client-returns-page"
import {
  AccessDeniedPage,
} from "@/features/auth/pages/access-denied-page"
import {
  PermissionRoute,
} from "@/features/authorization/components/permission-route"
import {
  permissions,
} from "@/features/authorization/permissions"

import {
  OrganizerPersonalInformationPage,
} from "@/features/client-portal/pages/organizer-personal-information-page"

import {
  OrganizerIdentityInformationPage,
} from "@/features/client-portal/pages/organizer-identity-information-page"

import {
  OrganizerBankingInformationPage,
} from "@/features/client-portal/pages/organizer-banking-information-page"

import {
  OrganizerProvider,
} from "@/features/client-portal/context/organizer/organizer-provider"

import {
  OrganizerDependentsPage,
} from "@/features/client-portal/pages/organizer-dependents-page"

import {
  OrganizerIncomePage,
} from "@/features/client-portal/pages/organizer-income-page"

import {
  OrganizerOverviewPage,
} from "@/features/client-portal/pages/organizer-overview-page"

import {
  HealthcarePage,
} from "@/features/client-portal/pages/organizer/healthcare-page"

import {
  OrganizerReviewPage,
} from "@/features/organizer-review/pages/organizer-review-page"

import {
  HealthcareReviewPage,
} from "@/features/organizer-review/pages/healthcare-review-page"

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
              path: appConfig.routes.login,
              element: <LoginPage />,
            },
          ],
        },
      ],
    },
    {
      element: (
        <ClientAuthProvider>
          <Outlet />
        </ClientAuthProvider>
      ),
      children: [
        {
          path: appConfig.routes.clientHome,
          element: (
            <Navigate
              to={appConfig.routes.clientDashboard}
              replace
            />
          ),
        },
        {
          path: appConfig.routes.clientLogin,
          element: <ClientLoginPage />,
        },
        {
          path: appConfig.routes.clientRegister,
          element: <ClientRegistrationPage />,
        },
        {
          path: appConfig.routes.termsOfService,
          element: <TermsOfServicePage />,
        },
        {
          path: appConfig.routes.privacyPolicy,
          element: <PrivacyPolicyPage />,
        },
        {
          path: "/accept-invitation",
          element: <AcceptPortalInvitationPage />,
        },
        {
          element: <ClientPortalGuard />,
          children: [
            {
              element: <ClientPortalLayout />,
              children: [
                {
                  path: appConfig.routes.clientDashboard,
                  element: <ClientDashboardPage />,
                },
                {
                  element: (
                    <OrganizerProvider>
                      <Outlet />
                    </OrganizerProvider>
                  ),
                  children: [
                    {
                      path: "/client/organizer/personal",
                      element: (
                        <OrganizerPersonalInformationPage />
                      ),
                    },
                    {
                      path: "/client/organizer/identity",
                      element: (
                        <OrganizerIdentityInformationPage />
                      ),
                    },
                    {
                      path: "/client/organizer/banking",
                      element: (
                        <OrganizerBankingInformationPage />
                      ),
                    },
                    {
                      path: "/client/organizer/dependents",
                      element: (
                        <OrganizerDependentsPage />
                      ),
                    },
                    {
                      path: "/client/organizer/income",
                      element: (
                        <OrganizerIncomePage />
                      ),
                    },
                    {
                      path: "/client/organizer/overview",
                      element: (
                        <OrganizerOverviewPage />
                      ),
                    },
                    {
                      path: "/client/organizer/healthcare",
                      element: (
                        <HealthcarePage />
                      ),
                    },
                  ],
                },
                {
                  path: "/client/returns",
                  element: <ClientReturnsPage />,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: appConfig.routes.pendingApproval,
      element: <PendingApprovalPage />,
    },
    {
      path: appConfig.routes.accountError,
      element: <AccountErrorPage />,
    },
    {
      path: "/403",
      element: <AccessDeniedPage />,
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
                  element: (
                    <PermissionRoute
                      permission={permissions.dashboard.view}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.dashboard,
                      element: <DashboardPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.notifications.view}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.notifications,
                      element: <NotificationCenterPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.clients.view}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.clients,
                      element: <ClientsPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.clients.create}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.clientNew,
                      element: <NewClientPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.clients.edit}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.clientEdit,
                      element: <EditClientPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.clients.view}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.clientDetails,
                      element: <ClientDetailsPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.clients.view}
                    />
                  ),
                  children: [
                    {
                      path:
                        "/clients/:clientId/organizer-review/:taxYear",
                      element:
                        <OrganizerReviewPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.clients.view}
                    />
                  ),
                  children: [
                    {
                      path:
                        "/clients/:clientId/organizer-review/:taxYear/healthcare",
                      element:
                        <HealthcareReviewPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.returns.view}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.returns,
                      element: <ReturnsPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.documents.view}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.documents,
                      element: <DocumentsPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.documents.view}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.reviewQueue,
                      element: <ReviewQueuePage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.returns.create}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.returnNew,
                      element: <NewReturnPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.returns.edit}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.returnEdit,
                      element: <EditReturnPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.returns.view}
                    />
                  ),
                  children: [
                    {
                      path:
                        appConfig.routes.returnWorkspace,
                      element: (
                        <LegacyReturnWorkspaceRedirect />
                      ),
                    },
                    {
                      path:
                        appConfig.routes.returnDetails,
                      element: <ReturnDetailsPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.payments.view}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.payments,
                      element: <PaymentsPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.reports.view}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.reports,
                      element: <ReportsPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.settings.view}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.settings,
                      element: <SettingsPage />,
                    },
                  ],
                },
                {
                  element: (
                    <PermissionRoute
                      permission={permissions.settings.view}
                    />
                  ),
                  children: [
                    {
                      path: appConfig.routes.notificationPreferences,
                      element: <NotificationPreferencesPage />,
                    },
                  ],
                },
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