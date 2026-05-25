from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from .models import ImportBatch
from .serializers import ImportBatchSerializer
from sap.parsers import parse_sap_csv
from utilities.parsers import parse_utility_csv
from travel.parsers import sync_travel_api
from tenants.models import Tenant

class ImportBatchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ImportBatch.objects.all().order_by('-created_at')
    serializer_class = ImportBatchSerializer

@csrf_exempt
@api_view(['POST'])
def import_sap(request):
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'No file provided'}, status=400)
    
    tenant = Tenant.objects.first() # Simplification for prototype
    batch = ImportBatch.objects.create(
        tenant=tenant,
        source_type='SAP',
        original_filename=file.name,
        ingestion_method='FILE_UPLOAD'
    )
    
    # Process synchronously for prototype
    parse_sap_csv(file, batch)
    return Response(ImportBatchSerializer(batch).data)

@csrf_exempt
@api_view(['POST'])
def import_utility(request):
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'No file provided'}, status=400)
    
    tenant = Tenant.objects.first()
    batch = ImportBatch.objects.create(
        tenant=tenant,
        source_type='UTILITY',
        original_filename=file.name,
        ingestion_method='FILE_UPLOAD'
    )
    
    parse_utility_csv(file, batch)
    return Response(ImportBatchSerializer(batch).data)

@csrf_exempt
@api_view(['POST'])
def import_travel_sync(request):
    tenant = Tenant.objects.first()
    batch = ImportBatch.objects.create(
        tenant=tenant,
        source_type='TRAVEL',
        ingestion_method='API_SYNC'
    )
    
    sync_travel_api(batch)
    return Response(ImportBatchSerializer(batch).data)
