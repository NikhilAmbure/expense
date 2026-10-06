# Decisions and Assumptions

## Assumptions (requirements were unclear)
- **No authentication.** The brief doesn't ask for it. The Employee/Manager tabs are a UI toggle only, and the API is open.
  In production: login, roles, and a manager-only permission on approve, reject, list and summary.
- **Employees can only submit.** Without auth I can't identify "their" expenses, so the employee tab doesn't list others' data.
- **Status:** `pending` on creation. Employees cannot set it. Only the manager endpoints change it.
- **Decisions are final.** Only `pending` expenses can be approved or rejected. Anything else returns 400.
- **Amount** must be greater than 0. Currency isn't specified, so amounts are plain numbers with two decimals.
- **Date** cannot be in the future.
- **The total** counts approved expenses only.

## Backend decisions
- Approve and reject are separate POST actions, so the submit endpoint can never set a status.
- Decisions use one conditional `UPDATE ... WHERE status='pending'`, so concurrent decisions can't both succeed.
- `TextChoices` for status: named constants, one place for value and label, typos fail loudly.
  Allowed values are enforced by the serializer, not a DB constraint.
- The viewset uses create/list/retrieve mixins only, so there are no update or delete routes to secure.
- `DecimalField` for money (serialized as a string). The total is computed in the database with `Sum`.
- The list is not paginated, since the volume is small. At scale: cursor pagination.
- SQLite for simplicity. PostgreSQL in production.
- CORS allows only the Vite dev origin.

## Frontend decisions
- Plain `fetch` in one `src/api.js` (no axios). The base URL comes from `VITE_API_URL`.
- `useState`/`useEffect` only, no state library. If the app grows, TanStack Query rather than Redux.
- Validation rules live on the server. The form shows DRF's field errors and keeps only `required` in the browser.
- The screen is refetched from the server after every submit and every decision (including failed ones).
- Tailwind CSS v4 via its Vite plugin.

## Not done / next steps
- Authentication and permissions, pagination, a frontend test suite, and Docker/deployment config.
- AI assistance was used for scaffolding and review. I understand and can explain every part (see commit history).