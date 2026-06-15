from django.contrib import admin
from .models import FeeCategory, PaymentReceipt, PaymentItem, ReceiptTemplate

@admin.register(FeeCategory)
class FeeCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount', 'frequency', 'class_level')
    list_filter = ('frequency', 'class_level')

# রিসিটের ভেতরেই আইটেমগুলো দেখার জন্য Inline Admin
class PaymentItemInline(admin.TabularInline):
    model = PaymentItem
    extra = 0
    readonly_fields = ('fee_category', 'amount_paid', 'month', 'year')

@admin.register(PaymentReceipt)
class PaymentReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'student', 'total_amount', 'payment_date', 'method')
    search_fields = ('receipt_number', 'student__name', 'transaction_id')
    list_filter = ('method', 'payment_date')
    inlines = [PaymentItemInline] # রিসিটের ভেতরে আইটেম দেখাবে
    readonly_fields = ('transaction_id', 'receipt_number')

admin.site.register(ReceiptTemplate)