# Data Sources

This document describes the types of data sources the Breathe ESG Data Ingestion Platform is designed to handle, reflecting real-world operational challenges.

## 1. SAP Exports (ERP Data)
- **Data Type:** Procurement data, fleet fuel consumption.
- **Characteristics:** 
  - Often provided as CSV or Excel files exported directly from the ERP.
  - Contains localized field names (e.g., German column headers for global companies).
  - Internal Plant Codes or Cost Center IDs that need mapping to ESG Facilities.
  - Inconsistent units (e.g., liters vs. gallons, or currency variations).

## 2. Utility Portals
- **Data Type:** Electricity, Gas, and Water consumption.
- **Characteristics:**
  - Exported as CSVs from provider portals.
  - Data is often structured around "Billing Periods" rather than exact calendar months.
  - Contains Meter IDs which must be mapped to physical corporate assets.
  - High likelihood of missing data or overlapping billing periods requiring anomaly detection.

## 3. Corporate Travel APIs (e.g., Concur, Navan)
- **Data Type:** Flights, Hotel stays, Ground Transportation.
- **Characteristics:**
  - Ingested via API payloads (JSON).
  - High volume of granular records (individual trips).
  - Requires parsing distances, origins/destinations (IATA codes), and travel classes to accurately estimate Scope 3 emissions.

## Design Inspirations
The workflow and UI design of this platform are heavily inspired by modern financial audit tools and data reconciliation platforms, prioritizing traceability, exception handling (anomaly queues), and immutable state transitions (locking).
