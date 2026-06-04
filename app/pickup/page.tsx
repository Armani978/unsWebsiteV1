import { requireCustomer } from "../lib/auth/session";

const statuses = ["pending", "accepted", "preparing", "ready", "arrived", "completed"];

export default async function PickupPage() {
  await requireCustomer();

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12 text-neutral-950">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
          Curbside Pickup
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Track your pickup.</h1>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {statuses.map((status) => (
            <div key={status} className="rounded-md border bg-white p-4 shadow-sm">
              <p className="font-medium capitalize">{status}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
