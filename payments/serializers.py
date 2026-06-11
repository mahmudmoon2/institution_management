from rest_framework import serializers
from .models import FeeCategory, Payment, ReceiptTemplate

class FeeCategorySerializer(serializers.ModelSerializer):
    # ফ্রন্টএন্ডে দেখানোর জন্য ক্লাসের নামটা রিড-অনলি হিসেবে পাঠানো হলো
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)

    class Meta:
        model = FeeCategory
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    # স্টুডেন্ট এবং ক্যাটাগরির বিস্তারিত নাম দেখানোর জন্য
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id_str = serializers.CharField(source='student.student_id', read_only=True)
    fee_category_name = serializers.CharField(source='fee_category.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.username', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
        # এই ফিল্ডগুলো ইউজার ইনপুট দিতে পারবে না, সিস্টেম অটো জেনারেট করবে
        read_only_fields = ['transaction_id', 'receipt_number', 'recorded_by']