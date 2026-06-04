import Link from "next/link";

export default function CustomerLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const nextPath = searchParams?.next ?? "/account";

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-12 text-white">
      <section className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-[1fr_420px]">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Customer Account
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Sign in to shop, save favorites, and track pickup orders.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-neutral-300">
            This login is only for Up N Smoke customer accounts. Employee tools
            are separate and stay locked behind the employee portal.
          </p>
        </div>

        <form
          action="/api/auth/customer/login"
          method="post"
          className="rounded-lg border border-white/10 bg-white p-6 text-neutral-950 shadow-2xl"
        >
          <input name="next" type="hidden" value={nextPath} />
          <h2 className="text-2xl font-semibold">Customer Login</h2>
          <label className="mt-6 block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-3 outline-none focus:border-emerald-600"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <label className="mt-4 block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-3 outline-none focus:border-emerald-600"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
          <button className="mt-6 w-full rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">
            Sign In
          </button>
          <p className="mt-5 text-sm text-neutral-600">
            New customer?{" "}
            <Link className="font-semibold text-emerald-700" href="/auth/register">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
