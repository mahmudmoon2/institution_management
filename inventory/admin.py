from django.contrib import admin
from .models import Category, Product, Distribution

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'quantity_in_stock', 'unit', 'purchase_price')
    list_filter = ('category',)
    search_fields = ('name',)
    list_editable = ('quantity_in_stock',)

@admin.register(Distribution)
class DistributionAdmin(admin.ModelAdmin):
    list_display = ('product', 'distributed_to', 'quantity', 'date', 'distributed_by')
    list_filter = ('date', 'product')
    search_fields = ('product__name', 'distributed_to')
    date_hierarchy = 'date'