from django.db import models

class RawRecord(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='raw_records')
    import_batch = models.ForeignKey('imports.ImportBatch', on_delete=models.CASCADE, related_name='raw_records')
    source_type = models.CharField(max_length=50)
    raw_payload = models.JSONField()
    row_number = models.IntegerField(null=True, blank=True)
    parser_version = models.CharField(max_length=50, default='1.0')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"RawRecord {self.id} (Batch {self.import_batch_id})"

class NormalizedActivityRecord(models.Model):
    ACTIVITY_TYPES = (
        ('FUEL', 'Fuel'),
        ('ELECTRICITY', 'Electricity'),
        ('FLIGHT', 'Flight'),
        ('HOTEL', 'Hotel'),
        ('GROUND_TRANSPORT', 'Ground Transport'),
        ('PROCUREMENT', 'Procurement'),
    )
    SCOPE_CATEGORIES = (
        ('SCOPE_1', 'Scope 1'),
        ('SCOPE_2', 'Scope 2'),
        ('SCOPE_3', 'Scope 3'),
    )
    REVIEW_STATUSES = (
        ('PENDING', 'Pending'),
        ('FLAGGED', 'Flagged'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('LOCKED', 'Locked'),
    )

    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='normalized_records')
    raw_record = models.OneToOneField(RawRecord, on_delete=models.CASCADE, related_name='normalized_record')
    
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    scope_category = models.CharField(max_length=50, choices=SCOPE_CATEGORIES)
    activity_date = models.DateField(null=True, blank=True)
    
    quantity = models.FloatField(null=True, blank=True)
    normalized_unit = models.CharField(max_length=50, null=True, blank=True)
    source_unit = models.CharField(max_length=50, null=True, blank=True)
    
    facility_name = models.CharField(max_length=255, null=True, blank=True)
    facility_code = models.CharField(max_length=100, null=True, blank=True)
    
    vendor_name = models.CharField(max_length=255, null=True, blank=True)
    travel_origin = models.CharField(max_length=100, null=True, blank=True)
    travel_destination = models.CharField(max_length=100, null=True, blank=True)
    
    currency = models.CharField(max_length=10, null=True, blank=True)
    estimated_co2e = models.FloatField(null=True, blank=True)
    
    review_status = models.CharField(max_length=50, choices=REVIEW_STATUSES, default='PENDING')
    anomaly_score = models.FloatField(default=0.0)
    is_flagged = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_records')
    locked_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.activity_type} - {self.activity_date} ({self.review_status})"
