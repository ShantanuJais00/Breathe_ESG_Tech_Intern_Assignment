import json
from records.models import RawRecord, NormalizedActivityRecord

def sync_travel_api(batch):
    try:
        # Simulate fetching data from an API
        mock_data = [
            {"flight_id": "FL-102", "origin": "LHR", "destination": "JFK", "distance_km": 5540, "class": "Economy"},
            {"flight_id": "FL-103", "origin": "SFO", "destination": "JFK", "distance_km": 4150, "class": "Business"},
            {"flight_id": "FL-104", "origin": "BER", "destination": "CDG", "distance_km": 880, "class": "Economy"}
        ]
        
        total = 0
        success = 0
        
        for item in mock_data:
            total += 1
            raw = RawRecord.objects.create(
                tenant=batch.tenant,
                import_batch=batch,
                source_type='TRAVEL',
                raw_payload=item,
                row_number=total
            )

            # Introduce a mock validation issue for the first record by setting is_flagged to True
            # if we wanted to test validation issues, but we can just leave it pending
            
            NormalizedActivityRecord.objects.create(
                tenant=batch.tenant,
                raw_record=raw,
                activity_type='FLIGHT',
                scope_category='SCOPE_3',
                quantity=item.get('distance_km', 0),
                normalized_unit='km',
                travel_origin=item.get('origin'),
                travel_destination=item.get('destination'),
                review_status='PENDING',
                is_flagged= (total == 1) # Flag the first one for the UI
            )
            success += 1
            
        batch.total_rows = total
        batch.successful_rows = success
        batch.import_status = 'COMPLETED'
        batch.save()
    except Exception as e:
        batch.import_status = 'FAILED'
        batch.save()
