import type {
  ReturnFilters,
  TaxReturnListItem,
} from "@/features/returns/types/return.types"
import {
  formatReturnCurrency,
} from "@/features/returns/utils/return-formatters"

function escapeCsvValue(value: unknown) {
  const text = value === null || value === undefined
    ? ""
    : String(value)

  if (/[,"\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

function formatDate(value: string | null) {
  if (!value) {
    return ""
  }

  const parsedDate = new Date(`${value}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(parsedDate)
}

function humanizeValue(value: string) {
  return value
    .split("_")
    .map((part) =>
      part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ")
}

export function getReturnReportFilterSummary(
  filters: ReturnFilters,
) {
  const summary: string[] = []

  if (filters.search) {
    summary.push(`Search: ${filters.search}`)
  }

  if (filters.status !== "all") {
    summary.push(`Status: ${humanizeValue(filters.status)}`)
  }

  if (filters.taxYear !== "all") {
    summary.push(`Tax Year: ${filters.taxYear}`)
  }

  if (filters.preparerId !== "all") {
    summary.push("Specific preparer selected")
  }

  if (filters.assignment !== "all") {
    summary.push(`Assignment: ${humanizeValue(filters.assignment)}`)
  }

  if (filters.reviewer !== "all") {
    summary.push(`Reviewer: ${humanizeValue(filters.reviewer)}`)
  }

  if (filters.deadline !== "all") {
    summary.push(`Deadline: ${humanizeValue(filters.deadline)}`)
  }

  return summary
}

export function buildReturnReportCsv(
  taxReturns: TaxReturnListItem[],
) {
  const headers = [
    "Client Number",
    "Client Name",
    "Tax Year",
    "Return Type",
    "Tax Form",
    "Filing Status",
    "Workflow Status",
    "Preparer",
    "Reviewer",
    "Date Received",
    "Due Date",
    "Filed Date",
    "Accepted Date",
    "Preparation Fee",
    "Discount",
    "Net Fee",
  ]

  const rows = taxReturns.map((taxReturn) => [
    taxReturn.clientNumber,
    `${taxReturn.clientLastName}, ${taxReturn.clientFirstName}`,
    taxReturn.taxYear,
    humanizeValue(taxReturn.returnType),
    humanizeValue(taxReturn.taxForm),
    humanizeValue(taxReturn.filingStatus),
    humanizeValue(taxReturn.status),
    taxReturn.assignedPreparerName ?? "Unassigned",
    taxReturn.assignedReviewerName ?? "Unassigned",
    formatDate(taxReturn.dateReceived),
    formatDate(taxReturn.dueDate),
    formatDate(taxReturn.filedDate),
    formatDate(taxReturn.acceptedDate),
    taxReturn.preparationFee.toFixed(2),
    taxReturn.discountAmount.toFixed(2),
    taxReturn.netFee.toFixed(2),
  ])

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n")
}

export function downloadReturnReportCsv(
  taxReturns: TaxReturnListItem[],
) {
  const csv = buildReturnReportCsv(taxReturns)
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  const dateStamp = new Date().toISOString().slice(0, 10)

  link.href = url
  link.download = `smith-enterprises-return-report-${dateStamp}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function openPrintableReturnReport(
  taxReturns: TaxReturnListItem[],
  filters: ReturnFilters,
) {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer")

  if (!reportWindow) {
    throw new Error(
      "The printable report could not be opened. Allow pop-ups for this site and try again.",
    )
  }

  const totalNetFees = taxReturns.reduce(
    (total, taxReturn) => total + taxReturn.netFee,
    0,
  )
  const filterSummary = getReturnReportFilterSummary(filters)
  const generatedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date())

  const rows = taxReturns.map((taxReturn) => `
    <tr>
      <td>${escapeHtml(taxReturn.clientNumber)}</td>
      <td>${escapeHtml(`${taxReturn.clientLastName}, ${taxReturn.clientFirstName}`)}</td>
      <td>${escapeHtml(taxReturn.taxYear)}</td>
      <td>${escapeHtml(humanizeValue(taxReturn.status))}</td>
      <td>${escapeHtml(taxReturn.assignedPreparerName ?? "Unassigned")}</td>
      <td>${escapeHtml(formatDate(taxReturn.dueDate) || "—")}</td>
      <td class="money">${escapeHtml(formatReturnCurrency(taxReturn.netFee))}</td>
    </tr>
  `).join("")

  reportWindow.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tax Return Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
    h1 { margin: 0; font-size: 24px; }
    .subtitle { margin-top: 6px; color: #475569; }
    .summary { display: flex; gap: 24px; margin: 24px 0; }
    .metric { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; }
    .metric-label { color: #64748b; font-size: 12px; text-transform: uppercase; }
    .metric-value { font-size: 22px; font-weight: 700; margin-top: 4px; }
    .filters { margin: 16px 0 24px; font-size: 13px; color: #334155; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border-bottom: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    th { background: #f1f5f9; }
    .money { text-align: right; white-space: nowrap; }
    .footer { margin-top: 24px; color: #64748b; font-size: 11px; }
    @media print {
      body { margin: 0.35in; }
      .no-print { display: none; }
      thead { display: table-header-group; }
      tr { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <button class="no-print" onclick="window.print()">Print Report</button>
  <h1>Smith Enterprises Tax Return Report</h1>
  <p class="subtitle">Generated ${escapeHtml(generatedAt)}</p>
  <div class="summary">
    <div class="metric">
      <div class="metric-label">Results</div>
      <div class="metric-value">${taxReturns.length}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Net Fees</div>
      <div class="metric-value">${escapeHtml(formatReturnCurrency(totalNetFees))}</div>
    </div>
  </div>
  <div class="filters">
    <strong>Filters:</strong>
    ${filterSummary.length > 0
      ? escapeHtml(filterSummary.join(" • "))
      : "No filters applied"}
  </div>
  <table>
    <thead>
      <tr>
        <th>Client #</th>
        <th>Client</th>
        <th>Tax Year</th>
        <th>Status</th>
        <th>Preparer</th>
        <th>Due Date</th>
        <th class="money">Net Fee</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="footer">Confidential business report. Handle according to Smith Enterprises security procedures.</p>
</body>
</html>`)
  reportWindow.document.close()
}
