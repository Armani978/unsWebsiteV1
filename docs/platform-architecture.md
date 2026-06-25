# Up N Smoke Platform Architecture

## Experience Separation

The app has two separate experiences sharing one backend:

- Customer: public storefront plus `/auth/login` and `/auth/register`.
- Employee: locked portal at `/employee/login` and protected `/employee/*` routes.

Customer credentials do not open the employee portal. Employee credentials do not create customer accounts.

## Auth Boundary

- `customer` is the only customer role.
- `owner`, `manager`, `inventory`, and `employee` are employee roles.
- Middleware blocks `/employee/*` unless the session role is an employee role.
- Middleware blocks customer account routes unless the session role is exactly `customer`.
- Server helpers in `app/lib/auth/session.ts` provide `requireCustomer`, `requireEmployee`, and `requirePermission`.
- Employee sign-in uses provider-based employee access: Apple, Google, and
  passkeys. Employee emails must be allowlisted server-side before a provider
  callback can create a staff session. Phone number sign-in codes are retired.

## Inventory Boundary

Internal inventory is the platform source of truth. Clover, barcode scanning, manual updates, vendor feeds, and AI tools connect through adapters instead of directly owning storefront inventory.

## Clover Boundary

Clover sync is feature-flagged with `CLOVER_SYNC_ENABLED`. The app can build and test internal inventory, orders, and pickup flows before Clover approval.

## AI Boundary

AI features are exposed through `app/lib/ai`. AI can draft, search, summarize, and recommend. It cannot silently change inventory, orders, pricing, reviews, or Clover data.
