const BASE_URL = "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // DRF sends validation errors as JSON
    const error = new Error("Request failed");
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const listExpenses = (status) =>
  request(`/expenses/${status ? `?status=${status}` : ""}`);

export const createExpense = (expense) =>
  request("/expenses/", { method: "POST", body: JSON.stringify(expense) });

export const decideExpense = (id, action) =>
  request(`/expenses/${id}/${action}/`, { method: "POST" }); // action: "approve" | "reject"

export const getSummary = () => request("/expenses/summary/");