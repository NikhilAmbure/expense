# Expense Tracker

Employees submit expenses; a manager approves or rejects them and sees the total of approved expenses.
Stack: Django + Django REST Framework (SQLite) · React (Vite) + Tailwind CSS.

## Run the backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1      # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver       # http://127.0.0.1:8000

## Run the frontend (second terminal)
cd frontend
npm install
npm run dev                      # http://localhost:5173

## Run the tests
cd backend
python manage.py test

## API
| Method | URL | Purpose |
|---|---|---|
| POST | /api/expenses/ | Submit an expense (always created as `pending`) |
| GET | /api/expenses/?status=pending | List expenses, optionally filtered by status |
| POST | /api/expenses/<id>/approve/ | Approve a pending expense |
| POST | /api/expenses/<id>/reject/ | Reject a pending expense |
| GET | /api/expenses/summary/ | `{ "total_approved": "..." }` |

See `Decisions.md` for assumptions and design decisions.