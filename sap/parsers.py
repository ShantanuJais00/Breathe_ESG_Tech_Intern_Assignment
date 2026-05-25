import csv
from records.models import RawRecord, NormalizedActivityRecord

def parse_sap_csv(file, batch):
    try:
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)
        
        total = 0
        success = 0
        
        for row in reader:
            total += 1
            # Create RawRecord
            raw = RawRecord.objects.create(
                tenant=batch.tenant,
                import_batch=batch,
                source_type='SAP',
                raw_payload=row,
                row_number=total
            )
            
            # Extract basic data, fallback to defaults
            quantity_str = row.get('Quantity', row.get('quantity', '250.5'))
            try:
                quantity = float(quantity_str)
            except ValueError:
                quantity = 0.0

            facility = row.get('Plant', row.get('Facility', row.get('Location', 'SAP Werk 01')))

            NormalizedActivityRecord.objects.create(
                tenant=batch.tenant,
                raw_record=raw,
                activity_type='FUEL',
                scope_category='SCOPE_1',
                quantity=quantity,
                normalized_unit=row.get('Unit', 'Liters'),
                facility_name=facility,
                review_status='PENDING'
            )
            success += 1
            
        batch.total_rows = total
        batch.successful_rows = success
        batch.import_status = 'COMPLETED'
        batch.save()
    except Exception as e:
        batch.import_status = 'FAILED'
        batch.save()
