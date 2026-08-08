import {
  BadgeCheck,
  IdCard,
  ShieldCheck,
} from "lucide-react"

import {
  SecureTextField,
} from "@/features/security/vault/components/secure-text-field"

interface SecureIdentitySectionProps {
  organizerId: string
  disabled?: boolean
}

export function SecureIdentitySection({
  organizerId,
  disabled = false,
}: SecureIdentitySectionProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 shadow-sm">
            <ShieldCheck
              className="h-6 w-6 text-blue-700"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-blue-950">
              Secure Identity
            </h2>

            <p className="mt-2 text-sm leading-6 text-blue-900">
              Taxpayer identification and government-document numbers are
              encrypted through the Smith Enterprises Secure Vault. After a
              value is saved, only a masked version is displayed in the portal.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <BadgeCheck
            className="mt-0.5 h-5 w-5 text-emerald-700"
            aria-hidden="true"
          />

          <div>
            <h3 className="font-semibold text-slate-950">
              Taxpayer Identification
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Most U.S. taxpayers use a Social Security number. Enter an ITIN
              only when the IRS issued one instead of an SSN.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <SecureTextField
            organizerId={organizerId}
            label="Social Security Number"
            secretType="social_security_number"
            placeholder="123-45-6789"
            inputMode="numeric"
            autoComplete="off"
            maxLength={11}
            confirmValue
            disabled={disabled}
            helpText="Enter all nine digits. Dashes are optional. Only the final four digits will be displayed after saving."
          />

          <SecureTextField
            organizerId={organizerId}
            label="Individual Taxpayer Identification Number"
            secretType="itin"
            placeholder="9XX-XX-XXXX"
            inputMode="numeric"
            autoComplete="off"
            maxLength={11}
            confirmValue
            disabled={disabled}
            helpText="Complete this field only if the IRS issued you an ITIN instead of a Social Security number."
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <IdCard
            className="mt-0.5 h-5 w-5 text-blue-700"
            aria-hidden="true"
          />

          <div>
            <h3 className="font-semibold text-slate-950">
              Government Identification
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Government-issued identification may be required for identity
              verification, fraud prevention, and electronic-filing
              requirements. Complete only the document types that apply to you.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <SecureTextField
            organizerId={organizerId}
            label="Driver’s License Number"
            secretType="drivers_license"
            placeholder="Enter license number"
            inputMode="text"
            autoComplete="off"
            maxLength={32}
            disabled={disabled}
            helpText="Use the number exactly as shown on your current driver’s license."
          />

          <SecureTextField
            organizerId={organizerId}
            label="State Identification Number"
            secretType="state_identification"
            placeholder="Enter state ID number"
            inputMode="text"
            autoComplete="off"
            maxLength={32}
            disabled={disabled}
            helpText="Complete this field only if you use a state identification card instead of a driver’s license."
          />

          <SecureTextField
            organizerId={organizerId}
            label="Passport Number"
            secretType="passport"
            placeholder="Enter passport number"
            inputMode="text"
            autoComplete="off"
            maxLength={20}
            disabled={disabled}
            helpText="Complete this field only when a passport is part of your identity-verification documentation."
          />
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-950">
          Complete only the fields that apply
        </p>

        <p className="mt-2 text-sm leading-6 text-amber-900">
          A client normally uses either an SSN or an ITIN, and may use a
          driver’s license, state ID, or passport for government
          identification. You are not required to submit every field simply
          because it appears in this section.
        </p>
      </div>
    </section>
  )
}
