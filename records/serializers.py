from rest_framework import serializers
from .models import NormalizedActivityRecord, RawRecord
from validation.models import ValidationIssue

class ValidationIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValidationIssue
        fields = '__all__'

class NormalizedActivityRecordSerializer(serializers.ModelSerializer):
    validation_issues = ValidationIssueSerializer(many=True, read_only=True)
    
    class Meta:
        model = NormalizedActivityRecord
        fields = '__all__'

class RawRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawRecord
        fields = '__all__'
