import { useState } from "react";
import { createExpense } from "../api";

// Local date as YYYY-MM-DD (toISOString would give the UTC date, which can be yesterday in India)
const today = new Date().toLocaleDateString("en-CA");
const EMPTY = { employee_name: "", amount: "", description: "", date: today };

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function Field({ label, error, children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
      {error && <p className="mt-1 text-xs font-normal text-red-600">{error}</p>}
    </label>
  );
}

export default function ExpenseForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setSuccess(false);
    try {
      const created = await createExpense(form);
      setForm(EMPTY);
      setSuccess(true);
      onCreated?.(created);
    } catch (err) {
      if (err.status === 400 && err.data) {
        setErrors(err.data); // DRF: { amount: ["..."], date: ["..."] }
      } else {
        setErrors({ form: ["Something went wrong. Please try again."] });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const first = (key) => errors[key]?.[0];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <h2 className="text-lg font-semibold">Submit an expense</h2>

      <Field label="Employee name" error={first("employee_name")}>
        <input
          name="employee_name"
          value={form.employee_name}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Amount" error={first("amount")}>
          <input
            name="amount"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Date" error={first("date")}>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </Field>
      </div>

      <Field label="Description" error={first("description")}>
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </Field>

      {(first("form") || first("non_field_errors") || first("detail")) && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {first("form") || first("non_field_errors") || first("detail")}
        </p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Expense submitted. It is now pending approval.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit expense"}
      </button>
    </form>
  );
}