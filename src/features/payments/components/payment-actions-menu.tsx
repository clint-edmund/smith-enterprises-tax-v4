import {
  Ban,
  ChevronDown,
  ExternalLink,
  Pencil,
  Printer,
  ReceiptText,
  UserRound,
  WalletCards,
} from "lucide-react"
import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import {
  Link,
} from "react-router-dom"

import {
  getClientDetailsRoute,
  getReturnDetailsRoute,
} from "@/config/app-config"
import type {
  OfficePaymentRecord,
} from "@/features/payments/types/payment.types"

interface PaymentActionsMenuProps {
  payment: OfficePaymentRecord
  canRecordPayment: boolean
  canVoidPayment: boolean
  onViewReceipt: (
    payment: OfficePaymentRecord,
  ) => void
  onPrintReceipt: (
    payment: OfficePaymentRecord,
  ) => void
  onRecordPayment: (
    payment: OfficePaymentRecord,
  ) => void
  onEditPayment: (
    payment: OfficePaymentRecord,
  ) => void
  onVoidPayment: (
    payment: OfficePaymentRecord,
  ) => void
}

export function PaymentActionsMenu({
  payment,
  canRecordPayment,
  canVoidPayment,
  onViewReceipt,
  onPrintReceipt,
  onRecordPayment,
  onEditPayment,
  onVoidPayment,
}: PaymentActionsMenuProps) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false)

  const menuRef =
    useRef<HTMLDivElement | null>(null)

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
      if (event.key === "Escape") {
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
      onClick={(event) => {
        event.stopPropagation()
      }}
    >
      <button
        type="button"
        aria-label={`Payment actions for return ${payment.taxReturnId}`}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((current) => !current)
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        Actions

        <ChevronDown
          className={`size-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label="Payment actions"
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl"
        >
          <Link
            role="menuitem"
            to={getClientDetailsRoute(
              payment.clientId,
            )}
            onClick={() => {
              closeMenu()
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
          >
            <UserRound
              className="size-4 text-slate-400"
              aria-hidden="true"
            />

            Open Client
          </Link>

          <Link
            role="menuitem"
            to={getReturnDetailsRoute(
              payment.taxReturnId,
            )}
            onClick={() => {
              closeMenu()
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
          >
            <ExternalLink
              className="size-4 text-slate-400"
              aria-hidden="true"
            />

            Open Return
          </Link>

          <div
            className="my-2 border-t border-slate-200"
            aria-hidden="true"
          />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu()
              onViewReceipt(payment)
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
          >
            <ReceiptText
              className="size-4 text-slate-400"
              aria-hidden="true"
            />

            View Receipt
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu()
              onPrintReceipt(payment)
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
          >
            <Printer
              className="size-4 text-slate-400"
              aria-hidden="true"
            />

            Print Receipt
          </button>

          {canRecordPayment && (
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
                  onRecordPayment(payment)
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
              >
                <WalletCards
                  className="size-4 text-slate-400"
                  aria-hidden="true"
                />

                Record Payment
              </button>
            </>
          )}

          {!payment.isVoided && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                closeMenu()
                onEditPayment(payment)
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
            >
              <Pencil
                className="size-4 text-slate-400"
                aria-hidden="true"
              />

              Edit Payment
            </button>
          )}

          {canVoidPayment &&
            !payment.isVoided && (
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
                    onVoidPayment(payment)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600"
                >
                  <Ban
                    className="size-4"
                    aria-hidden="true"
                  />

                  Void Payment
                </button>
              </>
            )}
        </div>
      )}
    </div>
  )
}
