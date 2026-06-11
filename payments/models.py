import uuid
from django.db import models
from django.conf import settings

class FeeCategory(models.Model):
    FREQUENCY_CHOICES = [
        ('Monthly', 'Monthly'),
        ('Yearly', 'Yearly'),
        ('One-time', 'One-time'),
    ]

    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    # academics.Class দিয়ে রেফার করা হলো যাতে Circular Import না হয়
    # 'academics.Class' এর বদলে 'academics.ClassLevel' হবে (বা আপনার মডেলের আসল যে নাম)
    class_level = models.ForeignKey('academics.ClassLevel', on_delete=models.SET_NULL, null=True, blank=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='Monthly')

    def __str__(self):
        return f"{self.name} - {self.class_level.name if self.class_level else 'All Classes'}"


class Payment(models.Model):
    METHOD_CHOICES = [
        ('Cash', 'Cash'),
        ('Online', 'Online'),
        ('Cheque', 'Cheque'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='payments')
    fee_category = models.ForeignKey(FeeCategory, on_delete=models.PROTECT)
    
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    due_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    payment_date = models.DateField(auto_now_add=True)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='Cash')
    
    # অটো-জেনারেটেড ইউনিক আইডি
    transaction_id = models.CharField(max_length=100, unique=True, blank=True)
    receipt_number = models.CharField(max_length=50, unique=True, blank=True)
    
    month = models.CharField(max_length=20, blank=True, null=True) # e.g., 'January'
    year = models.IntegerField(blank=True, null=True)
    
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # সেভ হওয়ার আগে ট্রানজেকশন আইডি জেনারেট করবে
        if not self.transaction_id:
            self.transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
            
        # সিম্পল রিসিট নাম্বার জেনারেটর
        if not self.receipt_number:
            last_receipt = Payment.objects.all().order_by('created_at').last()
            if not last_receipt:
                self.receipt_number = "REC-1000"
            else:
                try:
                    last_num = int(last_receipt.receipt_number.split('-')[1])
                    self.receipt_number = f"REC-{last_num + 1}"
                except:
                    self.receipt_number = f"REC-{uuid.uuid4().hex[:6].upper()}"
                    
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.receipt_number} - {self.student.name}"


class ReceiptTemplate(models.Model):
    name = models.CharField(max_length=100, default="Default Template")
    template_html = models.TextField(help_text="Pre-designed receipt template with placeholders")
    
    def __str__(self):
        return self.name