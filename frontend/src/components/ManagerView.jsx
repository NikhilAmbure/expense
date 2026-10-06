import { useEffect, useState } from "react";
import { listExpenses, getSummary, decideExpense } from "../api";

// Full class names (not built dynamically), so Tailwind can detect them
const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

// Display only: the server calculates the total, the browser just formats it
const formatAmount = (value) =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function ManagerView() {
  const [filter, setFilter] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [version, setVersion] = useState(0); // bump to refetch

  useEffect(() => {
    let cancelled = false;
    Promise.all([listExpenses(filter), getSummary()])
      .then(([list, summary]) => {
        if (cancelled) return;
        setExpenses(list);
        setTotal(summary.total_approved);
        setError(null);
      })
      .catch(() => !cancelled && setError("Could not reach the API."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filter, version]);

  const decide = async (id, action) => {
    setBusyId(id);
    setActionError(null);
    try {
      await decideExpense(id, action);
    } catch (err) {
      setActionError(err.data?.detail || "Could not update the expense.");
    } finally {
      setVersion((v) => v + 1); // refetch even on error, so stale rows are refreshed
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Total approved</p>
        <p className="mt-1 text-3xl font-semibold">
          {total === null ? "..." : formatAmount(total)}
        </p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === f.value
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {actionError && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : expenses.length === 0 ? (
        <p className="text-sm text-slate-500">No expenses to show.</p>
      ) : (
        <ul className="space-y-2">
          {expenses.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-4 rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{e.description}</p>
                <p className="text-xs text-slate-500">
                  {e.employee_name} · {e.date}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold">{formatAmount(e.amount)}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[e.status]}`}
                >
                  {e.status}
                </span>

                {e.status === "pending" && (
                  <>
                    <button
                      onClick={() => decide(e.id, "approve")}
                      disabled={busyId === e.id}
                      className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => decide(e.id, "reject")}
                      disabled={busyId === e.id}
                      className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}