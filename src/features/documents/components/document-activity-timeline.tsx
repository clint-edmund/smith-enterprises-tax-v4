import {
  Activity,
  Archive,
  Download,
  Eye,
  FilePenLine,
  FileText,
  RefreshCw,
  Upload,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import type { DocumentActivity } from "@/features/documents/types/document-activity.types";

interface DocumentActivityTimelineProps {
  activities: DocumentActivity[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  errorMessage?: string | null;
  onRefresh?: () => void;
}

export function DocumentActivityTimeline({
  activities,
  isLoading = false,
  isRefreshing = false,
  errorMessage = null,
  onRefresh,
}: DocumentActivityTimelineProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Activity aria-hidden="true" className="size-5" />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">Document Activity</h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent document events for this client.
            </p>
          </div>
        </div>

        {onRefresh ? (
          <button
            type="button"
            disabled={isLoading || isRefreshing}
            onClick={onRefresh}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Refresh document activity"
            title="Refresh activity"
          >
            <RefreshCw
              aria-hidden="true"
              className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        ) : null}
      </div>

      <div className="px-5">
        {isLoading ? <DocumentActivityLoading /> : null}

        {!isLoading && errorMessage ? (
          <div
            role="alert"
            className="my-5 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-semibold text-red-900">
              Activity unavailable
            </p>

            <p className="mt-1 text-sm leading-6 text-red-700">
              {errorMessage}
            </p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && activities.length === 0 ? (
          <DocumentActivityEmptyState />
        ) : null}

        {!isLoading && activities.length > 0 ? (
          <ol className="divide-y divide-slate-200">
            {activities.map((activity) => (
              <DocumentActivityRow key={activity.id} activity={activity} />
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}

interface DocumentActivityRowProps {
  activity: DocumentActivity;
}

function DocumentActivityRow({ activity }: DocumentActivityRowProps) {
  const iconDetails = getActivityIconDetails(activity.action);

  const Icon = iconDetails.icon;

  return (
    <li className="relative py-5">
      <div className="flex gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${iconDetails.className}`}
        >
          <Icon aria-hidden="true" className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="text-sm leading-6 text-slate-700">
            <span className="font-semibold text-slate-950">
              {activity.actorName}
            </span>{" "}
            {formatActivityAction(activity.action)}
          </p>

          <p className="mt-1 break-words text-sm font-medium text-slate-800">
            {activity.documentName}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {formatActivityDate(activity.occurredAt)}
          </p>
        </div>
      </div>
    </li>
  );
}

function DocumentActivityLoading() {
  return (
    <div className="space-y-5 py-5">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div key={index} className="flex animate-pulse gap-3">
          <div className="size-9 shrink-0 rounded-full bg-slate-200" />

          <div className="flex-1 space-y-2">
            <div className="h-3 w-4/5 rounded bg-slate-200" />
            <div className="h-3 w-3/5 rounded bg-slate-100" />
            <div className="h-2.5 w-2/5 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentActivityEmptyState() {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <FileText aria-hidden="true" className="size-6" />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-800">
        No document activity yet
      </p>

      <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-slate-500">
        Uploading, updating, downloading, or archiving documents will create
        activity here.
      </p>
    </div>
  );
}

interface ActivityIconDetails {
  icon: LucideIcon;
  className: string;
}

function getActivityIconDetails(action: string): ActivityIconDetails {
  switch (action) {
    case "document_uploaded":
      return {
        icon: Upload,
        className: "bg-emerald-50 text-emerald-700",
      };

    case "document_archived":
      return {
        icon: Archive,
        className: "bg-amber-50 text-amber-700",
      };

    case "document_downloaded":
      return {
        icon: Download,
        className: "bg-blue-50 text-blue-700",
      };

    case "document_viewed":
      return {
        icon: Eye,
        className: "bg-violet-50 text-violet-700",
      };

    case "document_updated":
    case "document_status_changed":
    case "document_category_changed":
      return {
        icon: FilePenLine,
        className: "bg-sky-50 text-sky-700",
      };

    default:
      return {
        icon: FileText,
        className: "bg-slate-100 text-slate-600",
      };
  }
}

function formatActivityAction(action: string): string {
  const actionDescriptions: Record<string, string> = {
    document_uploaded: "uploaded a document",
    document_archived: "archived a document",
    document_downloaded: "downloaded a document",
    document_viewed: "viewed a document",
    document_updated: "updated a document",
    document_status_changed: "changed the document status",
    document_category_changed: "changed the document category",
  };

  return (
    actionDescriptions[action] ??
    action.replace(/^document_/, "").replaceAll("_", " ")
  );
}

function formatActivityDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
