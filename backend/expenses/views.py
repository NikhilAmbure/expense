from django.shortcuts import render
from decimal import Decimal
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        return qs

    def _decide(self, pk, new_status):
        # only changes the row if it is still pending.
        updated = Expense.objects.filter(
            pk=pk, status=Expense.Status.PENDING
        ).update(status=new_status)

        if not updated:
            expense = get_object_or_404(Expense, pk=pk)  # 404 if it doesn't exist
            return Response(
                {"detail": f"Expense is already {expense.status}."}, status=400
            )
        return Response(ExpenseSerializer(Expense.objects.get(pk=pk)).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._decide(pk, Expense.Status.APPROVED)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._decide(pk, Expense.Status.REJECTED)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        total = Expense.objects.filter(status=Expense.Status.APPROVED).aggregate(
            total=Sum("amount")
        )["total"]
        return Response({"total_approved": total or Decimal("0.00")})