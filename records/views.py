from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import NormalizedActivityRecord
from .serializers import NormalizedActivityRecordSerializer
from audit.models import AuditLog

class RecordViewSet(viewsets.ModelViewSet):
    queryset = NormalizedActivityRecord.objects.all().order_by('-created_at')
    serializer_class = NormalizedActivityRecordSerializer

    def log_action(self, record, action_name, previous, new_vals):
        AuditLog.objects.create(
            tenant=record.tenant,
            entity_type='NormalizedActivityRecord',
            entity_id=record.id,
            action=action_name,
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            previous_values=previous,
            new_values=new_vals
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        record = self.get_object()
        if record.review_status == 'LOCKED':
            return Response({'error': 'Record is locked'}, status=status.HTTP_400_BAD_REQUEST)
        
        prev_status = record.review_status
        record.review_status = 'APPROVED'
        record.approved_at = timezone.now()
        record.approved_by = request.user if request.user.is_authenticated else None
        record.save()
        
        self.log_action(record, 'APPROVED', {'review_status': prev_status}, {'review_status': 'APPROVED'})
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        record = self.get_object()
        if record.review_status == 'LOCKED':
            return Response({'error': 'Record is locked'}, status=status.HTTP_400_BAD_REQUEST)
        
        prev_status = record.review_status
        record.review_status = 'REJECTED'
        record.save()
        
        self.log_action(record, 'REJECTED', {'review_status': prev_status}, {'review_status': 'REJECTED'})
        return Response({'status': 'rejected'})

    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        record = self.get_object()
        if record.review_status != 'APPROVED':
            return Response({'error': 'Only approved records can be locked'}, status=status.HTTP_400_BAD_REQUEST)
            
        prev_status = record.review_status
        record.review_status = 'LOCKED'
        record.locked_at = timezone.now()
        record.save()
        
        self.log_action(record, 'LOCKED', {'review_status': prev_status}, {'review_status': 'LOCKED'})
        return Response({'status': 'locked'})
