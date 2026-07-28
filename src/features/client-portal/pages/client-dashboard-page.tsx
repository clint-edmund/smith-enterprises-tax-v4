export function ClientDashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome Back
        </h1>

        <p className="text-slate-600">
          Here's the current status of your tax return.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          2026 Tax Return
        </h2>

        <p className="mt-2 text-slate-600">
          Status
        </p>

        <p className="text-lg font-semibold text-orange-600">
          Information Needed
        </p>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span>Progress</span>
            <span>56%</span>
          </div>

          <div className="h-3 rounded-full bg-slate-200">
            <div className="h-3 w-[56%] rounded-full bg-blue-600" />
          </div>
        </div>

        <button className="mt-8 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
          Continue Questionnaire
        </button>
      </div>
    </section>
  )
}