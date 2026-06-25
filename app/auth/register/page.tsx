import Link from "next/link";

export default async function CustomerRegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params?.next ?? "/account";

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-12 text-white">
      <section className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-[1fr_420px]">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Customer Registration
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Create your customer account.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-neutral-300">
            Customer accounts are separate from employee accounts and only
            unlock shopping, order history, pickup tracking, reviews, and
            favorites.
          </p>
        </div>

        <form
          action="/api/auth/customer/register"
          method="post"
          className="rounded-lg border border-white/10 bg-white p-6 text-neutral-950 shadow-2xl"
        >
          <input name="next" type="hidden" value={nextPath} />
          <h2 className="text-2xl font-semibold">Create Account</h2>
          <label className="mt-6 block text-sm font-medium" htmlFor="name">
            Name
          </label>
          <input
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-3 outline-none focus:border-emerald-600"
            id="name"
            name="name"
            autoComplete="name"
          />
          <label className="mt-4 block text-sm font-medium" htmlFor="email">
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
            autoComplete="new-password"
          />
          <button
            className="mt-6 w-full rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
            type="submit"
          >
            Create Customer Account
          </button>
          <p className="mt-5 text-sm text-neutral-600">
            Already have an account?{" "}
            <Link className="font-semibold text-emerald-700" href="/auth/login">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
