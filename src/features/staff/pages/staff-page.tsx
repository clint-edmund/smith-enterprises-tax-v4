import {
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  AtlasCard,
  AtlasKpiCard,
  AtlasPageHeader,
  AtlasStatusPill,
} from "@/components/atlas-ui"

import {
  useAuthorization,
} from "@/features/authorization/hooks/use-authorization"
import {
  useAuth,
} from "@/features/auth/hooks/use-auth"
import {
  AddStaffDialog,
} from "@/features/staff/components/add-staff-dialog"
import {
  StaffActionsMenu,
} from "@/features/staff/components/staff-actions-menu"
import {
  StaffAdministrationActivity,
} from "@/features/staff/components/staff-administration-activity"
import {
  StaffRoleDialog,
} from "@/features/staff/components/staff-role-dialog"

import type {
  AppRole,
} from "@/features/auth/types/auth.types"
import {
  getStaffDirectory,
  inviteStaffUser,
  sendStaffPasswordReset,
  updateStaffRole,
  updateStaffStatus,
} from "@/features/staff/services/staff-service"
import type {
  StaffDirectoryItem,
} from "@/features/staff/types/staff.types"

type StatusFilter =
  | "all"
  | "active"
  | "inactive"

type RoleFilter =
  | "all"
  | AppRole

const roleLabels: Record<
  AppRole,
  string
> = {
  administrator: "Administrator",
  manager: "Manager",
  preparer: "Preparer",
  reviewer: "Reviewer",
  receptionist: "Receptionist",
  read_only: "Read Only",
}

const roleOptions: AppRole[] = [
  "administrator",
  "manager",
  "preparer",
  "reviewer",
  "receptionist",
  "read_only",
]

function getStaffName(
  staffMember: StaffDirectoryItem,
): string {
  return (
    staffMember.displayName ||
    [
      staffMember.firstName,
      staffMember.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    staffMember.email
  )
}

function getInitials(
  staffMember: StaffDirectoryItem,
): string {
  const name =
    getStaffName(staffMember)

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0),
    )
    .join("")
    .toUpperCase()

  return initials || "SE"
}

function formatDate(
  value: string,
): string {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date)
}

function formatPhone(
  value: string | null,
): string {
  if (!value) {
    return "—"
  }

  return value
}

