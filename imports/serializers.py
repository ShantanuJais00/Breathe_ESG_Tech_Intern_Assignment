from rest_framework import serializers
from .models import ImportBatch

class ImportBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportBatch
        fields = '__all__'
