import {
  CheckCircle2,
  CircleAlert,
  ShieldQuestion,
} from "lucide-react"

import type {
  EvidenceFieldOption,
  OrganizerEvidenceSource,
} from "@/features/organizer-review/types/evidence.types"

interface EvidenceCoverageSummaryProps {
  evidence:
    OrganizerEvidenceSource[]
  fieldOptions:
    EvidenceFieldOption[]
}

const importantFieldKeys = [
  "first_name",
  "last_name",
  "birth_date",
  "relationship",
  "lived_with_taxpayer_all_year",
  "us_citizen_or_resident",
  "taxpayer_identifier_documentation",
  "supporting_documentation",
] as const

export function EvidenceCoverageSummary({
  evidence,
  fieldOptions,
}: EvidenceCoverageSummaryProps) {
  const linkedFields =
    new Set(
      evidence.flatMap(
        (source) =>
          source.links
            .map(
              (link) =>
                link.fieldKey,
            )
            .filter(
              (
                fieldKey,
              ): fieldKey is string =>
                Boolean(
                  fieldKey,
                ),
            ),
      ),
    )

  const verifiedFields =
    new Set(
      evidence
        .filter(
          (source) =>
            source.verificationStatus ===
            "verified",
        )
        .flatMap(
          (source) =>
            source.links
              .map(
                (link) =>
                  link.fieldKey,
              )
              .filter(
                (
                  fieldKey,
                ): fieldKey is string =>
                  Boolean(
                    fieldKey,
                  ),
              ),
        ),
    )

  const coverage =
    importantFieldKeys
      .filter(
        (fieldKey) =>
          fieldOptions.some(
            (option) =>
              option.key ===
              fieldKey,
          ),
      )
      .map(
        (fieldKey) => ({
          fieldKey,

          label:
            fieldOptions.find(
              (option) =>
                option.key ===
                fieldKey,
            )?.label ??
            fieldKey,

          isLinked:
            linkedFields.has(
              fieldKey,
            ),

          isVerified:
            verifiedFields.has(
              fieldKey,
            ),
        }),
      )

  const verifiedCount =
    coverage.filter(
      (item) =>
        item.isVerified,
    ).length

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <ShieldQuestion
          className="mt-0.5 h-5 w-5 text-blue-700"
          aria-hidden="true"
        />

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Evidence Workspace
          </p>

          <h4 className="mt-1 text-base font-semibold text-slate-950">
            Evidence Coverage
          </h4>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {verifiedCount} of {coverage.length} important dependent fields have verified supporting evidence.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {coverage.map(
          (item) => (
            <div
              key={
                item.fieldKey
              }
              className={[
                "rounded-xl border p-3",
                item.isVerified
                  ? "border-emerald-200 bg-emerald-50"
                  : item.isLinked
                    ? "border-amber-200 bg-amber-50"
                    : "border-slate-200 bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-start gap-2">
                {item.isVerified ? (
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                ) : (
                  <CircleAlert
                    className={[
                      "mt-0.5 h-4 w-4 shrink-0",
                      item.isLinked
                        ? "text-amber-700"
                        : "text-slate-500",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                )}

                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {item.isVerified
                      ? "Verified evidence linked"
                      : item.isLinked
                        ? "Evidence linked but not verified"
                        : "Supporting evidence not linked"}
                  </p>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  )
}
