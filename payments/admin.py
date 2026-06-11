from django.contrib import admin
from .models import FeeCategory, Payment, ReceiptTemplate

@admin.register(FeeCategory)
class FeeCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount', 'frequency', 'class_level')
    list_filter = ('frequency', 'class_level')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'student', 'fee_category', 'amount_paid', 'due_amount', 'payment_date')
    search_fields = ('receipt_number', 'student__name', 'transaction_id')
    list_filter = ('method', 'payment_date')

admin.site.register(ReceiptTemplate)

