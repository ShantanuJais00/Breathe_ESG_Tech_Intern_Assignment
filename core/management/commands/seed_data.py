from django.core.management.base import BaseCommand
from tenants.models import Tenant
from core.models import User
from imports.models import ImportBatch
from sources.parsers.travel import sync_travel_api

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **options):
        tenant, created = Tenant.objects.get_or_create(name='Acme Corp')
        
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin', tenant=tenant)
            self.stdout.write(self.style.SUCCESS('Superuser created (admin / admin)'))
            
        batch = ImportBatch.objects.create(
            tenant=tenant,
            source_type='TRAVEL',
            ingestion_method='API_SYNC'
        )
        sync_travel_api(batch)
        self.stdout.write(self.style.SUCCESS('Successfully seeded travel records'))
