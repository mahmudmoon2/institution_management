from rest_framework import serializers
from .models import FeeCategory, PaymentReceipt, PaymentItem, ReceiptTemplate

class FeeCategorySerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)

    class Meta:
        model = FeeCategory
        fields = '__all__'

class PaymentItemSerializer(serializers.ModelSerializer):
    fee_category_name = serializers.CharField(source='fee_category.name', read_only=True)

    class Meta:
        model = PaymentItem
        fields = '__all__'

class PaymentReceiptSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id_str = serializers.CharField(source='student.student_id', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.username', read_only=True)
    
    items = PaymentItemSerializer(many=True, read_only=True)
    
    fee_category_name = serializers.SerializerMethodField()
    month = serializers.SerializerMethodField()
    year = serializers.SerializerMethodField()

    class Meta:
        model = PaymentReceipt
        fields = '__all__'
        # amount_paid এবং due_amount রিড-অনলি করা হয়নি, যাতে ফ্রন্টএন্ড থেকে সেভ করা যায়
        read_only_fields = ['transaction_id', 'receipt_number', 'recorded_by']

    def get_fee_category_name(self, obj):
        return ", ".join([item.fee_category.name for item in obj.items.all()])

    def get_month(self, obj):
        first_item = obj.items.first()
        return first_item.month if first_item else ""
        
    def get_year(self, obj):
        first_item = obj.items.first()
        return first_item.year if first_item else ""