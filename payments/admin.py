from django.contrib import admin
from .models import FeeCategory, PaymentReceipt, PaymentItem, ReceiptTemplate

@admin.register(FeeCategory)
class FeeCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount', 'class_level', 'frequency')
    list_filter = ('frequency', 'class_level')
    search_fields = ('name',)

@admin.register(PaymentReceipt)
class PaymentReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'student', 'total_amount', 'amount_paid', 'due_amount', 'method', 'payment_date')
    list_filter = ('method', 'payment_date')
    search_fields = ('receipt_number', 'student__name', 'transaction_id')
    date_hierarchy = 'payment_date'
    readonly_fields = ('receipt_number', 'transaction_id')

@admin.register(PaymentItem)
class PaymentItemAdmin(admin.ModelAdmin):
    list_display = ('receipt', 'fee_category', 'amount_paid', 'month', 'year')
    list_filter = ('fee_category',)

@admin.register(ReceiptTemplate)
class ReceiptTemplateAdmin(admin.ModelAdmin):
    list_display = ('name',)