import { ShieldCheck } from "lucide-react";

export default function EmployeeLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const nextPath = searchParams?.next ?? "/employee/dashboard";

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white">
      <section className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-[1fr_420px]">
        <div className="flex flex-col justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-500 text-zinc-950">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Employee Portal
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Staff tools are locked behind employee sign in.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
            This portal is separate from customer accounts. Customers cannot use
            this login to reach inventory, orders, pickup queues, Clover sync, or
            dashboard tools.
          </p>
        </div>

        <form
          action="/api/auth/employee/login"
          method="post"
          className="rounded-lg border border-white/10 bg-white p-6 text-zinc-950 shadow-2xl"
        >
          <input name="next" type="hidden" value={nextPath} />
          <h2 className="text-2xl font-semibold">Employee Login</h2>
          <label className="mt-6 block text-sm font-medium" htmlFor="email">
            Employee email
          </label>
          <input
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-3 outline-none focus:border-emerald-600"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <label className="mt-4 block text-sm font-medium" htmlFor="code">
            Employee sign-in code
          </label>
          <input
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-3 outline-none focus:border-emerald-600"
            id="code"
            name="code"
            type="password"
            autoComplete="one-time-code"
            required
          />
          <button className="mt-6 w-full rounded-md bg-zinc-950 px-4 py-3 font-semibold text-white hover:bg-zinc-800">
            Enter Employee Portal
          </button>
          <p className="mt-5 text-sm text-zinc-600">
            QR sign-in and passkeys will attach to this employee-only flow.
          </p>
        </form>
      </section>
    </main>
  );
}
