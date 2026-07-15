function App() {
  return (
    <main className="min-h-screen bg-slate-100">
      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Development Environment Ready
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Smith Enterprises
          </h1>

          <h2 className="mt-3 text-2xl font-semibold text-slate-700">
            Tax Management System v4
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            The React, TypeScript, Vite, and Tailwind CSS foundation has been
            configured successfully.
          </p>

          <div className="mt-10">
            <button
              type="button"
              className="rounded-md bg-blue-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-600"
            >
              Environment Ready
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App