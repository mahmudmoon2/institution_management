from rest_framework import serializers
from .models import Category, Product, Distribution

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

class DistributionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    distributed_by_name = serializers.CharField(source='distributed_by.username', read_only=True)

    class Meta:
        model = Distribution
        fields = '__all__'