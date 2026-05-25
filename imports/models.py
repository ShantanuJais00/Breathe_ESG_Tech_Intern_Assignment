from django.db import models

class ImportBatch(models.Model):
    SOURCE_TYPES = (
        ('SAP', 'SAP'),
        ('UTILITY', 'Utility'),
        ('TRAVEL', 'Travel'),
    )
    INGESTION_METHODS = (
        ('FILE_UPLOAD', 'File Upload'),
        ('API_SYNC', 'API Sync'),
    )
    STATUS_CHOICES = (
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    )

    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='import_batches')
    source_type = models.CharField(max_length=50, choices=SOURCE_TYPES)
    uploaded_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, related_name='imports')
    original_filename = models.CharField(max_length=255, null=True, blank=True)
    ingestion_method = models.CharField(max_length=50, choices=INGESTION_METHODS)
    import_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PROCESSING')
    
    total_rows = models.IntegerField(default=0)
    successful_rows = models.IntegerField(default=0)
    failed_rows = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.source_type} Import - {self.created_at.strftime('%Y-%m-%d')}"
