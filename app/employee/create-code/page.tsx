import { KeyRound } from "lucide-react";

export default function EmployeeCreateCodePage({
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
            <KeyRound className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">
            First-Time Employee Setup
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Create your personal staff sign-in code.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
            Your setup code is only used to claim your phone number. After this,
            you will sign in with your phone number and the personal code you
            create here.
          </p>
        </div>

        <form
          action="/api/auth/employee/create-code"
          method="post"
          className="rounded-lg border border-white/10 bg-white p-6 text-zinc-950 shadow-2xl"
        >
          <input name="next" type="hidden" value={nextPath} />
          <h2 className="text-2xl font-semibold">New Sign-In Code</h2>
          <label className="mt-6 block text-sm font-medium" htmlFor="code">
            New code
          </label>
          <input
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-3 text-lg tracking-[0.35em] outline-none focus:border-emerald-600"
            id="code"
            name="code"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            minLength={4}
            maxLength={8}
            required
          />
          <label className="mt-4 block text-sm font-medium" htmlFor="confirmCode">
            Confirm code
          </label>
          <input
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-3 text-lg tracking-[0.35em] outline-none focus:border-emerald-600"
            id="confirmCode"
            name="confirmCode"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            minLength={4}
            maxLength={8}
            required
          />
          <button className="mt-6 w-full rounded-md bg-zinc-950 px-4 py-3 font-semibold text-white hover:bg-zinc-800">
            Save Code & Enter Portal
          </button>
          <p className="mt-5 text-sm text-zinc-600">
            Use 4 to 8 numbers. Keep it private; managers can reset access later.
          </p>
        </form>
      </section>
    </main>
  );
}
