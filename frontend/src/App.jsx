import { useCallback, useEffect, useState } from "react";
import { listExpenses } from "./api";
import ExpenseForm from "./components/ExpenseForm";

// Full class names (not built dynamically), so Tailwind can detect them
const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setExpenses(await listExpenses());
      setError(null);
    } catch {
      setError("Could not reach the API.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
        <h1 className="text-2xl font-semibold">Expense tracker</h1>

        <ExpenseForm onCreated={load} />

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <ul className="space-y-2">
          {expenses.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200"
            >
              <div>
                <p className="text-sm font-medium">{e.description}</p>
                <p className="text-xs text-slate-500">
                  {e.employee_name} · {e.date}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{e.amount}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[e.status]}`}
                >
                  {e.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}