export function StaffPage() {
  
  const {
    profile,
    } = useAuth()

  const [
  staffForManagement,
  setStaffForManagement,
] = useState<
  StaffDirectoryItem | null
>(null)

const [
  passwordResetStaff,
  setPasswordResetStaff,
] = useState<
  StaffDirectoryItem | null
>(null)

const [
  isSendingPasswordReset,
  setIsSendingPasswordReset,
] = useState(false)

const [
  passwordResetError,
  setPasswordResetError,
] = useState<
  string | null
>(null)

const [
  passwordResetSuccess,
  setPasswordResetSuccess,
] = useState<
  string | null
>(null)

const [
  isManagingStaff,
  setIsManagingStaff,
] = useState(false)

const [
  staffManagementError,
  setStaffManagementError,
] = useState<
  string | null
>(null)

  const [
    staff,
    setStaff,
  ] = useState<
    StaffDirectoryItem[]
  >([])

  const {
    hasPermission,
    permissions,
  } = useAuthorization()

  const canManageStaff =
    hasPermission(
      permissions.users.edit,
    )

  const [
    isAddStaffOpen,
    setIsAddStaffOpen,
  ] = useState(false)

  const [
    isInvitingStaff,
    setIsInvitingStaff,
  ] = useState(false)

  const [
    inviteError,
    setInviteError,
  ] = useState<string | null>(null)

  const [
    inviteSuccess,
    setInviteSuccess,
  ] = useState<string | null>(null)

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<
    string | null
  >(null)

  const [
    searchText,
    setSearchText,
  ] = useState("")

  const [
    roleFilter,
    setRoleFilter,
  ] = useState<RoleFilter>(
    "all",
  )

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>(
    "all",
  )

  const [
    selectedStaff,
    setSelectedStaff,
  ] = useState<
    StaffDirectoryItem | null
  >(null)

  const loadStaff =
    useCallback(
      async (
        showRefreshing = false,
      ) => {
        if (showRefreshing) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        setErrorMessage(null)

        try {
          const results =
            await getStaffDirectory()

          setStaff(results)
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load staff directory.",
          )
        } finally {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      },
      [],
    )

  useEffect(() => {
    void loadStaff()
  }, [loadStaff])

  const metrics =
    useMemo(() => {
      const active =
        staff.filter(
          (item) =>
            item.isActive,
        ).length

      const inactive =
        staff.length -
        active

      const administrators =
        staff.filter(
          (item) =>
            item.role ===
            "administrator",
        ).length

      return {
        total: staff.length,
        active,
        inactive,
        administrators,
      }
    }, [staff])

  const filteredStaff =
    useMemo(() => {
      const search =
        searchText
          .trim()
          .toLowerCase()

      return staff.filter(
        (item) => {
          if (
            roleFilter !==
              "all" &&
            item.role !==
              roleFilter
          ) {
            return false
          }

          if (
            statusFilter ===
              "active" &&
            !item.isActive
          ) {
            return false
          }

          if (
            statusFilter ===
              "inactive" &&
            item.isActive
          ) {
            return false
          }

          if (!search) {
            return true
          }

          const searchableValues =
            [
              getStaffName(item),
              item.email,
              item.phone ?? "",
              roleLabels[
                item.role
              ],
            ]

          return searchableValues.some(
            (value) =>
              value
                .toLowerCase()
                .includes(search),
          )
        },
      )
    }, [
      roleFilter,
      searchText,
      staff,
      statusFilter,
    ])

  async function handleInviteStaff(
    values: {
      firstName: string
      lastName: string
      displayName: string
      email: string
      phone: string
      role: AppRole
    },
  ) {
    setIsInvitingStaff(true)
    setInviteError(null)
    setInviteSuccess(null)

    try {
      const result =
        await inviteStaffUser(values)

      setIsAddStaffOpen(false)
      setInviteSuccess(
        result.message ??
          `Invitation sent to ${values.email}.`,
      )

      await loadStaff(true)
    } catch (error) {
      setInviteError(
        error instanceof Error
          ? error.message
          : "Unable to invite the staff member.",
      )
    } finally {
      setIsInvitingStaff(false)
    }
  }

  async function handleSendPasswordReset() {
    if (!passwordResetStaff) {
      return
    }

    setIsSendingPasswordReset(true)
    setPasswordResetError(null)
    setPasswordResetSuccess(null)

    try {
      await sendStaffPasswordReset(
        passwordResetStaff.id,
        )

      setPasswordResetSuccess(
        `Password reset instructions were sent to ${passwordResetStaff.email}.`,
      )

      setPasswordResetStaff(null)
    } catch (error) {
      setPasswordResetError(
        error instanceof Error
          ? error.message
          : "Unable to send password reset instructions.",
      )
    } finally {
      setIsSendingPasswordReset(false)
    }
  }

  async function handleRoleUpdate(
    role: AppRole,
  ) {
    if (!staffForManagement) {
      return
    }

    setIsManagingStaff(true)
    setStaffManagementError(null)

    try {
      const updatedStaff =
        await updateStaffRole(
          staffForManagement.id,
          role,
        )

      setStaff((current) =>
        current.map((item) =>
          item.id ===
          updatedStaff.id
            ? updatedStaff
            : item,
        ),
      )

      setStaffForManagement(
        null,
      )
    } catch (error) {
      setStaffManagementError(
        error instanceof Error
          ? error.message
          : "Unable to update the staff role.",
      )
    } finally {
      setIsManagingStaff(false)
    }
  }

  async function handleStatusUpdate(
    isActive: boolean,
  ) {
    if (!staffForManagement) {
      return
    }

    setIsManagingStaff(true)
    setStaffManagementError(null)

    try {
      const updatedStaff =
        await updateStaffStatus(
          staffForManagement.id,
          isActive,
        )

      setStaff((current) =>
        current.map((item) =>
          item.id ===
          updatedStaff.id
            ? updatedStaff
            : item,
        ),
      )

      setStaffForManagement(
        null,
      )
    } catch (error) {
      setStaffManagementError(
        error instanceof Error
          ? error.message
          : "Unable to update the staff account status.",
      )
    } finally {
      setIsManagingStaff(false)
    }
  }

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid gap-4 sm\:grid-cols-2 xl\:grid-cols-4">
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-xl bg-slate-200"
              />
            ),
          )}
        </div>

        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <AtlasPageHeader
        eyebrow="Staff Administration"
        title="Staff Directory"
        description="Review staff access, application roles, and account status from one administrative workspace."
        metadata={
          <>
            {metrics.active} active
            {" · "}
            {metrics.inactive} inactive
            {" · "}
            {metrics.total} total
          </>
        }
        actions={
          <div className="flex flex-wrap gap-3">
            {profile?.role === "administrator" && (
              <button
                type="button"
                onClick={() => {
                  setInviteError(null)
                  setInviteSuccess(null)
                  setIsAddStaffOpen(true)
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover\:bg-slate-100"
              >
                <UserPlus className="size-4" aria-hidden="true" />
                Add Staff Member
              </button>
            )}

            <button
              type="button"
              disabled={isRefreshing}
              onClick={() => {
                void loadStaff(true)
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover\:bg-white/15 disabled\:cursor-not-allowed disabled\:opacity-50"
            >
              <RefreshCw
                className={[
                  "size-4",
                  isRefreshing ? "animate-spin" : "",
                ].join(" ")}
                aria-hidden="true"
              />
              Refresh
            </button>
          </div>
        }
      />

      {errorMessage && (
        <AtlasCard
          className="border-red-200 bg-red-50"
        >
          <p className="font-semibold text-red-900">
            Unable to load
            staff directory
          </p>

          <p className="mt-2 text-sm text-red-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => {
              void loadStaff(
                true,
              )
            }}
            className="mt-4 text-sm font-semibold text-red-800 underline underline-offset-4"
          >
            Try again
          </button>
        </AtlasCard>
      )}

      <div className="grid gap-4 sm\:grid-cols-2 xl\:grid-cols-4">
        <AtlasKpiCard
          label="Total Staff"
          value={
            metrics.total
          }
          description="All staff profiles"
          icon={Users}
          tone="info"
        />

        <AtlasKpiCard
          label="Active Staff"
          value={
            metrics.active
          }
          description="Approved for access"
          icon={UserCheck}
          tone="success"
        />

        <AtlasKpiCard
          label="Inactive / Pending"
          value={
            metrics.inactive
          }
          description="Access not active"
          icon={UserX}
          tone={
            metrics.inactive >
            0
              ? "warning"
              : "neutral"
          }
        />

        <AtlasKpiCard
          label="Administrators"
          value={
            metrics.administrators
          }
          description="Full system access"
          icon={ShieldCheck}
          tone="neutral"
        />
      </div>

      <AtlasCard
        padding="none"
        className="overflow-hidden"
      >
        <div className="border-b border-slate-200 p-5 sm\:p-6">
          <div className="flex flex-col gap-4 xl\:flex-row xl\:items-end xl\:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                Staff Directory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search and filter
                staff accounts by
                role and access
                status.
              </p>
            </div>

            <div className="grid gap-3 sm\:grid-cols-2 xl\:grid-cols-[minmax(16rem,22rem)_12rem_12rem]">
              <div className="relative sm\:col-span-2 xl\:col-span-1">
                <Search
                  className="pointer-events-none absolute left-3 top-3 size-4.5 text-slate-400"
                  aria-hidden="true"
                />

                <input
                  type="search"
                  value={
                    searchText
                  }
                  onChange={(
                    event,
                  ) => {
                    setSearchText(
                      event.target
                        .value,
                    )
                  }}
                  placeholder="Search staff..."
                  aria-label="Search staff"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-950 outline-none transition focus\:border-blue-600 focus\:ring-4 focus\:ring-blue-100"
                />
              </div>

              <select
                value={
                  roleFilter
                }
                onChange={(
                  event,
                ) => {
                  setRoleFilter(
                    event.target
                      .value as RoleFilter,
                  )
                }}
                aria-label="Filter by role"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus\:border-blue-600 focus\:ring-4 focus\:ring-blue-100"
              >
                <option value="all">
                  All Roles
                </option>

                {roleOptions.map(
                  (role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {
                        roleLabels[
                          role
                        ]
                      }
                    </option>
                  ),
                )}
              </select>

              <select
                value={
                  statusFilter
                }
                onChange={(
                  event,
                ) => {
                  setStatusFilter(
                    event.target
                      .value as StatusFilter,
                  )
                }}
                aria-label="Filter by status"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus\:border-blue-600 focus\:ring-4 focus\:ring-blue-100"
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive / Pending
                </option>
              </select>
            </div>
          </div>
        </div>

        {filteredStaff.length ===
        0 ? (
          <div className="px-6 py-16 text-center">
            <Users
              className="mx-auto size-10 text-slate-300"
              aria-hidden="true"
            />

            <h3 className="mt-4 font-semibold text-slate-950">
              {staff.length ===
              0
                ? "No staff accounts found"
                : "No matching staff found"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {staff.length ===
              0
                ? "Staff profiles will appear here when accounts are available."
                : "Try changing your search or filters."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md\:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Staff Member
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Added
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStaff.map(
                    (
                      staffMember,
                    ) => (
                      <tr
                        key={
                          staffMember.id
                        }
                        className="hover\:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                              {getInitials(
                                staffMember,
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-950">
                                {getStaffName(
                                  staffMember,
                                )}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {
                                  staffMember.email
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">
                          {
                            roleLabels[
                              staffMember
                                .role
                            ]
                          }
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <AtlasStatusPill
                            tone={
                              staffMember.isActive
                                ? "success"
                                : "warning"
                            }
                          >
                            {staffMember.isActive
                              ? "Active"
                              : "Inactive / Pending"}
                          </AtlasStatusPill>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-700">
                            {
                              staffMember.email
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatPhone(
                              staffMember.phone,
                            )}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {formatDate(
                            staffMember.createdAt,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <StaffActionsMenu
                            staffMember={
                              staffMember
                            }
                            canManageStaff={
                              canManageStaff
                            }
                            onViewDetails={
                              setSelectedStaff
                            }
                            onManageStaff={(
                              selected,
                            ) => {
                              setStaffManagementError(
                                null,
                              )
                              setStaffForManagement(
                                selected,
                              )
                            }}
                            onSendPasswordReset={(
                              selected,
                            ) => {
                              setPasswordResetError(
                                null,
                              )
                              setPasswordResetSuccess(
                                null,
                              )
                              setPasswordResetStaff(
                                selected,
                              )
                            }}
                          />
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md\:hidden">
              {filteredStaff.map(
                (
                  staffMember,
                ) => (
                  <article
                    key={
                      staffMember.id
                    }
                    className="p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                        {getInitials(
                          staffMember,
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-950">
                          {getStaffName(
                            staffMember,
                          )}
                        </p>

                        <p className="mt-1 break-all text-sm text-slate-500">
                          {
                            staffMember.email
                          }
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <AtlasStatusPill>
                            {
                              roleLabels[
                                staffMember
                                  .role
                              ]
                            }
                          </AtlasStatusPill>

                          <AtlasStatusPill
                            tone={
                              staffMember.isActive
                                ? "success"
                                : "warning"
                            }
                          >
                            {staffMember.isActive
                              ? "Active"
                              : "Inactive / Pending"}
                          </AtlasStatusPill>
                        </div>

                        <div className="mt-4 grid gap-2 text-sm text-slate-600">
                          <p>
                            Phone:{" "}
                            {formatPhone(
                              staffMember.phone,
                            )}
                          </p>

                          <p>
                            Added:{" "}
                            {formatDate(
                              staffMember.createdAt,
                            )}
                          </p>
                        </div>

                        <div className="mt-4">
                          <StaffActionsMenu
                            staffMember={
                              staffMember
                            }
                            canManageStaff={
                              canManageStaff
                            }
                            onViewDetails={
                              setSelectedStaff
                            }
                            onManageStaff={(
                              selected,
                            ) => {
                              setStaffManagementError(
                                null,
                              )
                              setStaffForManagement(
                                selected,
                              )
                            }}
                            onSendPasswordReset={(
                              selected,
                            ) => {
                              setPasswordResetError(
                                null,
                              )
                              setPasswordResetSuccess(
                                null,
                              )
                              setPasswordResetStaff(
                                selected,
                              )
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>

            <footer className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
              Showing{" "}
              {
                filteredStaff.length
              }{" "}
              of {staff.length} staff{" "}
              {staff.length === 1
                ? "account"
                : "accounts"}
              .
            </footer>
          </>
        )}
      </AtlasCard>

      {profile?.role === "administrator" && (
        <StaffAdministrationActivity />
      )}

      {selectedStaff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Staff details for ${getStaffName(
            selectedStaff,
          )}`}
        >
          <AtlasCard
            className="w-full max-w-lg"
            elevated
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                  Staff Account
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {getStaffName(
                    selectedStaff,
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedStaff(
                    null,
                  )
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover\:bg-slate-50"
              >
                Close
              </button>
            </div>

            <dl className="mt-6 grid gap-4 sm\:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {selectedStaff.email}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {formatPhone(
                    selectedStaff.phone,
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {
                    roleLabels[
                      selectedStaff.role
                    ]
                  }
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </dt>
                <dd className="mt-1">
                  <AtlasStatusPill
                    tone={
                      selectedStaff.isActive
                        ? "success"
                        : "warning"
                    }
                  >
                    {selectedStaff.isActive
                      ? "Active"
                      : "Inactive / Pending"}
                  </AtlasStatusPill>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Added
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {formatDate(
                    selectedStaff.createdAt,
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Last Updated
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {formatDate(
                    selectedStaff.updatedAt,
                  )}
                </dd>
              </div>
            </dl>
          </AtlasCard>
        </div>
      )}

      {staffManagementError && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-md rounded-xl border border-red-200 bg-red-50 p-4 shadow-xl">
          <p className="text-sm font-semibold text-red-900">
            Unable to update staff account
          </p>

          <p className="mt-1 text-sm text-red-700">
            {staffManagementError}
          </p>
        </div>
      )}

      {inviteSuccess && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-md rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-xl">
          <p className="text-sm font-semibold text-emerald-900">
            Staff invitation sent
          </p>
          <p className="mt-1 text-sm text-emerald-700">
            {inviteSuccess}
          </p>
        </div>
      )}

      {passwordResetSuccess && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-md rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-xl">
          <p className="text-sm font-semibold text-emerald-900">
            Password reset sent
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            {passwordResetSuccess}
          </p>
        </div>
      )}

      {passwordResetStaff && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-reset-dialog-title"
        >
          <AtlasCard
            className="w-full max-w-lg"
            elevated
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Staff Account Security
            </p>

            <h2
              id="password-reset-dialog-title"
              className="mt-2 text-2xl font-bold text-slate-950"
            >
              Send Password Reset
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Send secure password reset instructions to:
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-950">
                {getStaffName(
                  passwordResetStaff,
                )}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {passwordResetStaff.email}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm leading-6 text-blue-900">
                The staff member will choose their own new password.
                Their account role and activation status will not be changed.
              </p>
            </div>

            {passwordResetError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-900">
                  Unable to send reset
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {passwordResetError}
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isSendingPasswordReset}
                onClick={() => {
                  setPasswordResetStaff(
                    null,
                  )
                  setPasswordResetError(
                    null,
                  )
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover\:bg-slate-50 disabled\:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSendingPasswordReset}
                onClick={() => {
                  void handleSendPasswordReset()
                }}
                className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover\:bg-blue-800 disabled\:opacity-50"
              >
                {isSendingPasswordReset
                  ? "Sending..."
                  : "Send Reset Email"}
              </button>
            </div>
          </AtlasCard>
        </div>
      )}

      <AddStaffDialog
        open={isAddStaffOpen}
        isSubmitting={isInvitingStaff}
        errorMessage={inviteError}
        onCancel={() => {
          if (!isInvitingStaff) {
            setIsAddStaffOpen(false)
            setInviteError(null)
          }
        }}
        onConfirm={(values) => {
          void handleInviteStaff(values)
        }}
      />

      <StaffRoleDialog
        open={
          staffForManagement !==
          null
        }
        staffMember={
          staffForManagement
        }
        currentUserId={
          profile?.id ?? null
        }
        isSubmitting={
          isManagingStaff
        }
        onCancel={() => {
          if (
            !isManagingStaff
          ) {
            setStaffForManagement(
              null,
            )
            setStaffManagementError(
              null,
            )
          }
        }}
        onConfirm={(
          role,
        ) => {
          void handleRoleUpdate(
            role,
          )
        }}
        onStatusChange={(
          isActive,
        ) => {
          void handleStatusUpdate(
            isActive,
          )
        }}
      />
    </section>
  )}