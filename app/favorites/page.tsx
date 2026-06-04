import { requireCustomer } from "../lib/auth/session";

export default async function FavoritesPage() {
  await requireCustomer();

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12 text-neutral-950">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
          Favorites
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Saved products</h1>
        <p className="mt-3 text-neutral-600">
          Customer favorites are isolated from employee inventory tools.
        </p>
      </section>
    </main>
  );
}
