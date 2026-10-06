import { useEffect, useState } from "react";
import { listExpenses, getSummary } from "./api";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listExpenses(), getSummary()])
      .then(([list, summary]) => {
        if (cancelled) return;
        setExpenses(list);
        setTotal(summary.total_approved);
      })
      .catch(() => !cancelled && setError("Could not reach the API."));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Connection test</h1>

        {error ? (
          <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : (
          <>
            <div className="mt-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">Approved total</p>
              <p className="mt-1 text-3xl font-semibold">{total ?? "..."}</p>
            </div>

            <pre className="mt-6 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
              {JSON.stringify(expenses, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}