import {
  ShieldCheck,
  UserCheck,
  UserX,
  X,
} from "lucide-react"
import {
  useEffect,
  useState,
} from "react"

import type {
  AppRole,
} from "@/features/auth/types/auth.types"
import type {
  StaffDirectoryItem,
} from "@/features/staff/types/staff.types"

interface StaffRoleDialogProps {
  open: boolean
  staffMember: StaffDirectoryItem | null
  currentUserId: string | null
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: (
    role: AppRole,
  ) => void
  onStatusChange: (
    isActive: boolean,
  ) => void
}

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

export function StaffRoleDialog({
  open,
  staffMember,
  currentUserId,
  isSubmitting,
  onCancel,
  onConfirm,
  onStatusChange,
}: StaffRoleDialogProps) {
  const [
    selectedRole,
    setSelectedRole,
  ] = useState<AppRole>(
    "read_only",
  )

  const [
    confirmDeactivate,
    setConfirmDeactivate,
  ] = useState(false)

  useEffect(() => {
    if (staffMember) {
      setSelectedRole(
        staffMember.role,
      )
      setConfirmDeactivate(false)
    }
  }, [staffMember])

  if (
    !open ||
    !staffMember
  ) {
    return null
  }

  const isCurrentUser =
    staffMember.id ===
    currentUserId

  const wouldSelfDemote =
    isCurrentUser &&
    selectedRole !==
      "administrator"

  const roleChanged =
    selectedRole !==
    staffMember.role

  const statusLabel =
    staffMember.isActive
      ? "Active"
      : "Inactive / Pending"

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-role-dialog-title"
    >
      <div className="my-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div className="flex gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ShieldCheck
                className="size-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Staff Administration
              </p>

              <h2
                id="staff-role-dialog-title"
                className="mt-1 text-xl font-bold text-slate-950"
              >
                Manage Staff Account
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <X
              className="size-5"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <p className="font-semibold text-slate-950">
              {getStaffName(
                staffMember,
              )}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {staffMember.email}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Current Role
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {
                  roleLabels[
                    staffMember.role
                  ]
                }
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account Status
              </p>

              <div className="mt-1 flex items-center gap-2">
                {staffMember.isActive ? (
                  <UserCheck
                    className="size-4 text-emerald-700"
                    aria-hidden="true"
                  />
                ) : (
                  <UserX
                    className="size-4 text-amber-700"
                    aria-hidden="true"
                  />
                )}

                <p className="font-semibold text-slate-900">
                  {statusLabel}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="staff-role"
              className="text-sm font-semibold text-slate-700"
            >
              Application role
            </label>

            <select
              id="staff-role"
              value={selectedRole}
              disabled={isSubmitting}
              onChange={(event) => {
                setSelectedRole(
                  event.target
                    .value as AppRole,
                )
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
            >
              {roleOptions.map(
                (role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {roleLabels[role]}
                  </option>
                ),
              )}
            </select>

            {wouldSelfDemote && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-900">
                  Administrator protection
                </p>

                <p className="mt-1 text-sm leading-5 text-red-700">
                  You cannot remove your own
                  administrator role while signed
                  in with this account.
                </p>
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                disabled={
                  isSubmitting ||
                  !roleChanged ||
                  wouldSelfDemote
                }
                onClick={() => {
                  onConfirm(
                    selectedRole,
                  )
                }}
                className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting
                  ? "Updating..."
                  : "Update Role"}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <p className="text-sm font-semibold text-slate-900">
              Account access
            </p>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {staffMember.isActive
                ? "Deactivating this account removes application access until an administrator activates it again."
                : "Activating this account allows the staff member to access the application according to their assigned role."}
            </p>

            {isCurrentUser &&
            staffMember.isActive ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-900">
                  Self-deactivation blocked
                </p>

                <p className="mt-1 text-sm leading-5 text-red-700">
                  You cannot deactivate the
                  administrator account you are
                  currently signed in with.
                </p>
              </div>
            ) : staffMember.isActive ? (
              <>
                {!confirmDeactivate ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setConfirmDeactivate(
                        true,
                      )
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <UserX
                      className="size-4"
                      aria-hidden="true"
                    />
                    Deactivate Staff
                  </button>
                ) : (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-900">
                      Confirm deactivation
                    </p>

                    <p className="mt-1 text-sm leading-5 text-red-700">
                      This staff member will no
                      longer be able to access the
                      application. Their profile and
                      historical records will remain
                      intact.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setConfirmDeactivate(
                            false,
                          )
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Keep Active
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          onStatusChange(
                            false,
                          )
                        }}
                        className="rounded-lg bg-red-700 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50"
                      >
                        {isSubmitting
                          ? "Deactivating..."
                          : "Confirm Deactivation"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  onStatusChange(
                    true,
                  )
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
              >
                <UserCheck
                  className="size-4"
                  aria-hidden="true"
                />

                {isSubmitting
                  ? "Activating..."
                  : "Activate Staff"}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 p-5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
