from django.db import models

class AuditLog(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='audit_logs')
    entity_type = models.CharField(max_length=100) # e.g. 'NormalizedActivityRecord'
    entity_id = models.IntegerField()
    action = models.CharField(max_length=100) # e.g. 'APPROVED', 'EDITED'
    performed_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True)
    previous_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} on {self.entity_type} {self.entity_id} at {self.created_at}"
