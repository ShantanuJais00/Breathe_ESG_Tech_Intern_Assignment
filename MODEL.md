# Data Models

This document outlines the core data models used in the Breathe ESG Data Ingestion Platform. The database schema is designed with an "audit-first" philosophy, prioritizing immutability, provenance, and multi-tenancy.

## Core Models (`records/models.py`)

### 1. RawRecord
The foundational model of the ingestion process.
- **Purpose:** Stores the exact, unmodified payload received from any source system.
- **Key Fields:**
  - `tenant`, `import_batch`: References to isolate data and track the ingestion event.
  - `source_type`: Indicates origin (e.g., SAP, Utility, Travel API).
  - `raw_payload` (JSONField): The exact data received. Storing this as JSON allows us to ingest heterogeneous, unstructured, or varying schemas without breaking the database.
  - `parser_version`: Ensures we know exactly which code parsed this record.
- **Audit Rule:** Instances of `RawRecord` are strictly immutable after creation.

### 2. NormalizedActivityRecord
The canonical schema used for all downstream reporting and analyst review.
- **Purpose:** A structured, normalized representation of a `RawRecord`.
- **Key Fields:**
  - `raw_record` (OneToOneField): A direct link back to the immutable source. Provides 100% provenance traceability.
  - `activity_type`, `scope_category`: Categorizes the environmental impact.
  - `quantity`, `normalized_unit`, `source_unit`: Standardizes measurements.
  - `facility_name`, `vendor_name`, `travel_origin` etc.: Contextual data extracted from the raw payload.
  - `review_status`, `anomaly_score`, `is_flagged`: Workflow state for analyst review.
- **Lifecycle:** Starts as `PENDING` or `FLAGGED`, moves to `APPROVED`, and finally `LOCKED` by an analyst.

## Supporting Models

### Tenants & Multi-tenancy (`tenants` app)
- **Tenant:** Represents a distinct corporate entity or reporting unit. All operational records are strictly bound to a tenant to ensure data isolation.

### Import Batch (`imports` app)
- **ImportBatch:** Represents a single ingestion event (e.g., a file upload or API sync). Tracks metadata like success/failure counts and timestamps.

### Users & Workflow (`core` and `reviews` apps)
- **User:** The human analyst interacting with the system.
- **Audit Logs:** While not fully detailed here, every state transition (especially approvals and locks) is recorded with the user who initiated it and the exact timestamp.
