### Status field uses `TextChoices`
**Decision:** `status` is defined with `models.TextChoices` (pending / approved / rejected), defaulting to `pending`.
**Why:** Gives named constants (`Expense.Status.APPROVED`) instead of repeating string literals, keeps value and label in one place, and a typo fails loudly instead of silently matching nothing. It still produces a standard `choices` field, so DRF validates it automatically.
**Trade-off:** Requires Django 3.0+. Allowed values are enforced by the serializer, not by a database constraint.