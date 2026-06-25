import { Fingerprint, KeyRound, ShieldCheck, Wrench } from "lucide-react";
import { isEmployeeDevLoginEnabled } from "../../lib/auth/employee-oauth";

export default function EmployeeLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const nextPath = searchParams?.next ?? "/employee/dashboard";
  const encodedNext = encodeURIComponent(nextPath);
  const showDevLogin = isEmployeeDevLoginEnabled();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white">
      <section className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-[1fr_420px]">
        <div className="flex flex-col justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-300 text-zinc-950">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.28em] text-yellow-300">
            Employee Portal
          </p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">
            Staff tools stay behind real employee sign in.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
            Employee access is separate from customer accounts. Use Apple,
            Google, or a registered passkey to reach inventory, Clover sync,
            pickup tools, and dashboard workflows.
          </p>
        </div>

        <section className="rounded-lg border border-white/10 bg-white p-6 text-zinc-950 shadow-2xl">
          <h2 className="text-2xl font-black uppercase">Employee Login</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Phone numbers and sign-in codes are retired.
          </p>

          <div className="mt-6 grid gap-3">
            <a
              className="flex min-h-12 items-center justify-center gap-3 rounded-md border border-zinc-300 bg-zinc-950 px-4 py-3 text-sm font-black uppercase text-white transition hover:bg-zinc-800"
              href={`/api/auth/employee/apple?next=${encodedNext}`}
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Continue with Apple
            </a>
            <a
              className="flex min-h-12 items-center justify-center gap-3 rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-black uppercase text-zinc-950 transition hover:bg-zinc-100"
              href={`/api/auth/employee/google?next=${encodedNext}`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 text-xs font-black">
                G
              </span>
              Continue with Google
            </a>
            <form action="/api/auth/employee/passkey" method="post">
              <button
                className="flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-zinc-300 bg-yellow-300 px-4 py-3 text-sm font-black uppercase text-black transition hover:bg-yellow-200"
                type="submit"
              >
                <Fingerprint className="h-4 w-4" aria-hidden="true" />
                Continue with Passkey
              </button>
            </form>
            {showDevLogin && (
              <form action="/api/auth/employee/dev" method="post">
                <input name="next" type="hidden" value={nextPath} />
                <button
                  className="flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-dashed border-zinc-400 bg-zinc-100 px-4 py-3 text-sm font-black uppercase text-zinc-950 transition hover:bg-zinc-200"
                  type="submit"
                >
                  <Wrench className="h-4 w-4" aria-hidden="true" />
                  Dev Login
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 rounded-lg border border-yellow-300/50 bg-yellow-50 p-3 text-sm text-zinc-700">
            Employee emails must be allowlisted before provider login can create
            a staff session. Dev login is local-only for setup and testing.
          </div>
        </section>
      </section>
    </main>
  );
}
