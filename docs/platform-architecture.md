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
- Employee sign-in uses a phone number plus a sign-in code. First-time employees
  claim their phone number with an issued setup code, then immediately create a
  personal code for future sign-ins.

## Inventory Boundary

Internal inventory is the platform source of truth. Clover, barcode scanning, manual updates, vendor feeds, and AI tools connect through adapters instead of directly owning storefront inventory.

## Clover Boundary

Clover sync is feature-flagged with `CLOVER_SYNC_ENABLED`. The app can build and test internal inventory, orders, and pickup flows before Clover approval.

## AI Boundary

AI features are exposed through `app/lib/ai`. AI can draft, search, summarize, and recommend. It cannot silently change inventory, orders, pricing, reviews, or Clover data.
