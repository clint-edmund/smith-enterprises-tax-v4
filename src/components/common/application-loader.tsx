interface ApplicationLoaderProps {
  message?: string
}

export function ApplicationLoader({
  message = "Loading application...",
}: ApplicationLoaderProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
        aria-live="polite"
      >
        <div
          className="mx-auto size-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700"
          aria-hidden="true"
        />

        <p className="mt-5 font-medium text-slate-800">
          {message}
        </p>
      </section>
    </main>
  )
}