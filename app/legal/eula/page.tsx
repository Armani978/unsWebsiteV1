import Link from "next/link";

const sections = [
  {
    title: "1. The Application",
    body: [
      "UNSV provides mobile-friendly barcode scanning and inventory-management tools for authorized Up N Smoke personnel. Features may include reading Clover inventory, preparing product records, tracking quantities, organizing variants, and submitting inventory updates when live writes are enabled.",
      "The merchant receives a limited, non-exclusive, non-transferable, revocable license to use the application for its internal business operations. The merchant may not resell, sublicense, reverse engineer, or misuse the application.",
    ],
  },
  {
    title: "2. Authorized Use",
    body: [
      "The merchant is responsible for ensuring that only authorized personnel access the application and for maintaining the accuracy of inventory changes submitted through the application.",
      "The application must not be used for unlawful activity, unauthorized access, or any purpose that interferes with Clover, the merchant, or other systems.",
    ],
  },
  {
    title: "3. Clover Connection and Data",
    body: [
      "The merchant authorizes the application to access Clover data only within the permissions approved during installation. Clover authorization tokens are encrypted before storage.",
      "The merchant may request disconnection of the Clover account. Information processing is further described in the UNSV Inventory Privacy Policy.",
    ],
  },
  {
    title: "4. Availability and Changes",
    body: [
      "The application is provided on an as-is and as-available basis. Features may change as development continues, and maintenance or third-party service availability may occasionally interrupt access.",
      "To the extent permitted by law, no warranties are made regarding uninterrupted operation, accuracy, fitness for a particular purpose, or non-infringement.",
    ],
  },
  {
    title: "5. Limitation of Liability",
    body: [
      "To the extent permitted by law, the application provider will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, lost revenue, or lost business opportunities arising from use of the application.",
      "The merchant remains responsible for reviewing inventory changes and maintaining appropriate business records and backups.",
    ],
  },
  {
    title: "6. Termination",
    body: [
      "Access may be suspended or terminated if the merchant or its personnel misuse the application, violate these terms, or create a security risk. The merchant may stop using the application and request disconnection at any time.",
    ],
  },
  {
    title: "7. Updates to These Terms",
    body: [
      "These terms may be updated as the application changes. Continued use of the application after an update means the merchant accepts the revised terms.",
    ],
  },
];

export default function EulaPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-24 text-foreground sm:px-8">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          Up N Smoke
        </Link>
        <h1 className="mt-5 text-3xl font-semibold">
          UNSV End User License Agreement
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: June 2, 2026
        </p>
        <p className="mt-8 leading-7 text-muted-foreground">
          This End User License Agreement governs the merchant&apos;s use of
          UNSV. By installing, connecting, or using the application, the
          merchant agrees to these terms.
        </p>

        <div className="mt-10 space-y-9">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          Related document:{" "}
          <Link href="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </article>
    </main>
  );
}
