import { requireCustomer } from "../lib/auth/session";

export default async function ReviewsPage() {
  await requireCustomer();

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12 text-neutral-950">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
          Reviews
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Your product reviews</h1>
        <p className="mt-3 text-neutral-600">
          Customers can manage submitted reviews here. Employees moderate reviews
          separately from the employee portal.
        </p>
      </section>
    </main>
  );
}
