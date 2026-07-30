import { Link } from "react-router-dom";

import { appConfig } from "@/config/app-config";

export function AccessDenied() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg rounded-2xl border bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-red-700">
          Access Denied
        </h1>

        <p className="mt-4 text-slate-600">
          You do not have permission to access this page.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Contact your administrator if you believe this is an error.
        </p>

        <Link
          to={appConfig.routes.dashboard}
          className="mt-8 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Return to Dashboard
        </Link>
      </div>
    </section>
  );
}