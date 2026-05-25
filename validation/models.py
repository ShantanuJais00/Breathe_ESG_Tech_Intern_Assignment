from django.db import models

class ValidationIssue(models.Model):
    ISSUE_TYPES = (
        ('MISSING_UNIT', 'Missing Unit'),
        ('INVALID_DATE', 'Invalid Date'),
        ('DUPLICATE_RECORD', 'Duplicate Record'),
        ('UNKNOWN_FACILITY', 'Unknown Facility'),
        ('SUSPICIOUS_QUANTITY', 'Suspicious Quantity'),
        ('MISSING_REQUIRED_FIELD', 'Missing Required Field'),
        ('INVALID_AIRPORT_CODE', 'Invalid Airport Code'),
    )
    SEVERITIES = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
    )

    normalized_record = models.ForeignKey('records.NormalizedActivityRecord', on_delete=models.CASCADE, related_name='validation_issues')
    issue_type = models.CharField(max_length=50, choices=ISSUE_TYPES)
    severity = models.CharField(max_length=50, choices=SEVERITIES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.issue_type} - {self.severity} for Record {self.normalized_record_id}"
