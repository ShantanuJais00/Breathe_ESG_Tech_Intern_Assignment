# Architectural Decisions

This document captures the key architectural and design decisions made while building the Breathe ESG Data Ingestion Platform.

## 1. Domain-Driven Project Structure
Instead of a single monolithic app, the backend is split into domain-specific Django apps (`core`, `tenants`, `imports`, `sap`, `utilities`, `travel`, `records`, `validation`, `reviews`, `audit`).
- **Why:** ESG data is highly heterogeneous. The logic to parse an SAP procurement export is entirely different from parsing a Concur API payload. Isolating these into separate apps (`sap`, `travel`) prevents spaghetti code and makes it easy to add new integrations.

## 2. Strict Separation of Raw and Normalized Data
We explicitly map one `RawRecord` to one `NormalizedActivityRecord`.
- **Why:** Auditability is the highest priority. If a parser has a bug, or an auditor questions a value, we can trace the normalized record back to the exact JSON payload we received from the source system.

## 3. Normalization on Write
Data is normalized and validated immediately during the ingestion batch process, rather than being parsed on-the-fly when analysts view it.
- **Why:** ESG datasets can be massive. Pre-calculating normalized values and anomaly scores ensures the Analyst Review Interface remains highly responsive.

## 4. JSONField for Raw Payloads
We use PostgreSQL/SQLite `JSONField` to store the incoming data.
- **Why:** Source systems change their export formats, add new columns, or use inconsistent casing. A rigid relational schema for raw data would break frequently. JSON allows us to accept anything, then handle mapping gracefully in the normalization layer.

## 5. Technology Stack Selection
- **Django & DRF:** Chosen for rapid development, excellent ORM, and built-in security features. The Admin panel also provides a free fallback UI for developers.
- **React, TypeScript & Vite:** Provides a fast, type-safe frontend experience. Essential for building a complex, state-heavy UI like the Analyst Review Interface.
- **Tailwind CSS:** Allows for rapid UI prototyping and ensures a consistent, modern design system without maintaining complex CSS files.
