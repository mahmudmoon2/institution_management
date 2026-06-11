import uuid
from django.db import models
from django.conf import settings

class Head(models.Model):
    """
    খাতের নাম (Income/Expense Heads) 
    যেমন: 'Tuition Fee' (Income), 'Electricity Bill' (Expense)
    """
    HEAD_TYPE_CHOICES = (
        ('Income', 'Income'),
        ('Expense', 'Expense'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    head_type = models.CharField(max_length=10, choices=HEAD_TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.head_type})"

class DailyTransaction(models.Model):
    """
    দৈনিক লেনদেন (Daily Transaction)
    """
    TRANSACTION_TYPE_CHOICES = (
        ('Income', 'Income'),
        ('Expense', 'Expense'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    head = models.ForeignKey(Head, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} on {self.date}"