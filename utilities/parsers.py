import csv
from records.models import RawRecord, NormalizedActivityRecord

def parse_utility_csv(file, batch):
    try:
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)
        
        total = 0
        success = 0
        
        for row in reader:
            total += 1
            raw = RawRecord.objects.create(
                tenant=batch.tenant,
                import_batch=batch,
                source_type='UTILITY',
                raw_payload=row,
                row_number=total
            )
            
            quantity_str = row.get('Usage', row.get('Consumption', '4500'))
            try:
                quantity = float(quantity_str)
            except ValueError:
                quantity = 0.0

            NormalizedActivityRecord.objects.create(
                tenant=batch.tenant,
                raw_record=raw,
                activity_type='ELECTRICITY',
                scope_category='SCOPE_2',
                quantity=quantity,
                normalized_unit=row.get('Unit', 'kWh'),
                facility_name=row.get('Meter', row.get('Address', 'Main HQ')),
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
