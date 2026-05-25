from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from records.views import RecordViewSet
from imports.views import ImportBatchViewSet, import_sap, import_utility, import_travel_sync
from audit.views import AuditLogViewSet

router = DefaultRouter()
router.register(r'records', RecordViewSet)
router.register(r'imports', ImportBatchViewSet)
router.register(r'audit-log', AuditLogViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/imports/sap', import_sap),
    path('api/imports/utility', import_utility),
    path('api/imports/travel-sync', import_travel_sync),
]
