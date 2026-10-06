from datetime import date
from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ["id", "employee_name", "amount", "description", "date", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]

    def validate_date(self, value):
        if value > date.today():
            raise serializers.ValidationError("Expense date cannot be in the future.")
        return value