from datetime import date, timedelta
from decimal import Decimal

from rest_framework.test import APITestCase

from .models import Expense


class ExpenseApiTests(APITestCase):
    def payload(self, **overrides):
        data = {
            "employee_name": "Asha",
            "amount": "120.50",
            "description": "Taxi",
            "date": str(date.today()),
        }
        data.update(overrides)
        return data

    def create(self, **overrides):
        return self.client.post("/api/expenses/", self.payload(**overrides), format="json")

    def test_create_ignores_status_sent_by_client(self):
        r = self.create(status="approved")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.data["status"], "pending")

    def test_rejects_non_positive_amount(self):
        r = self.create(amount="0")
        self.assertEqual(r.status_code, 400)
        self.assertIn("amount", r.data)

    def test_rejects_future_date(self):
        r = self.create(date=str(date.today() + timedelta(days=1)))
        self.assertEqual(r.status_code, 400)
        self.assertIn("date", r.data)

    def test_decision_is_final(self):
        pk = self.create().data["id"]
        self.assertEqual(self.client.post(f"/api/expenses/{pk}/approve/").status_code, 200)
        self.assertEqual(self.client.post(f"/api/expenses/{pk}/reject/").status_code, 400)
        self.assertEqual(Expense.objects.get(pk=pk).status, Expense.Status.APPROVED)

    def test_unknown_expense_returns_404(self):
        self.assertEqual(self.client.post("/api/expenses/999/approve/").status_code, 404)

    def test_summary_counts_only_approved(self):
        a = self.create(amount="100.00").data["id"]
        b = self.create(amount="50.00").data["id"]
        self.create(amount="25.00")  # stays pending
        self.client.post(f"/api/expenses/{a}/approve/")
        self.client.post(f"/api/expenses/{b}/reject/")
        r = self.client.get("/api/expenses/summary/")
        self.assertEqual(r.data["total_approved"], Decimal("100.00"))