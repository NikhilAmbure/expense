import { useState } from "react";
import ExpenseForm from "./components/ExpenseForm";
import ManagerView from "./components/ManagerView";

const TABS = [
  { id: "employee", label: "Employee" },
  { id: "manager", label: "Manager" },
];

export default function App() {
  const [view, setView] = useState("employee");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
        <h1 className="text-2xl font-semibold">Expense tracker</h1>

        <div className="flex gap-1 rounded-lg bg-slate-200 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
                view === t.id ? "bg-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {view === "employee" ? <ExpenseForm /> : <ManagerView />}
      </div>
    </div>
  );
}