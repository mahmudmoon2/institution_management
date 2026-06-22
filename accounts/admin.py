from django.contrib import admin
from .models import Head, DailyTransaction

@admin.register(Head)
class HeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'head_type', 'description')
    list_filter = ('head_type',)
    search_fields = ('name',)

@admin.register(DailyTransaction)
class DailyTransactionAdmin(admin.ModelAdmin):
    list_display = ('head', 'transaction_type', 'amount', 'date', 'reference_number', 'recorded_by')
    list_filter = ('transaction_type', 'head', 'date')
    search_fields = ('reference_number', 'description')
    date_hierarchy = 'date'