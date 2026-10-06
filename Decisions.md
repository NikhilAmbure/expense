### Status field uses `TextChoices`
**Decision:** `status` is defined with `models.TextChoices` (pending / approved / rejected), defaulting to `pending`.
**Why:** Gives named constants (`Expense.Status.APPROVED`) instead of repeating string literals, keeps value and label in one place, and a typo fails loudly instead of silently matching nothing. It still produces a standard `choices` field, so DRF validates it automatically.
**Trade-off:** Allowed values are enforced by the serializer, not by a database constraint.


### Mixins instead of ModelViewSet
1) Approve and reject are separate POST endpoints, so the submit endpoint can never set a status.
2) Only pending expenses can be decided, and decisions are final (400 otherwise). It's done with a conditional update, so concurrent decisions can't both win.
3) Future-dated expenses are rejected.
4) The list isn't paginated, since the volume is small. At scale I'd add cursor pagination.
5) The total is computed in the database, and amounts are Decimal, serialized as strings.
6) No authentication, since the brief doesn't ask for it. Anyone can call the manager endpoints, and in production I'd add auth and a manager-only permission.

### No state management library
**Decision:** State is held with `useState` and `useEffect`.
**Why:** Three screens and one list of server data don't justify Redux. If the app grows, I'd add TanStack Query (built for server state: caching and refetching) rather than Redux.