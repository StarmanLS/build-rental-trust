# Rental Trust local foundation

Synthetic Malaysian rental workspace at http://localhost:5199. Isolated from existing INTAN applications. This is a partial foundation, not a production service.

## Run
Use Node with the committed npm lockfile: `npm ci`, then `npm run dev` from this directory. The server binds only to 127.0.0.1. `npm run typecheck`, `npm test`, and `npm run build` validate the current slice. `npm start` serves a built local preview. Do not use NODE_ENV=production: the synthetic bootstrap intentionally refuses it.

Fictional accounts: `manager@example.invalid`, `tenant@example.invalid`, `outsider@example.invalid`. All start with password `LocalRental!2026`. These are disposable local fixtures, not real credentials. The mailbox is intentionally operator-visible and synthetic only.

## Available
- Password authentication, verification/reset test mail, persistent sessions and logout.
- Two primary Tenant/Landlord cards, an agent entry, saved setup and multiple roles per account.
- Private property claims, tenancy drafts and recipient-bound accept/decline/revoke invitations.
- Agent property-viewing records, tenant confirmation/dispute, distinct confirmed-property counts per tenant for the recording agent only. No global tenant browsing or cross-agent sharing.
- Private evidence versions for confirmed tenancies, synthetic text downloads, PDF quarantine and version-specific receipt/dispute history.
- Persistent database, SQL migrations, versioned backend endpoints and scoped event history.

## Database and deployment preparation
Next.js UI and NestJS/Express API share a local process. Better Auth uses Drizzle; domain operations use parameterized SQL transactions. Drizzle was selected for the auth adapter and common SQL migration model in place of the provisional Prisma proposal. PGlite runs PostgreSQL locally in `.local/postgres`; the standard PostgreSQL adapter uses `pg` when DATABASE_URL is set. Migrations are additive, transactional and checksum-checked. Back up `.local` before experimenting; never commit it.

`db/compose.yaml` defines an isolated PostgreSQL service. `npm run test:postgres` requires a dedicated RENTAL_TEST_DATABASE_URL and uses a randomized schema. CI is prepared in `.github/workflows/checks.yml`. Standard PostgreSQL service/CI have not been run here; do not infer production validation from embedded tests.

A live deployment still needs a production bootstrap, secure managed secrets/TLS/cookies, configured email, backup/restore verification, migrations against the target database, MFA/recovery assurance, private object storage, monitoring, a scaling/rate-limit strategy, full accessibility/security/acceptance testing and the real-data review. No hosting or bank integration has been deployed.

## API
Authenticated routes under `/api/v1`: GET `/dashboard`; POST `/me/role`, `/me/setup`, `/properties`, `/tenancies`, `/tenancies/:id/invite`, `/tenancies/:id/revoke`, `/invitations/:id/respond`, `/viewings`, `/viewings/:id/respond`. Writes require the local Origin; sessions and resource relations are checked server-side. GET `/health` and `/local-mail` are local operator utilities. Better Auth owns `/api/auth/*`.

Viewing POST body: propertyId, email, viewedOn (YYYY-MM-DD). Requires completed agent setup and the agent's own property claim; the target must be a different verified fictional account. Response POST body: status (`confirmed` or `disputed`); only the named tenant can respond. Reports are not counted as confirmed. Repeated visits to one property count as one distinct property. Reconfirming/disputing changes the current state and appends an audit event.

## Future work
[Rental passport specification](../rental-trust-research/development-plan/FUTURE-RENTAL-PASSPORT.md): tenant-selected payment summaries, history map/timeline, landlord references, consent grants and bank integration investigation. All remain NOT STARTED. No receipts, banks, AI or real identity checks are connected.

## Agreement evidence slice — 10 November 2026
Migration 4 adds tenancy_documents and append-only document_responses. Each upload gets a SHA-256 fingerprint and a new version within its category; no replace/delete API exists. Stamp-evidence uploads must reference an agreement in the same tenancy and never imply official validity. Tenant and creator access is enforced on list, upload, download and response. Uploader cannot acknowledge their own document. Receipt is not a signature or assent to terms.

GET/POST `/api/v1/tenancies/:id/documents`; GET `/api/v1/documents/:id/download`; POST `/api/v1/documents/:id/respond`. Upload body: kind (agreement/stamp_evidence/supporting), filename, contentBase64, syntheticOnly:true, and relatedAgreementId only for stamp_evidence. Response body: response (received/disputed), note (required for dispute). Files: nonempty UTF-8 .txt or PDF header, maximum 2 MiB/file and 20 MiB/tenancy. All PDFs remain quarantined without downloads or responses; there is no scan/release service yet. Text downloads are attachment-only, no-store, nosniff and sandboxed. No HTML rendering of file content.

For local synthetic rehearsal, file bytes are base64 in the private database and are not encrypted separately. Before real files: managed encrypted object storage, malware scanning/quarantine pipeline, worker retries, retention/deletion policies and private delivery controls must replace/extend this local storage adapter. Database account access can mutate rows; application-level append-only behavior is not a tamper-proof ledger. Production is still blocked by the explicit bootstrap guard.

## Handover and reporting checkpoint 0001
Handover tab supports synthetic move-in/out observations, key quantities, electricity/water units, exact-version item responses, baseline comparison and private JSON export. Migration 005 creates handovers/handover_responses. Endpoints: GET/POST /api/v1/tenancies/:id/handovers; POST /api/v1/handovers/:id/respond; GET /api/v1/tenancies/:id/handover-export. No photo/video attachment, signature, liability or deposit settlement. New versions do not inherit responses. Labels/type drive comparison; renamed items are unmatched.

Read DEVELOPMENT-REPORT.md and DEVELOPMENT-CHECKPOINT.md before continuing. Maintain PROJECT-STATUS.md, DEVELOPMENT-REPORT.md, DEVELOPMENT-CHECKPOINT.md, KNOWN-ISSUES.md and NEXT-STEPS.md each cycle. Archive earlier reports and return the full A–I report; stop for owner approval before the next major task. No Git repository currently exists.
