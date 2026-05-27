# Tradeoffs

Engineering is about tradeoffs. Below are the significant compromises made in the current architecture of the Breathe ESG Data Ingestion Platform, and the reasoning behind them.

## 1. Storage Cost vs. Auditability
**Tradeoff:** Storing both the `RawRecord` (complete JSON payload) and the `NormalizedActivityRecord` effectively doubles our storage requirements for the operational dataset.
**Reasoning:** In ESG and carbon accounting, audibility is non-negotiable. The cost of database storage is negligible compared to the cost of failing an audit or losing data provenance. We accepted higher storage costs to guarantee strict traceability.

## 2. Monolith vs. Microservices
**Tradeoff:** The application is built as a modular Django monolith rather than splitting parsers and validation engines into separate microservices (e.g., AWS Lambdas).
**Reasoning:** For an MVP and early-stage scaling, managing a distributed microservice architecture introduces massive operational overhead (deployment, orchestration, inter-service communication). A modular monolith gives us logical separation (via Django apps) while keeping deployment simple. We can always extract specific parsers to serverless functions later if ingestion load demands it.

## 3. SQLite (Development) vs. PostgreSQL (Production)
**Tradeoff:** The project currently uses `db.sqlite3` for local development (evidenced by the file in the repo), while targeting PostgreSQL for production.
**Reasoning:** SQLite makes it incredibly easy for new developers to spin up the project without running Docker or local Postgres servers. However, this risks "works on my machine" bugs where SQLite handles JSONFields or concurrency differently than Postgres.

## 4. Synchronous vs. Asynchronous Ingestion
**Tradeoff:** Currently, ingestion batches might be processed synchronously (or via simple background tasks) rather than using a heavy message broker like Kafka.
**Reasoning:** While Kafka/RabbitMQ would provide better resilience and throughput for millions of records, it drastically increases local setup complexity. Simple background task queues (like Celery/Redis or simple threading) are sufficient for the current scale.

## 5. Explicit State Machines vs. Flexible Edits
**Tradeoff:** Analysts must follow a strict workflow (`PENDING` -> `REVIEWED` -> `APPROVED` -> `LOCKED`) rather than just freely editing records.
**Reasoning:** Free-form editing destroys data integrity. A strict state machine creates friction for the user but ensures compliance with audit standards.
