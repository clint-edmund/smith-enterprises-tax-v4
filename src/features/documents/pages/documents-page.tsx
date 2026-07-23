import {
  Archive,
  FileText,
  FolderLock,
  Search,
  Star,
  TriangleAlert,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";

import { DocumentWorkspace } from "@/features/documents/components/document-workspace";

import { searchClients } from "@/features/clients/services/client-service";

import type { ClientListItem } from "@/features/clients/types/client.types";

import { DocumentStatCard } from "@/features/documents/components/document-stat-card";

import { getDocumentMetrics } from "@/features/documents/services/document-metrics-service";

import { DocumentActivityTimeline } from "@/features/documents/components/document-activity-timeline";

import { useDocumentActivity } from "@/features/documents/hooks/use-document-activity";

export function DocumentsPage() {
  const [searchText, setSearchText] = useState("");

  const [clients, setClients] = useState<ClientListItem[]>([]);

  const [selectedClient, setSelectedClient] = useState<ClientListItem | null>(
    null,
  );

  const [isSearching, setIsSearching] = useState(false);

  const [searchError, setSearchError] = useState<string | null>(null);

  const [documentStats, setDocumentStats] = useState({
    total: 0,
    active: 0,
    archived: 0,
    favorites: 0,
    missingRequired: 0,
  });

  const {
    activities,
    isLoading: isActivityLoading,
    isRefreshing: isActivityRefreshing,
    errorMessage: activityErrorMessage,
    refresh: refreshActivity,
  } = useDocumentActivity(selectedClient?.id ?? null, 12);

  useEffect(() => {
    let isCurrentSearch = true;

    const normalizedSearch = searchText.trim();

    if (normalizedSearch.length < 2) {
      setClients([]);
      setSearchError(null);
      setIsSearching(false);

      return () => {
        isCurrentSearch = false;
      };
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      setClients([]);

      try {
        const results = await searchClients(normalizedSearch, "all");

        if (isCurrentSearch) {
          setClients(results);
        }
      } catch (error) {
        console.error("Unable to search clients:", error);

        if (isCurrentSearch) {
          setClients([]);
          setSearchError("We could not search for clients. Please try again.");
        }
      } finally {
        if (isCurrentSearch) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      isCurrentSearch = false;
      window.clearTimeout(timeoutId);
    };
  }, [searchText]);

  useEffect(() => {
    if (!selectedClient) {
      setDocumentStats({
        total: 0,
        active: 0,
        archived: 0,
        favorites: 0,
        missingRequired: 0,
      });

      return;
    }

    const clientId = selectedClient.id;
    let cancelled = false;

    async function loadMetrics() {
      try {
        const metrics = await getDocumentMetrics(clientId);

        if (!cancelled) {
          setDocumentStats(metrics);
        }
      } catch (error) {
        console.error("Unable to load document metrics", error);
      }
    }

    void loadMetrics();

    return () => {
      cancelled = true;
    };
  }, [selectedClient]);

  function handleClientSelected(client: ClientListItem) {
    setSelectedClient(client);
    setSearchText("");
    setClients([]);
    setSearchError(null);
  }

  function formatClientName(client: ClientListItem) {
    return [client.firstName, client.middleName, client.lastName]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
            <FolderLock className="size-8" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-950">
              Enterprise Document Center
            </h1>

            <p className="mt-2 text-slate-600">
              Search for a client and manage their secure documents from one
              central workspace.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
            <Search className="size-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">Find a Client</h2>

            <p className="mt-1 text-sm text-slate-600">
              Search by client name, preferred name, client number, email, or
              phone number.
            </p>
          </div>
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
            }}
            placeholder="Search clients..."
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {searchText.trim().length === 1 ? (
          <p className="mt-3 text-sm text-slate-500">
            Enter at least two characters to search.
          </p>
        ) : null}

        {searchError ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="font-semibold text-red-900">
              Client search unavailable
            </p>

            <p className="mt-1 text-sm text-red-700">{searchError}</p>
          </div>
        ) : null}

        {isSearching ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-600">
            Searching clients...
          </div>
        ) : null}

        {!isSearching &&
        !searchError &&
        searchText.trim().length >= 2 &&
        clients.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-5 text-center">
            <p className="font-semibold text-slate-800">
              No matching clients found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try a different name, client number, email address, or phone
              number.
            </p>
          </div>
        ) : null}

        {!isSearching && clients.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-700">
                Matching Clients
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {clients.map((client) => {
                const clientName = formatClientName(client);

                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      handleClientSelected(client);
                    }}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-blue-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-full bg-blue-100 p-2.5 text-blue-700">
                        <User className="size-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950">
                          {clientName}
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          Client #{client.clientNumber}
                          {client.email ? ` • ${client.email}` : ""}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                      {client.status.replaceAll("_", " ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      {selectedClient ? (
        <section className="space-y-5">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Selected Client
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {formatClientName(selectedClient)}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Client #{selectedClient.clientNumber}
                  {selectedClient.email ? ` • ${selectedClient.email}` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedClient(null);
                }}
                className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
              >
                Change Client
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DocumentStatCard
              label="Documents"
              value={documentStats.total}
              icon={<FileText className="size-6" />}
            />

            <DocumentStatCard
              label="Favorites"
              value={documentStats.favorites}
              icon={<Star className="size-6" />}
            />

            <DocumentStatCard
              label="Archived"
              value={documentStats.archived}
              icon={<Archive className="size-6" />}
            />

            <DocumentStatCard
              label="Missing Required"
              value={documentStats.missingRequired}
              icon={<TriangleAlert className="size-6" />}
            />
          </div>

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0">
              <DocumentWorkspace
                clientId={selectedClient.id}
                title={`${formatClientName(selectedClient)} Documents`}
              />
            </div>

            <div className="xl:sticky xl:top-6">
              <DocumentActivityTimeline
                activities={activities}
                isLoading={isActivityLoading}
                isRefreshing={isActivityRefreshing}
                errorMessage={activityErrorMessage}
                onRefresh={() => {
                  void refreshActivity();
                }}
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <FolderLock className="size-7" />
          </div>

          <h2 className="mt-4 text-xl font-semibold text-slate-950">
            Select a client to begin
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Search for a client above to upload, preview, organize, download,
            favorite, and archive their secure documents.
          </p>
        </section>
      )}
    </section>
  );
}
