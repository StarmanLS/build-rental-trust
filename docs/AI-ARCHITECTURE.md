# AI Rental Trust Engine — M1.1 contract

Status: **contract only**. No provider, credential, endpoint, external transfer, AI-generated result, or paid service is active. The agent dashboard uses deterministic viewing counts and follow-up links; it does not label these as AI output.

## Shared service boundary

`server/ai/engine.ts` defines capabilities, evidence references, permission checks, provider input, suggestion provenance, error states, and mandatory human review. A caller must authorize each source for the actor and resource scope before invoking any provider. The engine refuses unsupported evidence references in returned suggestions. A provider failure becomes a clear unavailable/failed state; normal rental workflows continue.

Before any live provider is connected, add: server-side secret management; a scoped record loader; consent and redaction policy; prompt-injection isolation for documents and messages; per-user and per-tenant usage limits; cost accounting; retained model/version metadata; review, correction, appeal and audit records; provider data-processing review; and integration tests with real permission boundaries. No private API key belongs in the frontend. A key found on a machine alone is not approval to use it.

## Evidence and data model

The evidence reference kinds cover identities, properties, ownership claims, tenancies, agreement versions, payment events, maintenance, viewings, handovers, reviews, disputes, communications and sharing grants. Only some have persistent tables in M1.1. Later migrations must add missing entities, source versions, consent grants, AI run records, user corrections, and approved-result reuse. Original evidence remains immutable; AI text is stored separately and always cites its source ID, date range, sample size and limits where applicable.

## Workflow entry points

- Landlord dashboard: suggest missing tenancy details, summarize confirmed records, prepare maintenance follow-ups when those records exist.
- Tenant dashboard: explain an agreement clause, prepare maintenance requests, summarize only tenant-selected rental history.
- Agent dashboard: identify missing viewing information and draft follow-up suggestions from the agent's own records.
- Future normal tasks: document extraction, agreement drafting, room/photo/key analysis, payment evidence review, property matching, review moderation, and inconsistent-record checks.

The user must confirm extracted data, agreements, payments without independent evidence, inspection responses, disputes, and shared trust records. AI must not verify identity or ownership, decide housing eligibility, or infer personality or mental health. Trust Maps use separate evidence-backed measures with sample size, date range, source and uncertainty; protected traits are excluded from scoring.

## Integration backlog

MyDigital ID, CTOS, CCRIS, bank APIs, WhatsApp, AI mediation and the vendor marketplace remain future candidates. Access, consent, lawful basis, retention, cost and security review are required before activation. No current provider pricing or usage limit is verified; current provider spend and API calls are zero.
