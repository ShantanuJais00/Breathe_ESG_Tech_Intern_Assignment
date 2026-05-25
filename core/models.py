from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('analyst', 'Analyst'),
        ('admin', 'Admin'),
    )
    
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='analyst')

    def __str__(self):
        return self.username
