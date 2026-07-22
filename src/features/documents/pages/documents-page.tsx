import { FolderLock, Search, User } from "lucide-react";

import { useEffect, useState } from "react";

import { DocumentWorkspace } from "@/features/documents/components/document-workspace";

import { searchClients } from "@/features/clients/services/client-service";

import type { ClientListItem } from "@/features/clients/types/client.types";

export function DocumentsPage() {
  const [searchText, setSearchText] = useState("");

  const [clients, setClients] = useState<ClientListItem[]>([]);

  const [selectedClient, setSelectedClient] = useState<ClientListItem | null>(
    null,
  );

  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      if (searchText.trim().length < 2) {
        setClients([]);
        return;
      }

      setIsSearching(true);

      try {
        const results = await searchClients(searchText, "all");

        setClients(results);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchText]);
  function handleClientSelected(client: ClientListItem) {
    setSelectedClient(client);
    setSearchText("");
    setClients([]);
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

        {isSearching ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-600">
            Searching clients...
          </div>
        ) : null}

        {!isSearching &&
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

          <DocumentWorkspace
            clientId={selectedClient.id}
            title={`${formatClientName(selectedClient)} Documents`}
          />
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
