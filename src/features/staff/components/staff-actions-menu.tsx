import {
  ChevronDown,
  Eye,
  KeyRound,
  Settings2,
} from "lucide-react"
import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react"

import type {
  StaffDirectoryItem,
} from "@/features/staff/types/staff.types"

interface StaffActionsMenuProps {
  staffMember: StaffDirectoryItem
  canManageStaff: boolean
  onViewDetails: (
    staffMember: StaffDirectoryItem,
  ) => void
  onManageStaff: (
    staffMember: StaffDirectoryItem,
  ) => void
  onSendPasswordReset: (
    staffMember: StaffDirectoryItem,
  ) => void
}

export function StaffActionsMenu({
  staffMember,
  canManageStaff,
  onViewDetails,
  onManageStaff,
  onSendPasswordReset,
}: StaffActionsMenuProps) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false)

  const menuRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  const menuId =
    useId()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(
      event: MouseEvent,
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    )

    document.addEventListener(
      "keydown",
      handleKeyDown,
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      )

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      )
    }
  }, [isOpen])

  function closeMenu() {
    setIsOpen(false)
  }

  return (
    <div
      ref={menuRef}
      className="relative inline-block text-left"
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(
            (current) =>
              !current,
          )
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        Actions

        <ChevronDown
          className={[
            "size-4 transition-transform",
            isOpen
              ? "rotate-180"
              : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label={`Staff actions for ${staffMember.email}`}
          className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu()

              onViewDetails(
                staffMember,
              )
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
          >
            <Eye
              className="size-4 text-slate-400"
              aria-hidden="true"
            />

            View Details
          </button>

          {canManageStaff && (
            <>
              <div
                className="my-2 border-t border-slate-200"
                aria-hidden="true"
              />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  closeMenu()

                  onManageStaff(
                    staffMember,
                  )
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
              >
                <Settings2
                  className="size-4 text-slate-400"
                  aria-hidden="true"
                />

                Manage Staff
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  closeMenu()

                  onSendPasswordReset(
                    staffMember,
                  )
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
              >
                <KeyRound
                  className="size-4 text-slate-400"
                  aria-hidden="true"
                />

                Send Password Reset
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}