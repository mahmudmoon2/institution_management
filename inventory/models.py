import uuid
from django.db import models
from django.conf import settings

class Category(models.Model):
    """
    মালামালের ক্যাটাগরি (যেমন: Books, Stationery, Lab Equipment)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    """
    প্রোডাক্টের নাম এবং বর্তমান স্টক
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    quantity_in_stock = models.IntegerField(default=0)
    unit = models.CharField(max_length=50) # e.g. pcs, kg, box
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Distribution(models.Model):
    """
    মালামাল বিতরণের রেকর্ড
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    distributed_to = models.CharField(max_length=150) # class বা individual name
    quantity = models.IntegerField()
    date = models.DateField()
    distributed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.quantity} {self.product.name} to {self.distributed_to}"