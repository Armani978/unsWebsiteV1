import Link from "next/link";

const sections = [
  {
    title: "Information We Process",
    body: [
      "UNSV processes Clover merchant identifiers, encrypted Clover authorization tokens, and inventory information such as product names, UPC or SKU values, prices, categories, variants, and quantities.",
      "The current inventory scanner does not process payments, payment card information, customer records, or employee records. Product photos selected in the scanner remain on the employee's device unless a future upload feature is enabled.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use merchant and inventory information only to connect the authorized Clover merchant account, read inventory, prepare inventory updates, and provide inventory-management features requested by the merchant.",
      "We do not sell personal information. We do not use merchant data for advertising or unrelated commercial purposes.",
    ],
  },
  {
    title: "Storage and Security",
    body: [
      "Clover access and refresh tokens are encrypted before storage. The application keeps inventory writes disabled until the merchant connection is verified and live updates are deliberately enabled.",
      "We retain stored connection information only as long as needed to provide the application or comply with legal obligations. A merchant may request disconnection or deletion of stored connection information.",
    ],
  },
  {
    title: "Sharing",
    body: [
      "Information is shared only with the authorized merchant, Clover as the connected platform, and service providers required to host and operate the application, such as database and deployment providers.",
      "We may disclose information when required by law or when reasonably necessary to protect the application, the merchant, or others from fraud, abuse, or security threats.",
    ],
  },
  {
    title: "Merchant Responsibilities and Requests",
    body: [
      "Merchants control the inventory data made available through their Clover account and are responsible for their own privacy notices and legal obligations.",
      "Requests to access, correct, disconnect, or delete information associated with this application should be sent to the Up N Smoke administrator who provided access to the application.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-24 text-foreground sm:px-8">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          Up N Smoke
        </Link>
        <h1 className="mt-5 text-3xl font-semibold">UNSV Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective date: June 2, 2026
        </p>
        <p className="mt-8 leading-7 text-muted-foreground">
          This Privacy Policy explains how UNSV processes information on behalf
          of the merchant using the application. UNSV is an internal
          inventory-management application connected to Clover.
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

        <section className="mt-10 border-t border-border pt-6">
          <h2 className="text-xl font-semibold">Updates</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            We may update this policy as the application changes. The effective
            date above will be revised when material changes are published.
          </p>
        </section>

        <p className="mt-10 text-sm text-muted-foreground">
          Related document:{" "}
          <Link href="/legal/eula" className="text-primary hover:underline">
            End User License Agreement
          </Link>
        </p>
      </article>
    </main>
  );
}
