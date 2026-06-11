from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Category, Product, Distribution
from .serializers import CategorySerializer, ProductSerializer, DistributionSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('name')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

class DistributionViewSet(viewsets.ModelViewSet):
    queryset = Distribution.objects.all().order_by('-date')
    serializer_class = DistributionSerializer
    permission_classes = [IsAuthenticated]

    # মালামাল বিতরণ হলে স্টক থেকে অটোমেটিক মাইনাস করার লজিক
    def perform_create(self, serializer):
        distribution = serializer.save(distributed_by=self.request.user)
        product = distribution.product
        product.quantity_in_stock -= distribution.quantity
        product.save()